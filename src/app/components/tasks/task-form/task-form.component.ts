import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Task, TaskService } from '../../../core/services/task.service';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss'
})
export class TaskFormComponent implements OnInit, OnDestroy {
  taskForm!: FormGroup;
  isEditMode: boolean = false;
  taskId?: number;
  loading: boolean = false;
  errorMessage: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['id']) {
          this.isEditMode = true;
          this.taskId = +params['id'];
          this.loadTaskData(this.taskId);
        }
      });
  }

  private initForm(): void {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      completed: [false]
    });
  }

  private loadTaskData(id: number): void {
    this.loading = true;
    this.taskService.getTaskById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (task) => {
          this.taskForm.patchValue({
            title: task.title,
            description: task.description || '',
            completed: task.completed
          });
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = 'Failed to load task. Please try again.';
          console.error('Error loading task:', error);
        }
      });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      return;
    }

    this.loading = true;
    const taskData: Partial<Task> = {
      ...this.taskForm.value
    };

    if (!this.isEditMode) {
      taskData.completed = false;
    }

    if (this.isEditMode && this.taskId) {
      this.taskService.updateTask(this.taskId, taskData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/tasks']);
          },
          error: (error) => {
            this.loading = false;
            this.errorMessage = 'Falha ao atualizar tarefa. Por favor, tente novamente.';
            console.error('Error updating task:', error);
          }
        });
    } else {
      this.taskService.createTask(taskData as Omit<Task, 'id'>)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/tasks']);
          },
          error: (error) => {
            this.loading = false;
            this.errorMessage = 'Falha ao criar tarefa. Por favor, tente novamente.';
            console.error('Error creating task:', error);
          }
        });
    }
  }

  cancel(): void {
    this.router.navigate(['/tasks']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
