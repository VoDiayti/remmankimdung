import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { asc } from "drizzle-orm";
import { db, productCategories, productLines } from "@/db";
import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/products/product-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Thêm sản phẩm" };
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  // Kể cả danh mục / loại rèm đang ẩn (form đánh dấu "(ẩn)") để vẫn gắn trước được
  const [categoryOptions, lineOptions] = await Promise.all([
    db.query.productCategories.findMany({ orderBy: [asc(productCategories.order), asc(productCategories.name)], columns: { id: true, name: true, isActive: true } }),
    db.query.productLines.findMany({ orderBy: [asc(productLines.order), asc(productLines.name)], columns: { id: true, name: true, categoryId: true, isActive: true } }),
  ]);

  return (
    <>
      <PageHeader
        title="Thêm sản phẩm"
        description="Tạo mẫu rèm mới để hiển thị trên website và bảng giá."
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/san-pham"><ArrowLeft /> Quay lại</Link>
          </Button>
        }
      />
      <ProductForm categories={categoryOptions} lines={lineOptions} />
    </>
  );
}
