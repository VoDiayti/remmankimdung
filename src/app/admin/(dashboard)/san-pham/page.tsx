import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Pencil, Plus } from "lucide-react";
import { and, asc, count, desc, eq, like, or } from "drizzle-orm";
import { db, productCategories, productLines, products } from "@/db";
import { ADMIN_PAGE_SIZE, PRODUCT_STATUS_LABELS } from "@/lib/constants";
import { formatDateTime, formatPriceRange } from "@/lib/format";
import type { ProductStatus } from "@/db/enums";
import { deleteProduct, toggleProductFeatured, toggleProductInPriceTable } from "@/actions/products";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { ListPagination } from "@/components/admin/list-pagination";
import { SearchInput, UrlParamSelect } from "@/components/admin/url-filters";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { ToggleSwitch } from "@/components/admin/banners/toggle-switch";
import { Thumbnail } from "@/components/admin/banners/thumbnail";
import { ProductStatusToggle } from "@/components/admin/products/product-status-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Sản phẩm" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const isProductStatus = (v: string | undefined): v is ProductStatus => !!v && v in PRODUCT_STATUS_LABELS;

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = first(sp.q)?.trim() ?? "";
  const category = first(sp.category)?.trim() || "";
  const line = first(sp.line)?.trim() || "";
  const status = isProductStatus(first(sp.status)) ? (first(sp.status) as ProductStatus) : undefined;
  const page = Math.max(1, Number(first(sp.page)) || 1);

  const where = and(
    q ? or(like(products.name, `%${q}%`), like(products.code, `%${q}%`), like(products.material, `%${q}%`)) : undefined,
    category ? eq(products.categoryId, category) : undefined,
    line ? eq(products.lineId, line) : undefined,
    status ? eq(products.status, status) : undefined
  );

  const [items, [{ total }], categoryOptions, lineOptions] = await Promise.all([
    db.query.products.findMany({
      where,
      orderBy: [desc(products.updatedAt)],
      limit: ADMIN_PAGE_SIZE,
      offset: (page - 1) * ADMIN_PAGE_SIZE,
      columns: {
        id: true, name: true, slug: true, code: true, image: true, priceFrom: true, priceTo: true, priceUnit: true,
        status: true, isFeatured: true, showInPriceTable: true, updatedAt: true,
      },
      with: { category: { columns: { id: true, name: true } }, line: { columns: { id: true, name: true } } },
    }),
    db.select({ total: count() }).from(products).where(where),
    db.query.productCategories.findMany({ orderBy: [asc(productCategories.order), asc(productCategories.name)], columns: { id: true, name: true, isActive: true } }),
    // Loại rèm: chỉ hiện các loại thuộc danh mục đang lọc (nếu có)
    db.query.productLines.findMany({
      where: category ? eq(productLines.categoryId, category) : undefined,
      orderBy: [asc(productLines.order), asc(productLines.name)],
      columns: { id: true, name: true, isActive: true },
      with: { category: { columns: { name: true } } },
    }),
  ]);
  const totalPages = Math.ceil(total / ADMIN_PAGE_SIZE);
  const hasFilter = Boolean(q || category || line || status);

  return (
    <>
      <PageHeader
        title="Sản phẩm"
        description={`${total} sản phẩm${hasFilter ? " theo bộ lọc" : ""}. Chỉ sản phẩm “Đang bán” hiển thị trên website.`}
        actions={
          <Button asChild>
            <Link href="/admin/san-pham/moi"><Plus /> Thêm sản phẩm</Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <SearchInput placeholder="Tìm theo tên, mã, chất liệu..." className="w-full sm:w-72" />
        <UrlParamSelect
          param="category"
          allLabel="Tất cả danh mục"
          placeholder="Danh mục"
          options={categoryOptions.map((c) => ({ value: c.id, label: c.isActive ? c.name : `${c.name} (ẩn)` }))}
          className="w-full sm:w-52"
        />
        <UrlParamSelect
          param="line"
          allLabel="Tất cả loại rèm"
          placeholder="Loại rèm"
          options={lineOptions.map((l) => ({ value: l.id, label: `${l.isActive ? l.name : `${l.name} (ẩn)`}${category ? "" : ` – ${l.category.name}`}` }))}
          className="w-full sm:w-56"
        />
        <UrlParamSelect
          param="status"
          allLabel="Tất cả trạng thái"
          placeholder="Trạng thái"
          options={Object.entries(PRODUCT_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
        />
      </div>

      {items.length === 0 ? (
        <EmptyState
          title={hasFilter ? "Không tìm thấy sản phẩm phù hợp" : "Chưa có sản phẩm"}
          description={hasFilter ? "Thử đổi từ khóa hoặc bộ lọc." : "Thêm mẫu rèm đầu tiên để hiển thị trên website."}
          action={!hasFilter && <Button asChild><Link href="/admin/san-pham/moi"><Plus /> Thêm sản phẩm</Link></Button>}
        />
      ) : (
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Ảnh</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead className="hidden lg:table-cell">Danh mục / Loại</TableHead>
                <TableHead className="hidden md:table-cell">Giá</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-20 text-center">Nổi bật</TableHead>
                <TableHead className="hidden w-20 text-center xl:table-cell">Bảng giá</TableHead>
                <TableHead className="hidden xl:table-cell">Cập nhật</TableHead>
                <TableHead className="w-28 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((p) => (
                <TableRow key={p.id}>
                  <TableCell><Thumbnail src={p.image} className="w-20" /></TableCell>
                  <TableCell className="max-w-72 whitespace-normal">
                    <Link href={`/admin/san-pham/${p.id}`} className="line-clamp-2 font-medium hover:underline">{p.name}</Link>
                    <p className="text-xs text-muted-foreground">
                      {p.code && <span className="mr-1.5 rounded bg-muted px-1 py-0.5 font-mono text-[10px]">{p.code}</span>}
                      <span className="lg:hidden">{p.category.name}{p.line ? ` · ${p.line.name}` : ""}</span>
                    </p>
                  </TableCell>
                  <TableCell className="hidden whitespace-normal lg:table-cell">
                    <p>{p.category.name}</p>
                    <p className="text-xs text-muted-foreground">{p.line?.name ?? "Chưa phân loại"}</p>
                  </TableCell>
                  <TableCell className="hidden whitespace-normal md:table-cell">
                    <span className="text-sm font-medium tabular-nums">{formatPriceRange(p.priceFrom, p.priceTo, p.priceUnit)}</span>
                  </TableCell>
                  <TableCell><ProductStatusToggle id={p.id} status={p.status} /></TableCell>
                  <TableCell className="text-center">
                    <ToggleSwitch checked={p.isFeatured} action={toggleProductFeatured.bind(null, p.id)} label="Sản phẩm nổi bật" />
                  </TableCell>
                  <TableCell className="hidden text-center xl:table-cell">
                    <ToggleSwitch checked={p.showInPriceTable} action={toggleProductInPriceTable.bind(null, p.id)} label="Hiện trong bảng giá trang chủ" />
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground xl:table-cell">{formatDateTime(p.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-0.5">
                      <Button variant="ghost" size="icon" asChild aria-label="Sửa">
                        <Link href={`/admin/san-pham/${p.id}`} title="Sửa"><Pencil /></Link>
                      </Button>
                      {p.status === "ACTIVE" && (
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/san-pham/${p.slug}`} target="_blank" aria-label="Xem trên website" title="Xem trên website"><ExternalLink /></Link>
                        </Button>
                      )}
                      <ConfirmDeleteButton
                        action={deleteProduct.bind(null, p.id)}
                        title="Xóa sản phẩm này?"
                        description={`Sản phẩm "${p.name}" sẽ bị xóa khỏi website. Các yêu cầu báo giá liên quan vẫn được giữ lại.`}
                      />
                    </div>
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
