import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Task } from "./types.js";
import { parseTasks } from "./validation.js";

const TASKS_FILE = path.join(process.cwd(), "tasks.json");

export async function loadTasks(): Promise<Task[]> {
  try {
    const content = await readFile(TASKS_FILE, "utf8");

    const parsed: unknown = JSON.parse(content);
    return parseTasks(parsed);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  const content = JSON.stringify(tasks, null, 2);
  await writeFile(TASKS_FILE, `${content}\n`, "utf8");
}

