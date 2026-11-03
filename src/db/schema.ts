/**
 * Schema Drizzle cho Cloudflare D1 (SQLite) – website bán rèm màn.
 * Tên bảng PascalCase, cột camelCase (khớp DDL trong migrations/).
 * Sửa schema → `npm run db:migration -- ten-thay-doi` → `npm run db:migrate` (local) / `npm run db:migrate:remote`.
 */
import { relations, sql } from "drizzle-orm";
import { customType, index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { createId } from "./id";
import { LEAD_STATUS_VALUES, LEAD_TYPE_VALUES, POST_STATUS_VALUES, PRICE_UNIT_VALUES, PRODUCT_STATUS_VALUES, ROLE_VALUES } from "./enums";

/** DATETIME lưu dạng chuỗi ISO-8601 (UTC). Đọc được cả dạng CURRENT_TIMESTAMP "YYYY-MM-DD HH:MM:SS" và số mili-giây. */
export const datetime = customType<{ data: Date; driverData: string | number }>({
  dataType: () => "datetime",
  toDriver: (value: Date) => value.toISOString(),
  fromDriver: (value) => {
    if (typeof value === "number") return new Date(value);
    const s = String(value);
    return new Date(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s) ? `${s.replace(" ", "T")}Z` : s);
  },
});

const now = () => new Date();
const id = () => text("id").primaryKey().$defaultFn(createId);
const createdAt = () => datetime("createdAt").notNull().default(sql`CURRENT_TIMESTAMP`).$defaultFn(now);
const updatedAt = () => datetime("updatedAt").notNull().$defaultFn(now).$onUpdateFn(now);

// ---------- TÀI KHOẢN ----------

export const users = sqliteTable(
  "User",
  {
    id: id(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    passwordHash: text("passwordHash").notNull(),
    role: text("role", { enum: ROLE_VALUES }).notNull().default("EDITOR"),
    isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
    lastLoginAt: datetime("lastLoginAt"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("User_email_key").on(t.email)]
);

// ---------- BÀI VIẾT (tin tức, kinh nghiệm chọn rèm, công trình đã thi công) ----------

export const categories = sqliteTable(
  "Category",
  {
    id: id(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    order: integer("order").notNull().default(0),
    isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("Category_slug_key").on(t.slug)]
);

export const tags = sqliteTable(
  "Tag",
  {
    id: id(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("Tag_slug_key").on(t.slug)]
);

export const posts = sqliteTable(
  "Post",
  {
    id: id(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    excerpt: text("excerpt"),
    /** HTML từ trình soạn thảo */
    content: text("content").notNull().default(""),
    coverImage: text("coverImage"),
    status: text("status", { enum: POST_STATUS_VALUES }).notNull().default("DRAFT"),
    /** Thời điểm xuất bản; bài hẹn giờ là thời điểm sẽ hiển thị */
    publishedAt: datetime("publishedAt"),
    isFeatured: integer("isFeatured", { mode: "boolean" }).notNull().default(false),
    viewCount: integer("viewCount").notNull().default(0),
    metaTitle: text("metaTitle"),
    metaDescription: text("metaDescription"),
    ogImage: text("ogImage"),
    categoryId: text("categoryId").references(() => categories.id, { onDelete: "set null", onUpdate: "cascade" }),
    authorId: text("authorId").references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("Post_slug_key").on(t.slug),
    index("Post_status_publishedAt_idx").on(t.status, t.publishedAt),
    index("Post_categoryId_idx").on(t.categoryId),
  ]
);

/** Bảng nối bài viết – thẻ (nhiều-nhiều). Cột A = Post.id, B = Tag.id. */
export const postTags = sqliteTable(
  "_PostToTag",
  {
    postId: text("A").notNull().references(() => posts.id, { onDelete: "cascade", onUpdate: "cascade" }),
    tagId: text("B").notNull().references(() => tags.id, { onDelete: "cascade", onUpdate: "cascade" }),
  },
  (t) => [uniqueIndex("_PostToTag_AB_unique").on(t.postId, t.tagId), index("_PostToTag_B_index").on(t.tagId)]
);

// ---------- DANH MỤC RÈM, LOẠI RÈM & SẢN PHẨM ----------

/** Danh mục sản phẩm (rèm vải, rèm cuốn, rèm cầu vồng, rèm roman, rèm sáo gỗ, rèm sáo nhôm, rèm phòng tắm, rèm lá dọc...) – cũng là các tab của bảng giá trang chủ */
export const productCategories = sqliteTable(
  "ProductCategory",
  {
    id: id(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    image: text("image"),
    summary: text("summary"),
    /** HTML mô tả chi tiết (trang /danh-muc/[slug]) */
    description: text("description").notNull().default(""),
    /** Mảng JSON các ưu điểm nổi bật, đọc bằng parseStringList() */
    highlights: text("highlights").notNull().default("[]"),
    /** Dòng giá hiển thị trên thẻ danh mục, vd "Giá từ 280.000 đ/m²" */
    priceNote: text("priceNote"),
    isFeatured: integer("isFeatured", { mode: "boolean" }).notNull().default(false),
    isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
    order: integer("order").notNull().default(0),
    metaTitle: text("metaTitle"),
    metaDescription: text("metaDescription"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("ProductCategory_slug_key").on(t.slug)]
);

/** Loại rèm (dòng sản phẩm) trong một danh mục, vd Rèm vải hệ 1 lớp / hệ 2 lớp / chống nắng 100% */
export const productLines = sqliteTable(
  "ProductLine",
  {
    id: id(),
    categoryId: text("categoryId").notNull().references(() => productCategories.id, { onDelete: "cascade", onUpdate: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    order: integer("order").notNull().default(0),
    isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("ProductLine_slug_key").on(t.slug), index("ProductLine_categoryId_idx").on(t.categoryId)]
);

export const products = sqliteTable(
  "Product",
  {
    id: id(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    categoryId: text("categoryId").notNull().references(() => productCategories.id, { onDelete: "restrict", onUpdate: "cascade" }),
    /** Loại rèm (ProductLine.id); null = chưa phân loại */
    lineId: text("lineId").references(() => productLines.id, { onDelete: "set null", onUpdate: "cascade" }),
    /** Mã sản phẩm / mã vải, vd RV-101 */
    code: text("code"),
    summary: text("summary"),
    /** HTML mô tả chi tiết */
    description: text("description").notNull().default(""),
    /** Chất liệu, vd "Polyester gấm Hàn Quốc" */
    material: text("material"),
    /** Xuất xứ, vd "Hàn Quốc" */
    origin: text("origin"),
    /** Khổ vải / kích thước lá, vd "Khổ 2,8 m" hoặc "Lá 50 mm" */
    width: text("width"),
    /** Màu sắc có sẵn, vd "Kem, xám, nâu" */
    colors: text("colors"),
    /** Mảng JSON slug không gian phù hợp (ROOM_OPTIONS trong lib/constants), đọc bằng parseStringList() */
    rooms: text("rooms").notNull().default("[]"),
    /** Mảng JSON các đặc điểm nổi bật, đọc bằng parseStringList() */
    features: text("features").notNull().default("[]"),
    /** Giá tham khảo (VNĐ) theo priceUnit; null = liên hệ */
    priceFrom: integer("priceFrom"),
    priceTo: integer("priceTo"),
    priceUnit: text("priceUnit", { enum: PRICE_UNIT_VALUES }).notNull().default("M2"),
    /** Ghi chú giá, vd "Đã gồm phụ kiện, chưa gồm công lắp đặt" */
    priceNote: text("priceNote"),
    warrantyMonths: integer("warrantyMonths"),
    image: text("image"),
    /** Mảng JSON URL ảnh phụ, đọc bằng parseStringList() */
    gallery: text("gallery").notNull().default("[]"),
    status: text("status", { enum: PRODUCT_STATUS_VALUES }).notNull().default("ACTIVE"),
    isFeatured: integer("isFeatured", { mode: "boolean" }).notNull().default(false),
    /** Hiện trong bảng giá theo danh mục ở trang chủ */
    showInPriceTable: integer("showInPriceTable", { mode: "boolean" }).notNull().default(true),
    viewCount: integer("viewCount").notNull().default(0),
    metaTitle: text("metaTitle"),
    metaDescription: text("metaDescription"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("Product_slug_key").on(t.slug),
    index("Product_status_categoryId_idx").on(t.status, t.categoryId),
    index("Product_lineId_idx").on(t.lineId),
  ]
);

// ---------- YÊU CẦU BÁO GIÁ / TƯ VẤN ----------

export const leads = sqliteTable(
  "Lead",
  {
    id: id(),
    type: text("type", { enum: LEAD_TYPE_VALUES }).notNull().default("QUOTE"),
    fullName: text("fullName").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    /** Địa chỉ lắp đặt / khu vực */
    address: text("address"),
    /** Kích thước cửa, số lượng cửa hoặc diện tích ước tính (văn bản tự do) */
    size: text("size"),
    categoryId: text("categoryId").references(() => productCategories.id, { onDelete: "set null", onUpdate: "cascade" }),
    productId: text("productId").references(() => products.id, { onDelete: "set null", onUpdate: "cascade" }),
    message: text("message"),
    status: text("status", { enum: LEAD_STATUS_VALUES }).notNull().default("NEW"),
    adminNote: text("adminNote"),
    source: text("source"),
    ipAddress: text("ipAddress"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("Lead_status_createdAt_idx").on(t.status, t.createdAt)]
);

// ---------- NỘI DUNG KHÁC ----------

/** Cảm nhận khách hàng (position = vai trò/khu vực, vd "Chủ căn hộ tại Quận 7") */
export const testimonials = sqliteTable("Testimonial", {
  id: id(),
  name: text("name").notNull(),
  position: text("position"),
  content: text("content").notNull(),
  avatar: text("avatar"),
  rating: integer("rating").notNull().default(5),
  order: integer("order").notNull().default(0),
  isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const faqs = sqliteTable("Faq", {
  id: id(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  order: integer("order").notNull().default(0),
  isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/** Đối tác / thương hiệu vải, phụ kiện (hiện logo ở trang chủ) */
export const partners = sqliteTable("Partner", {
  id: id(),
  name: text("name").notNull(),
  logo: text("logo"),
  website: text("website"),
  order: integer("order").notNull().default(0),
  isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const banners = sqliteTable("Banner", {
  id: id(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  image: text("image").notNull(),
  ctaText: text("ctaText"),
  ctaLink: text("ctaLink"),
  ctaText2: text("ctaText2"),
  ctaLink2: text("ctaLink2"),
  order: integer("order").notNull().default(0),
  isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/** Dịch vụ: tư vấn – đo đạc tận nơi, lắp đặt, bảo hành – bảo trì, vệ sinh rèm, rèm công trình... */
export const services = sqliteTable(
  "Service",
  {
    id: id(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    summary: text("summary"),
    /** HTML từ trình soạn thảo */
    content: text("content").notNull().default(""),
    image: text("image"),
    /** Tên icon lucide (vd "Ruler", "Wrench", "ShieldCheck", "Sparkles"); null = icon mặc định */
    icon: text("icon"),
    /** Giá dịch vụ dạng văn bản, vd "Miễn phí" / "Từ 150.000 đ/bộ" */
    price: text("price"),
    /** Thời gian thực hiện, vd "1 – 2 giờ" */
    duration: text("duration"),
    order: integer("order").notNull().default(0),
    isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("Service_slug_key").on(t.slug)]
);

/** Thư viện ảnh đã upload lên R2 */
export const media = sqliteTable("Media", {
  id: id(),
  url: text("url").notNull(),
  /** Key trong bucket R2 để xóa file */
  storageKey: text("storageKey"),
  filename: text("filename").notNull(),
  mimeType: text("mimeType").notNull(),
  size: integer("size").notNull(),
  width: integer("width"),
  height: integer("height"),
  alt: text("alt"),
  uploadedById: text("uploadedById").references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
  createdAt: createdAt(),
});

/** Cài đặt chung – chỉ có 1 dòng (id = 1) */
export const settings = sqliteTable("Setting", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  companyName: text("companyName").notNull(),
  shortName: text("shortName"),
  slogan: text("slogan"),
  logo: text("logo"),
  taxCode: text("taxCode"),
  foundedYear: integer("foundedYear"),
  hotline: text("hotline").notNull(),
  zalo: text("zalo"),
  email: text("email"),
  /** Địa chỉ showroom / xưởng */
  address: text("address"),
  mapEmbedUrl: text("mapEmbedUrl"),
  workingHours: text("workingHours"),
  facebook: text("facebook"),
  youtube: text("youtube"),
  tiktok: text("tiktok"),
  messenger: text("messenger"),
  /** Số liệu nổi bật: khách hàng, năm kinh nghiệm, công trình đã thi công, mẫu rèm */
  statCustomers: integer("statCustomers"),
  statYears: integer("statYears"),
  statProjects: integer("statProjects"),
  statProducts: integer("statProducts"),
  aboutShort: text("aboutShort"),
  /** HTML – nội dung trang giới thiệu */
  aboutContent: text("aboutContent"),
  vision: text("vision"),
  mission: text("mission"),
  /** Chính sách bảo hành hiển thị ở trang chủ / chi tiết sản phẩm, vd "Bảo hành 24 tháng, bảo trì trọn đời" */
  warrantyText: text("warrantyText"),
  /** Link YouTube video giới thiệu (để trống = ẩn khối video) */
  introVideoUrl: text("introVideoUrl"),
  metaTitle: text("metaTitle"),
  metaDescription: text("metaDescription"),
  ogImage: text("ogImage"),
  /** Khối "bảng giá theo danh mục" ở trang chủ */
  priceTableTitle: text("priceTableTitle"),
  priceTableEnabled: integer("priceTableEnabled", { mode: "boolean" }).notNull().default(true),
  updatedAt: updatedAt(),
});

// ---------- QUAN HỆ (dùng cho db.query.*.findMany({ with: ... })) ----------

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  media: many(media),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  postTags: many(postTags),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  category: one(categories, { fields: [posts.categoryId], references: [categories.id] }),
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
  postTags: many(postTags),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, { fields: [postTags.postId], references: [posts.id] }),
  tag: one(tags, { fields: [postTags.tagId], references: [tags.id] }),
}));

export const productCategoriesRelations = relations(productCategories, ({ many }) => ({
  lines: many(productLines),
  products: many(products),
  leads: many(leads),
}));

export const productLinesRelations = relations(productLines, ({ one, many }) => ({
  category: one(productCategories, { fields: [productLines.categoryId], references: [productCategories.id] }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(productCategories, { fields: [products.categoryId], references: [productCategories.id] }),
  line: one(productLines, { fields: [products.lineId], references: [productLines.id] }),
  leads: many(leads),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  category: one(productCategories, { fields: [leads.categoryId], references: [productCategories.id] }),
  product: one(products, { fields: [leads.productId], references: [products.id] }),
}));

export const mediaRelations = relations(media, ({ one }) => ({
  uploadedBy: one(users, { fields: [media.uploadedById], references: [users.id] }),
}));
