type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

function assertNever(value: never): never {
  throw new Error(`未处理的值：${value}`);
}

function getPaymentMessage(status: PaymentStatus): string {
  switch (status) {
    case "pending":
      return "等待支付";
    case "paid":
      return "支付成功";
    case "failed":
      return "支付失败";
    case "refunded":
      return "已退款";
    default:
      return assertNever(status);
  }
}

console.log(getPaymentMessage("pending"));

// 你可以试验：
// 1. 把 PaymentStatus 改成 "pending" | "paid" | "failed" | "refunded"。
// 2. 不新增 case "refunded"。
// 3. 运行 npm run check。
// 这时 assertNever(status) 会报错，因为 status 已经不再是 never，而是 "refunded"。
