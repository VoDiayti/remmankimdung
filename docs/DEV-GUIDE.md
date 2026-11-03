# Hướng dẫn phát triển – Website bán rèm màn (bản Cloudflare)

Tài liệu này mô tả stack, cấu trúc thư mục và các quy ước bắt buộc khi viết code cho dự án
(dành cho lập trình viên và coding agent). Đọc kỹ trước khi thêm trang/module mới.

## 1. Stack (đã cài, KHÔNG cài thêm package nếu không thật sự cần)

| Thành phần | Phiên bản | Ghi chú |
|---|---|---|
| Next.js | 16.4 (App Router) | `params`/`searchParams` là **Promise**; `src/proxy.ts` thay cho middleware; dev dùng Turbopack, build production cũng Turbopack |
| Hosting | **Cloudflare Workers** qua `@opennextjs/cloudflare` | `wrangler.jsonc`, `open-next.config.ts`; binding đọc bằng `getCloudflareContext()` |
| Database | **Cloudflare D1** (SQLite) + **Drizzle ORM** (`drizzle-orm/d1`) | schema TS trong `src/db/schema.ts`; migration là file SQL trong `migrations/` áp dụng bằng wrangler (sinh bằng drizzle-kit). Xem docs/DB-DRIZZLE.md |
| Ảnh | **Cloudflare R2** (binding `R2_BUCKET`) | `src/lib/storage.ts`; URL công khai qua `R2_PUBLIC_URL` hoặc route `/api/media/<key>` |
| Tối ưu ảnh | Cloudflare Images (binding `IMAGES`) | `next/image` dùng như bình thường; khi `next dev` dùng optimizer của Next |
| Rate limit | binding `LEAD_RATE_LIMITER` (5 lượt/60s/IP) | `src/lib/rate-limit.ts` có fallback bộ nhớ khi không có binding |
| React | 19.3 | `useActionState`, `useFormStatus` |
| Tailwind CSS | 4.x qua `@tailwindcss/postcss` | cấu hình trong `src/app/globals.css` (không có tailwind.config) |
| shadcn/ui | base **Radix** | components trong `src/components/ui/*` |
| Auth.js (next-auth) | 5 beta | Credentials + JWT; cấu hình **lười** `NextAuth(async () => config)` để đọc `AUTH_SECRET` theo từng request |
| Mật khẩu | PBKDF2-SHA256 qua WebCrypto (`src/lib/password.ts`) | bcrypt không dùng được trên Workers vì giới hạn CPU |
| TipTap | 3.x | editor sẵn: `src/components/editor/rich-text-editor.tsx` |
| zod | **4.x** | `z.email()`, `z.flattenError(err)`, `err.issues` |
| react-hook-form | 7.x + `@hookform/resolvers/zod` | |
| lucide-react | **1.x** | tên icon đã đổi, xem mục 7 |

Package.json có `"type": "module"`.

## 2. Cấu trúc thư mục

```
wrangler.jsonc                Cấu hình Worker: binding DB (D1), R2_BUCKET, IMAGES, LEAD_RATE_LIMITER, vars
open-next.config.ts           Cấu hình OpenNext (hiện không dùng cache ISR)
worker-configuration.d.ts     Kiểu CloudflareEnv sinh bởi `npm run cf-typegen` (gitignored)
migrations/NNNN_*.sql         Migration D1 (sinh bằng `npm run db:migration -- ten`, áp dụng bằng wrangler)
drizzle/meta                  Snapshot schema của drizzle-kit (commit cùng code)
drizzle.config.ts             Cấu hình drizzle-kit (chỉ sinh SQL, không kết nối DB)
src/db/schema.ts              Schema Drizzle (bảng, cột, quan hệ) – KHÔNG sửa khi chưa được yêu cầu
src/db/index.ts               `db` (Drizzle + D1 binding) → import { db, posts, ... } from "@/db"
src/db/types.ts, enums.ts     Kiểu hàng (Post, Product, ProductCategory...) và enum (ProductStatus, PriceUnit, LeadStatus...)
db/seed.ts                    Sinh db/seed.sql rồi wrangler nạp vào D1 (npm run db:seed)
.env / .dev.vars              Biến local cho Next / cho runtime Workers (xem README)
src/app/layout.tsx            Root layout (font Be Vietnam Pro, Toaster, TooltipProvider)
src/app/(public)/**           Trang công khai (render động mỗi request: `export const dynamic = "force-dynamic"`)
src/app/admin/(auth)/dang-nhap/   Trang đăng nhập (không sidebar)
src/app/admin/(dashboard)/**  Khu vực quản trị (layout có sidebar, yêu cầu đăng nhập)
src/app/api/auth/[...nextauth]    Route Auth.js
src/app/api/admin/upload      POST upload ảnh lên R2 (đã có)
src/app/api/media/[...key]    GET phục vụ file từ R2 khi chưa có R2_PUBLIC_URL
src/actions/*.ts              Server actions ("use server") theo module
src/lib/cloudflare.ts         getCfEnv() / getCfEnvAsync() / getConfigVar() – truy cập binding
src/lib/auth-guard.ts         getSessionUser / requireUser / requireAdmin / assertUser / assertAdmin
src/lib/auth-secret.ts        getAuthSecret() đọc AUTH_SECRET theo request
src/lib/password.ts           hashPassword / verifyPassword (PBKDF2)
src/lib/action-result.ts      ActionResult, ok(), fail(), zodFail(), safeAction()
src/lib/validations/*.ts      Zod schema dùng chung client + server
src/lib/constants.ts          Nhãn tiếng Việt cho enum, PUBLIC_NAV, PRICE_RANGES, ROOM_OPTIONS/ROOM_LABELS, PAGE_SIZE
src/lib/format.ts             formatDate, formatVnd, formatPriceRange(priceFrom, priceTo, unit), truncate, telHref, zaloHref, parseStringList...
src/lib/slug.ts               slugify(), uniqueSlug()
src/lib/sanitize.ts           sanitizeRichText()
src/lib/storage.ts            putObject / getObject / deleteObject / publicUrlForKey (R2)
src/lib/upload.ts             storeImage(), deleteMedia() (server)
src/lib/upload-client.ts      uploadImage(file): thu nhỏ + chuyển WebP trên trình duyệt rồi POST /api/admin/upload
src/lib/rate-limit.ts         checkRateLimit() (async), getClientIp()
src/lib/queries/settings.ts   getSettings() (cache theo request), getSiteUrl()
src/components/ui/*           shadcn
src/components/shared/rich-content.tsx   <RichContent html={...} /> render HTML đã sanitize (server-only)
src/components/editor/rich-text-editor.tsx  <RichTextEditor value onChange />
src/components/admin/*        page-header, submit-button, confirm-delete-button, list-pagination,
                              url-filters (SearchInput, UrlParamSelect), status-badge, empty-state,
                              image-upload-field, sidebar, header, nav.ts, login-form + thư mục theo module
src/components/public/*       component trang công khai
public/images/*.jpg           Ảnh minh họa Unsplash dùng trong seed (xem CREDITS.md), public/logo.svg (logo tròn Niji), og-default.jpg
public/_headers               Cache dài hạn cho /_next/static
```

## 3. Database (Drizzle + D1) – tóm tắt model

Enum: `Role(ADMIN|EDITOR)`, `PostStatus(DRAFT|PUBLISHED|SCHEDULED)`, `ProductStatus(ACTIVE|HIDDEN)`,
`PriceUnit(M2|SET|METER)` (đ/m² · đ/bộ · đ/mét), `LeadType(QUOTE|CONSULTATION|CONTACT)`,
`LeadStatus(NEW|CONTACTED|QUOTED|WON|CANCELLED)`.

- `User`: email, name, passwordHash (PBKDF2), role, isActive, lastLoginAt
- `Category`: name, slug, description, order, isActive → posts (chuyên mục bài viết: kinh nghiệm chọn rèm, công trình, bảo quản, khuyến mãi)
- `Tag`: name, slug → posts (m-n, bảng `_PostToTag`)
- `Post`: title, slug, excerpt, content(HTML), coverImage, status, publishedAt, isFeatured, viewCount, metaTitle, metaDescription, ogImage, categoryId, authorId, tags
- `ProductCategory` (danh mục rèm, cũng là tab của bảng giá trang chủ): name, slug, image, summary, description(HTML), **highlights: chuỗi JSON của mảng** (đọc bằng `parseStringList()`), priceNote ("Giá từ 350.000 đ/m²"), isFeatured, isActive, order, metaTitle, metaDescription → lines, products, leads
- `ProductLine` (loại rèm trong một danh mục, vd Rèm vải hệ 1 lớp / 2 lớp / chống nắng 100%): categoryId, name, slug, description, order, isActive → products
- `Product`: name, slug, categoryId (bắt buộc), lineId (null = chưa phân loại), code, summary, description(HTML), material, origin, width (khổ vải/kích thước lá), colors, **rooms (JSON mảng slug của ROOM_OPTIONS), features (JSON mảng), gallery (JSON mảng URL)**, priceFrom/priceTo (VNĐ; null = "Liên hệ"), priceUnit, priceNote, warrantyMonths, image, status, isFeatured, showInPriceTable, viewCount, metaTitle, metaDescription → leads
- `Lead` (yêu cầu báo giá / tư vấn / liên hệ): type, fullName, phone, email, address (địa chỉ lắp đặt), size (kích thước/số cửa), categoryId, productId, message, status, adminNote, source, ipAddress
- `Service` (dịch vụ: tư vấn – đo đạc, lắp đặt, bảo hành, vệ sinh, rèm công trình): title, slug, summary, content(HTML), image, icon (tên icon lucide), price (text), duration (text), order, isActive
- `Testimonial`: name, position (vai trò/khu vực khách hàng), content, avatar, rating, order, isActive
- `Faq`: question, answer, order, isActive
- `Partner` (đối tác / thương hiệu vải): name, logo, website, order, isActive
- `Banner`: title, subtitle, image, ctaText, ctaLink, ctaText2, ctaLink2, order, isActive
- `Media`: url, storageKey (key trong R2), filename, mimeType, size, width, height, alt, uploadedById
- `Setting` (1 dòng, id=1): companyName, shortName, slogan, logo, taxCode, foundedYear, hotline, zalo, email, address, mapEmbedUrl, workingHours, facebook, youtube, tiktok, messenger, statCustomers, statYears, statProjects, statProducts, aboutShort, aboutContent(HTML), vision, mission, warrantyText, introVideoUrl (YouTube; null = ẩn), metaTitle, metaDescription, ogImage, priceTableTitle, priceTableEnabled (khối bảng giá trang chủ)

Giới hạn của SQLite/D1 cần nhớ:
- Không có kiểu mảng → lưu JSON string. Tìm kiếm bằng `like` (không phân biệt hoa thường với ký tự ASCII).
- Không có transaction tương tác: dùng `db.batch([...])` cho nhiều câu lệnh nguyên tử.
- Enum lưu dạng TEXT; Boolean dạng 0/1 (Drizzle trả về true/false); DateTime dạng chuỗi ISO (Drizzle trả về `Date`).

Cách viết truy vấn (danh sách + đếm, quan hệ, nhiều-nhiều, upsert...): xem **docs/DB-DRIZZLE.md**.
```ts
import { db, posts, products, productCategories } from "@/db";
import type { Post, Product, ProductCategory } from "@/db/types";
import { PostStatus, LeadStatus } from "@/db/enums"; // enum – dùng được cả client component
```

**Quy tắc hiển thị bài viết công khai:** `status IN (PUBLISHED, SCHEDULED) AND publishedAt <= now()`.
Sản phẩm công khai: `status = ACTIVE`. Danh mục/loại rèm/dịch vụ/FAQ/…: `isActive = true`. Bảng giá trang chủ: sản phẩm ACTIVE có `showInPriceTable = true`, gom theo danh mục đang hoạt động.

### Sửa schema
```bash
# sửa src/db/schema.ts
npm run db:migration -- ten-thay-doi   # drizzle-kit diff với snapshot → migrations/000N_ten_thay_doi.sql
npm run db:migrate                     # áp dụng local;  npm run db:migrate:remote cho production
```

## 4. Quy ước code

### Chung
- Server Component mặc định; chỉ thêm `"use client"` khi cần state/hooks/sự kiện.
- `params`, `searchParams` là Promise: `const { slug } = await params;`
- Mọi trang công khai `export const dynamic = "force-dynamic"` (không ISR – OpenNext chưa cấu hình cache); `revalidatePath` trong action vẫn gọi được nhưng không bắt buộc.
- Trình soạn thảo `RichTextEditor` chỉ tải ở client (dynamic, ssr:false) – không import `rich-text-editor-impl.tsx` trực tiếp.
- Truy cập binding Cloudflare chỉ trong lúc xử lý request (server component động, route handler, server action, proxy). Trang được prerender lúc build không được chạm DB – nếu cần thì `await connection()` (xem `src/app/not-found.tsx`).
- Toàn bộ chữ trên giao diện bằng **tiếng Việt có dấu**. Slug URL tiếng Việt không dấu.
- Responsive mobile-first; nút CTA to, dễ bấm (tối thiểu h-11 trên mobile).
- Ảnh: dùng `next/image` cho trang công khai (ảnh local `/images/...`, `/api/media/...` và các host trong `next.config.ts`). Trong admin có thể dùng `<img>` với comment eslint-disable như `image-upload-field.tsx`.
- Không dùng `node:fs`, `sharp`, `bcrypt`, pool kết nối…: code server chạy trên Workers (nodejs_compat một phần).

### Server actions (`src/actions/<module>.ts`)
```ts
"use server";
import { revalidatePath } from "next/cache";
import { db, posts } from "@/db";
import { assertUser, assertAdmin } from "@/lib/auth-guard";
import { ok, fail, zodFail, safeAction, type ActionResult } from "@/lib/action-result";
import { postSchema } from "@/lib/validations/post";

export async function createPost(input: unknown): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    const user = await assertUser();                 // hoặc assertAdmin() cho chức năng admin-only
    const parsed = postSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const [post] = await db.insert(posts).values({ ...parsed.data, authorId: user.id }).returning();
    revalidatePath("/tin-tuc");
    return ok({ id: post.id }, "Đã tạo bài viết");
  });
}
```
- Luôn validate lại bằng zod ở server (cùng schema với client).
- Không ném lỗi ra ngoài; trả `fail("thông báo tiếng Việt")`. `safeAction` đã bắt lỗi chung.

### Form (client)
- react-hook-form + `zodResolver(schema)` + shadcn `Form/FormField/FormItem/FormLabel/FormControl/FormMessage`.
- Schema zod: giữ field dạng **string/boolean** (input = output) rồi chuyển kiểu ở server.
- Submit: `startTransition(async () => { const r = await action(values); if (r.success) { toast.success(r.message); router.push(...)/refresh(); } else { toast.error(r.message); /* set lỗi field từ r.fieldErrors */ } })`.
- Nút submit: `<SubmitButton pending={isPending}>Lưu</SubmitButton>`; trường ảnh: `<ImageUploadField value onChange />`; nội dung HTML: `<RichTextEditor value onChange />`.
- Slug: tự sinh bằng `slugify()` khi người dùng chưa sửa tay; server dùng `uniqueSlug()`.
- Với react-hook-form dùng `useWatch` thay `form.watch` (eslint react-hooks v7).

### Trang danh sách admin
- Đọc `searchParams` (`q`, `page`, bộ lọc), phân trang `ADMIN_PAGE_SIZE` (20).
- Dùng `PageHeader`, `SearchInput`, `UrlParamSelect`, `ListPagination`, `EmptyState`, các `*StatusBadge`, `ConfirmDeleteButton` (`action={deleteX.bind(null, id)}`), shadcn `Table`, `Card`, `Button`.
- Trang chỉ dành cho Quản trị viên: gọi `await requireAdmin()` ở đầu page (sẽ redirect `/admin?error=forbidden`).

### Trang công khai
- `generateMetadata` cho title/description/openGraph (ảnh mặc định `/og-default.jpg`), `alternates.canonical`.
- JSON-LD: HomeGoodsStore/Organization (layout), Article, Product (+ Offer theo priceFrom), FAQPage, BreadcrumbList (helper trong `src/lib/seo.ts`).
- Lấy settings: `const s = await getSettings();`. Render HTML: `<RichContent html={post.content} />`.
- Form báo giá/tư vấn/liên hệ: `submitLead(values)` từ `@/actions/leads-public` với schema `leadFormSchema` (fullName, phone, email, address, size, categoryId, productId, message); trường honeypot `website` ẩn; `source` = pathname.
- Giá: luôn hiển thị qua `formatPriceRange(priceFrom, priceTo, priceUnit)` ("350.000 – 520.000 đ/m²" / "Từ …" / "Liên hệ").

## 5. Routes

### Công khai (`src/app/(public)/...`)
`/`, `/gioi-thieu`, `/danh-muc`, `/danh-muc/[slug]` (danh mục: loại rèm + sản phẩm), `/san-pham` (lọc `danh-muc`, `loai`, `gia`, `phong`, `q`, `page`), `/san-pham/[slug]`, `/dich-vu`, `/dich-vu/[slug]`, `/bao-gia` (form yêu cầu báo giá), `/tin-tuc`, `/tin-tuc/[slug]`, `/tin-tuc/chuyen-muc/[slug]`, `/tin-tuc/the/[slug]`, `/lien-he`, `/cau-hoi-thuong-gap`, `/chinh-sach-bao-mat` (chính sách bảo mật – nội dung tĩnh trong page, thông tin liên hệ lấy từ Setting), `sitemap.xml`, `robots.txt`.

### Admin (`src/app/admin/(dashboard)/...`) – menu trong `src/components/admin/nav.ts`
`/admin` (dashboard), `/admin/danh-muc` (+ `/moi`, `/[id]`), `/admin/loai-rem` (dialog), `/admin/san-pham` (+ `/moi`, `/[id]`), `/admin/dich-vu` (+ `/moi`, `/[id]`), `/admin/bao-gia` (+ `/[id]`, `GET /api/admin/bao-gia/export`), `/admin/bai-viet` (+ `/moi`, `/[id]`, `/[id]/xem-truoc`), `/admin/chuyen-muc`, `/admin/the`, `/admin/banner`, `/admin/cam-nhan`, `/admin/faq`, `/admin/doi-tac`, `/admin/thu-vien-anh`, `/admin/cai-dat`, `/admin/tai-khoan` (+ `/moi`, `/[id]`, `/doi-mat-khau`).

## 6. Chạy & kiểm tra

- D1/R2 local nằm trong `.wrangler/state` (gitignored). Lần đầu: `npm run db:migrate && npm run db:seed`.
- Tài khoản: `admin@example.com / Admin@12345` (ADMIN, đổi qua `SEED_ADMIN_*` trong `.env`), `bientap@remniji.vn / Editor@12345` (EDITOR).
- `npm run dev` (Turbopack, binding giả lập) – cổng 3000 có thể bị chiếm trên máy dev, dùng `npm run dev -- -p 3100`.
- `npm run preview` chạy đúng runtime Workers tại http://localhost:8787 (cần `.dev.vars` có `AUTH_SECRET` và `AUTH_URL=http://localhost:8787`).
- Kiểm tra bắt buộc trước khi báo hoàn thành: `npx tsc --noEmit`, `npx eslint <thư mục>`; kích thước Worker: `npx wrangler deploy --dry-run --outdir=.wrangler/dry-run` (gzip phải < 3 MiB để chạy gói Free).
- Đăng nhập bằng curl: `GET /api/auth/csrf` (cookie jar) → `POST /api/auth/callback/credentials` (csrfToken, email, password, redirectTo=/admin) → `GET /admin/...` kèm cookie.

## 7. Lưu ý Next 16 / Cloudflare / thư viện mới

- lucide-react v1: `TextAlignStart/Center/End/Justify`, `LoaderCircle`, `Trash`, `Image` (import `Image as ImageIcon`), `CircleCheck`, `CircleAlert`, `CircleQuestionMark`, `House`, `Funnel`, `Building`, `Images`. **Không có icon thương hiệu** → SVG inline.
- shadcn Button `size`: default | xs | sm | lg | icon | icon-xs | icon-sm | icon-lg; `variant`: default | destructive | outline | secondary | ghost | link. `DropdownMenuItem variant="destructive"`.
- Tailwind 4: class `container-page`; màu thương hiệu **xanh ngọc (teal)** `bg-primary`/`text-primary`, nút kêu gọi hành động **vàng đồng chữ tối** `bg-cta text-cta-foreground hover:bg-cta-hover` (không dùng `text-white` trên nền cta), nền nhạt `bg-brand-light`, xanh đậm `bg-brand-dark`/`text-brand-dark`. Chữ nhấn trên nền sáng dùng `text-primary` hoặc `text-amber-700` (không dùng `text-cta` vì vàng trên trắng khó đọc; `text-cta`/`text-amber-300` chỉ trên nền tối). Đổi bảng màu chỉ cần sửa biến trong `src/app/globals.css` (mục `:root` và `.dark`) và logo `public/logo.svg`, `src/app/icon.svg`.
- ESLint React Compiler (react-hooks v7): không gọi `Date.now()`/`Math.random()` trực tiếp trong thân component, không `setState` trong `useEffect` chỉ để đồng bộ props, không gán `ref.current` khi render.
- TipTap v3: `useEditorState` chỉ làm mới snapshot sau transaction đầu tiên – `RichTextEditor` đã xử lý.
- Plugin chia sẻ Zalo chính thức cần `NEXT_PUBLIC_ZALO_OA_ID`; phần tử nút phải tạo bằng DOM thuần (xem `share-buttons.tsx`).
- `next.config.ts` có `outputFileTracingExcludes` loại `@electric-sql`, `blake3-wasm`, `@vercel/og`… khỏi bản build: nếu không, Turbopack kéo mọi file `.wasm` của các gói này vào Worker (bundle tăng ~15 MiB). Thêm gói mới có `.wasm` thì cân nhắc loại trừ tương tự.
- Auth.js: trên workerd không có `x-forwarded-proto` nên Auth.js mặc định coi là HTTPS → preview HTTP cần `AUTH_URL` trong `.dev.vars`; production HTTPS không cần. Proxy đọc cả 2 tên cookie (`__Secure-authjs.session-token` khi HTTPS, `authjs.session-token` khi HTTP) với salt = tên cookie.
- Workers Free plan: giới hạn 3 MiB nén và 10 ms CPU. Vì vậy dùng Drizzle thay Prisma (bỏ ~1,4 MiB WASM/JS), editor tải client-only, proxy chỉ giải mã JWT (không nạp cả NextAuth), PBKDF2 mặc định 50.000 vòng (~4–8 ms CPU). Kiểm tra bằng `npx wrangler deploy --dry-run --outdir=.wrangler/dry-run` sau mỗi lần thêm thư viện.
