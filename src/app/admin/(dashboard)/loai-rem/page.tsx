import type { Metadata } from "next";
import Link from "next/link";
import { asc, count, eq, getTableColumns } from "drizzle-orm";
import { db, productCategories, productLines, products } from "@/db";
import { deleteProductLine, toggleProductLineActive } from "@/actions/product-lines";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { UrlParamSelect } from "@/components/admin/url-filters";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { ToggleSwitch } from "@/components/admin/banners/toggle-switch";
import { ProductLineDialog } from "@/components/admin/product-lines/product-line-dialog";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Loại rèm" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function ProductLinesPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const category = first(sp.category)?.trim() || undefined;

  // Số sản phẩm đang gắn vào mỗi loại rèm: leftJoin + count + groupBy
  const [rows, categoryOptions] = await Promise.all([
    db
      .select({ ...getTableColumns(productLines), categoryName: productCategories.name, categoryActive: productCategories.isActive, productCount: count(products.id) })
      .from(productLines)
      .innerJoin(productCategories, eq(productCategories.id, productLines.categoryId))
      .leftJoin(products, eq(products.lineId, productLines.id))
      .where(category ? eq(productLines.categoryId, category) : undefined)
      .groupBy(productLines.id)
      .orderBy(asc(productCategories.order), asc(productCategories.name), asc(productLines.order), asc(productLines.name)),
    db.query.productCategories.findMany({
      orderBy: [asc(productCategories.order), asc(productCategories.name)],
      columns: { id: true, name: true, isActive: true },
    }),
  ]);
  const selectedCategory = category ? categoryOptions.find((c) => c.id === category) : undefined;

  const addButton = <ProductLineDialog categories={categoryOptions} defaultCategoryId={category} />;

  return (
    <>
      <PageHeader
        title="Loại rèm"
        description={`${rows.length} loại rèm${selectedCategory ? ` trong danh mục “${selectedCategory.name}”` : ""} – mỗi loại là một nhóm sản phẩm trong danh mục (vd: Rèm vải hệ 1 lớp, hệ 2 lớp, chống nắng 100%).`}
        actions={addButton}
      />
      <p className="-mt-3 mb-4 text-sm text-muted-foreground">
        Loại rèm hiện ở trang chi tiết <Link href="/admin/danh-muc" className="font-medium underline underline-offset-4">danh mục</Link> và bộ lọc “Loại rèm” của trang sản phẩm.
        Gắn sản phẩm vào loại rèm khi tạo/sửa <Link href="/admin/san-pham" className="font-medium underline underline-offset-4">sản phẩm</Link>.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        <UrlParamSelect
          param="category"
          allLabel="Tất cả danh mục"
          placeholder="Danh mục"
          options={categoryOptions.map((c) => ({ value: c.id, label: c.isActive ? c.name : `${c.name} (ẩn)` }))}
          className="w-full sm:w-60"
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title={category ? "Danh mục này chưa có loại rèm" : "Chưa có loại rèm nào"}
          description="Tạo loại rèm để nhóm sản phẩm trong danh mục, ví dụ: Rèm vải hệ 1 lớp, Rèm vải hệ 2 lớp, Rèm cuốn trơn, Rèm cuốn lưới."
          action={addButton}
        />
      ) : (
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên loại rèm</TableHead>
                <TableHead className="hidden lg:table-cell">Danh mục</TableHead>
                <TableHead className="hidden md:table-cell">Đường dẫn (slug)</TableHead>
                <TableHead className="text-center">Số sản phẩm</TableHead>
                <TableHead className="hidden text-center sm:table-cell">Thứ tự</TableHead>
                <TableHead className="w-24 text-center">Hiển thị</TableHead>
                <TableHead className="w-24 text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((line) => {
                const data = { id: line.id, name: line.name, slug: line.slug, categoryId: line.categoryId, description: line.description, order: line.order, isActive: line.isActive };
                return (
                  <TableRow key={line.id}>
                    <TableCell className="max-w-xs whitespace-normal md:max-w-md">
                      <p className="font-medium">{line.name}</p>
                      {line.description && <p className="line-clamp-1 text-xs text-muted-foreground">{line.description}</p>}
                      <p className="text-xs text-muted-foreground lg:hidden">{line.categoryName}</p>
                    </TableCell>
                    <TableCell className="hidden whitespace-normal lg:table-cell">
                      <Link href={`/admin/danh-muc/${line.categoryId}`} className="hover:underline">{line.categoryName}</Link>
                      {!line.categoryActive && <span className="ml-1 text-xs text-muted-foreground">(ẩn)</span>}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{line.slug}</TableCell>
                    <TableCell className="text-center">
                      {line.productCount > 0 ? (
                        <Link href={`/admin/san-pham?line=${line.id}`} className="font-medium tabular-nums hover:underline" title="Xem các sản phẩm thuộc loại rèm">
                          {line.productCount}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden text-center sm:table-cell">{line.order}</TableCell>
                    <TableCell className="text-center">
                      <ToggleSwitch checked={line.isActive} action={toggleProductLineActive.bind(null, line.id)} label="Hiển thị loại rèm" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-0.5">
                        <ProductLineDialog line={data} categories={categoryOptions} />
                        <ConfirmDeleteButton
                          action={deleteProductLine.bind(null, line.id)}
                          title="Xóa loại rèm?"
                          description={
                            line.productCount > 0
                              ? `Loại rèm "${line.name}" sẽ bị xóa. ${line.productCount} sản phẩm đang gắn vào loại này KHÔNG bị xóa, chỉ chuyển về "Chưa phân loại".`
                              : `Loại rèm "${line.name}" sẽ bị xóa. Hành động này không thể hoàn tác.`
                          }
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
    </>
  );
}
