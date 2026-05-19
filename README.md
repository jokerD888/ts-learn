# TypeScript 从 0 学习

按阶段学习 TypeScript，每课三件事：理解概念 → 写练习 → 类型检查通过。

## 常用命令

```bash
npm install          # 安装依赖
npm run check        # tsc --noEmit 类型检查
npm run lesson:01    # 运行第 1 课（01-16 同理）
```

## 学习路线

### 基础篇

| 课 | 主题 | 文件 |
|----|------|------|
| 01 | 基础类型、类型推断、函数类型 | `01-basics.ts` |
| 02 | 对象、数组、元组、字面量类型 | `02-objects-arrays.ts` |
| 03 | union、interface、type、类型收窄 | `03-unions-narrowing.ts` |
| 04 | 泛型 | `04-generics.ts` |
| 05 | 类、访问修饰符、抽象类 | `05-classes.ts` |
| 06 | 模块、声明文件、第三方库类型 | `06-modules.ts` |
| 07 | 工程化：tsconfig、严格模式、构建调试 | `07-tsconfig.ts` |
| 08 | 实战：命令行任务管理器 | `08-task-manager.ts` |

### 进阶篇

| 课 | 主题 | 文件 |
|----|------|------|
| 09 | Utility Types：内置工具类型 + 手写实现 | `09-utility-types.ts` |
| 10 | 条件类型 & infer：分布式、递归、模式匹配 | `10-conditional-types.ts` |
| 11 | 映射类型：keyof、修饰符、as 重映射、过滤 | `11-mapped-types.ts` |
| 12 | 模板字面量类型：字符串解析、递归、类型安全路由 | `12-template-literal-types.ts` |

### 高级篇

| 课 | 主题 | 文件 |
|----|------|------|
| 13 | 声明合并 & 模块增强：interface 合并、declare global/module、.d.ts | `13-declaration-merging.ts` |
| 14 | 装饰器：Stage 3、类/方法/字段装饰器、装饰器工厂 | `14-decorators.ts` |
| 15 | 高级类型模式：Branded Types、Builder、递归类型、状态机、类型安全 EventEmitter | `15-advanced-patterns.ts` |
| 16 | 综合实战：类型安全 API Client（融合 03-15 所有知识点） | `16-api-client.ts` |
