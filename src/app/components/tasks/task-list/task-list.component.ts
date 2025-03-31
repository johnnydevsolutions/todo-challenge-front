import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Task, TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';

// Import DataTables types 
declare var require: any;
declare var $: any;

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss'
})
export class TaskListComponent implements OnInit, OnDestroy {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  loading: boolean = true;
  errorMessage: string = '';
  currentFilter: 'all' | 'active' | 'completed' = 'all';
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject<any>();
  private destroy$ = new Subject<void>();

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setupDataTable();
    this.loadTasks();
  }

  setupDataTable(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      responsive: true,
      order: [[0, 'asc']],
      columnDefs: [
        { orderable: false, targets: [3] } // Disable sorting for action column
      ]
    };
  }

  loadTasks(): void {
    this.loading = true;
    this.taskService.getAllTasks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tasks) => {
          this.tasks = tasks;
          this.applyFilter(this.currentFilter);
          this.loading = false;
          // Trigger DataTable render/refresh
          this.dtTrigger.next(null);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = 'Failed to load tasks. Please try again.';
          console.error('Error loading tasks:', error);
        }
      });
  }

  applyFilter(filter: 'all' | 'active' | 'completed'): void {
    this.currentFilter = filter;
    
    switch (filter) {
      case 'active':
        this.filteredTasks = this.tasks.filter(task => !task.completed);
        break;
      case 'completed':
        this.filteredTasks = this.tasks.filter(task => task.completed);
        break;
      default:
        this.filteredTasks = [...this.tasks];
        break;
    }
  }

  toggleTaskStatus(task: Task): void {
    if (!task.id) return;
    
    const updatedStatus = !task.completed;
    this.taskService.toggleTaskStatus(task.id, updatedStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedTask) => {
          // Update the task in the local array
          const index = this.tasks.findIndex(t => t.id === task.id);
          if (index !== -1) {
            this.tasks[index] = updatedTask;
            this.applyFilter(this.currentFilter);
          }
        },
        error: (error) => {
          console.error('Error toggling task status:', error);
        }
      });
  }

  deleteTask(taskId: number): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Remove the task from the local array
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.applyFilter(this.currentFilter);
          },
          error: (error) => {
            console.error('Error deleting task:', error);
          }
        });
    }
  }

  createTask(): void {
    this.router.navigate(['/tasks/new']);
  }

  editTask(taskId: number): void {
    this.router.navigate(['/tasks', taskId, 'edit']);
  }

  viewTaskDetails(taskId: number): void {
    this.router.navigate(['/tasks', taskId]);
  }

  logout(): void {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.dtTrigger.unsubscribe();
  }
}
