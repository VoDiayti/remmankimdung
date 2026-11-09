# Website bán rèm màn – bản Cloudflare

Website gồm **trang công khai** (trang chủ dạng landing page với bảng giá theo danh mục, danh mục rèm → loại rèm → sản phẩm, dịch vụ, tin tức, liên hệ, FAQ, chính sách bảo mật, form yêu cầu báo giá) và **trang quản trị** `/admin` (danh mục rèm, loại rèm, sản phẩm, dịch vụ, yêu cầu báo giá + xuất CSV, bài viết, chuyên mục, thẻ, banner, cảm nhận khách hàng, FAQ, đối tác, thư viện ảnh, cài đặt chung, tài khoản).

Danh mục rèm mẫu (sửa thoải mái trong admin): rèm vải (hệ 1 lớp, hệ 2 lớp, chống nắng 100%), rèm cuốn (trơn, hoa văn, lưới), rèm cầu vồng Hàn Quốc, rèm roman (xếp lớp, phẳng), rèm sáo gỗ (hệ 1 dây, 2 dây), rèm sáo nhôm (trơn, ánh kim), rèm phòng tắm, rèm lá dọc văn phòng.

Toàn bộ hạ tầng chạy trên **Cloudflare** và **đủ nhỏ để chạy trên gói Workers Free** (bundle < 3 MiB nén):

| Thành phần | Dịch vụ |
|---|---|
| Web (Next.js 16, App Router) | **Cloudflare Workers** qua [OpenNext](https://opennext.js.org/cloudflare) |
| Database | **Cloudflare D1** (SQLite) + **Drizzle ORM** (`drizzle-orm/d1`, schema trong `src/db/schema.ts`) |
| Ảnh upload | **Cloudflare R2** (binding `R2_BUCKET`), tùy chọn custom domain/`r2.dev` qua `R2_PUBLIC_URL` |
| Tối ưu ảnh `next/image` | Cloudflare Images (binding `IMAGES`) |
| Chống spam form | Workers Rate Limiting (binding `LEAD_RATE_LIMITER`) + honeypot |
| Đăng nhập admin | Auth.js v5, mật khẩu băm PBKDF2 (WebCrypto), vai trò Quản trị viên / Biên tập viên |

Quy ước code: [docs/DEV-GUIDE.md](docs/DEV-GUIDE.md). Truy vấn Drizzle: [docs/DB-DRIZZLE.md](docs/DB-DRIZZLE.md).

## Yêu cầu

- Node.js 22 (≥ 20.19)
- Tài khoản Cloudflare (D1, R2, Workers). Chạy local **không cần** tài khoản: wrangler giả lập D1/R2 trong thư mục `.wrangler/state`.

## Chạy local

```bash
npm install                 # postinstall: wrangler types (sinh worker-configuration.d.ts)
cp .env.example .env        # sửa AUTH_SECRET (openssl rand -base64 32)
cp .dev.vars.example .dev.vars   # rồi điền AUTH_SECRET giống .env

npm run db:migrate          # tạo bảng trong D1 local
npm run db:seed             # nạp dữ liệu mẫu + tài khoản admin
npm run dev                 # http://localhost:3000 (Next dev, có binding D1/R2 giả lập)
```

Tài khoản mẫu (đổi ngay sau khi đăng nhập tại **Admin → Tài khoản**):

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Quản trị viên | `admin@example.com` (đổi qua `SEED_ADMIN_EMAIL`) | `Admin@12345` (đổi qua `SEED_ADMIN_PASSWORD`) |
| Biên tập viên | `bientap@remmankimdung.vn` | `Editor@12345` |

Muốn chạy đúng runtime Workers (workerd) trên máy: `npm run preview` (build bằng OpenNext rồi chạy wrangler dev tại http://localhost:8787).

## Scripts

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Next dev server (có binding Cloudflare giả lập) |
| `npm run build` | `next build` (OpenNext tự gọi khi preview/deploy) |
| `npm run preview` | Build OpenNext + chạy trong workerd local |
| `npm run deploy` | Build OpenNext + deploy lên Cloudflare Workers |
| `npm run upload` | Build + upload phiên bản mới (không chuyển traffic) |
| `npm run cf-typegen` | Sinh `worker-configuration.d.ts` từ `wrangler.jsonc` (chạy lại sau khi sửa binding) |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run db:migration -- ten-thay-doi` | Sinh file SQL migration mới từ thay đổi trong `src/db/schema.ts` (drizzle-kit) |
| `npm run db:migrate` / `db:migrate:remote` | Áp dụng migration vào D1 local / production |
| `npm run db:seed` / `db:seed:remote` | Sinh `db/seed.sql` và nạp vào D1 local / production (INSERT OR IGNORE – không ghi đè dữ liệu đã sửa) |
| `npm run db:reset` | Xoá dữ liệu mẫu trong D1 **local** rồi seed lại từ đầu (dùng khi đổi nội dung/ID trong `db/seed.ts`). Không có bản remote vì sẽ xoá lead thật và tài khoản trên production |
| `npm run db:shell -- "SELECT ..."` | Chạy SQL trên D1 local |

## Biến môi trường và bí mật

- **`.env`** (local, Next.js): `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`, `R2_PUBLIC_URL`, `PASSWORD_HASH_ITERATIONS`, `SEED_ADMIN_*`... Các giá trị `NEXT_PUBLIC_*` được nhúng lúc build.
- **`.dev.vars`** (local, runtime Workers khi `preview`): `NEXTJS_ENV=development`, `AUTH_SECRET`, `AUTH_TRUST_HOST=true`, `AUTH_URL=http://localhost:8787`, `R2_PUBLIC_URL`.
- **Production**: bí mật đặt bằng `npx wrangler secret put AUTH_SECRET`; biến thường đặt trong `vars` của `wrangler.jsonc` (vd `R2_PUBLIC_URL`) hoặc Dashboard.
- **Lưu ý `.env` khi deploy**: build trên máy (`npm run deploy`) thì OpenNext nhúng mọi biến trong `.env` vào Worker, nên bản đó vẫn đăng nhập được dù Worker chưa có secret `AUTH_SECRET` (và còn mang theo `NEXT_PUBLIC_SITE_URL=http://localhost:3000`, mật khẩu seed). GitHub Actions không có `.env`, nên Worker **bắt buộc** có secret `AUTH_SECRET` (workflow dừng nếu thiếu). Nên deploy production qua GitHub thay vì từ máy.
- Xem danh sách đầy đủ trong [.env.example](.env.example).

## Chạy local với D1 / R2 thật

Trong `wrangler.jsonc`, binding `DB` và `R2_BUCKET` có cờ `"remote": true|false`:
- `true`: `npm run dev` / `npm run preview` đọc–ghi thẳng dữ liệu thật trên Cloudflare (cần `npx wrangler login`, đã tạo D1/R2 và điền `database_id`; điền `R2_PUBLIC_URL` thật trong `.dev.vars`).
- `false` (mặc định của repo này): dùng bản giả lập trong `.wrangler/state` (chạy `npm run db:migrate && npm run db:seed` lần đầu; để trống `R2_PUBLIC_URL` trong `.dev.vars`).

## Triển khai lên Cloudflare (lần đầu)

```bash
npx wrangler login

# 1. Tạo database D1 và dán database_id vào wrangler.jsonc (mục d1_databases → database_name + database_id)
npx wrangler d1 create rem-man-kim-dung

# 2. Tạo bucket R2 chứa ảnh (tên phải khớp bucket_name trong wrangler.jsonc)
npx wrangler r2 bucket create rem-man-kim-dung
#    (tùy chọn) bật Public access cho bucket hoặc gắn custom domain, rồi đặt R2_PUBLIC_URL trong wrangler.jsonc > vars

# 3. Bí mật
npx wrangler secret put AUTH_SECRET          # chuỗi ngẫu nhiên ≥ 32 ký tự

# 4. Tạo bảng + dữ liệu mẫu trên D1 production
npm run db:migrate:remote
npm run db:seed:remote                       # đổi SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD trong .env trước khi chạy

# 5. Deploy lần đầu (wrangler in ra URL dạng https://remmankimdung.<tên-tài-khoản>.workers.dev)
npm run deploy

# 6. Ghi URL thật vào .env.production rồi deploy lại để sitemap/Open Graph/JSON-LD dùng đúng địa chỉ
echo 'NEXT_PUBLIC_SITE_URL="https://remmankimdung.<tên-tài-khoản>.workers.dev"' > .env.production
npm run deploy
```

Khi gắn tên miền riêng (Workers & Pages → Settings → Domains & Routes), sửa `NEXT_PUBLIC_SITE_URL` trong `.env.production` và deploy lại. Để `next/image` tối ưu ảnh trên production, bật **Images → Transformations** cho zone trong Dashboard.

### Deploy tự động từ Git

Workflow `.github/workflows/deploy.yml` deploy mỗi khi push lên `main` (cần secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` và variable `NEXT_PUBLIC_SITE_URL`); migration D1 chạy tự động trước bước deploy.

### Cập nhật schema database

```bash
# sửa src/db/schema.ts
npm run db:migration -- them-truong-x    # drizzle-kit diff với snapshot → migrations/000N_them_truong_x.sql
npm run db:migrate                       # áp dụng local
npm run db:migrate:remote                # áp dụng production
```

## Giới hạn cần biết

- **Kích thước Worker**: gói Workers Free giới hạn 3 MiB nén. Thêm thư viện mới thì kiểm tra lại bằng `npx wrangler deploy --dry-run --outdir=.wrangler/dry-run`.
- **CPU khi đăng nhập**: băm PBKDF2 50.000 vòng (~4–8 ms), nằm trong giới hạn 10 ms CPU của gói Free. Đăng nhập sai bị giới hạn 5 lần/phút mỗi IP.
- **D1 không có transaction tương tác**: nhiều câu lệnh cần nguyên tử thì dùng `db.batch([...])`.
- **Không có ISR**: các trang công khai render động mỗi request. Muốn cache thêm, dùng Cache Rules của Cloudflare hoặc bật incremental cache R2 theo tài liệu OpenNext.
- **Ảnh upload** được thu nhỏ (≤ 1920px) và chuyển WebP ngay trên trình duyệt trước khi gửi, vì Workers không chạy được thư viện xử lý ảnh.
- **Rate limiting** của Workers tính theo từng PoP, là biện pháp mềm; honeypot vẫn hoạt động.

## Sau khi cài đặt – việc cần làm

1. Admin → **Cài đặt chung**: tên cửa hàng, hotline/Zalo, email, địa chỉ showroom, giờ làm việc, bản đồ, mạng xã hội, số liệu nổi bật, chính sách bảo hành, video giới thiệu, SEO (dữ liệu seed là mẫu).
2. **Tài khoản**: đổi mật khẩu admin, tạo tài khoản biên tập viên.
3. **Danh mục rèm → Loại rèm → Sản phẩm**: sửa tên/thứ tự danh mục và loại rèm theo cửa hàng, cập nhật giá (theo m², bộ hoặc mét), chất liệu, ảnh thật; bật "Hiện trong bảng giá" cho các sản phẩm muốn đưa lên bảng giá trang chủ (tiêu đề và bật/tắt khối này ở Cài đặt chung → Trang chủ).
4. Thay nội dung/ảnh mẫu trong Banner, Dịch vụ, Bài viết, Cảm nhận, FAQ, Đối tác; thay `public/logo.svg`, `public/og-default.jpg`, `src/app/icon.svg`. Ảnh mẫu trong `public/images/` lấy từ Unsplash (xem `public/images/CREDITS.md`).
5. Đặt `NEXT_PUBLIC_SITE_URL` và (nếu có) `R2_PUBLIC_URL` đúng tên miền trước khi deploy.
