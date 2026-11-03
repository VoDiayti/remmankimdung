import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { count, eq } from "drizzle-orm";
import { db, productCategories, productLines, products } from "@/db";
import { formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/admin/page-header";
import { ProductCategoryForm } from "@/components/admin/product-categories/product-category-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Sửa danh mục rèm" };
export const dynamic = "force-dynamic";

export default async function EditProductCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [category, [{ lineCount }], [{ productCount }]] = await Promise.all([
    db.query.productCategories.findFirst({ where: eq(productCategories.id, id) }),
    db.select({ lineCount: count() }).from(productLines).where(eq(productLines.categoryId, id)),
    db.select({ productCount: count() }).from(products).where(eq(products.categoryId, id)),
  ]);
  if (!category) notFound();

  return (
    <>
      <PageHeader
        title={category.name}
        description={`${lineCount} loại rèm · ${productCount} sản phẩm · Cập nhật ${formatDateTime(category.updatedAt)}`}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/admin/danh-muc"><ArrowLeft /> Quay lại</Link>
            </Button>
            {productCount > 0 && (
              <Button variant="outline" asChild>
                <Link href={`/admin/san-pham?category=${category.id}`}>Xem sản phẩm</Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href={`/danh-muc/${category.slug}`} target="_blank"><ExternalLink /> Xem trang</Link>
            </Button>
          </>
        }
      />
      <ProductCategoryForm initialData={category} />
    </>
  );
}
