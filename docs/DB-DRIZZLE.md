# Truy cập dữ liệu với Drizzle ORM (Cloudflare D1)

Dự án dùng **Drizzle ORM** (`drizzle-orm/d1`) để Worker nhỏ hơn 3 MiB (gói Free). Website bán rèm màn: danh mục rèm → loại rèm → sản phẩm; khách gửi yêu cầu báo giá (Lead).
Schema: `src/db/schema.ts` (tên bảng PascalCase, cột camelCase – khớp DDL trong `migrations/`). Client: `import { db, posts, ... } from "@/db"`.

## Import

```ts
import { and, asc, count, desc, eq, gte, inArray, isNull, like, lte, ne, or, sql, type SQL } from "drizzle-orm";
import { db, posts, categories, tags, postTags, productCategories, productLines, products, services, leads, users, media, settings, banners, faqs, partners, testimonials } from "@/db";
import type { Post, ProductCategory, Product, Lead, NewPost } from "@/db/types";   // kiểu hàng (select) / NewX (insert)
import { PostStatus, LeadStatus, POST_STATUS_VALUES } from "@/db/enums";  // enum (dùng được cả client component)
```

`db` chỉ dùng trong lúc xử lý request (server component động, route handler, server action). Trang prerender lúc build không được chạm DB.

## Bảng → biến

| Bảng SQL | Biến Drizzle | Quan hệ (`with:`) |
|---|---|---|
| User | `users` | `posts`, `media` |
| Category | `categories` | `posts` |
| Tag | `tags` | `postTags` |
| Post | `posts` | `category`, `author`, `postTags` → mỗi phần tử có `.tag` |
| _PostToTag | `postTags` (cột `postId` = "A", `tagId` = "B") | `post`, `tag` |
| ProductCategory | `productCategories` (danh mục rèm – cũng là tab bảng giá trang chủ) | `lines`, `products`, `leads` |
| ProductLine | `productLines` (loại rèm trong danh mục, `categoryId`) | `category`, `products` |
| Product | `products` (`categoryId` bắt buộc, `lineId` tùy chọn) | `category`, `line`, `leads` |
| Lead | `leads` (yêu cầu báo giá/tư vấn, `categoryId`, `productId`) | `category`, `product` |
| Media | `media` | `uploadedBy` |
| Service | `services` (dịch vụ: tư vấn – đo đạc, lắp đặt, bảo hành, vệ sinh...) | – |
| Testimonial / Faq / Partner / Banner / Setting | `testimonials` / `faqs` / `partners` / `banners` / `settings` | – |

Cột `createdAt`/`updatedAt`/`id` tự điền khi insert (`updatedAt` tự cập nhật khi `db.update`). Boolean là `true/false`, ngày là `Date`, enum là chuỗi (`"PUBLISHED"`).

## Mẫu thường dùng

### Danh sách có lọc + phân trang + đếm (thay `findMany` + `count` + `$transaction`)
```ts
const conditions: (SQL | undefined)[] = [
  q ? or(like(posts.title, `%${q}%`), like(posts.excerpt, `%${q}%`)) : undefined,
  status ? eq(posts.status, status) : undefined,
  categoryId ? eq(posts.categoryId, categoryId) : undefined,
];
const where = and(...conditions); // and() bỏ qua phần tử undefined
const [rows, [{ total }]] = await Promise.all([
  db.query.posts.findMany({
    where,
    orderBy: [desc(posts.updatedAt)],
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
    with: { category: { columns: { name: true, slug: true } }, author: { columns: { name: true } } },
  }),
  db.select({ total: count() }).from(posts).where(where),
]);
```
`like` của SQLite không phân biệt hoa/thường với ký tự ASCII (đủ dùng, không có `mode: "insensitive"`).

### Một bản ghi theo slug/id (thay `findUnique`/`findFirst`)
```ts
const post = await db.query.posts.findFirst({
  where: eq(posts.slug, slug),
  with: { category: true, author: { columns: { name: true } }, postTags: { with: { tag: true } } },
});
if (!post) notFound();
const tagList = post.postTags.map((pt) => pt.tag);   // thay cho post.tags của Prisma
```

### Bài viết công khai (quy tắc hiển thị)
```ts
const visible = and(inArray(posts.status, ["PUBLISHED", "SCHEDULED"]), lte(posts.publishedAt, new Date()));
```

### Insert / update / delete (thay `create`/`update`/`delete`)
```ts
const [created] = await db.insert(posts).values({ title, slug, content, authorId: user.id }).returning();
await db.update(posts).set({ title, isFeatured: true }).where(eq(posts.id, id));
await db.delete(posts).where(eq(posts.id, id));
```
`returning()` trả về mảng; `.returning().get()` không dùng với D1 – lấy `[row]`.

### Nhiều-nhiều (thẻ của bài viết) – thay `tags: { set/connect }`
```ts
await db.batch([
  db.delete(postTags).where(eq(postTags.postId, postId)),
  ...(tagIds.length ? [db.insert(postTags).values(tagIds.map((tagId) => ({ postId, tagId })))] : []),
]);
```
`db.batch([...])` chạy nguyên tử trên D1 (thay cho `$transaction`); cần ít nhất 1 phần tử.

### Đếm bản ghi liên quan (thay `_count`)
```ts
const rows = await db
  .select({ id: categories.id, name: categories.name, slug: categories.slug, order: categories.order, isActive: categories.isActive, postCount: count(posts.id) })
  .from(categories)
  .leftJoin(posts, eq(posts.categoryId, categories.id))
  .groupBy(categories.id)
  .orderBy(asc(categories.order));
```

### Giá trị phân biệt (thay `groupBy`/`distinct`)
```ts
const origins = (await db.selectDistinct({ origin: products.origin }).from(products).orderBy(asc(products.origin))).map((r) => r.origin);
```

### Upsert 1 dòng cài đặt (thay `upsert` id = 1)
```ts
await db.insert(settings).values({ id: 1, ...data }).onConflictDoUpdate({ target: settings.id, set: data });
```

### Tồn tại / kiểm tra trùng slug
```ts
const exists = async (s: string) => !!(await db.query.posts.findFirst({ columns: { id: true }, where: and(eq(posts.slug, s), excludeId ? ne(posts.id, excludeId) : undefined) }));
const slug = await uniqueSlug(title, exists);
```

### Tăng bộ đếm
```ts
await db.update(posts).set({ viewCount: sql`${posts.viewCount} + 1` }).where(eq(posts.id, id));
```

### Lưu ý khi chuyển từ Prisma
- `include: { category: true }` → `with: { category: true }`; `select` → `columns: { a: true }` (chỉ trong relational API).
- `where: { OR: [...] }` → `or(...)`; `{ in: [...] }` → `inArray`; `{ contains }` → `like(col, \`%x%\`)`; `{ gte }` → `gte`; `null` → `isNull`.
- `orderBy: { createdAt: "desc" }` → `orderBy: [desc(leads.createdAt)]` (relational) hoặc `.orderBy(desc(...))` (select builder).
- `skip/take` → `offset/limit`.
- `prisma.x.count({ where })` → `db.select({ total: count() }).from(x).where(...)` rồi `[{ total }]`.
- `Prisma.XWhereInput` → mảng `SQL | undefined` ghép bằng `and()`.
- Kiểu kết quả relational có sẵn từ Drizzle; khi cần đặt tên kiểu: `Awaited<ReturnType<typeof getPostBySlug>>`.
- D1 không có transaction; dùng `db.batch` khi cần nhiều câu lệnh nguyên tử.
