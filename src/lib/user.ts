export interface User {
  id: number;
  name: string;
  email?: string;
}

export function formatUser(user: User): string {
  if (user.email) {
    return `${user.name} <${user.email}>`;
  }

  return user.name;
}
