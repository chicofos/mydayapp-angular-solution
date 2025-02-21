import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Route } from '@angular/router';

import { TodoTask } from 'src/app/models/todo-task.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {

  public tasks: TodoTask[] = [];
  public originalTasks: TodoTask[] = [];
  public form!: FormGroup;
  public filter: boolean | undefined;

  @ViewChild("editField") editField!: ElementRef;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {

    this.form = new FormGroup({
      title: new FormControl()
    });

    const storedData = localStorage.getItem('mydayapp-angular');
    this.tasks = !!storedData ? JSON.parse(storedData) : [];
    this.originalTasks = [...this.tasks];
    this.applyFilter();
  }

  public addTask(): void {
    const task = this.form.controls['title'].value;
    if (task && task.trim() !== "") {
      this.tasks.push({ id: Math.floor(Math.random() * 100), title: task, completed: false, edit: false });
      this.save();
      this.form.controls['title'].patchValue(null);
    }
  }

  public onCheck(event: Event, task: TodoTask): void {
    const checked = (event.target as HTMLInputElement).checked;
    task.completed = checked;
    this.save();
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
    this.save();
  }

  public getPendingItems(): number {
    return this.tasks.filter(x => !x.completed).length;
  }

  public canSeeCompletedAction(): boolean {
    return this.tasks.some(x => x.completed);
  }

  public clearCompleted(): void {
    this.tasks = this.tasks.filter(x => !x.completed);
    this.originalTasks = this.originalTasks.filter(x => !x.completed);
    this.save();
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

  private save(): void {

    this.tasks.forEach(o => {
      let element = this.originalTasks.find(x => x.id === o.id);
      if (element) {
        element.completed = o.completed;
        element.title = o.title;
      } else {
        this.originalTasks.push(o);
      }
    });
    localStorage.setItem('mydayapp-angular', JSON.stringify(this.originalTasks));
    this.applyFilter();
  }

  private applyFilter(): void {
    this.filter = this.route.snapshot.data['completed'];
    if (this.filter !== undefined) {
      this.tasks = this.originalTasks.filter(x => x.completed === this.route.snapshot.data['completed']);
    }
  }

}
