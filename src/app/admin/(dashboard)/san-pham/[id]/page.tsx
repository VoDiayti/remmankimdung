import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { asc, count, eq } from "drizzle-orm";
import { db, leads, productCategories, productLines, products } from "@/db";
import { formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/admin/page-header";
import { ProductStatusBadge } from "@/components/admin/status-badge";
import { ProductForm } from "@/components/admin/products/product-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Sửa sản phẩm" };
export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, [{ leadCount }], categoryOptions, lineOptions] = await Promise.all([
    db.query.products.findFirst({ where: eq(products.id, id) }),
    db.select({ leadCount: count() }).from(leads).where(eq(leads.productId, id)),
    db.query.productCategories.findMany({ orderBy: [asc(productCategories.order), asc(productCategories.name)], columns: { id: true, name: true, isActive: true } }),
    // Kể cả loại rèm đang ẩn (form đánh dấu "(ẩn)")
    db.query.productLines.findMany({ orderBy: [asc(productLines.order), asc(productLines.name)], columns: { id: true, name: true, categoryId: true, isActive: true } }),
  ]);
  if (!product) notFound();

  return (
    <>
      <PageHeader
        title={product.name}
        description={`${leadCount} yêu cầu báo giá · ${product.viewCount} lượt xem · Cập nhật ${formatDateTime(product.updatedAt)}`}
        actions={
          <>
            <ProductStatusBadge status={product.status} />
            <Button variant="outline" asChild>
              <Link href="/admin/san-pham"><ArrowLeft /> Quay lại</Link>
            </Button>
            {leadCount > 0 && (
              <Button variant="outline" asChild>
                <Link href={`/admin/bao-gia?product=${product.id}`}>Xem yêu cầu</Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href={`/san-pham/${product.slug}`} target="_blank"><ExternalLink /> Xem trang</Link>
            </Button>
          </>
        }
      />
      <ProductForm initialData={product} categories={categoryOptions} lines={lineOptions} />
    </>
  );
}
