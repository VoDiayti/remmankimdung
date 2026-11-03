import type { Metadata } from "next";
import { getSettings } from "@/lib/queries/settings";
import { buildMetadata, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { FloatingContact } from "@/components/public/floating-contact";
import { JsonLd } from "@/components/public/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const siteName = s.shortName || s.companyName;
  const defaultTitle = s.metaTitle || `${siteName} – Rèm cửa đẹp, giá tận xưởng`;
  const base = buildMetadata(s, { title: defaultTitle, absoluteTitle: true, description: s.metaDescription, path: "/" });
  return {
    ...base,
    title: { default: defaultTitle, template: `%s | ${siteName}` },
    applicationName: siteName,
    keywords: ["rèm cửa", "rèm vải", "rèm cuốn", "rèm cầu vồng", "rèm roman", "rèm sáo gỗ", "rèm văn phòng", "rèm cửa TP. HCM", siteName],
    robots: { index: true, follow: true },
  };
}

/** Layout nhóm trang công khai: Header, Footer, nút liên hệ nổi, JSON-LD HomeGoodsStore */
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  return (
    <>
      <JsonLd data={[organizationJsonLd(s), websiteJsonLd(s)]} />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <FloatingContact hotline={s.hotline} zalo={s.zalo} messenger={s.messenger} />
    </>
  );
}
