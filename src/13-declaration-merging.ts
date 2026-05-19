// ============================================================
// 第 13 课：Declaration Merging & Module Augmentation（声明合并与模块扩展）
// 核心思想：扩展已有类型，而不修改原始代码
// ============================================================

// --------------------------------------------------
// 1. 接口合并——同名的 interface 自动合并
// --------------------------------------------------

interface Config {
  host: string;
  port: number;
}

interface Config {
  debug: boolean;
  // host: number; // ❌ 合并时同名属性类型必须一致
}

// 合并结果：{ host: string; port: number; debug: boolean }
const cfg: Config = { host: "localhost", port: 3000, debug: false };
console.log("接口合并：", cfg);

// --------------------------------------------------
// 2. 类合并——interface 可以给 class 补充声明
// --------------------------------------------------

class Logger {
  logs: string[] = []; // 注意：不能用 private，合并后外部也要访问
  log(msg: string) { this.logs.push(msg); }
}

interface Logger {
  level: "debug" | "info" | "error";
  flush(): void;
}

const logger = new Logger();
(logger as any).level = "info";
(logger as Logger).flush = function () { this.logs = []; };
console.log("类合并：", logger);

// --------------------------------------------------
// 3. 命名空间合并——namespace 与 function/class/enum 合并
// --------------------------------------------------

function buildUser(name: string) {
  return { name };
}

namespace buildUser {
  export let defaultRole = "user";
  export function admin(name: string) {
    return { name, role: "admin" as const };
  }
}

console.log("函数+命名空间：", buildUser("Joker"), buildUser.defaultRole, buildUser.admin("Boss"));

enum Color { Red, Green, Blue }

namespace Color {
  export function label(c: Color): string {
    return ["Red", "Green", "Blue"][c] ?? "Unknown";
  }
}

console.log("enum+命名空间：", Color.label(Color.Red));

// --------------------------------------------------
// 4. Module Augmentation（模块扩展）——扩展第三方模块的类型
// --------------------------------------------------

// 场景：express 的 Request 对象没有 user 属性，
// 但我们通过中间件加了，需要让 TS 知道。
// 实际写法：declare module "express" { interface Request { user?: ... } }
// 这里用 namespace 模拟

declare namespace Express {
  interface Request {
    body: unknown;
    params: Record<string, string>;
  }
}

declare namespace Express {
  interface Request {
    user?: { id: number; name: string; role: string };
  }
}

function handler(req: Express.Request) {
  console.log("body：", req.body);
  if (req.user) {
    console.log("user：", req.user.name, req.user.role);
  }
}

handler({ body: { action: "test" }, params: {}, user: { id: 1, name: "Joker", role: "admin" } });

// --------------------------------------------------
// 5. 扩展全局类型——String / Array / Window 等
// --------------------------------------------------

declare global {
  interface String {
    toSnakeCase(): string;
  }
  interface Array<T> {
    last(): T | undefined;
  }
  interface Math {
    clamp(value: number, min: number, max: number): number;
  }
}

String.prototype.toSnakeCase = function () {
  return this.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");
};

Array.prototype.last = function () {
  return this[this.length - 1];
};

Math.clamp = function (value, min, max) {
  return Math.min(Math.max(value, min), max);
};

console.log("扩展 String：", "myComponentName".toSnakeCase());
console.log("扩展 Array：", [1, 2, 3].last());
console.log("扩展 Math：", Math.clamp(150, 0, 100));

// --------------------------------------------------
// 6. 编写 .d.ts 声明文件——为 JS 模块提供类型
// --------------------------------------------------

// 实际项目中，声明文件放在 .d.ts 里，例如 src/types/legacy-utils.d.ts：
//
// declare module "legacy-utils" {
//   export function formatCurrency(value: number, currency: string): string;
//   export function parseDate(input: string): Date;
//   export const VERSION: string;
//   export default class Cache<T> {
//     get(key: string): T | undefined;
//     set(key: string, value: T): void;
//   }
// }
//
// 注意：declare module "xxx" 只能在 .d.ts 文件或外部模块上下文中使用，
// 在普通 .ts 文件中（非模块）写 declare module 会报 "module not found"。
// 因为当前文件是独立脚本（没有 import/export），不构成外部模块。

// --------------------------------------------------
// 7. 三斜线指令——声明文件间的依赖
// --------------------------------------------------

// <reference path="..." />  指定依赖的声明文件
// <reference types="node" /> 指定依赖的 @types 包
// 现代 TS 项目中大部分由 tsconfig 自动处理，了解即可

// --------------------------------------------------
// 8. 实战：为 Node.js 扩展 process.env 的类型
// --------------------------------------------------

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
      DATABASE_URL?: string;
      API_KEY?: string;
    }
  }
}

const env = process.env.NODE_ENV; // "development" | "production" | "test"
console.log("扩展 ProcessEnv：", env);

// --------------------------------------------------
// 练习
// --------------------------------------------------

// 1. 给 Order 接口补充 timestamp 属性（接口合并）
interface Order {
  id: number;
  items: string[];
}
interface Order {
  timestamp: number;
}

const order: Order = { id: 1, items: ["A", "B"], timestamp: Date.now() };
console.log("Order 合并：", order);

// 2. Math.clamp 已在上方 declare global 中声明并实现

// 3. 用 namespace 合并扩展 Result 类型，加上 code 字段
declare namespace MyLib {
  interface Result<T> {
    ok: boolean;
    data: T;
  }
}

declare namespace MyLib {
  interface Result<T> {
    code: number;
  }
}

const res: MyLib.Result<string> = { ok: true, data: "hi", code: 200 };
console.log("扩展 Result：", res);

// 4. 为假设的 "geo-lib" JS 包写 .d.ts 声明文件
// 实际文件：src/types/geo-lib.d.ts
//   declare module "geo-lib" {
//     export function distance(lat1: number, lng1: number, lat2: number, lng2: number): number;
//     export function bearing(lat1: number, lng1: number, lat2: number, lng2: number): number;
//     export default class GeoMap {
//       getCenter(): { lat: number; lng: number };
//     }
//   }
// （当前文件非模块上下文，无法 inline declare module，故写注释示意）

// 5. 用 namespace 给枚举添加 fromValue 方法
enum Season { Spring = 1, Summer = 2, Autumn = 3, Winter = 4 }

namespace Season {
  export function fromValue(v: number): Season | undefined {
    return ([Season.Spring, Season.Summer, Season.Autumn, Season.Winter] as Season[]).find((s) => s === v);
  }
}

console.log("Season.fromValue(2)：", Season.fromValue(2));   // 2 (Summer)
console.log("Season.fromValue(9)：", Season.fromValue(9));   // undefined

// --------------------------------------------------
// 总结
// --------------------------------------------------
//
// 机制                    用途
// interface 合并          同名 interface 属性自动合并
// interface + class       给 class 补充属性声明
// namespace + function    给函数加静态属性/方法
// namespace + enum        给枚举加方法
// declare module "xxx"    扩展第三方模块的类型（需 .d.ts 或模块上下文）
// declare global          扩展全局类型（String/Array/Math/ProcessEnv）
// .d.ts 文件              为 JS 模块提供类型声明
