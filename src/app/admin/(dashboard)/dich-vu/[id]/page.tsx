import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { eq } from "drizzle-orm";
import { db, services } from "@/db";
import { formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/admin/page-header";
import { ActiveBadge } from "@/components/admin/status-badge";
import { ServiceForm, type ServiceFormInitialData } from "@/components/admin/services/service-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Chỉnh sửa dịch vụ" };
export const dynamic = "force-dynamic";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await db.query.services.findFirst({ where: eq(services.id, id) });
  if (!service) notFound();

  const initialData: ServiceFormInitialData = {
    id: service.id,
    title: service.title,
    slug: service.slug,
    summary: service.summary,
    content: service.content,
    image: service.image,
    icon: service.icon,
    price: service.price,
    duration: service.duration,
    order: service.order,
    isActive: service.isActive,
  };

  return (
    <>
      <PageHeader
        title="Chỉnh sửa dịch vụ"
        description={`${service.title} · Cập nhật ${formatDateTime(service.updatedAt)}`}
        actions={
          <>
            <ActiveBadge active={service.isActive} />
            <Button variant="outline" asChild>
              <Link href="/admin/dich-vu"><ArrowLeft /> Danh sách dịch vụ</Link>
            </Button>
          </>
        }
      />
      <ServiceForm initialData={initialData} />
    </>
  );
}
