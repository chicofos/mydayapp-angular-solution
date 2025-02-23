import { Injectable } from '@angular/core';
import { TodoTask } from '../models/todo-task.model';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TodoTaskService {

    public tasks: TodoTask[] = [];
    public originalTasks: TodoTask[] = [];
    public filter!: string;

    private tasksSubject: Subject<TodoTask[]> = new Subject();

    constructor() { }

    public getTasksObservable(): Observable<TodoTask[]> {
        return this.tasksSubject.asObservable();
    }

    public getStoredTasks(filter: string): void {
        const storedData = localStorage.getItem('mydayapp-angular');
        this.tasks = !!storedData ? JSON.parse(storedData) : [];
        this.originalTasks = [...this.tasks];
        this.applyFilter(filter);
    }

    public setFilter(filter: string): void {
        this.filter = filter;
        this.applyFilter(this.filter);
    }

    public clearCompleted(): void {
        this.tasks = this.tasks.filter(x => !x.completed);
        this.originalTasks = this.originalTasks.filter(x => !x.completed);
        this.save();
    }

    public getCounter(): string {
        const completedAmount = this.tasks.filter(x => !x.completed).length;
        return `${completedAmount} item${completedAmount === 1 ? '' : 's'} left`;
    }

    public addTask(task: string): void {
        this.tasks.push({ id: Math.floor(Math.random() * 100), title: task, completed: false, edit: false });
        this.save();
    }

    public save(): void {

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
        this.applyFilter(this.filter);
    }

    private applyFilter(filter: string): void {
        this.filter = filter;
        if (this.filter !== undefined) {
            switch (filter) {
                case 'completed':
                    this.tasks = this.originalTasks.filter(x => x.completed);
                    break;
                case 'pending':
                    this.tasks = this.originalTasks.filter(x => !x.completed);
                    break;
                default:
                    break;
            }
        }
        this.tasksSubject.next(this.tasks);
    }
}