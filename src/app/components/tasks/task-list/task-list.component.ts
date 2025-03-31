import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Task, TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss'
})
export class TaskListComponent implements OnInit, OnDestroy {
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  loading: boolean = true;
  errorMessage: string = '';
  currentFilter: 'all' | 'active' | 'completed' = 'all';
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject<any>();
  private destroy$ = new Subject<void>();
  private isTableInitialized = false;

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setupDataTable();
    this.loadTasks();
  }

  private setupDataTable(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      dom: 'rtip',
      language: {
        search: 'Buscar:',
        lengthMenu: 'Mostrar _MENU_ registros por página',
        zeroRecords: 'Nenhum registro encontrado',
        info: 'Mostrando página _PAGE_ de _PAGES_',
        infoEmpty: 'Nenhum registro disponível',
        infoFiltered: '(filtrado de _MAX_ registros no total)',
        paginate: {
          first: 'Primeira',
          last: 'Última',
          next: 'Próxima',
          previous: 'Anterior'
        }
      }
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
          this.reloadTable();
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = 'Falha ao carregar tarefas. Por favor, tente novamente.';
          console.error('Error loading tasks:', error);
        }
      });
  }

  private reloadTable(): void {
    if (this.isTableInitialized) {
      this.dtElement.dtInstance.then((dtInstance: any) => {
        dtInstance.destroy();
        this.dtTrigger.next(null);
      });
    } else {
      this.isTableInitialized = true;
      this.dtTrigger.next(null);
    }
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

    // Se a tabela já foi inicializada, recarrega-a
    if (this.isTableInitialized) {
      this.reloadTable();
    }
  }

  toggleTaskStatus(task: Task): void {
    if (!task.id) return;
    
    const updatedStatus = !task.completed;
    this.taskService.toggleTaskStatus(task.id, updatedStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedTask) => {
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
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      this.taskService.deleteTask(taskId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
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
