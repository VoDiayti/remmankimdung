import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Pencil, Plus } from "lucide-react";
import { and, asc, count, countDistinct, eq, like, or } from "drizzle-orm";
import { db, productCategories, productLines, products } from "@/db";
import { ADMIN_PAGE_SIZE } from "@/lib/constants";
import { deleteProductCategory, toggleProductCategoryActive, toggleProductCategoryFeatured } from "@/actions/product-categories";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { ListPagination } from "@/components/admin/list-pagination";
import { SearchInput, UrlParamSelect } from "@/components/admin/url-filters";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { ToggleSwitch } from "@/components/admin/banners/toggle-switch";
import { Thumbnail } from "@/components/admin/banners/thumbnail";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Danh mục rèm" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function ProductCategoriesPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = first(sp.q)?.trim() ?? "";
  const active = first(sp.active);
  const page = Math.max(1, Number(first(sp.page)) || 1);

  const where = and(
    q ? or(like(productCategories.name, `%${q}%`), like(productCategories.slug, `%${q.toLowerCase()}%`)) : undefined,
    active === "true" ? eq(productCategories.isActive, true) : active === "false" ? eq(productCategories.isActive, false) : undefined
  );

  // Số loại rèm & số sản phẩm của từng danh mục = leftJoin + countDistinct (2 join nên phải đếm distinct)
  const [items, [{ total }]] = await Promise.all([
    db
      .select({
        id: productCategories.id,
        name: productCategories.name,
        slug: productCategories.slug,
        image: productCategories.image,
        priceNote: productCategories.priceNote,
        isFeatured: productCategories.isFeatured,
        isActive: productCategories.isActive,
        order: productCategories.order,
        lineCount: countDistinct(productLines.id),
        productCount: countDistinct(products.id),
      })
      .from(productCategories)
      .leftJoin(productLines, eq(productLines.categoryId, productCategories.id))
      .leftJoin(products, eq(products.categoryId, productCategories.id))
      .where(where)
      .groupBy(productCategories.id)
      .orderBy(asc(productCategories.order), asc(productCategories.name))
      .limit(ADMIN_PAGE_SIZE)
      .offset((page - 1) * ADMIN_PAGE_SIZE),
    db.select({ total: count() }).from(productCategories).where(where),
  ]);
  const totalPages = Math.ceil(total / ADMIN_PAGE_SIZE);
  const hasFilter = Boolean(q || active);

  return (
    <>
      <PageHeader
        title="Danh mục rèm"
        description={`${total} danh mục. Danh mục đang hiển thị là các tab của bảng giá trang chủ; danh mục nổi bật hiện ở khối danh mục trang chủ.`}
        actions={
          <Button asChild>
            <Link href="/admin/danh-muc/moi"><Plus /> Thêm danh mục</Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <SearchInput placeholder="Tìm theo tên danh mục..." className="w-full sm:w-72" />
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
          title={hasFilter ? "Không tìm thấy danh mục phù hợp" : "Chưa có danh mục rèm"}
          description={hasFilter ? "Thử đổi từ khóa hoặc bộ lọc." : "Thêm danh mục đầu tiên (Rèm vải, Rèm cuốn, Rèm cầu vồng, Rèm sáo gỗ...)."}
          action={!hasFilter && <Button asChild><Link href="/admin/danh-muc/moi"><Plus /> Thêm danh mục</Link></Button>}
        />
      ) : (
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Ảnh</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead className="hidden w-24 text-center md:table-cell">Loại rèm</TableHead>
                <TableHead className="hidden w-28 text-center md:table-cell">Sản phẩm</TableHead>
                <TableHead className="hidden w-20 text-center sm:table-cell">Thứ tự</TableHead>
                <TableHead className="w-24 text-center">Nổi bật</TableHead>
                <TableHead className="w-24 text-center">Hiển thị</TableHead>
                <TableHead className="w-28 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((category) => (
                <TableRow key={category.id}>
                  <TableCell><Thumbnail src={category.image} className="w-20" /></TableCell>
                  <TableCell className="max-w-72 whitespace-normal">
                    <Link href={`/admin/danh-muc/${category.id}`} className="font-medium hover:underline">{category.name}</Link>
                    <p className="text-xs text-muted-foreground">/danh-muc/{category.slug}{category.priceNote ? ` · ${category.priceNote}` : ""}</p>
                  </TableCell>
                  <TableCell className="hidden text-center md:table-cell">
                    {category.lineCount > 0 ? (
                      <Link href={`/admin/loai-rem?category=${category.id}`} className="font-medium tabular-nums hover:underline" title="Xem loại rèm thuộc danh mục">
                        {category.lineCount}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-center md:table-cell">
                    {category.productCount > 0 ? (
                      <Link href={`/admin/san-pham?category=${category.id}`}>
                        <Badge variant="secondary">{category.productCount} sản phẩm</Badge>
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-center sm:table-cell">{category.order}</TableCell>
                  <TableCell className="text-center">
                    <ToggleSwitch checked={category.isFeatured} action={toggleProductCategoryFeatured.bind(null, category.id)} label="Danh mục nổi bật" />
                  </TableCell>
                  <TableCell className="text-center">
                    <ToggleSwitch checked={category.isActive} action={toggleProductCategoryActive.bind(null, category.id)} label="Hiển thị danh mục" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-0.5">
                      <Button variant="ghost" size="icon" asChild aria-label="Sửa">
                        <Link href={`/admin/danh-muc/${category.id}`} title="Sửa"><Pencil /></Link>
                      </Button>
                      {category.isActive && (
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/danh-muc/${category.slug}`} target="_blank" aria-label="Xem trên website" title="Xem trên website"><ExternalLink /></Link>
                        </Button>
                      )}
                      <ConfirmDeleteButton
                        action={deleteProductCategory.bind(null, category.id)}
                        title={`Xóa danh mục "${category.name}"?`}
                        description={
                          category.productCount > 0
                            ? `Danh mục đang có ${category.productCount} sản phẩm. Hãy xóa hoặc chuyển sản phẩm sang danh mục khác trước.`
                            : `${category.lineCount > 0 ? `${category.lineCount} loại rèm thuộc danh mục sẽ bị xóa theo. ` : ""}Các yêu cầu báo giá liên quan sẽ không còn gắn với danh mục này. Hành động không thể hoàn tác.`
                        }
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
