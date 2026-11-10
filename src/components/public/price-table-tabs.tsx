"use client";

import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { formatPriceRange } from "@/lib/format";
import type { PriceTableGroup } from "@/lib/queries/product-categories";

function warranty(months: number | null) {
  return months ? `${months} tháng` : "—";
}

/** Bảng giá theo tab danh mục: Sản phẩm · Chất liệu · Khổ – kích thước · Giá tham khảo · Bảo hành */
export function PriceTableTabs({ groups }: { groups: PriceTableGroup[] }) {
  return (
    <Tabs defaultValue={groups[0].slug} className="gap-0 overflow-hidden rounded-2xl border bg-card shadow-sm">
      {/* Chỉ cuộn ngang; khoá trục dọc vì ::after của TabsTrigger (bottom -5px) làm dư chiều cao */}
      <div className="overflow-x-auto overflow-y-hidden bg-brand-dark">
        <TabsList className="h-auto w-max min-w-full justify-start gap-0 rounded-none bg-transparent p-0">
          {groups.map((g) => (
            <TabsTrigger
              key={g.slug}
              value={g.slug}
              className="h-12 flex-none rounded-none border-0 px-4 text-xs font-semibold uppercase tracking-wide text-white/80 shadow-none transition-colors duration-300 hover:bg-white/10 hover:text-white data-[state=active]:bg-cta data-[state=active]:text-cta-foreground data-[state=active]:shadow-none md:px-6 md:text-sm"
            >
              {g.name}
              <span className="ml-1.5 rounded-full bg-white/15 px-1.5 py-0.5 text-[10px] font-bold tabular-nums">{g.total}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {groups.map((g) => (
        // Đổi tab: nội dung hiện mờ dần + trượt nhẹ lên
        <TabsContent key={g.slug} value={g.slug} className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none">
          {/* Điện thoại: mỗi sản phẩm là một thẻ xếp dọc */}
          <ul className="divide-y md:hidden">
            {g.rows.map((r) => (
              <li key={r.id}>
                <Link href={`/san-pham/${r.slug}`} className="block space-y-2 px-4 py-3 transition-colors active:bg-brand-light/60">
                  <p className="flex items-start gap-1.5 font-semibold leading-snug">
                    {r.isFeatured && <Star className="mt-0.5 size-3.5 shrink-0 fill-cta text-cta" aria-label="Nổi bật" />}
                    <span>
                      {r.name}
                      {r.code && <span className="ml-1.5 font-mono text-xs font-medium text-muted-foreground">{r.code}</span>}
                    </span>
                  </p>
                  <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                    <span className="text-muted-foreground">Chất liệu</span>
                    <span>{r.material ?? "—"}</span>
                    <span className="text-muted-foreground">Khổ – kích thước</span>
                    <span>{r.width ?? "—"}</span>
                    <span className="text-muted-foreground">Giá tham khảo</span>
                    <span className="font-bold text-primary">{formatPriceRange(r.priceFrom, r.priceTo, r.priceUnit)}</span>
                    <span className="text-muted-foreground">Bảo hành</span>
                    <span className="font-medium tabular-nums">{warranty(r.warrantyMonths)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {/* Tablet/desktop: bảng đầy đủ */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="bg-muted/60 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 md:px-5">Sản phẩm</th>
                  <th className="px-3 py-3">Chất liệu</th>
                  <th className="px-3 py-3">Khổ – kích thước</th>
                  <th className="px-3 py-3 text-right">Giá tham khảo</th>
                  <th className="px-3 py-3 text-center">Bảo hành</th>
                </tr>
              </thead>
              <tbody>
                {g.rows.map((r) => (
                  <tr key={r.id} className="border-t transition-colors hover:bg-brand-light/60 [&>td:first-child]:border-l-2 [&>td:first-child]:border-transparent hover:[&>td:first-child]:border-cta">
                    <td className="px-4 py-3 md:px-5">
                      <Link href={`/san-pham/${r.slug}`} className="inline-flex items-start gap-1.5 font-semibold leading-snug text-foreground hover:text-primary">
                        {r.isFeatured && <Star className="mt-0.5 size-3.5 shrink-0 fill-cta text-cta" aria-label="Nổi bật" />}
                        <span>
                          {r.name}
                          {r.code && <span className="ml-2 font-mono text-xs font-medium text-muted-foreground">{r.code}</span>}
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-3">{r.material ?? "—"}</td>
                    <td className="px-3 py-3">{r.width ?? "—"}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-right font-bold text-primary">{formatPriceRange(r.priceFrom, r.priceTo, r.priceUnit)}</td>
                    <td className="px-3 py-3 text-center font-medium tabular-nums">{warranty(r.warrantyMonths)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col items-start gap-2 border-t bg-muted/30 px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between md:px-5">
            <span>{g.priceNote ?? `${g.total} mẫu đang bán`}</span>
            <Button asChild variant="link" className="h-auto px-0 font-semibold">
              <Link href={`/san-pham?danh-muc=${g.slug}`}>
                Xem tất cả {g.name} <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
