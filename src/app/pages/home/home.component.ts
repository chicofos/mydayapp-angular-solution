import { Component, ElementRef, inject, Input, OnChanges, OnInit, SimpleChange, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TodoTask } from 'src/app/models/todo-task.model';
import { TodoTaskService } from 'src/app/services/todo-task.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: false
})
export class HomeComponent implements OnInit, OnChanges {

  @Input() filter!: string;
  private todoTaskService = inject(TodoTaskService);

  public tasks = this.todoTaskService.filteredTasks;
  public tasksFilter = this.todoTaskService.filter;

  public form!: FormGroup;

  @ViewChild("editField") editField!: ElementRef;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      title: new FormControl()
    });

    this.route.params.subscribe(params => {
      const filterValue = params['filter'] || '';
      this.tasksFilter.set(filterValue);
    });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    const filter = changes['filter'] as SimpleChange;
    const filterValue = '' + filter.currentValue?.toString();
    this.tasksFilter.set(filterValue);
  }

  public addTask(): void {
    const task = this.form.controls['title'].value;
    if (task && task.trim() !== "") {
      this.todoTaskService.addTask(task);
      this.form.controls['title'].patchValue(null);
    }
  }

  public onCheck(event: Event, task: TodoTask): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.todoTaskService.changeTaskStatus(task.id, checked);
  }

  public editTask(task: TodoTask): void {
    task.edit = !task.edit;
    this.editField.nativeElement.focus();
  }

  public cancel(task: TodoTask): void {
    task.edit = false;
    this.editField.nativeElement.value = task.title.trim();
  }

  public saveEdit(task: TodoTask, event: Event): void {
    const title = (event.target as HTMLInputElement).value.trim();
    this.todoTaskService.changeTaskTitle(task.id, title);
  }

  public getCounter(): string {
    return this.todoTaskService.getCounter();
  }

  public canSeeCompletedAction(): boolean {
    return this.tasks().some(x => x.completed);
  }

  public removeTask(task: TodoTask): void {
    this.todoTaskService.removeTask(task.id);
  }

  public clearCompleted(): void {
    this.todoTaskService.clearCompleted();
  }

  public canSeeActions(): boolean {
    if (this.tasksFilter() !== undefined) {
      return true;
    }
    return this.tasks.length > 0;
  }

  public getMode(task: TodoTask): string {

    if (task.completed)
      return 'completed';
    else if (task.edit)
      return 'editing'
    else
      return '';
  }
}
