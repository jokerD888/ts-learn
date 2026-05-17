import { TaskService } from "./tasks/service.js";
import { loadTasks, saveTasks } from "./tasks/storage.js";

type Command =
  | {
      name: "list";
    }
  | {
      name: "add";
      title: string;
    }
  | {
      name: "help";
    }
  | {
      name: "done";
      id: number;
    };

function assertNever(value: never): never {
  throw new Error(`未处理的命令：${JSON.stringify(value)}`);
}

function parseCommand(args: string[]): Command {
  const [commandName, ...rest] = args;

  if (commandName === "list") {
    return { name: "list" };
  }

  if (commandName === "add") {
    return {
      name: "add",
      title: rest.join(" ")
    };
  }
  if (commandName === "done") {
    const id = Number(rest[0]);
    if (Number.isNaN(id)) {
      console.log("请输入正确的任务 ID");
      return { name: "help" };
    }

    return {
      name: "done",
      id
    };
  }

  return { name: "help" };
}

function printHelp(): void {
  console.log("用法：");
  console.log("  npm run task -- list");
  console.log("  npm run task -- add 任务标题");
  console.log("  npm run task -- done 任务ID");
}

const tasks = await loadTasks();
const taskService = new TaskService(tasks);
const command = parseCommand(process.argv.slice(2));

switch (command.name) {
  case "list":
    console.table(taskService.list());
    break;
  case "add": {
    const result = taskService.createSafe({ title: command.title });

    if (result.ok) {
      console.log(`已创建任务：${result.data.title}`);
      await saveTasks(taskService.list());
    } else {
      console.log(result.error);
    }

    break;
  }
  case "help":
    printHelp();
    break;
  case "done": {
    const task = taskService.updateStatus(command.id, "done");

    if (task) {
      console.log(`已完成任务：${task.title}`);
      await saveTasks(taskService.list());
    } else {
      console.log("任务不存在");
    }

    break;
  }
  default:
    assertNever(command);
}

// 实战项目第 3 步：
// 1. 给 Command 联合类型新增 done 命令，包含 id: number。
// 2. 让 parseCommand 支持：npm run task -- done 1。
// 3. 在 switch 中处理 done：
//    - 调用 taskService.updateStatus(id, "done")
//    - 找到任务时打印 "已完成任务：标题"
//    - 找不到任务时打印 "任务不存在"
// 4. 给 printHelp 增加 done 命令说明。
//
// 说明：
// 当前 TaskService 是内存存储，所以每次运行命令都会重新开始。
// 下一步我们会把任务保存到 JSON 文件。

// 实战项目第 4 步：
// 1. 从 "./tasks/storage.js" 导入 loadTasks 和 saveTasks。
// 2. 用 await loadTasks() 读取已有任务。

// 3. 用 new TaskService(tasks) 初始化服务。

// 4. add 和 done 修改任务后，调用 await saveTasks(taskService.list())。
// 5. 运行：
//    npm run task -- add 学习 JSON 存储
//    npm run task -- list
//    npm run task -- done 1
