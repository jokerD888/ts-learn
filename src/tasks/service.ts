import type { CreateTaskInput, Result, Task, TaskStatus } from "./types.js";

export class TaskService {
  private tasks: Task[];
  private nextId: number;

  constructor(initialTasks: Task[] = []) {
    this.tasks = initialTasks;
    this.nextId = Math.max(0, ...initialTasks.map((task) => task.id)) + 1;
  }

  list(): Task[] {
    return this.tasks;
  }

  create(input: CreateTaskInput): Task {
    const task: Task = {
      id: this.nextId,
      title: input.title,
      status: "todo",
      createdAt: new Date().toISOString()
    };

    this.nextId += 1;
    this.tasks.push(task);

    return task;
  }

  updateStatus(id: number, status: TaskStatus): Task | undefined {
    const task = this.tasks.find((item) => item.id === id);

    if (!task) {
      return undefined;
    }

    task.status = status;
    return task;
  }
  findById(id: number): Task | undefined {
    return this.tasks.find((item) => item.id === id);
  }

  remove(id: number): boolean {
    const index = this.tasks.findIndex((item) => item.id === id);
    if (index === -1) {
      return false;
    }
    this.tasks.splice(index, 1);
    return true;
  }
  createSafe(input: CreateTaskInput): Result<Task> {
    const title = input.title.trim();
    if (title === "") {
      return {
        ok: false,
        error: "任务标题不能为空"
      };
    }

    const task = this.create({ title });
    return {
      ok: true,
      data: task
    };
  }
}
