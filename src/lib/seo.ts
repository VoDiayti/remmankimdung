import "server-only";
import type { Metadata } from "next";
import type { PriceUnit } from "@/db/enums";
import type { Setting } from "@/db/types";
import { getSiteUrl } from "@/lib/queries/settings";
import { truncate } from "@/lib/format";

export const DEFAULT_OG_IMAGE = "/og-default.jpg";

/** Chuyển đường dẫn tương đối thành URL tuyệt đối theo NEXT_PUBLIC_SITE_URL */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Bỏ thẻ HTML, gom khoảng trắng – dùng cho JSON-LD / mô tả */
export function plainText(html: string | null | undefined, max = 5000): string {
  if (!html) return "";
  const text = html
    .replace(/<\/(p|div|li|h[1-6]|tr|br)>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

export type MetadataInput = {
  title: string;
  /** Không thêm hậu tố "| Tên cửa hàng" */
  absoluteTitle?: boolean;
  description?: string | null;
  /** Đường dẫn tương đối, vd "/san-pham/rem-vai-2-lop" */
  path: string;
  image?: string | null;
  type?: "website" | "article";
  publishedTime?: Date | null;
  modifiedTime?: Date | null;
  authors?: string[];
  noIndex?: boolean;
};

/** Tạo metadata chuẩn (title, description, canonical, Open Graph, Twitter) cho trang công khai */
export function buildMetadata(s: Setting, input: MetadataInput): Metadata {
  const siteName = s.shortName || s.companyName;
  const fullTitle = input.absoluteTitle ? input.title : `${input.title} | ${siteName}`;
  const description = truncate(input.description || s.metaDescription || s.aboutShort || s.companyName, 300);
  const url = absoluteUrl(input.path);
  const image = absoluteUrl(input.image || s.ogImage || DEFAULT_OG_IMAGE);
  const images = [{ url: image, width: 1200, height: 630, alt: fullTitle }];

  const openGraph: NonNullable<Metadata["openGraph"]> =
    input.type === "article"
      ? {
          type: "article",
          title: fullTitle,
          description,
          url,
          siteName,
          locale: "vi_VN",
          images,
          publishedTime: input.publishedTime?.toISOString(),
          modifiedTime: input.modifiedTime?.toISOString(),
          authors: input.authors,
        }
      : { type: "website", title: fullTitle, description, url, siteName, locale: "vi_VN", images };

  return {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description,
    alternates: { canonical: url },
    openGraph,
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [image] },
    ...(input.noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

// ---------- JSON-LD ----------

export type JsonLdObject = Record<string, unknown>;

function compact<T extends JsonLdObject>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0))
  ) as T;
}

/** Cửa hàng rèm = HomeGoodsStore (LocalBusiness) – địa chỉ, điện thoại, giờ mở cửa */
export function organizationJsonLd(s: Setting): JsonLdObject {
  const siteUrl = getSiteUrl();
  return compact({
    "@context": "https://schema.org",
    "@type": "HomeGoodsStore",
    "@id": `${siteUrl}/#organization`,
    name: s.companyName,
    alternateName: s.shortName ?? undefined,
    url: siteUrl,
    logo: absoluteUrl(s.logo || "/logo.svg"),
    image: absoluteUrl(s.ogImage || DEFAULT_OG_IMAGE),
    description: s.metaDescription || s.aboutShort || undefined,
    slogan: s.slogan ?? undefined,
    telephone: s.hotline,
    email: s.email ?? undefined,
    foundingDate: s.foundedYear ? String(s.foundedYear) : undefined,
    taxID: s.taxCode ?? undefined,
    priceRange: "$$",
    currenciesAccepted: "VND",
    address: s.address ? { "@type": "PostalAddress", streetAddress: s.address, addressCountry: "VN" } : undefined,
    openingHours: s.workingHours ?? undefined,
    sameAs: [s.facebook, s.youtube, s.tiktok].filter((v): v is string => Boolean(v)),
    contactPoint: [
      compact({
        "@type": "ContactPoint",
        telephone: s.hotline,
        email: s.email ?? undefined,
        contactType: "customer service",
        areaServed: "VN",
        availableLanguage: ["Vietnamese"],
        hoursAvailable: s.workingHours ?? undefined,
      }),
    ],
  });
}

export function websiteJsonLd(s: Setting): JsonLdObject {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: s.shortName || s.companyName,
    publisher: { "@id": `${siteUrl}/#organization` },
    inLanguage: "vi-VN",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/san-pham?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export type BreadcrumbItem = { name: string; path?: string };

export function breadcrumbJsonLd(items: BreadcrumbItem[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) =>
      compact({
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        item: item.path ? absoluteUrl(item.path) : undefined,
      })
    ),
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function articleJsonLd(
  s: Setting,
  post: {
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    coverImage: string | null;
    ogImage?: string | null;
    publishedAt: Date | null;
    updatedAt: Date;
    author?: { name: string } | null;
    category?: { name: string } | null;
    tags?: { name: string }[];
  }
): JsonLdObject {
  const siteUrl = getSiteUrl();
  const url = absoluteUrl(`/tin-tuc/${post.slug}`);
  return compact({
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: truncate(post.title, 110),
    description: post.excerpt || truncate(plainText(post.content), 200),
    image: [absoluteUrl(post.ogImage || post.coverImage || s.ogImage || DEFAULT_OG_IMAGE)],
    datePublished: post.publishedAt?.toISOString(),
    dateModified: (post.updatedAt > (post.publishedAt ?? post.updatedAt) ? post.updatedAt : post.publishedAt ?? post.updatedAt).toISOString(),
    author: { "@type": post.author?.name ? "Person" : "Organization", name: post.author?.name || s.companyName },
    publisher: {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: s.companyName,
      logo: { "@type": "ImageObject", url: absoluteUrl(s.logo || "/logo.svg") },
    },
    articleSection: post.category?.name ?? undefined,
    keywords: post.tags?.length ? post.tags.map((t) => t.name).join(", ") : undefined,
    inLanguage: "vi-VN",
    wordCount: plainText(post.content).split(/\s+/).filter(Boolean).length || undefined,
  });
}

/** Đơn vị tính giá theo schema.org (UN/CEFACT): MTK = m², MTR = mét, SET = bộ */
const PRICE_UNIT_CODE: Record<PriceUnit, string> = { M2: "MTK", METER: "MTR", SET: "SET" };

/** JSON-LD Product: có `offers` khi sản phẩm có giá tham khảo (priceCurrency VND) */
export function productJsonLd(
  s: Setting,
  product: {
    name: string;
    slug: string;
    code: string | null;
    summary: string | null;
    description: string;
    image: string | null;
    gallery: string[];
    material: string | null;
    colors: string | null;
    width: string | null;
    priceFrom: number | null;
    priceTo: number | null;
    priceUnit: PriceUnit;
    category: { name: string };
    line?: { name: string } | null;
  }
): JsonLdObject {
  const siteUrl = getSiteUrl();
  const url = absoluteUrl(`/san-pham/${product.slug}`);
  const images = [product.image, ...product.gallery].filter((v): v is string => Boolean(v)).map(absoluteUrl);
  const hasPrice = product.priceFrom != null || product.priceTo != null;
  const low = product.priceFrom ?? product.priceTo;
  const high = product.priceTo ?? product.priceFrom;

  return compact({
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": url,
    url,
    name: product.name,
    sku: product.code ?? undefined,
    description: product.summary || truncate(plainText(product.description), 300) || product.name,
    image: images.length ? images : [absoluteUrl(s.ogImage || DEFAULT_OG_IMAGE)],
    category: product.line ? `${product.category.name} › ${product.line.name}` : product.category.name,
    material: product.material ?? undefined,
    color: product.colors ?? undefined,
    size: product.width ?? undefined,
    brand: { "@type": "Brand", name: s.shortName || s.companyName },
    offers: hasPrice
      ? compact({
          "@type": low !== high ? "AggregateOffer" : "Offer",
          url,
          priceCurrency: "VND",
          price: low !== high ? undefined : low,
          lowPrice: low !== high ? low : undefined,
          highPrice: low !== high ? high : undefined,
          availability: "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            priceCurrency: "VND",
            price: low,
            unitCode: PRICE_UNIT_CODE[product.priceUnit],
          },
          seller: { "@type": "Organization", "@id": `${siteUrl}/#organization`, name: s.companyName },
        })
      : undefined,
  });
}
