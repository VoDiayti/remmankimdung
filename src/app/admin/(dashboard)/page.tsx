import Link from "next/link";
import { ArrowRight, Blinds, ClipboardList, FileText, Package } from "lucide-react";
import { count, desc, eq } from "drizzle-orm";
import { db, leads, posts, productCategories, products } from "@/db";
import { formatDateTime, formatPriceRange } from "@/lib/format";
import { LEAD_TYPE_LABELS } from "@/lib/constants";
import { PageHeader } from "@/components/admin/page-header";
import { LeadStatusBadge, ProductStatusBadge } from "@/components/admin/status-badge";
import { Thumbnail } from "@/components/admin/banners/thumbnail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  const [[{ activeProducts }], [{ totalProducts }], [{ activeCategories }], [{ newLeads }], [{ totalLeads }], [{ publishedPosts }], latestLeads, recentProducts] =
    await Promise.all([
      db.select({ activeProducts: count() }).from(products).where(eq(products.status, "ACTIVE")),
      db.select({ totalProducts: count() }).from(products),
      db.select({ activeCategories: count() }).from(productCategories).where(eq(productCategories.isActive, true)),
      db.select({ newLeads: count() }).from(leads).where(eq(leads.status, "NEW")),
      db.select({ totalLeads: count() }).from(leads),
      db.select({ publishedPosts: count() }).from(posts).where(eq(posts.status, "PUBLISHED")),
      db.query.leads.findMany({
        orderBy: [desc(leads.createdAt)],
        limit: 5,
        columns: { id: true, fullName: true, phone: true, type: true, status: true, createdAt: true },
        with: { category: { columns: { name: true } }, product: { columns: { name: true } } },
      }),
      db.query.products.findMany({
        orderBy: [desc(products.updatedAt)],
        limit: 5,
        columns: { id: true, name: true, code: true, image: true, status: true, priceFrom: true, priceTo: true, priceUnit: true, updatedAt: true },
        with: { category: { columns: { name: true } } },
      }),
    ]);

  const stats = [
    { label: "Sản phẩm đang bán", value: activeProducts, sub: `${totalProducts} sản phẩm tổng cộng`, icon: Package, href: "/admin/san-pham?status=ACTIVE" },
    { label: "Danh mục rèm", value: activeCategories, sub: "Đang hiển thị trên website", icon: Blinds, href: "/admin/danh-muc" },
    { label: "Yêu cầu mới", value: newLeads, sub: `${totalLeads} yêu cầu tổng cộng · cần liên hệ sớm`, icon: ClipboardList, href: "/admin/bao-gia?status=NEW" },
    { label: "Bài viết đã đăng", value: publishedPosts, sub: "Tin tức, kinh nghiệm chọn rèm", icon: FileText, href: "/admin/bai-viet?status=PUBLISHED" },
  ];

  return (
    <>
      <PageHeader title="Bảng điều khiển" description="Tổng quan nhanh về sản phẩm, yêu cầu báo giá và nội dung." />

      {error === "forbidden" && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>Bạn không có quyền truy cập trang vừa yêu cầu. Chức năng đó chỉ dành cho Quản trị viên.</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="gap-2">
            <CardHeader className="flex flex-row items-center justify-between pb-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="size-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
              <Link href={s.href} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                Xem chi tiết <ArrowRight className="size-3" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Yêu cầu báo giá mới nhất</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link href="/admin/bao-gia">Tất cả <ArrowRight /></Link></Button>
          </CardHeader>
          <CardContent>
            {latestLeads.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Chưa có yêu cầu nào.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead className="hidden md:table-cell">Loại</TableHead>
                    <TableHead className="hidden lg:table-cell">Quan tâm</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="hidden sm:table-cell">Thời gian</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latestLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="max-w-48 whitespace-normal">
                        <Link href={`/admin/bao-gia/${lead.id}`} className="font-medium hover:underline">{lead.fullName}</Link>
                        <p className="text-xs text-muted-foreground"><a href={`tel:${lead.phone}`} className="hover:underline">{lead.phone}</a></p>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{LEAD_TYPE_LABELS[lead.type]}</TableCell>
                      <TableCell className="hidden max-w-56 whitespace-normal lg:table-cell">
                        <p className="line-clamp-2 text-sm">{lead.product?.name ?? lead.category?.name ?? <span className="text-muted-foreground">—</span>}</p>
                      </TableCell>
                      <TableCell><LeadStatusBadge status={lead.status} /></TableCell>
                      <TableCell className="hidden text-muted-foreground sm:table-cell">{formatDateTime(lead.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Sản phẩm cập nhật gần đây</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link href="/admin/san-pham/moi">Thêm sản phẩm</Link></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentProducts.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Chưa có sản phẩm.</p>}
            {recentProducts.map((p) => (
              <div key={p.id} className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0">
                <Thumbnail src={p.image} className="h-12 w-16" />
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/san-pham/${p.id}`} className="line-clamp-2 text-sm font-medium hover:underline">{p.name}</Link>
                  <p className="text-xs text-muted-foreground">
                    {p.category.name} · {formatPriceRange(p.priceFrom, p.priceTo, p.priceUnit)} · {formatDateTime(p.updatedAt)}
                  </p>
                </div>
                <ProductStatusBadge status={p.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
