import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/queries/settings";
import { getPostSlugs, getActiveCategories } from "@/lib/queries/posts";
import { getProductCategorySlugs } from "@/lib/queries/product-categories";
import { getProductSlugs } from "@/lib/queries/products";
import { getServiceSlugs } from "@/lib/queries/services";

export const dynamic = "force-dynamic";

const STATIC_PAGES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/gioi-thieu", priority: 0.7, changeFrequency: "monthly" },
  { path: "/danh-muc", priority: 0.9, changeFrequency: "weekly" },
  { path: "/san-pham", priority: 0.9, changeFrequency: "daily" },
  { path: "/dich-vu", priority: 0.8, changeFrequency: "monthly" },
  { path: "/bao-gia", priority: 0.8, changeFrequency: "monthly" },
  { path: "/tin-tuc", priority: 0.8, changeFrequency: "daily" },
  { path: "/cau-hoi-thuong-gap", priority: 0.6, changeFrequency: "monthly" },
  { path: "/lien-he", priority: 0.6, changeFrequency: "yearly" },
  { path: "/chinh-sach-bao-mat", priority: 0.3, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const [posts, categories, productCategories, products, services] = await Promise.all([
    getPostSlugs().catch(() => []),
    getActiveCategories().catch(() => []),
    getProductCategorySlugs().catch(() => []),
    getProductSlugs().catch(() => []),
    getServiceSlugs().catch(() => []),
  ]);

  return [
    ...STATIC_PAGES.map((p) => ({ url: `${base}${p.path}`, lastModified: now, changeFrequency: p.changeFrequency, priority: p.priority })),
    ...productCategories.map((c) => ({ url: `${base}/danh-muc/${c.slug}`, lastModified: c.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...products.map((p) => ({ url: `${base}/san-pham/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...services.map((sv) => ({ url: `${base}/dich-vu/${sv.slug}`, lastModified: sv.updatedAt, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...categories.map((c) => ({ url: `${base}/tin-tuc/chuyen-muc/${c.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.5 })),
    ...posts.map((p) => ({ url: `${base}/tin-tuc/${p.slug}`, lastModified: p.updatedAt ?? p.publishedAt ?? now, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
