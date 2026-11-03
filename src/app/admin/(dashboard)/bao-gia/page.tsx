import type { Metadata } from "next";
import Link from "next/link";
import { Download, Eye } from "lucide-react";
import { asc, count, desc, eq } from "drizzle-orm";
import { db, leads, productCategories, products } from "@/db";
import { ADMIN_PAGE_SIZE, LEAD_STATUS_LABELS, LEAD_TYPE_LABELS } from "@/lib/constants";
import { formatDateTime, telHref } from "@/lib/format";
import { leadFilterWhere, parseLeadFilter } from "@/lib/validations/lead-admin";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { ListPagination } from "@/components/admin/list-pagination";
import { SearchInput, UrlParamSelect } from "@/components/admin/url-filters";
import { LeadStatusSelect } from "@/components/admin/leads/lead-status-select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Yêu cầu báo giá" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function LeadsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const filter = parseLeadFilter(sp);
  const page = Math.max(1, Number(first(sp.page)) || 1);
  const where = leadFilterWhere(filter);

  const [items, [{ total }], categoryOptions, product] = await Promise.all([
    db.query.leads.findMany({
      where,
      orderBy: [desc(leads.createdAt)],
      limit: ADMIN_PAGE_SIZE,
      offset: (page - 1) * ADMIN_PAGE_SIZE,
      with: { category: { columns: { id: true, name: true } }, product: { columns: { id: true, name: true } } },
    }),
    db.select({ total: count() }).from(leads).where(where),
    db.select({ id: productCategories.id, name: productCategories.name }).from(productCategories).orderBy(asc(productCategories.order), asc(productCategories.name)),
    filter.product ? db.query.products.findFirst({ columns: { name: true }, where: eq(products.id, filter.product) }) : null,
  ]);
  const totalPages = Math.ceil(total / ADMIN_PAGE_SIZE);
  const hasFilter = Boolean(filter.q || filter.status || filter.type || filter.category || filter.product);

  // Link xuất CSV giữ nguyên bộ lọc hiện tại
  const exportParams = new URLSearchParams();
  for (const [k, v] of Object.entries(filter)) if (v) exportParams.set(k, v);
  const exportHref = `/api/admin/bao-gia/export${exportParams.size ? `?${exportParams.toString()}` : ""}`;

  return (
    <>
      <PageHeader
        title="Yêu cầu báo giá"
        description={`${total} yêu cầu${hasFilter ? " (theo bộ lọc)" : ""}. Gọi lại sớm các yêu cầu “Mới” để đặt lịch đo đạc.`}
        actions={
          <Button variant="outline" asChild>
            <a href={exportHref} download><Download /> Xuất CSV</a>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <SearchInput placeholder="Tìm theo tên, số điện thoại, email, địa chỉ..." className="w-full sm:w-72" />
        <UrlParamSelect
          param="status"
          allLabel="Tất cả trạng thái"
          placeholder="Trạng thái"
          options={Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
        />
        <UrlParamSelect
          param="type"
          allLabel="Tất cả loại"
          placeholder="Loại yêu cầu"
          options={Object.entries(LEAD_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
        />
        <UrlParamSelect param="category" allLabel="Tất cả danh mục" placeholder="Danh mục rèm" options={categoryOptions.map((c) => ({ value: c.id, label: c.name }))} className="w-full sm:w-52" />
        {product && (
          <Badge variant="secondary" className="h-9 gap-1 px-3">
            Sản phẩm: <span className="max-w-48 truncate">{product.name}</span>
            <Link href="/admin/bao-gia" className="ml-1 underline">Bỏ lọc</Link>
          </Badge>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          title={hasFilter ? "Không có yêu cầu phù hợp" : "Chưa có yêu cầu nào"}
          description={hasFilter ? "Thử đổi từ khóa hoặc bộ lọc." : "Khi khách gửi form báo giá / tư vấn / liên hệ trên website, dữ liệu sẽ xuất hiện ở đây."}
        />
      ) : (
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-36 sm:table-cell">Thời gian</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead className="hidden md:table-cell">Loại</TableHead>
                <TableHead className="hidden lg:table-cell">Quan tâm</TableHead>
                <TableHead className="w-40">Trạng thái</TableHead>
                <TableHead className="hidden xl:table-cell">Nguồn</TableHead>
                <TableHead className="w-16 text-right">Xem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((lead) => (
                <TableRow key={lead.id} className={lead.status === "NEW" ? "bg-primary/5" : undefined}>
                  <TableCell className="hidden whitespace-normal text-muted-foreground sm:table-cell">{formatDateTime(lead.createdAt)}</TableCell>
                  <TableCell className="max-w-56 whitespace-normal">
                    <Link href={`/admin/bao-gia/${lead.id}`} className="font-medium hover:underline">{lead.fullName}</Link>
                    <p className="text-xs"><a href={telHref(lead.phone)} className="font-medium text-primary hover:underline">{lead.phone}</a></p>
                    {lead.address && <p className="line-clamp-1 text-xs text-muted-foreground">{lead.address}</p>}
                    <p className="text-xs text-muted-foreground sm:hidden">{formatDateTime(lead.createdAt)}</p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{LEAD_TYPE_LABELS[lead.type]}</TableCell>
                  <TableCell className="hidden max-w-60 whitespace-normal lg:table-cell">
                    {lead.category || lead.product ? (
                      <div className="space-y-0.5 text-sm">
                        {lead.category && <Link href={`/admin/danh-muc/${lead.category.id}`} className="block hover:underline">{lead.category.name}</Link>}
                        {lead.product && <Link href={`/admin/san-pham/${lead.product.id}`} className="line-clamp-2 block text-xs text-muted-foreground hover:underline">{lead.product.name}</Link>}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell><LeadStatusSelect id={lead.id} status={lead.status} size="sm" /></TableCell>
                  <TableCell className="hidden max-w-40 truncate xl:table-cell">
                    {lead.source ? <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{lead.source}</code> : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild aria-label="Xem chi tiết">
                      <Link href={`/admin/bao-gia/${lead.id}`}><Eye /></Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <ListPagination page={page} totalPages={totalPages} className="mt-4" />
    </>
  );
}
