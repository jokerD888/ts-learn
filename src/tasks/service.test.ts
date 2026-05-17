import assert from "node:assert/strict";
import { TaskService } from "./service.js";
import type { Task } from "./types.js";

const service = new TaskService();

const invalidResult = service.createSafe({ title: "   " });
assert.equal(invalidResult.ok, false);

if (!invalidResult.ok) {
  assert.equal(invalidResult.error, "任务标题不能为空");
}

const validResult = service.createSafe({ title: "写测试" });
assert.equal(validResult.ok, true);

if (validResult.ok) {
  assert.equal(validResult.data.id, 1);
  assert.equal(validResult.data.title, "写测试");
  assert.equal(validResult.data.status, "todo");
}

const updatedTask = service.updateStatus(1, "done");
assert.equal(updatedTask?.status, "done");

assert.equal(service.remove(1), true);
assert.equal(service.remove(1), false);
assert.deepEqual(service.list(), []);

console.log("TaskService 测试通过");

// 练习测试：
// 1. 新增一个测试：用 new TaskService([{...}]) 初始化已有任务。
const existingTasks: Task[] = [
  { id: 5, title: "旧任务1", status: "todo", createdAt: "2024-01-01T00:00:00.000Z" },
  { id: 8, title: "旧任务2", status: "doing", createdAt: "2024-01-02T00:00:00.000Z" },
  { id: 10, title: "旧任务3", status: "done", createdAt: "2024-01-03T00:00:00.000Z" }
];

const serviceWithExisting = new TaskService(existingTasks);

// 验证初始任务已加载
assert.equal(serviceWithExisting.list().length, 3);
assert.equal(serviceWithExisting.findById(10)?.title, "旧任务3");

// 2. 调用 createSafe 创建新任务。
const newResult = serviceWithExisting.createSafe({ title: "新任务" });
assert.equal(newResult.ok, true);

if (newResult.ok) {
  // 3. 断言新任务 id 会接在已有最大 id 后面。
  // 已有最大 id 是 10，新任务 id 应该是 11
  assert.equal(newResult.data.id, 11);
  assert.equal(newResult.data.title, "新任务");
  assert.equal(newResult.data.status, "todo");
  
  console.log(`✅ 新任务 ID 正确：${newResult.data.id}（接在最大 ID 10 后面）`);
}

// 再创建一个任务，验证 ID 继续递增
const anotherResult = serviceWithExisting.createSafe({ title: "另一个新任务" });
if (anotherResult.ok) {
  assert.equal(anotherResult.data.id, 12);
  console.log(`✅ 第二个新任务 ID 正确：${anotherResult.data.id}`);
}

console.log("练习测试通过");

