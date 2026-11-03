import type { Metadata } from "next";
import { getSettings } from "@/lib/queries/settings";
import { paramPage, paramString, type SearchParams } from "@/lib/queries/params";
import { buildMetadata } from "@/lib/seo";
import { NewsListing } from "@/components/public/news-listing";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<SearchParams> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const [s, sp] = await Promise.all([getSettings(), searchParams]);
  const q = paramString(sp.q);
  return buildMetadata(s, {
    title: q ? `Tìm kiếm: ${q}` : "Tin tức & kinh nghiệm chọn rèm",
    description: "Kinh nghiệm chọn rèm cửa cho từng không gian, hướng dẫn bảo quản, công trình tiêu biểu và chương trình ưu đãi mới nhất.",
    path: "/tin-tuc",
    noIndex: Boolean(q) || paramPage(sp.page) > 1,
  });
}

export default async function NewsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = paramString(sp.q);
  return (
    <NewsListing
      title="Tin tức & Kinh nghiệm chọn rèm"
      description="Kinh nghiệm chọn rèm cho từng không gian, hướng dẫn bảo quản, công trình tiêu biểu và ưu đãi mới."
      crumbs={[{ label: "Tin tức" }]}
      pathname="/tin-tuc"
      q={q}
      page={paramPage(sp.page)}
    />
  );
}
