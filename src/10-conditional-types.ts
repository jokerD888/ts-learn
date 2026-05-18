// ============================================================
// 第 10 课：Conditional Types & infer（条件类型与类型推断）
// ============================================================
//
// 学习目标：
//   理解条件类型的本质——类型层面的 if/else，掌握 infer 关键字
//   从类型中"提取"子类型，并手写实现上节课的 Utility Types。
//
// 核心概念：
//   Conditional Type = 类型层面的三元表达式
//   T extends U ? X : Y
//   如果 T 能赋值给 U，结果是 X，否则是 Y
// ============================================================

// --------------------------------------------------
// 1. 基本条件类型
// --------------------------------------------------

// 最简单的条件类型：判断是否是字符串
type IsString<T> = T extends string ? true : false;

type A = IsString<"hello">;   // true
type B = IsString<42>;        // false
type C = IsString<string>;    // true

console.log("IsString 示例编译通过");

// --------------------------------------------------
// 2. 条件类型的分发特性（Distributive Conditional Types）
// --------------------------------------------------

// 当 T 是裸类型参数（没有被包裹在元组/对象等中）且传入联合类型时，
// 条件类型会"分发"——对联合的每个成员分别计算，再合并结果

type ToArray<T> = T extends unknown ? T[] : never;

type Result1 = ToArray<string | number>;
// 等价于 ToArray<string> | ToArray<number>
// = string[] | number[]

// 对比：如果不想分发，用 [T] 包裹
type ToArrayNoDistribute<T> = [T] extends [unknown] ? T[] : never;

type Result2 = ToArrayNoDistribute<string | number>;
// = (string | number)[]  —— 不会分发

// 实际验证
const arr1: Result1 = ["hello"];   // string[] | number[] 的成员
const arr2: Result2 = ["hello", 1]; // (string | number)[] 可以混合

console.log("分发 vs 不分发：类型检查通过");

// --------------------------------------------------
// 3. infer 关键字——在条件类型中"提取"子类型
// --------------------------------------------------

// infer 就像在 extends 子句中声明一个"类型变量"，
// TS 会自动推断它应该是什么类型

// 提取 Promise 内部的值类型
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type P1 = UnwrapPromise<Promise<string>>;   // string
type P2 = UnwrapPromise<Promise<number[]>>; // number[]
type P3 = UnwrapPromise<string>;            // string（不是 Promise，原样返回）

const p1: P1 = "hello";
const p2: P2 = [1, 2, 3];
const p3: P3 = "not a promise";

console.log("UnwrapPromise 示例：", p1, p2, p3);

// 提取函数返回值类型——自己实现 ReturnType
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function getUser() {
  return { id: 1, name: "Joker", role: "admin" as const };
}

type GetUserReturn = MyReturnType<typeof getUser>;
// { id: number; name: string; role: "admin" }

const userReturn: GetUserReturn = { id: 1, name: "Joker", role: "admin" };
console.log("MyReturnType 结果：", userReturn);

// 提取函数第一个参数的类型
type FirstParameter<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never;

function sendMessage(to: string, content: string, urgent: boolean): void {}

type FirstParam = FirstParameter<typeof sendMessage>; // string

const firstArg: FirstParam = "user@test.com";
console.log("第一个参数类型：", firstArg);

// 提取数组元素类型
type ElementOf<T> = T extends (infer E)[] ? E : never;

type Elem1 = ElementOf<string[]>;   // string
type Elem2 = ElementOf<number[]>;   // number
type Elem3 = ElementOf<boolean>;    // never（不是数组）

const elem1: Elem1 = "item";
console.log("数组元素类型：", elem1);

// --------------------------------------------------
// 4. 手写 Utility Types——理解底层原理
// --------------------------------------------------

// MyPartial：把所有属性变可选
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

// MyRequired：把所有属性变必填
// -? 语法：移除属性的可选标记
type MyRequired<T> = {
  [K in keyof T]-?: T[K];
};

// MyReadonly：把所有属性变只读
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

// MyPick：从 T 中选取部分属性
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// MyOmit：从 T 中排除部分属性
// 思路：先从 keyof T 中排除 K，再 Pick
type MyOmit<T, K extends keyof T> = MyPick<T, Exclude<keyof T, K>>;

// MyRecord：构建键值映射
type MyRecord<K extends string | number | symbol, V> = {
  [P in K]: V;
};

// MyExclude：从联合类型中排除成员
// 利用分发条件类型：对 U 的每个成员分别判断
type MyExclude<U, E> = U extends E ? never : U;

// MyExtract：从联合类型中提取成员
type MyExtract<U, E> = U extends E ? U : never;

// MyNonNullable：排除 null 和 undefined
type MyNonNullable<T> = T extends null | undefined ? never : T;

// 验证手写版本和内置版本一致
interface TestType {
  id: number;
  name: string;
  email?: string;
}

const myPartial: MyPartial<TestType> = { id: 1 };
const myRequired: MyRequired<TestType> = { id: 1, name: "Joker", email: "j@test.com" };
const myReadonly: MyReadonly<TestType> = { id: 1, name: "Joker", email: "j@test.com" };
const myPick: MyPick<TestType, "id" | "name"> = { id: 1, name: "Joker" };
const myOmit: MyOmit<TestType, "email"> = { id: 1, name: "Joker" };
const myRecord: MyRecord<"a" | "b", number> = { a: 1, b: 2 };
type MyExclResult = MyExclude<"x" | "y" | "z", "z">; // "x" | "y"
type MyExtrResult = MyExtract<string | number | boolean, string | number>; // string | number
type MyNNResult = MyNonNullable<string | null | undefined>; // string

console.log("手写 Utility Types 验证通过");
console.log("MyPartial：", myPartial);
console.log("MyRequired：", myRequired);
console.log("MyReadonly：", myReadonly);
console.log("MyPick：", myPick);
console.log("MyOmit：", myOmit);
console.log("MyRecord：", myRecord);

// --------------------------------------------------
// 5. infer 的进阶用法——多次 infer
// --------------------------------------------------

// 提取函数的参数类型元组（自己实现 Parameters）
type MyParameters<T> = T extends (...args: infer P) => any ? P : never;

function registerUser(name: string, age: number, active: boolean): void {}

type RegParams = MyParameters<typeof registerUser>;
// [name: string, age: number, active: boolean]

const regArgs: RegParams = ["Joker", 18, true];
console.log("MyParameters：", regArgs);

// 反转对象类型的键值（值的类型需可做键）
type FlipRecord<T extends Record<PropertyKey, PropertyKey>> = {
  [K in keyof T as T[K]]: K;
};

const originalMap = { a: "x" as const, b: "y" as const };
type Flipped = FlipRecord<typeof originalMap>;
// { x: "a"; y: "b" }

const flipped: Flipped = { x: "a", y: "b" };
console.log("FlipRecord：", flipped);

// --------------------------------------------------
// 6. 条件类型的链式判断
// --------------------------------------------------

// 类型级别的类型分类器
type TypeName<T> =
  T extends string ? "string" :
  T extends number ? "number" :
  T extends boolean ? "boolean" :
  T extends Array<any> ? "array" :
  T extends object ? "object" :
  "unknown";

type TN1 = TypeName<"hi">;      // "string"
type TN2 = TypeName<42>;        // "number"
type TN3 = TypeName<true>;      // "boolean"
type TN4 = TypeName<string[]>;  // "array"
type TN5 = TypeName<{ a: 1 }>;  // "object"

console.log("TypeName 类型检查通过");

// --------------------------------------------------
// 练习
// --------------------------------------------------

// 练习 1：实现 UnwrapArray<T>，如果 T 是数组则提取元素类型，否则返回 never。
type UnwrapArray<T> = T extends (infer E)[] ? E : never;

type UA1 = UnwrapArray<string[]>;   // string
type UA2 = UnwrapArray<number>;     // never
const ua1: UA1 = "element";
console.log("UnwrapArray：", ua1);

// 练习 2：实现 Head<T>，提取元组类型的第一个元素类型。
// 提示：T extends [infer First, ...infer Rest] ? First : never
type Head<T> = T extends [infer First, ...any[]] ? First : never;

type H1 = Head<[string, number, boolean]>; // string
type H2 = Head<[42]>;                       // 42
type H3 = Head<[]>;                         // never

const h1: H1 = "first";
console.log("Head：", h1);

// 练习 3：实现 Tail<T>，提取元组类型除第一个外的剩余部分。
type Tail<T extends any[]> = T extends [any, ...infer Rest] ? Rest : never;

type T1 = Tail<[string, number, boolean]>; // [number, boolean]
type T2 = Tail<[42]>;                       // []

const t1: T1 = [1, true];
console.log("Tail：", t1);

// 练习 4：实现 IsNever<T>，判断 T 是否为 never 类型。
// 注意：never 是特殊类型，直接 T extends never 会对 never 分发变成 never。
// 解法：用 [T] 包裹避免分发。
type IsNever<T> = [T] extends [never] ? true : false;

type IN1 = IsNever<never>;   // true
type IN2 = IsNever<string>;  // false
type IN3 = IsNever<void>;    // false

console.log("IsNever 类型检查通过");

// 练习 5：实现 DeepReadonly<T>，递归地将所有嵌套属性变为只读。
// 提示：对属性值递归判断——如果是对象，继续 DeepReadonly
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function
      ? T[K]            // 函数保持原样
      : DeepReadonly<T[K]>  // 非函数对象递归
    : T[K];             // 基本类型保持原样
};

interface NestedConfig {
  server: {
    host: string;
    port: number;
    ssl: {
      enabled: boolean;
      cert: string;
    };
  };
  name: string;
}

const frozenConfig: DeepReadonly<NestedConfig> = {
  server: {
    host: "localhost",
    port: 3000,
    ssl: { enabled: true, cert: "cert.pem" },
  },
  name: "app",
};

// frozenConfig.server.host = "new";        // ❌ 只读
// frozenConfig.server.ssl.enabled = false;  // ❌ 深层只读
console.log("DeepReadonly：", frozenConfig);

// --------------------------------------------------
// 关键总结
// --------------------------------------------------
//
// | 概念                | 语法                              | 要点                        |
// |--------------------|-----------------------------------|-----------------------------|
// | 条件类型            | T extends U ? X : Y               | 类型层面的 if/else          |
// | 分发条件类型        | 裸 T + 联合类型传入                | 自动对每个成员分别计算       |
// | 避免分发            | [T] extends [U] ? X : Y           | 用元组包裹 T               |
// | infer              | T extends ... infer R ... ? R : N | 在 extends 中声明类型变量   |
// | 多次 infer          | T extends (infer A) => infer B    | 可在多处使用 infer          |
// | -? 修饰符          | { [K in keyof T]-?: T[K] }       | 移除可选标记                 |
// | readonly 修饰符    | { readonly [K in keyof T]: T[K] } | 添加只读标记                 |
// | 递归条件类型        | T extends object ? Deep<T> : T    | 条件类型可以递归调用自身     |
//
// 下一课我们将学习 Mapped Types（映射类型），它与条件类型组合
// 能实现更强大的类型转换——比如根据值类型过滤属性、重映射键名等。
