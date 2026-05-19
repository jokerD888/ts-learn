// ============================================================
// 第 16 课：综合实战——Type-safe API Client
// 综合运用 09-15 所有进阶知识
// ============================================================

// === Branded Types（15课）===
type Brand<T, B extends string> = T & { __brand: B };
type UserId = Brand<number, "UserId">;
type PostId = Brand<number, "PostId">;
type CommentId = Brand<number, "CommentId">;
const uid = (n: number) => n as UserId;
const pid = (n: number) => n as PostId;
const cid = (n: number) => n as CommentId;

// === Discriminated Unions（03课）===
type Result<T> = { ok: true; data: T } | { ok: false; error: string };

// === Utility Types（09课）===
interface UserRow { id: UserId; name: string; email: string; createdAt: string }
type UserResponse = Omit<UserRow, "createdAt"> & { createdAt: Date };
type CreateUserRequest = Omit<UserRow, "id" | "createdAt">;
type UpdateUserRequest = Partial<Omit<UserRow, "id" | "createdAt">>;

interface PostRow { id: PostId; authorId: UserId; title: string; body: string; status: "draft" | "published" }
type CreatePostRequest = Omit<PostRow, "id">;
type UpdatePostRequest = Partial<Omit<PostRow, "id" | "authorId">>;

interface CommentRow { id: CommentId; postId: PostId; authorId: UserId; content: string }
type CreateCommentRequest = Omit<CommentRow, "id">;

// === Template Literal Types（12课）=== 路由 → 方法名
// "GET /users/:id" → "getUsersById"
// "GET /posts/:postId/comments" → "getPostsByPostIdComments"

type SegToCamel<S extends string> =
  S extends `:${infer Name}` ? `By${Capitalize<Name>}` : Capitalize<S>;

type PathToCamel<S extends string> =
  S extends `/${infer Seg}/${infer Rest}`
    ? `${SegToCamel<Seg>}${PathToCamel<`/${Rest}`>}`
    : S extends `/${infer Seg}`
      ? SegToCamel<Seg>
      : "";

type RouteToMethod<S extends string> =
  S extends `${infer M} ${infer P}` ? `${Lowercase<M>}${PathToCamel<P>}` : never;

// === Conditional Types + Mapped Types（10-11课）=== 生成客户端类型
interface RouteDefs {
  "GET /users": { response: UserResponse[]; params: {} };
  "GET /users/:id": { response: UserResponse; params: { id: string } };
  "POST /users": { response: UserResponse; params: {}; body: CreateUserRequest };
  "PATCH /users/:id": { response: UserResponse; params: { id: string }; body: UpdateUserRequest };
  "DELETE /users/:id": { response: { success: boolean }; params: { id: string } };
  "GET /posts": { response: PostRow[]; params: {} };
  "GET /posts/:id": { response: PostRow; params: { id: string } };
  "POST /posts": { response: PostRow; params: {}; body: CreatePostRequest };
  "GET /posts/:postId/comments": { response: CommentRow[]; params: { postId: string } };
  "POST /posts/:postId/comments": { response: CommentRow; params: { postId: string }; body: CreateCommentRequest };
}

// {} extends P → P 无必填属性 → 不需要传 params
type ApiMethods<R extends Record<string, any>> = {
  [K in keyof R as RouteToMethod<string & K>]:
    R[K] extends { body: any }
      ? ({} extends R[K]["params"]
          ? (body: R[K]["body"]) => Promise<Result<R[K]["response"]>>
          : (params: R[K]["params"], body: R[K]["body"]) => Promise<Result<R[K]["response"]>>)
      : ({} extends R[K]["params"]
          ? () => Promise<Result<R[K]["response"]>>
          : (params: R[K]["params"]) => Promise<Result<R[K]["response"]>>)
};

type ApiClient = ApiMethods<RouteDefs>;

// === 运行时实现 ===
const db = {
  users: [
    { id: uid(1), name: "Joker", email: "j@test.com", createdAt: new Date("2026-01-01") },
    { id: uid(2), name: "Alice", email: "a@test.com", createdAt: new Date("2026-02-01") },
  ] as UserResponse[],
  posts: [
    { id: pid(1), authorId: uid(1), title: "TypeScript 进阶", body: "正文...", status: "published" as const },
    { id: pid(2), authorId: uid(2), title: "React 模式", body: "内容...", status: "draft" as const },
  ] as PostRow[],
  comments: [
    { id: cid(1), postId: pid(1), authorId: uid(2), content: "写得好！" },
  ] as CommentRow[],
};

async function req(route: string, params: Record<string, string> = {}, body?: unknown): Promise<Result<any>> {
  if (route === "GET /users") return { ok: true, data: db.users };
  if (route === "GET /users/:id") {
    const u = db.users.find((u) => u.id === uid(Number(params.id)));
    return u ? { ok: true, data: u } : { ok: false, error: "用户不存在" };
  }
  if (route === "POST /users") {
    const b = body as CreateUserRequest;
    const u: UserResponse = { id: uid(db.users.length + 1), ...b, createdAt: new Date() };
    db.users.push(u);
    return { ok: true, data: u };
  }
  if (route === "PATCH /users/:id") {
    const idx = db.users.findIndex((u) => u.id === uid(Number(params.id)));
    if (idx === -1) return { ok: false, error: "用户不存在" };
    db.users[idx] = { ...db.users[idx], ...(body as UpdateUserRequest) } as UserResponse;
    return { ok: true, data: db.users[idx] };
  }
  if (route === "DELETE /users/:id") {
    const idx = db.users.findIndex((u) => u.id === uid(Number(params.id)));
    if (idx === -1) return { ok: false, error: "用户不存在" };
    db.users.splice(idx, 1);
    return { ok: true, data: { success: true } };
  }
  if (route === "GET /posts") return { ok: true, data: db.posts };
  if (route === "GET /posts/:id") {
    const p = db.posts.find((p) => p.id === pid(Number(params.id)));
    return p ? { ok: true, data: p } : { ok: false, error: "文章不存在" };
  }
  if (route === "POST /posts") {
    const b = body as CreatePostRequest;
    const p: PostRow = { id: pid(db.posts.length + 1), ...b };
    db.posts.push(p);
    return { ok: true, data: p };
  }
  if (route === "GET /posts/:postId/comments") {
    const cs = db.comments.filter((c) => c.postId === pid(Number(params.postId)));
    return { ok: true, data: cs };
  }
  if (route === "POST /posts/:postId/comments") {
    const b = body as CreateCommentRequest;
    const c: CommentRow = { id: cid(db.comments.length + 1), ...b };
    db.comments.push(c);
    return { ok: true, data: c };
  }
  return { ok: false, error: `未知路由：${route}` };
}

function createApi(): ApiClient {
  return {
    getUsers: () => req("GET /users"),
    getUsersById: (p) => req("GET /users/:id", p),
    postUsers: (body) => req("POST /users", {}, body),
    patchUsersById: (p, body) => req("PATCH /users/:id", p, body),
    deleteUsersById: (p) => req("DELETE /users/:id", p),
    getPosts: () => req("GET /posts"),
    getPostsById: (p) => req("GET /posts/:id", p),
    postPosts: (body) => req("POST /posts", {}, body),
    getPostsByPostIdComments: (p) => req("GET /posts/:postId/comments", p),
    postPostsByPostIdComments: (p, body) => req("POST /posts/:postId/comments", p, body),
  } as ApiClient;
}

// === 调用 ===
async function main() {
  const api = createApi();

  const users = await api.getUsers();
  if (users.ok) console.log("用户列表：", users.data.map((u) => u.name));

  const user = await api.getUsersById({ id: "1" });
  if (user.ok) console.log("用户详情：", user.data.name, user.data.createdAt);

  const created = await api.postUsers({ name: "Bob", email: "bob@test.com" });
  if (created.ok) console.log("创建用户：", created.data.name);

  const updated = await api.patchUsersById({ id: "1" }, { name: "Joker Updated" });
  if (updated.ok) console.log("更新用户：", updated.data.name);

  const deleted = await api.deleteUsersById({ id: "2" });
  if (deleted.ok) console.log("删除成功：", deleted.data.success);

  const posts = await api.getPosts();
  if (posts.ok) console.log("文章列表：", posts.data.map((p) => p.title));

  const comments = await api.getPostsByPostIdComments({ postId: "1" });
  if (comments.ok) console.log("评论：", comments.data.map((c) => c.content));

  const newComment = await api.postPostsByPostIdComments(
    { postId: "1" },
    { postId: pid(1), authorId: uid(1), content: "赞！" },
  );
  if (newComment.ok) console.log("新评论：", newComment.data.content);

  const notFound = await api.getUsersById({ id: "999" });
  if (!notFound.ok) console.log("错误：", notFound.error);

  // ❌ 以下全部编译报错：
  // api.getUsersById({});                    // 缺 id
  // api.postUsers({});                       // 缺 name/email
  // api.patchUsersById({ id: "1" });         // 缺 body
  // api.getUsersById({ id: "1" }, {});       // 多传参数
}

main();

// --------------------------------------------------
// 总结：本项目综合运用
// --------------------------------------------------
//
// 课号   知识点              在本项目中的应用
// 03    Discriminated Unions  Result<T> ok/error 分支
// 04    Generics             ApiMethods<RouteDefs> 泛型抽象
// 09    Utility Types        Omit/Partial 构造 Request/Response
// 10    Conditional Types    {} extends P 判断是否需要参数
// 11    Mapped Types         as 重映射生成方法名
// 12    Template Literals    路由→方法名（getUsersById）
// 15    Branded Types        UserId/PostId 防止 ID 混用
