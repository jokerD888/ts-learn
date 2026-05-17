function first<T>(items: T[]): T | undefined {
  return items[0];
}

const firstNumber = first([1, 2, 3]);
const firstName = first(["Joker", "Alice", "Bob"]);

console.log(firstNumber);
console.log(firstName);

type Result<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: string;
    };

function success<T>(data: T): Result<T> {
  return {
    ok: true,
    data
  };
}

console.log(success({ id: 1, name: "Joker" }));

function getValue<TObject, TKey extends keyof TObject>(
  object: TObject,
  key: TKey
): TObject[TKey] {
  return object[key];
}

const userProfile = {
  id: 1,
  name: "Joker",
  age: 18
};

console.log(getValue(userProfile, "name"));

// 练习：
// 1. 写一个 last<T>(items: T[]): T | undefined，返回数组最后一项。
function last<T>(items: T[]): T | undefined {
  return items[items.length - 1];
}
// 2. 写一个 failure<T = never>(error: string): Result<T>，返回失败结果。
function failure<T = never>(error: string): Result<T> {
  return {
    ok: false,
    error
  };
}
// 3. 写一个 pair<T, U>(first: T, second: U): [T, U]。
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}
// 4. 写一个 pick<TObject, TKey extends keyof TObject>(object: TObject, key: TKey): TObject[TKey]。
function pick<TObject, TKey extends keyof TObject>(object: TObject, key: TKey): TObject[TKey] {
  return object[key];
}

console.log(last([10, 20, 30]));
console.log(failure("保存失败"));
console.log(pair("id", 1));
console.log(pick(userProfile, "age"));
