// ============================================================
// 第 15 课：Advanced Type Patterns（高级类型模式）
// 核心思想：用类型系统解决真实工程问题
// ============================================================

// --------------------------------------------------
// 1. Branded Types（名义类型）—— 防止结构相同的类型混用
// --------------------------------------------------

// 问题：userId 和 orderId 都是 number，但不应互换
type Brand<T, B extends string> = T & { __brand: B };

type UserId = Brand<number, "UserId">;
type OrderId = Brand<number, "OrderId">;

function getUser(id: UserId) { return { name: "Joker", id }; }
function getOrder(id: OrderId) { return { title: "Widget", id }; }

const uid = 1 as UserId;
const oid = 2 as OrderId;

getUser(uid);   // ✅
// getUser(oid); // ❌ OrderId 不能赋值给 UserId
// getOrder(1);  // ❅ 字面量 number 也不行

console.log("Branded：", getUser(uid));

// 实战：强类型 ID 工厂
function createId<T extends string>(value: number): Brand<number, T> {
  return value as Brand<number, T>;
}

const userId = createId<"User">(100);
const orderId = createId<"Order">(200);
console.log("ID 工厂：", userId, orderId);

// --------------------------------------------------
// 2. Builder 模式—— 类型安全的链式构建
// --------------------------------------------------

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

interface EmailConfig {
  from: string;
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
  priority?: "low" | "normal" | "high";
}

class EmailBuilder {
  private config: Partial<EmailConfig> = {};

  from(from: string) { this.config.from = from; return this; }
  to(to: string) { this.config.to = to; return this; }
  subject(subject: string) { this.config.subject = subject; return this; }
  body(body: string) { this.config.body = body; return this; }
  cc(cc: string) { this.config.cc = cc; return this; }
  priority(p: "low" | "normal" | "high") { this.config.priority = p; return this; }

  build(): EmailConfig {
    const { from, to, subject, body } = this.config;
    if (!from || !to || !subject || !body) {
      throw new Error("缺少必填字段");
    }
    return { ...this.config, from, to, subject, body } as EmailConfig;
  }
}

const email = new EmailBuilder()
  .from("me@test.com")
  .to("you@test.com")
  .subject("Hello")
  .body("World")
  .priority("high")
  .build();

console.log("Builder：", email);

// --------------------------------------------------
// 3. 递归类型—— 深层嵌套结构
// --------------------------------------------------

// 树形结构
interface TreeNode<T> {
  value: T;
  children?: TreeNode<T>[];
}

const tree: TreeNode<string> = {
  value: "root",
  children: [
    { value: "a", children: [{ value: "a1" }, { value: "a2" }] },
    { value: "b" },
  ],
};

function flattenTree<T>(node: TreeNode<T>): T[] {
  return [node.value, ...(node.children?.flatMap(flattenTree) ?? [])];
}

console.log("树扁平化：", flattenTree(tree));

// JSON 类型（递归联合）
type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

const data: JsonValue = {
  name: "Joker",
  scores: [95, 88],
  meta: { active: true, tags: ["admin", null] },
};
console.log("JsonValue：", JSON.stringify(data));

// 深层 Path 类型
type Path<T, Prefix extends string = ""> =
  T extends object
    ? { [K in keyof T & string]: Path<T[K], `${Prefix}${Prefix extends "" ? "" : "."}${K}`> }[keyof T & string] | Prefix
    : Prefix;

type ObjPath = Path<{ a: { b: { c: number } }; d: string }>;
// "" | "a" | "a.b" | "a.b.c" | "d"

console.log("Path 类型验证通过");

// --------------------------------------------------
// 4. 类型安全的状态机
// --------------------------------------------------

type StateMachine<T extends Record<string, Record<string, string>>> = {
  [State in keyof T]: {
    transitions: T[State];
    is: <S extends string>(s: S) => s is State & S;
  };
};

function createMachine<T extends Record<string, Record<string, string>>>(config: {
  initial: keyof T;
  states: T;
}) {
  let current = String(config.initial);
  return {
    get current() { return current; },
    can(event: string): boolean {
      const state = config.states[current as keyof T];
      return state != null && event in state;
    },
    send(event: string): boolean {
      const next = config.states[current as keyof T]?.[event];
      if (next) { current = next; return true; }
      return false;
    },
  };
}

const light = createMachine({
  initial: "green",
  states: {
    green: { timer: "yellow" },
    yellow: { timer: "red" },
    red: { timer: "green" },
  },
});

console.log("状态机：", light.current);    // green
light.send("timer");                        // → yellow
console.log("→", light.current);            // yellow
light.send("timer");                        // → red
console.log("→", light.current);            // red
console.log("can timer？", light.can("timer")); // true
console.log("can crash？", light.can("crash")); // false

// --------------------------------------------------
// 5. 类型安全的 EventEmitter
// --------------------------------------------------

type EventMap2 = { [key: string]: unknown[] };
type Emitter<Events extends EventMap2> = {
  on<E extends string & keyof Events>(event: E, handler: (...args: Events[E]) => void): void;
  off<E extends string & keyof Events>(event: E, handler: (...args: Events[E]) => void): void;
  emit<E extends string & keyof Events>(event: E, ...args: Events[E]): void;
};

function createEmitter2<Events extends EventMap2>(): Emitter<Events> {
  const map = new Map<keyof Events, Set<Function>>();
  return {
    on(event, handler) {
      if (!map.has(event)) map.set(event, new Set());
      map.get(event)!.add(handler);
    },
    off(event, handler) { map.get(event)?.delete(handler); },
    emit(event, ...args) {
      map.get(event)?.forEach((fn) => fn(...args));
    },
  };
}

interface AppEvents extends EventMap2 {
  login: [userId: number, timestamp: number];
  logout: [userId: number];
  update: [table: string, id: number, data: Record<string, unknown>];
}

const bus = createEmitter2<AppEvents>();
bus.on("login", (userId, ts) => console.log(`login: ${userId} at ${ts}`));
bus.on("update", (table, id, data) => console.log(`update ${table}#${id}`, data));
bus.emit("login", 1, Date.now());
bus.emit("update", "users", 1, { name: "Joker" });
// bus.emit("login", 1);            // ❌ 缺参数
// bus.on("login", (s: string) => {}); // ❌ 参数类型不匹配

// --------------------------------------------------
// 练习
// --------------------------------------------------

// 1. 用 Branded Type 实现 Celsius / Fahrenheit，防止混用
type Celsius = Brand<number, "Celsius">;
type Fahrenheit = Brand<number, "Fahrenheit">;

function toFahrenheit(c: Celsius): Fahrenheit {
  return (c * 9 / 5 + 32) as Fahrenheit;
}

const temp: Celsius = 100 as Celsius;
console.log("温度转换：", toFahrenheit(temp)); // 212

// 2. 实现类型安全的 curry2：将 (a, b) => R 变成 a => b => R
function curry2<A, B, R>(fn: (a: A, b: B) => R): (a: A) => (b: B) => R {
  return (a) => (b) => fn(a, b);
}

const add = curry2((a: number, b: number) => a + b);
const add5 = add(5);
console.log("curry2：", add5(3), add5(10));

// 3. 实现 DeepPartial + DeepRequired 组合
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends Function ? T[K] : DeepPartial<T[K]>
    : T[K];
};
type DeepRequired<T> = {
  [K in keyof T]-?: T[K] extends object
    ? T[K] extends Function ? T[K] : DeepRequired<T[K]>
    : T[K];
};

interface DeepCfg {
  db: { host: string; port?: number; auth?: { user: string; pass?: string } };
  cache?: { enabled: boolean };
}

const partialCfg: DeepPartial<DeepCfg> = { db: { host: "localhost" } };
// const requiredCfg: DeepRequired<DeepCfg> = { ... }; // 全部必填
console.log("DeepPartial：", JSON.stringify(partialCfg));

// --------------------------------------------------
// 总结
// --------------------------------------------------
//
// 模式                 解决的问题                 关键技术
// Branded Type         防止结构相同类型混用         & { __brand: B }
// Builder              类型安全链式构建             Partial + 运行时校验
// 递归类型             树/JSON/深层路径            T extends object ? ... : T
// 状态机               有限状态转换                 Record<State, Record<Event, Next>>
// 类型安全 EventEmitter 事件名+参数类型绑定          映射类型 + 函数重载
