export interface Product {
  id: number;
  name: string;
  price: number;
  discount?: number;
}

export function formatProduct(product: Product): string {
  return `${product.name}：${product.price}`;
}
