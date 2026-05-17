import { TaskService } from "./tasks/service.js";
import type { Result, Task } from "./tasks/types.js";

const taskService = new TaskService();

const firstTask = taskService.create({ title: "学习 TypeScript 泛型" });
const secondTask = taskService.create({ title: "完成任务管理器项目" });

taskService.updateStatus(firstTask.id, "done");
taskService.updateStatus(secondTask.id, "doing");

console.table(taskService.list());

// 实战项目第 1 步：
// 1. 给 TaskService 新增 findById(id: number): Task | undefined。
// 2. 给 TaskService 新增 remove(id: number): boolean。
//    删除成功返回 true，找不到任务返回 false。
// 3. 在当前文件调用 findById，打印第一个任务。
console.log(taskService.findById(firstTask.id));
// 4. 在当前文件调用 remove，删除第二个任务。
console.log(taskService.remove(secondTask.id));
// 5. 再次 console.table(taskService.list())，确认第二个任务已删除。
console.table(taskService.list());

// 实战项目第 2 步：
// 1. 在 TaskService 中新增 createSafe(input: CreateTaskInput): Result<Task>。
// 2. 如果 title 去掉首尾空格后为空，返回 { ok: false, error: "任务标题不能为空" }。
// 3. 如果 title 合法，复用 create 创建任务，并返回 { ok: true, data: task }。
// 4. 在当前文件分别调用一次成功和失败的 createSafe。
console.log(taskService.createSafe({ title: "学习 TypeScript 泛型" }));
console.log(taskService.createSafe({ title: "" }));
// 5. 用 if (result.ok) 做类型收窄：成功时打印 result.data，失败时打印 result.error。
function printCreateResult(result: Result<Task>): void {
  if (result.ok) {
    console.log(`创建成功：${result.data.title}`);
  } else {
    console.log(`创建失败：${result.error}`);
  }
}

printCreateResult(taskService.createSafe({ title: "完成任务管理器项目" }));
printCreateResult(taskService.createSafe({ title: "   " }));
