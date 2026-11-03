import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Pencil, Plus, Wrench } from "lucide-react";
import { and, asc, count, desc, eq, like, or } from "drizzle-orm";
import { db, services } from "@/db";
import { ADMIN_PAGE_SIZE } from "@/lib/constants";
import { deleteService, toggleServiceActive } from "@/actions/services";
import { PageHeader } from "@/components/admin/page-header";
import { SearchInput, UrlParamSelect } from "@/components/admin/url-filters";
import { ListPagination } from "@/components/admin/list-pagination";
import { EmptyState } from "@/components/admin/empty-state";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { ToggleSwitch } from "@/components/admin/banners/toggle-switch";
import { Thumbnail } from "@/components/admin/banners/thumbnail";
import { SERVICE_ICON_MAP } from "@/components/admin/services/service-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Dịch vụ" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function ServicesPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = first(sp.q)?.trim() ?? "";
  const active = first(sp.active);
  const page = Math.max(1, Number(first(sp.page)) || 1);

  const where = and(
    q ? or(like(services.title, `%${q}%`), like(services.summary, `%${q}%`)) : undefined,
    active === "true" ? eq(services.isActive, true) : active === "false" ? eq(services.isActive, false) : undefined
  );

  const [items, [{ total }]] = await Promise.all([
    db.query.services.findMany({
      where,
      orderBy: [asc(services.order), desc(services.createdAt)],
      limit: ADMIN_PAGE_SIZE,
      offset: (page - 1) * ADMIN_PAGE_SIZE,
      columns: { id: true, title: true, slug: true, summary: true, image: true, icon: true, price: true, duration: true, order: true, isActive: true },
    }),
    db.select({ total: count() }).from(services).where(where),
  ]);
  const totalPages = Math.ceil(total / ADMIN_PAGE_SIZE);
  const hasFilters = Boolean(q || active);

  return (
    <>
      <PageHeader
        title="Dịch vụ"
        description={`${total} dịch vụ${hasFilters ? " phù hợp bộ lọc" : ""}: tư vấn – đo đạc tận nơi, lắp đặt, bảo hành – bảo trì, vệ sinh rèm, rèm công trình...`}
        actions={
          <Button asChild>
            <Link href="/admin/dich-vu/moi"><Plus /> Thêm dịch vụ</Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput placeholder="Tìm theo tiêu đề, tóm tắt..." className="w-full sm:w-72" />
        <UrlParamSelect
          param="active"
          allLabel="Tất cả trạng thái"
          placeholder="Trạng thái"
          options={[
            { value: "true", label: "Đang hiển thị" },
            { value: "false", label: "Đang ẩn" },
          ]}
        />
      </div>

      {items.length === 0 ? (
        <EmptyState
          title={hasFilters ? "Không tìm thấy dịch vụ phù hợp" : "Chưa có dịch vụ nào"}
          description={hasFilters ? "Thử đổi từ khóa hoặc bỏ bộ lọc." : "Thêm dịch vụ đo đạc, lắp đặt, bảo hành, vệ sinh rèm để hiển thị trên website."}
          action={!hasFilters && <Button asChild><Link href="/admin/dich-vu/moi"><Plus /> Thêm dịch vụ</Link></Button>}
        />
      ) : (
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Ảnh</TableHead>
                <TableHead>Dịch vụ</TableHead>
                <TableHead className="hidden lg:table-cell">Giá</TableHead>
                <TableHead className="hidden lg:table-cell">Thời gian</TableHead>
                <TableHead className="hidden w-20 text-center sm:table-cell">Thứ tự</TableHead>
                <TableHead className="w-24 text-center">Hiển thị</TableHead>
                <TableHead className="w-28 text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((s) => {
                const Icon = (s.icon && SERVICE_ICON_MAP[s.icon]) || Wrench;
                return (
                  <TableRow key={s.id}>
                    <TableCell><Thumbnail src={s.image} className="w-20" /></TableCell>
                    <TableCell className="max-w-xs whitespace-normal md:max-w-md">
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary" aria-hidden><Icon className="size-3.5" /></span>
                        <div className="min-w-0">
                          <Link href={`/admin/dich-vu/${s.id}`} className="line-clamp-2 font-medium hover:underline">{s.title}</Link>
                          <p className="truncate text-xs text-muted-foreground">/dich-vu/{s.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden max-w-48 truncate lg:table-cell">{s.price || <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell className="hidden max-w-48 truncate lg:table-cell">{s.duration || <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell className="hidden text-center sm:table-cell">{s.order}</TableCell>
                    <TableCell className="text-center">
                      <ToggleSwitch checked={s.isActive} action={toggleServiceActive.bind(null, s.id)} label="Hiển thị dịch vụ" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-0.5">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/dich-vu/${s.id}`} aria-label="Sửa" title="Sửa"><Pencil /></Link>
                        </Button>
                        {s.isActive && (
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dich-vu/${s.slug}`} target="_blank" aria-label="Xem trên website" title="Xem trên website"><ExternalLink /></Link>
                          </Button>
                        )}
                        <ConfirmDeleteButton
                          action={deleteService.bind(null, s.id)}
                          title="Xóa dịch vụ?"
                          description={`Dịch vụ "${s.title}" sẽ bị xóa vĩnh viễn khỏi website. Hành động này không thể hoàn tác.`}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <ListPagination page={page} totalPages={totalPages} className="mt-6" />
    </>
  );
}
