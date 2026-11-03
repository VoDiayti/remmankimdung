import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { ServiceForm } from "@/components/admin/services/service-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Thêm dịch vụ" };

export default function NewServicePage() {
  return (
    <>
      <PageHeader
        title="Thêm dịch vụ"
        description="Dịch vụ tư vấn – đo đạc, lắp đặt, bảo hành – bảo trì, vệ sinh rèm, rèm công trình..."
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/dich-vu"><ArrowLeft /> Danh sách dịch vụ</Link>
          </Button>
        }
      />
      <ServiceForm />
    </>
  );
}
