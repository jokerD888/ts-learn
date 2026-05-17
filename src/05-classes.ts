class UserAccount {
  readonly id: number;
  public name: string;
  private passwordHash: string;

  constructor(id: number, name: string, passwordHash: string) {
    this.id = id;
    this.name = name;
    this.passwordHash = passwordHash;
  }

  public rename(newName: string): void {
    this.name = newName;
  }

  public checkPassword(passwordHash: string): boolean {
    return this.passwordHash === passwordHash;
  }
}

const account = new UserAccount(1, "Joker", "hash-123");
account.rename("Joker Ts");

console.log(account.id);
console.log(account.name);
console.log(account.checkPassword("hash-123"));

abstract class NotificationSender {
  constructor(protected readonly from: string) {}

  abstract send(to: string, message: string): void;

  protected formatMessage(message: string): string {
    return `[${this.from}] ${message}`;
  }
}

class EmailSender extends NotificationSender {
  send(to: string, message: string): void {
    console.log(`发送邮件给 ${to}: ${this.formatMessage(message)}`);
  }
}

const sender = new EmailSender("system@example.com");
sender.send("joker@example.com", "欢迎学习 TypeScript");

// 练习：
// 1. 新增一个 class BankAccount。
//    - readonly id: number
//    - public owner: string
//    - private balance: number
class BankAccount {
  readonly id: number;
  public owner: string;
  private balance: number;

  constructor(id: number, owner: string, balance: number) {
    this.id = id;
    this.owner = owner;
    this.balance = balance;
  }

  deposit(amount: number): void {
    if (amount > 0) {
      this.balance += amount;
    }
  }

  withdraw(amount: number): boolean {
    if (amount > 0 && this.balance >= amount) {
      this.balance -= amount;
      return true;
    }
    return false;
  }

  getBalance(): number {
    return this.balance;
  }
}
// 2. 在 constructor 里初始化 id、owner、balance。
// 3. 新增 deposit(amount: number): void。amount 大于 0 才能增加余额。
// 4. 新增 withdraw(amount: number): boolean。余额足够时扣款并返回 true，否则返回 false。
// 5. 新增 getBalance(): number，用它读取余额，不要直接访问 private balance。
// 6. 新增一个 abstract class Animal，包含 abstract speak(): string。
abstract class Animal {
  abstract speak(): string;
}
// 7. 新增 Dog extends Animal，并让 speak() 返回 "汪"。
class Dog extends Animal {
  speak(): string {
    return "汪";
  }
}

const bankAccount = new BankAccount(1001, "Joker", 500);
bankAccount.deposit(200);
console.log(bankAccount.withdraw(300));
console.log(bankAccount.withdraw(1000));
console.log(bankAccount.getBalance());

const dog = new Dog();
console.log(dog.speak());
