type ApiResult =
  | {
      ok: true;
      data: string;
    }
  | {
      ok: false;
      error: string;
    };

function printResult(result: ApiResult): void {
  if (result.ok) {
    console.log(`成功：${result.data}`);
    return;
  }

  console.log(`失败：${result.error}`);
}

printResult({ ok: true, data: "用户加载完成" });
printResult({ ok: false, error: "网络错误" });

interface User {
  id: number;
  name: string;
  email?: string;
}

function getContactText(user: User): string {
  if (user.email) {
    return `${user.name} <${user.email}>`;
  }

  return user.name;
}

console.log(getContactText({ id: 1, name: "Joker" }));
console.log(getContactText({ id: 2, name: "Alice", email: "alice@example.com" }));

// 练习：
// 1. 新增一个类型 PaymentStatus，取值为 "pending"、"paid"、"failed"。
type PaymentStatus = "pending" | "paid" | "failed";

function assertNever(value: never): never {
  throw new Error(`未处理的值：${value}`);
}

// 2. 写一个函数 getPaymentMessage(status: PaymentStatus): string。
//    pending 返回 "等待支付"，paid 返回 "支付成功"，failed 返回 "支付失败"。
function getPaymentMessage(status: PaymentStatus): string {
  switch (status) {
    case "pending":
      return "等待支付";
    case "paid":
      return "支付成功";
    case "failed":
      return "支付失败";
    default:
      return assertNever(status);
  }
}
// 3. 新增一个联合类型 Shape：
//    - 圆形：{ kind: "circle"; radius: number }
//    - 矩形：{ kind: "rectangle"; width: number; height: number }
type Shape =
  | {
      kind: "circle";
      radius: number;
    }
  | {
      kind: "rectangle";
      width: number;
      height: number;
    };
// 4. 写一个函数 getArea(shape: Shape): number，用 if 或 switch 根据 kind 计算面积。
function getArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    default:
      return assertNever(shape);
  }
}

console.log(getPaymentMessage("pending"));
console.log(getPaymentMessage("paid"));
console.log(getPaymentMessage("failed"));
console.log(getArea({ kind: "circle", radius: 5 }));
console.log(getArea({ kind: "rectangle", width: 10, height: 20 }));
