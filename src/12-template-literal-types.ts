// ============================================================
// 第 12 课：Template Literal Types（模板字面量类型）
// 核心思想：类型层面的字符串拼接/解析
// ============================================================

// --------------------------------------------------
// 1. 基础：字符串拼接
// --------------------------------------------------

type Greeting = `Hello, ${string}`;       // 可赋值 "Hello, world"、"Hello, 任何string"
type Route = `/api/${string}`;             // 可赋值 "/api/users" 等
type EventName = `on${"Click" | "Change" | "Submit"}`;
// "onClick" | "onChange" | "onSubmit"

const ev: EventName = "onClick";
console.log("EventName：", ev);

// 联合类型在模板中自动展开（笛卡尔积）
type Method = "GET" | "POST";
type Path = "/users" | "/posts";
type Endpoint = `${Method} ${Path}`;
// "GET /users" | "GET /posts" | "POST /users" | "POST /posts"

const ep: Endpoint = "GET /users";
console.log("Endpoint：", ep);

// --------------------------------------------------
// 2. 结合映射类型：自动生成事件系统
// --------------------------------------------------

interface DomEvents {
  click: { x: number; y: number };
  keydown: { key: string; code: string };
  focus: {};
  blur: {};
}

// 自动生成 onXxx 方法签名
type OnEvents<T> = {
  [K in keyof T as `on${Capitalize<string & K>}`]: (payload: T[K]) => void;
};

type DomHandlers = OnEvents<DomEvents>;
// { onClick: (p: {x,y}) => void; onKeydown: (p: {key,code}) => void; onFocus: (p: {}) => void; onBlur: (p: {}) => void }

const handlers: DomHandlers = {
  onClick: (p) => console.log(`click at ${p.x},${p.y}`),
  onKeydown: (p) => console.log(`key: ${p.key}`),
  onFocus: () => console.log("focus"),
  onBlur: () => console.log("blur"),
};
handlers.onClick({ x: 10, y: 20 });

// 反向：从 onXxx 提取事件名
type UnCapitalize<S extends string> = S extends `on${infer Rest}` ? Lowercase<Rest> : never;
type ExtractedEvent = UnCapitalize<"onClick">; // "click"

// --------------------------------------------------
// 3. infer 解析字符串：类型级正则
// --------------------------------------------------

// 解析 HTTP 方法 + 路径
type ParseEndpoint<S extends string> =
  S extends `${infer Method} ${infer Path}` ? { method: Method; path: Path } : never;

type P1 = ParseEndpoint<"GET /users">;     // { method: "GET"; path: "/users" }
type P2 = ParseEndpoint<"POST /api/data">; // { method: "POST"; path: "/api/data" }

const p1: P1 = { method: "GET", path: "/users" };
console.log("ParseEndpoint：", p1);

// 解析 CSS 像素值
type ParsePx<S extends string> =
  S extends `${infer N}px` ? (N extends `${number}` ? number : never) : never;

// 解析版本号
type ParseVersion<S extends string> =
  S extends `${infer Major}.${infer Minor}.${infer Patch}`
    ? { major: Major; minor: Minor; patch: Patch }
    : S extends `${infer Major}.${infer Minor}`
      ? { major: Major; minor: Minor; patch: "0" }
      : never;

type V1 = ParseVersion<"1.2.3">;  // { major: "1"; minor: "2"; patch: "3" }
type V2 = ParseVersion<"2.0">;    // { major: "2"; minor: "0"; patch: "0" }

const v1: V1 = { major: "1", minor: "2", patch: "3" };
console.log("ParseVersion：", v1);

// --------------------------------------------------
// 4. 类型安全路由：实战模式
// --------------------------------------------------

interface RouteMap {
  "/users": { page: "user-list" };
  "/users/:id": { page: "user-detail"; id: string };
  "/posts/:postId/comments/:commentId": { page: "comment"; postId: string; commentId: string };
}

// 提取路径参数名
type ExtractParams<S extends string> =
  S extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof ExtractParams<Rest>]: string }
    : S extends `${string}:${infer Param}`
      ? { [K in Param]: string }
      : {};

type R1 = ExtractParams<"/users/:id">;
// { id: string }
type R2 = ExtractParams<"/posts/:postId/comments/:commentId">;
// { postId: string; commentId: string }

// 路由跳转函数：路径 + 参数 = 完整 URL
function navigate<T extends string>(
  path: T,
  ...args: keyof ExtractParams<T> extends never ? [] : [params: ExtractParams<T>]
): string {
  if (args.length > 0) {
    const params = args[0] as Record<string, string>;
    return path.replace(/:(\w+)/g, (_, key) => params[key] ?? key);
  }
  return path;
}

console.log("navigate /users：", navigate("/users"));
console.log("navigate /users/:id：", navigate("/users/:id", { id: "42" }));
console.log("navigate deep：", navigate("/posts/:postId/comments/:commentId", { postId: "1", commentId: "5" }));

// --------------------------------------------------
// 5. 字符串递归操作
// --------------------------------------------------

// 反转字符串（类型级）
type Reverse<S extends string> = S extends `${infer First}${infer Rest}` ? `${Reverse<Rest>}${First}` : S;
type Rev = Reverse<"abc">; // "cba"

// 字符串长度（类型级，有限制）
type StrLen<S extends string, T extends string[] = []> =
  S extends `${string}${infer Rest}` ? StrLen<Rest, [...T, ""]> : T["length"];
type Len = StrLen<"hello">; // 5

// Trim（去除首尾空格）
type Trim<S extends string> =
  S extends ` ${infer Rest}` ? Trim<Rest>
    : S extends `${infer Rest} ` ? Trim<Rest>
    : S;
type Trimmed = Trim<"  hello  ">; // "hello"

console.log("字符串递归类型验证通过");

// --------------------------------------------------
// 6. 类型安全的事件发射器
// --------------------------------------------------

interface AppEvents {
  "user:login": { userId: number; timestamp: number };
  "user:logout": { userId: number };
  "data:update": { table: string; id: number };
  "data:delete": { table: string; id: number };
}

// 严格类型的 EventEmitter
type StrictEmitter<Events extends Record<string, any>> = {
  on<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void): void;
  emit<K extends keyof Events>(event: K, payload: Events[K]): void;
};

function createEmitter<Events extends Record<string, any>>(): StrictEmitter<Events> {
  const listeners = new Map<string, Set<Function>>();
  return {
    on(event, handler) {
      if (!listeners.has(event as string)) listeners.set(event as string, new Set());
      listeners.get(event as string)!.add(handler);
    },
    emit(event, payload) {
      listeners.get(event as string)?.forEach((fn) => fn(payload));
    },
  };
}

const emitter = createEmitter<AppEvents>();
emitter.on("user:login", (p) => console.log(`用户 ${p.userId} 登录`));
emitter.emit("user:login", { userId: 1, timestamp: Date.now() });
// emitter.emit("user:login", { userId: 1 });              // ❌ 缺 timestamp
// emitter.emit("data:update", { table: "users" });         // ❌ 缺 id

// --------------------------------------------------
// 练习
// --------------------------------------------------

// 1. 实现 Join<S, D>，把字符串数组类型用分隔符拼接
//   Join<["a", "b", "c"], "-"> → "a-b-c"
type Join<S extends string[], D extends string> =
  S extends [infer First extends string, ...infer Rest extends string[]]
    ? Rest extends [] ? First : `${First}${D}${Join<Rest, D>}`
    : "";

type Joined = Join<["a", "b", "c"], "-">; // "a-b-c"
const joined: Joined = "a-b-c";
console.log("Join：", joined);

// 2. 实现 Split<S, D>，把字符串按分隔符拆分成元组
//   Split<"a-b-c", "-"> → ["a", "b", "c"]
type Split<S extends string, D extends string> =
  S extends `${infer Head}${D}${infer Tail}` ? [Head, ...Split<Tail, D>] : [S];

type Splitted = Split<"a-b-c", "-">; // ["a", "b", "c"]
const splitted: Splitted = ["a", "b", "c"];
console.log("Split：", splitted);

// 3. 实现 CamelCase<S>，把 kebab-case 转成 camelCase
//   CamelCase<"my-component-name"> → "myComponentName"
type CamelCase<S extends string> =
  S extends `${infer First}-${infer Rest}`
    ? `${First}${Capitalize<CamelCase<Rest>>}`
    : S;

type Camed = CamelCase<"my-component-name">; // "myComponentName"
const camed: Camed = "myComponentName";
console.log("CamelCase：", camed);

// 4. 实现 KebabCase<S>，把 camelCase 转成 kebab-case
//   提示：逐字符扫描，遇到大写字母前插入 "-"
type KebabCase<S extends string> =
  S extends `${infer First}${infer Rest}`
    ? First extends Uppercase<First>
      ? First extends Lowercase<First>
        ? `${First}${KebabCase<Rest>}`           // 非字母，原样
        : `-${Lowercase<First>}${KebabCase<Rest>}` // 大写字母
      : `${First}${KebabCase<Rest>}`              // 小写字母
    : S;

type Kebabed = KebabCase<"myComponentName">; // "my-component-name"
const kebabed: Kebabed = "my-component-name";
console.log("KebabCase：", kebabed);

// 5. 用模板字面量 + 映射类型，为下面的 Status 生成所有 isXxx() 和 setXxx() 方法签名
type Status = "active" | "inactive" | "pending";
type StatusMethods = {
  [K in Status as `is${Capitalize<K>}`]: () => boolean
} & {
  [K in Status as `set${Capitalize<K>}`]: () => void
};

const statusMethods: StatusMethods = {
  isActive: () => true,
  isInactive: () => false,
  isPending: () => false,
  setActive: () => {},
  setInactive: () => {},
  setPending: () => {},
};
console.log("StatusMethods：isActive =", statusMethods.isActive());

// --------------------------------------------------
// 总结
// --------------------------------------------------
//
// 能力                     示例
// 字符串拼接               `${A}${B}`
// 联合展开                 `${"a"|"b"}-${"x"|"y"}` → 4种
// infer 解析               S extends `${infer M} ${infer P}` ? ...
// 递归解析                 ExtractParams 逐段提取 :param
// 映射+模板生成方法        as `on${Capitalize<K>}`
// 字符串递归               Reverse / Trim / CamelCase
