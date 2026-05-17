type ConfigSummary = {
  strict: boolean;
  rootDir: string;
  outDir: string;
  module: "NodeNext";
};

const configSummary: ConfigSummary = {
  strict: true,
  rootDir: "src",
  outDir: "dist",
  module: "NodeNext"
};

console.log(configSummary);

function readRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`缺少环境变量：${name}`);
  }

  return value;
}

console.log(readRequiredEnv("PATH").length > 0);

// 练习：
// 1. 打开 tsconfig.json，理解下面几个配置：
//    - strict
//    - noUncheckedIndexedAccess
//    - exactOptionalPropertyTypes
//    - rootDir
//    - outDir
// 2. 运行 npm run check。它只做类型检查，不生成 dist。
// 3. 运行 npm run build。它会把 src 编译到 dist。
// 4. 打开 dist/07-tsconfig.js，观察 TypeScript 编译后的 JavaScript。
// 5. 新增一个函数 readOptionalEnv(name: string): string | undefined。
//    它直接返回 process.env[name]。
function readOptionalEnv(name: string): string | undefined {
  return process.env[name];
}
console.log(readOptionalEnv("PATH") !== undefined);
