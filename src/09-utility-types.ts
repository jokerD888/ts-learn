// ============================================================
// 第 9 课：Utility Types（内置工具类型）
// ============================================================
//
// 学习目标：
//   掌握 TypeScript 内置的常用工具类型，学会用它们从已有类型
//   派生新类型，减少重复定义。
//
// 核心概念：
//   Utility Types 是 TS 内置的类型函数（类型层面的函数），
//   接收类型参数，返回新类型。本质就是泛型 + 条件类型 +
//   映射类型的预置组合。
// ============================================================

// --------------------------------------------------
// 1. Partial<T> — 将所有属性变为可选
// --------------------------------------------------

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

// Partial<User> 等价于：
// { id?: number; name?: string; email?: string; age?: number }

// 典型场景：更新函数，只传需要改的字段
function updateUser(id: number, changes: Partial<User>): void {
  console.log(`更新用户 #${id}，变更字段：`, Object.keys(changes));
}

updateUser(1, { name: "Joker" }); // 只改 name
updateUser(2, { age: 20, email: "new@test.com" }); // 改两个字段

// --------------------------------------------------
// 2. Required<T> — 将所有属性变为必填（Partial 的反操作）
// --------------------------------------------------

interface OptionalConfig {
  host?: string;
  port?: number;
  debug?: boolean;
}

// Required<OptionalConfig> 等价于：
// { host: string; port: number; debug: boolean }

function validateConfig(config: OptionalConfig): Required<OptionalConfig> {
  // 练习时先确保理解：这里必须返回所有字段都有值的对象
  return {
    host: config.host ?? "localhost",
    port: config.port ?? 3000,
    debug: config.debug ?? false,
  };
}

const fullConfig = validateConfig({ host: "example.com" });
console.log("完整配置：", fullConfig);

// --------------------------------------------------
// 3. Readonly<T> — 将所有属性变为只读
// --------------------------------------------------

interface MutablePoint {
  x: number;
  y: number;
}

const point: Readonly<MutablePoint> = { x: 1, y: 2 };
// point.x = 10; // ❌ 报错：Cannot assign to 'x' because it is a read-only property

// 典型场景：函数返回不想被修改的数据
function getOrigin(): Readonly<MutablePoint> {
  return { x: 0, y: 0 };
}

console.log("原点：", getOrigin());

// --------------------------------------------------
// 4. Pick<T, K> — 从 T 中选取部分属性
// --------------------------------------------------

interface Article {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  tags: string[];
}

// 只需要文章的摘要信息
type ArticleSummary = Pick<Article, "id" | "title" | "author">;

const summary: ArticleSummary = {
  id: 1,
  title: "TypeScript 进阶",
  author: "Joker",
};

console.log("文章摘要：", summary);

// --------------------------------------------------
// 5. Omit<T, K> — 从 T 中排除部分属性（Pick 的反操作）
// --------------------------------------------------

// 创建文章时不需要 id 和 createdAt（由系统生成）
type CreateArticleInput = Omit<Article, "id" | "createdAt">;

const newArticle: CreateArticleInput = {
  title: "Utility Types 入门",
  content: "本节学习内置工具类型...",
  author: "Joker",
  tags: ["typescript", "utility-types"],
};

console.log("新建文章输入：", newArticle);

// --------------------------------------------------
// 6. Record<K, V> — 构建键为 K、值为 V 的对象类型
// --------------------------------------------------

// 场景：按状态分类的任务列表
type TaskStatus2 = "todo" | "doing" | "done";
interface TaskItem {
  id: number;
  title: string;
}

const tasksByStatus: Record<TaskStatus2, TaskItem[]> = {
  todo: [{ id: 1, title: "学习 Utility Types" }],
  doing: [{ id: 2, title: "写练习代码" }],
  done: [{ id: 3, title: "完成第 9 课" }],
};

console.log("按状态分组的任务：", tasksByStatus);

// Record<string, number> 的常见场景：字典/映射
const scoreMap: Record<string, number> = {
  math: 95,
  english: 88,
  chinese: 92,
};

console.log("成绩表：", scoreMap);

// --------------------------------------------------
// 7. Exclude<Union, Excluded> — 从联合类型中排除成员
// --------------------------------------------------

type AllStatuses = "pending" | "active" | "inactive" | "deleted";
type ActiveStatuses = Exclude<AllStatuses, "deleted">;
// ActiveStatuses = "pending" | "active" | "inactive"

const activeStatus: ActiveStatuses = "active"; // ✅
// const wrongStatus: ActiveStatuses = "deleted"; // ❌ 报错

console.log("活跃状态：", activeStatus);

// --------------------------------------------------
// 8. Extract<Union, Extracted> — 从联合类型中提取成员
// --------------------------------------------------

type Mixed = string | number | boolean;
type OnlyStringOrNumber = Extract<Mixed, string | number>;
// OnlyStringOrNumber = string | number

const value: OnlyStringOrNumber = 42;
console.log("提取后的值：", value);

// --------------------------------------------------
// 9. NonNullable<T> — 排除 null 和 undefined
// --------------------------------------------------

type MaybeString = string | null | undefined;
type DefiniteString = NonNullable<MaybeString>;
// DefiniteString = string

const definite: DefiniteString = "hello";
console.log("非空字符串：", definite);

// --------------------------------------------------
// 10. ReturnType<F> — 提取函数的返回值类型
// --------------------------------------------------

function createTimestamp(): { iso: string; unix: number } {
  return {
    iso: new Date().toISOString(),
    unix: Date.now(),
  };
}

type Timestamp = ReturnType<typeof createTimestamp>;
// Timestamp = { iso: string; unix: number }

const ts: Timestamp = { iso: "2026-01-01T00:00:00.000Z", unix: 1767225600000 };
console.log("时间戳类型对象：", ts);

// --------------------------------------------------
// 11. Parameters<F> — 提取函数的参数类型（元组）
// --------------------------------------------------

function sendEmail(to: string, subject: string, body: string): boolean {
  return true;
}

type EmailParams = Parameters<typeof sendEmail>;
// EmailParams = [to: string, subject: string, body: string]

const emailArgs: EmailParams = ["user@test.com", "你好", "正文内容"];
console.log("邮件参数：", emailArgs);

// --------------------------------------------------
// 练习
// --------------------------------------------------

// 练习 1：定义一个 UserPreview 类型，只包含 User 的 id 和 name。
// 提示：用 Pick
type UserPreview = Pick<User, "id" | "name">;

const preview: UserPreview = { id: 1, name: "Joker" };
console.log("用户预览：", preview);

// 练习 2：定义一个 UpdateUserInput 类型，所有字段均可选，
// 但 email 字段完全不允许出现（即使可选也不行）。
// 提示：用 Partial + Omit 组合
type UpdateUserInput = Partial<Omit<User, "email">>;

const updateInput: UpdateUserInput = { name: "New Name", age: 25 };
console.log("更新用户输入：", updateInput);

// 练习 3：定义一个 Role 权限映射，角色名为 string，
// 权限列表为 string[]。然后创建一个实例包含 admin 和 guest。
// 提示：用 Record
type RolePermissions = Record<string, string[]>;

const roles: RolePermissions = {
  admin: ["read", "write", "delete", "manage"],
  guest: ["read"],
};

console.log("角色权限：", roles);

// 练习 4：有一个格式化函数如下：
//   function formatAmount(currency: string, amount: number, locale: string): string
// 用 Parameters 提取它的参数类型，创建一个变量存放参数。
function formatAmount(currency: string, amount: number, locale: string): string {
  return `${currency} ${amount.toFixed(2)} (${locale})`;
}

type FormatAmountParams = Parameters<typeof formatAmount>;
const amountArgs: FormatAmountParams = ["CNY", 99.9, "zh-CN"];

console.log("格式化金额参数：", amountArgs);
console.log("格式化结果：", formatAmount(...amountArgs));

// 练习 5：定义一个 ReadonlyUser 类型，所有属性只读，
// 再定义一个 UserDiff 类型，所有属性可选且允许 undefined。
// 提示：Readonly + Partial，注意 exactOptionalPropertyTypes 下的行为差异
type ReadonlyUser = Readonly<User>;

const frozenUser: ReadonlyUser = { id: 1, name: "Joker", email: "j@test.com", age: 18 };
// frozenUser.name = "New"; // ❌ 只读不可改

console.log("只读用户：", frozenUser);

// exactOptionalPropertyTypes 为 true 时，Partial 的可选属性不能显式赋 undefined
// 如果需要显式 undefined，需要手动定义：
type UserDiff = {
  [K in keyof User]?: User[K] | undefined;
};

const diff: UserDiff = { name: undefined };
console.log("用户差异：", diff);

// --------------------------------------------------
// 关键总结
// --------------------------------------------------
//
// | 工具类型        | 作用                          | 典型场景               |
// |----------------|-------------------------------|-----------------------|
// | Partial<T>     | 所有属性变可选                  | 更新函数的变更参数      |
// | Required<T>    | 所有属性变必填                  | 填充默认值后确认完整    |
// | Readonly<T>    | 所有属性变只读                  | 防止修改返回的数据      |
// | Pick<T, K>     | 选取部分属性                    | 摘要/预览类型          |
// | Omit<T, K>     | 排除部分属性                    | 创建输入（去掉自动生成字段）|
// | Record<K, V>   | 键值映射                        | 字典/映射/分组         |
// | Exclude<U, E>  | 联合类型中排除成员              | 过滤不需要的状态值      |
// | Extract<U, E>  | 联合类型中提取成员              | 筛选符合条件的类型      |
// | NonNullable<T> | 排除 null/undefined            | 确保值存在             |
// | ReturnType<F>  | 提取函数返回类型                | 不重复定义返回值类型    |
// | Parameters<F>  | 提取函数参数类型（元组）         | 参数转发/日志          |
//
// 核心思想：从已有类型派生新类型，而不是从零定义。
// 这就是类型编程的起点——下一课我们将自己实现这些工具类型！
