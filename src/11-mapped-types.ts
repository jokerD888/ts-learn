// ============================================================
// 第 11 课：Mapped Types（映射类型）
// 核心思想：类型层面的 for...in 循环
// ============================================================

// --------------------------------------------------
// 1. 基础：遍历属性生成新类型
// --------------------------------------------------

interface Point3D { x: number; y: number; z: number }

// 所有值变 string
type Stringify<T> = { [K in keyof T]: string };
const pStr: Stringify<Point3D> = { x: "1", y: "2", z: "3" };
console.log("Stringify：", pStr);

// --------------------------------------------------
// 2. 修饰符：+readonly / -readonly / +? / -?
// --------------------------------------------------

type MakeReadonly<T>  = { readonly [K in keyof T]: T[K] };
type MakeOptional<T>  = { [K in keyof T]?: T[K] };
type MakeMutable<T>   = { -readonly [K in keyof T]: T[K] };
type MakeRequired<T>  = { [K in keyof T]-?: T[K] };

interface FrozenUser { readonly id: number; readonly name: string }
type UnfrozenUser = MakeMutable<FrozenUser>;
const u: UnfrozenUser = { id: 1, name: "Joker" };
u.name = "Alice"; // ✅ readonly 已移除
console.log("Mutable：", u);

interface OptData { a?: string; b?: number }
type ReqData = MakeRequired<OptData>;
const d: ReqData = { a: "hi", b: 42 };
console.log("Required：", d);

// --------------------------------------------------
// 3. Key 重映射（as 子句）—— 变换键名 / 过滤键
// --------------------------------------------------

// 变换键名：加前缀
type PrefixKeys<T, P extends string> = {
  [K in keyof T as `${P}${Capitalize<string & K>}`]: T[K];
};

interface ApiConfig { host: string; port: number; secure: boolean }
type Prefixed = PrefixKeys<ApiConfig, "api">;
// { apiHost: string; apiPort: number; apiSecure: boolean }
const pf: Prefixed = { apiHost: "localhost", apiPort: 3000, apiSecure: true };
console.log("PrefixKeys：", pf);

// 生成 Getter 方法签名
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};
type UserGetters = Getters<{ id: number; name: string }>;
// { getId: () => number; getName: () => string }
const g: UserGetters = { getId: () => 1, getName: () => "Joker" };
console.log("Getters：", g.getId(), g.getName());

// 过滤键：as 返回 never 则跳过
type PickFunctions<T> = {
  [K in keyof T as T[K] extends Function ? K : never]: T[K];
};
type OmitFunctions<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

interface MixedObj { id: number; name: string; onSave: () => void; onDelete: () => boolean }
const funcs: PickFunctions<MixedObj> = { onSave: () => {}, onDelete: () => true };
const data: OmitFunctions<MixedObj> = { id: 1, name: "Joker" };
console.log("PickFunctions：", funcs, "OmitFunctions：", data);

// 按值类型过滤/排除
type PickByValueType<T, V> = { [K in keyof T as T[K] extends V ? K : never]: T[K] };
type OmitByValueType<T, V> = { [K in keyof T as T[K] extends V ? never : K]: T[K] };

// --------------------------------------------------
// 4. 内置字符串工具类型（常和 as 配合）
// --------------------------------------------------

// Uppercase<"hello"> → "HELLO"
// Lowercase<"HELLO"> → "hello"
// Capitalize<"hello"> → "Hello"
// Uncapitalize<"Hello"> → "hello"

type ConstantKeys<T> = { [K in keyof T as Uppercase<string & K>]: T[K] };
type ConstCfg = ConstantKeys<{ host: string; port: number }>;
// { HOST: string; PORT: number }
const cc: ConstCfg = { HOST: "localhost", PORT: 3000 };
console.log("ConstantKeys：", cc);

// --------------------------------------------------
// 5. 递归映射 + 值变换
// --------------------------------------------------

// 深层可选
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends Function ? T[K] : DeepPartial<T[K]>
    : T[K];
};

interface DeepConfig {
  database: { host: string; port: number; credentials: { user: string; password: string } };
  cache: { enabled: boolean };
}

const dp: DeepPartial<DeepConfig> = { database: { credentials: { user: "admin" } } };
console.log("DeepPartial：", JSON.stringify(dp));

// API 响应 → 请求/客户端视图
interface ApiUser {
  id: number; name: string; email: string;
  createdAt: string; updatedAt: string;
}
type CreateUserReq = Omit<ApiUser, "id" | "createdAt" | "updatedAt">;
type UpdateUserReq = Partial<Omit<ApiUser, "id" | "createdAt" | "updatedAt">>;
type ClientUser = {
  [K in keyof ApiUser]: K extends "createdAt" | "updatedAt" ? Date : ApiUser[K];
};

const cu: ClientUser = { id: 1, name: "Joker", email: "j@test.com", createdAt: new Date(), updatedAt: new Date() };
console.log("ClientUser：", cu);

// --------------------------------------------------
// 练习
// --------------------------------------------------

// 1. Nullable<T>：所有属性值变成 T[K] | null
type Nullable<T> = { [K in keyof T]: T[K] | null };
interface Product { id: number; name: string; price: number }
const np: Nullable<Product> = { id: null, name: "Widget", price: null };
console.log("Nullable：", np);

// 2. PickByValue<T, V>：只保留值类型兼容 V 的属性（同上面 PickByValueType）
// 已在上方定义，这里直接用
interface EvtMap { click: string; change: string; keydown: number; hover: boolean }
type StrEvts = PickByValueType<EvtMap, string>;
// { click: string; change: string }
const se: StrEvts = { click: "c", change: "ch" };
console.log("PickByValue：", se);

// 3. SetterMethods<T>：为每个属性生成 set 方法
type SetterMethods<T> = {
  [K in keyof T as `set${Capitalize<string & K>}`]: (v: T[K]) => void;
};
type UsrSetters = SetterMethods<{ id: number; name: string }>;
// { setId: (v: number) => void; setName: (v: string) => void }
const s: UsrSetters = {
  setId: (v) => console.log(`id=${v}`),
  setName: (v) => console.log(`name=${v}`),
};
s.setId(1); s.setName("Joker");

// 4. OptionalKeys<T>：提取所有可选属性的键组成联合类型
// 原理：{} extends Pick<T, K> 成立 ↔ K 是可选的
type OptionalKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? K : never }[keyof T];
interface MixedProps { req: string; opt1?: number; anotherReq: boolean; opt2?: Date }
type OK = OptionalKeys<MixedProps>; // "opt1" | "opt2"
console.log("OptionalKeys 类型检查通过");

// 5. DeepReadonly<T>：递归所有嵌套属性只读
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function ? T[K] : DeepReadonly<T[K]>
    : T[K];
};
interface Nested { server: { host: string; ssl: { enabled: boolean } }; name: string }
const frozen: DeepReadonly<Nested> = {
  server: { host: "localhost", ssl: { enabled: true } }, name: "app",
};
// frozen.server.host = "x";      // ❌
// frozen.server.ssl.enabled = false; // ❌
console.log("DeepReadonly：", frozen);

// --------------------------------------------------
// 总结
// --------------------------------------------------
//
// 语法                          作用
// [K in keyof T]: NewType       遍历属性
// +/- readonly                  加/移除只读
// +/- ?                         加/移除可选
// as NewKey                     重映射键名
// as T[K] extends V ? K : never 按值类型过滤
// 递归：T[K] extends object ? Deep<T[K]> : T[K]
