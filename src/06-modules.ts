import { PI, add, multiply } from "./lib/math.js";
import { formatUser, type User } from "./lib/user.js";
import { type Product, formatProduct } from "./lib/product.js";

const sum = add(10, 20);
const product = multiply(3, 4);

const user: User = {
  id: 1,
  name: "Joker",
  email: "joker@example.com"
};

console.log(sum);
console.log(product);
console.log(PI);
console.log(formatUser(user));

// 练习：
// 1. 新建 src/lib/product.ts。
// 2. 在里面 export interface Product，包含 id、name、price、可选 discount。
// 3. 在里面 export function formatProduct(product: Product): string。
//    返回格式："商品名：价格"。
// 4. 在当前文件导入 Product 和 formatProduct。
// 5. 创建一个 product 对象并打印 formatProduct(product)。

const product1: Product = {
  id: 1,
  name: "iPhone",
  price: 9999
};
console.log(formatProduct(product1));

// 注意：
// 当前 tsconfig 使用 NodeNext，所以导入本地 TS 文件时，路径后缀要写 .js：
// import { something } from "./lib/example.js";
