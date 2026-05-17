const username = "Joker";
const age = 18;
const isLearningTypeScript = true;

function greet(name: string): string {
  return `Hello, ${name}`;
}

function add(a: number, b: number): number {
  return a + b;
}

const message = greet(username);
const total = add(age, 2);

console.log(message);
console.log(total);
console.log(isLearningTypeScript);

function multiply(a: number, b: number): number {
  return a * b;
}

const result = multiply(5, 3);
console.log(`5 * 3 = ${result}`);

let score = 95;
console.log(`Score: ${score}`);

// const errorResult = add("1", 2);
const correctResult = add(1, 2);
console.log(`1 + 2 = ${correctResult}`);
