import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { ProductCategoryForm } from "@/components/admin/product-categories/product-category-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Thêm danh mục rèm" };

export default function NewProductCategoryPage() {
  return (
    <>
      <PageHeader
        title="Thêm danh mục rèm"
        description="Tạo danh mục sản phẩm mới (Rèm vải, Rèm cuốn, Rèm cầu vồng...)."
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/danh-muc"><ArrowLeft /> Quay lại</Link>
          </Button>
        }
      />
      <ProductCategoryForm />
    </>
  );
}
