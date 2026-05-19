// ============================================================
// 第 14 课：Decorators（装饰器）
// 核心思想：用函数包装类/方法/属性，声明式地添加行为
// 注意：TS 5.0+ 支持 Stage 3 装饰器（无需 experimentalDecorators）
// ============================================================

// --------------------------------------------------
// 1. 类装饰器——包装或替换类定义
// --------------------------------------------------

function logged<T extends { new (...args: any[]): any }>(Class: T, ctx: ClassDecoratorContext) {
  const name = ctx.name as string;
  console.log(`[log] 注册类：${name}`);
  return class extends Class {
    constructor(...args: any[]) {
      console.log(`[log] 实例化 ${name}，参数：${args.join(", ")}`);
      super(...args);
    }
  };
}

@logged
class UserService {
  constructor(private name: string) {}
  greet() { return `Hello, ${this.name}`; }
}

const svc = new UserService("Joker");
console.log(svc.greet());

// --------------------------------------------------
// 2. 方法装饰器——拦截方法调用
// --------------------------------------------------

function debounce(delay: number) {
  return function (_target: any, ctx: ClassMethodDecoratorContext) {
    console.log(`[debounce] 装饰 ${String(ctx.name)}，延迟 ${delay}ms`);
    // Stage 3 装饰器返回函数替换方法实现，这里仅演示声明效果
    // 完整 debounce 需要返回 (fn) => debouncedFn
  };
}

function readonly(_target: any, ctx: ClassMethodDecoratorContext) {
  // Stage 3 中通过 addInitializer 冻结方法
  // 这里简化演示
  console.log(`[readonly] 标记 ${String(ctx.name)} 为只读`);
}

class Editor {
  @debounce(300)
  save() { console.log("保存文档"); }

  @readonly
  getConfig() { return { theme: "dark" }; }
}

const editor = new Editor();
editor.save();

// --------------------------------------------------
// 3. 属性装饰器——拦截属性访问
// --------------------------------------------------

function format(formatter: (v: any) => string) {
  return function (_target: any, ctx: ClassFieldDecoratorContext) {
    console.log(`[format] 装饰字段 ${String(ctx.name)}`);
    // Stage 3: 可通过返回初始化函数转换值
  };
}

class Product {
  @format((v) => `¥${v.toFixed(2)}`)
  price: number;
  constructor(price: number) { this.price = price; }
}

const prod = new Product(99.9);
console.log("Product price：", prod.price);

// --------------------------------------------------
// 4. 实战：自动绑定 this
// --------------------------------------------------

function autobind(_target: any, ctx: ClassMethodDecoratorContext) {
  const name = String(ctx.name);
  return function (this: any, originalFn: (...args: any[]) => any) {
    return function (this: any, ...args: any[]) {
      return originalFn.call(this, ...args);
    };
  } as any;
}

class Button {
  label = "Click me";
  @autobind
  onClick() { console.log(`clicked: ${this.label}`); }
}

const btn = new Button();
const { onClick } = btn;
onClick(); // ✅ this 正确绑定，不会 undefined

// --------------------------------------------------
// 5. 实战：装饰器工厂 + 元数据模式
// --------------------------------------------------

// 模拟路由注册（类似 NestJS 风格）
const routes = new Map<string, Function>();

function Get(path: string) {
  return function (_target: any, ctx: ClassMethodDecoratorContext) {
    const routePath = `GET ${path}`;
    console.log(`[路由注册] ${routePath} → ${String(ctx.name)}`);
    // 实际项目中收集元数据，这里简化为直接注册
  };
}

function Controller(prefix: string) {
  return function (_Class: any, ctx: ClassDecoratorContext) {
    console.log(`[控制器] 注册 ${String(ctx.name)}，前缀：${prefix}`);
  };
}

@Controller("/users")
class UserController {
  @Get("/")
  list() { return ["Joker", "Alice"]; }

  @Get("/:id")
  detail() { return { name: "Joker" }; }
}

// --------------------------------------------------
// 6. Stage 3 装饰器核心 API
// --------------------------------------------------

// 装饰器类型               签名                                         ctx 类型
// ──────────────────────────────────────────────────────────────────────────
// 类装饰器                 (Class, ClassDecoratorContext) => Class|void  ClassDecoratorContext
// 方法装饰器               (fn, ClassMethodDecoratorContext) => fn|void  ClassMethodDecoratorContext
// 属性装饰器               (undefined, ClassFieldDecoratorContext) =>     ClassFieldDecoratorContext
//                          (initVal) => newInitVal
// getter/setter 装饰器     (fn, ClassGetterDecoratorContext) => fn|void  ClassGetter/SetterDecoratorContext

// ctx 通用属性：
//   ctx.name     — 被装饰的名称（string | symbol）
//   ctx.kind     — "class" | "method" | "field" | "getter" | "setter"
//   ctx.static   — 是否静态成员
//   ctx.private  — 是否私有成员
//   ctx.access   — { has(obj), get(obj) } 访问器对象
//   ctx.addInitializer(fn) — 添加初始化钩子

// --------------------------------------------------
// 练习
// --------------------------------------------------

// 1. 写一个 @trace 装饰器，在方法调用前后打印日志
function trace(_target: any, ctx: ClassMethodDecoratorContext) {
  const name = String(ctx.name);
  return function (originalFn: (...args: any[]) => any) {
    return function (this: any, ...args: any[]) {
      console.log(`[trace] → ${name}(${args.join(", ")})`);
      const result = originalFn.call(this, ...args);
      console.log(`[trace] ← ${name} = ${result}`);
      return result;
    };
  } as any;
}

class Calc {
  @trace
  add(a: number, b: number) { return a + b; }
}

const calc = new Calc();
calc.add(3, 4);

// 2. 写一个 @frozen 类装饰器，让实例属性不可修改（Object.freeze）
function frozen<T extends { new (...args: any[]): any }>(Class: T, _ctx: ClassDecoratorContext) {
  return class extends Class {
    constructor(...args: any[]) {
      super(...args);
      Object.freeze(this);
    }
  };
}

@frozen
class Point {
  constructor(public x: number, public y: number) {}
}

const pt = new Point(1, 2);
// pt.x = 10; // ❌ Cannot assign to 'x' because it is read-only
console.log("frozen Point：", pt);

// 3. 写一个 @range 属性装饰器，校验数值在 [min, max] 范围内
function range(min: number, max: number) {
  return function (_target: any, ctx: ClassFieldDecoratorContext) {
    const name = String(ctx.name);
    return function (initValue: any) {
      if (typeof initValue === "number" && (initValue < min || initValue > max)) {
        throw new Error(`${name} 必须在 ${min}-${max} 之间，当前值：${initValue}`);
      }
      return initValue;
    };
  };
}

class Grade {
  @range(0, 100)
  score: number;
  constructor(score: number) { this.score = score; }
}

const grade = new Grade(85);
console.log("range：", grade);
// new Grade(150); // 运行时抛错

// --------------------------------------------------
// 总结
// --------------------------------------------------
//
// 装饰器类型      用途                     典型场景
// 类装饰器        包装/增强类              日志、单例、freeze
// 方法装饰器      拦截方法调用            debounce、trace、autobind
// 属性装饰器      校验/转换属性值          required、format、range
// 装饰器工厂      接受参数返回装饰器        @Get("/path")、@debounce(300)
// 元数据模式      声明式注册               路由、依赖注入、ORM 映射
