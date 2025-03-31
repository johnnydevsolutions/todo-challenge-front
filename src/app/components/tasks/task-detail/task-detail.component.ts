import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Task, TaskService } from '../../../core/services/task.service';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.scss'
})
export class TaskDetailComponent implements OnInit, OnDestroy {
  task?: Task;
  loading: boolean = true;
  errorMessage: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = +params['id'];
        this.loadTask(id);
      });
  }

  loadTask(id: number): void {
    this.loading = true;
    this.taskService.getTaskById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (task) => {
          this.task = task;
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = 'Failed to load task. Please try again.';
          console.error('Error loading task:', error);
        }
      });
  }

  toggleTaskStatus(): void {
    if (!this.task || !this.task.id) return;

    const updatedStatus = !this.task.completed;
    this.taskService.toggleTaskStatus(this.task.id, updatedStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedTask) => {
          this.task = updatedTask;
        },
        error: (error) => {
          console.error('Error toggling task status:', error);
        }
      });
  }

  editTask(): void {
    if (!this.task || !this.task.id) return;
    this.router.navigate(['/tasks', this.task.id, 'edit']);
  }

  deleteTask(): void {
    if (!this.task || !this.task.id) return;

    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(this.task.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.router.navigate(['/tasks']);
          },
          error: (error) => {
            console.error('Error deleting task:', error);
          }
        });
    }
  }

  backToList(): void {
    this.router.navigate(['/tasks']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
