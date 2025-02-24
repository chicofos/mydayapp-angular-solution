import { computed, effect, Injectable, signal } from '@angular/core';
import { TodoTask } from '../models/todo-task.model';

@Injectable({ providedIn: 'root' })
export class TodoTaskService {

    public tasks = signal<TodoTask[]>([]);
    public filter = signal<string>("");

    public filteredTasks = computed(() => {

        const tasks = this.tasks();
        const filter = this.filter();

        switch (filter) {
            case 'completed':
                return tasks.filter((task) => task.completed);
            case 'pending':
                return tasks.filter((task) => !task.completed);
            default:
                return tasks;
        }
    })

    constructor() {
        this.getStoredTasks();
        this.trackTasks();
    }

    public getStoredTasks(): void {
        const storedData = localStorage.getItem('mydayapp-angular');
        const tasks = !!storedData ? JSON.parse(storedData) : [];
        this.tasks.set(tasks);
    }

    public clearCompleted(): void {
        this.tasks.update((previousState) => {
            return previousState.filter((task) => !task.completed);
        });
    }

    public getCounter(): string {
        const completedAmount = this.filteredTasks().filter(x => !x.completed).length;
        return `${completedAmount} item${completedAmount === 1 ? '' : 's'} left`;
    }

    public addTask(task: string): void {
        const newTask = { id: Date.now(), title: task, completed: false, edit: false };
        this.tasks.update((previousState) => [...previousState, newTask]);
    }

    public removeTask(id: number): void {
        this.tasks.update((previousState) => {
            return previousState.filter(x => x.id !== id);
        });
    }

    public changeTaskStatus(id: number, checked: boolean): void {
        this.tasks.update((prevState) => {
            return prevState.map((task) => {
                if (task.id === id) {
                    return { ...task, completed: checked };
                }
                return task;
            })
        })
    }

    public changeTaskTitle(id: number, title: string): void {
        this.tasks.update((prevState) => {
            return prevState.map((task) => {
                if (task.id === id) {
                    return { ...task, title: title, edit: false };
                }
                return task;
            })
        })
    }

    public trackTasks(): void {
        effect(() => {
            const tasks = this.tasks();
            const tasksString = JSON.stringify(tasks);
            localStorage.setItem('mydayapp-angular', tasksString);
        });
    }
}