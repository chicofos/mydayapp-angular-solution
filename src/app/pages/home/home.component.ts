import { Component, ElementRef, Input, OnInit, SimpleChange, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Route } from '@angular/router';

import { TodoTask } from 'src/app/models/todo-task.model';
import { TodoTaskService } from 'src/app/services/todo-task.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: false
})
export class HomeComponent implements OnInit {

  @Input() filter!: string;

  public tasks: TodoTask[] = [];
  public form!: FormGroup;

  @ViewChild("editField") editField!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private todoTaskService: TodoTaskService) { }

  ngOnInit(): void {

    this.form = new FormGroup({
      title: new FormControl()
    });
    
    this.todoTaskService.getTasksObservable().subscribe(tasks => {
      this.tasks = tasks;
    });
    
    
    this.route.params.subscribe(params => {
      this.filter = params['filter'];
      this.todoTaskService.setFilter(this.filter);
    });
    
    this.todoTaskService.getStoredTasks(this.filter);
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
    task.completed = checked;
    this.todoTaskService.save();
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
    task.title = (event.target as HTMLInputElement).value.trim();
    task.edit = false;
    this.todoTaskService.save();
  }

  public getCounter(): string {
    return this.todoTaskService.getCounter();
  }

  public canSeeCompletedAction(): boolean {
    return this.tasks.some(x => x.completed);
  }

  public clearCompleted(): void {
    this.todoTaskService.clearCompleted();
  }

  public canSeeActions(): boolean {
    if (this.filter !== undefined) {
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
