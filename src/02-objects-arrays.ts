const tags: string[] = ["typescript", "node", "strict"];
const scores: number[] = [95, 88, 76];

const firstTag = tags[0];
const firstScore = scores[0];

console.log(firstTag);
console.log(firstScore);

const user: {
  id: number;
  name: string;
  isActive: boolean;
  email?: string;
} = {
  id: 1,
  name: "Joker",
  isActive: true
};

console.log(user.name);

const point: [number, number] = [10, 20];
console.log(point);

const method: "GET" | "POST" = "GET";
console.log(method);



type Product = {
  id: number;
  name: string;
  price: number;
  discount?: number;
};

// 练习：
// 1. 新增一个 products 数组。每个商品都应该有 id、name、price，以及可选的 discount。
const products: Product[] = [
  {
    id: 1,
    name: "iPhone",
    price: 999
  },
  {
    id: 2,
    name: "MacBook",
    price: 1999
  }
];
// 2. 写一个 getProductLabel(product) 函数，返回格式为 "name: price" 的字符串。
const getProductLabel = (product: Product): string => `${product.name}: ${product.price}`;
// 3. 新增一个名为 rgb 的元组，结构是 [number, number, number]。
const rgb: [number, number, number] = [255, 0, 0];
// 4. 新增一个字面量联合类型 Status，取值只能是 "draft"、"published"、"archived"。
type Status = "draft" | "published" | "archived";

const firstProduct = products[0];
if (firstProduct) {
  console.log(getProductLabel(firstProduct));
}
console.log(rgb);
