import type { Task, TaskStatus } from "./types.js";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isTaskStatus(value: unknown): value is TaskStatus {
  return value === "todo" || value === "doing" || value === "done";
}

export function isTask(value: unknown): value is Task {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.title === "string" &&
    isTaskStatus(value.status) &&
    typeof value.createdAt === "string"
  );
}

export function parseTasks(value: unknown): Task[] {
  if (Array.isArray(value) && value.every(isTask)) {
    return value;
  }

  return [];
}
