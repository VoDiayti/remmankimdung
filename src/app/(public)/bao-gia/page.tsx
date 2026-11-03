import type { Metadata } from "next";
import Image from "next/image";
import { Clock, Phone, Ruler, ShieldCheck, Truck, Wallet } from "lucide-react";
import { getSettings } from "@/lib/queries/settings";
import { getProductCategoryOptions } from "@/lib/queries/product-categories";
import { buildMetadata } from "@/lib/seo";
import { telHref, zaloHref } from "@/lib/format";
import { PageHero } from "@/components/public/page-hero";
import { LeadForm } from "@/components/public/lead-form";
import { ProcessStepsCompact } from "@/components/public/process-steps";
import { ZaloIcon } from "@/components/public/social-icons";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return buildMetadata(s, {
    title: "Nhận báo giá rèm cửa",
    description: "Gửi yêu cầu báo giá rèm cửa: đo đạc – tư vấn tận nơi miễn phí, báo giá theo m² rõ ràng, giá tận xưởng, lắp đặt trong 3 – 5 ngày, bảo hành đến 24 tháng.",
    path: "/bao-gia",
  });
}

const REASONS = [
  { Icon: Ruler, title: "Đo đạc tận nơi miễn phí", text: "Kỹ thuật viên mang mẫu vải đến nhà, đo kích thước cửa chính xác, tư vấn kiểu rèm hợp nội thất." },
  { Icon: Wallet, title: "Giá tận xưởng, không phát sinh", text: "Báo giá chi tiết theo m² hoặc theo bộ, đã gồm phụ kiện cơ bản; chốt giá trước khi may." },
  { Icon: Truck, title: "Lắp đặt trong 3 – 5 ngày", text: "May tại xưởng theo kích thước thực tế, lắp đặt gọn gàng, đúng hẹn, dọn dẹp sạch sẽ." },
  { Icon: ShieldCheck, title: "Bảo hành đến 24 tháng", text: "Bảo hành phụ kiện, thanh ray; bảo trì – chỉnh sửa trọn đời sản phẩm." },
];

export default async function QuotePage() {
  const [s, categories] = await Promise.all([getSettings(), getProductCategoryOptions()]);
  const storeName = s.shortName || s.companyName;

  return (
    <>
      <PageHero
        title="Nhận báo giá rèm cửa"
        description="Để lại thông tin và kích thước cửa (nếu có), nhân viên sẽ gọi lại trong giờ làm việc để báo giá sơ bộ và hẹn lịch đo đạc tận nơi miễn phí."
        crumbs={[{ label: "Nhận báo giá" }]}
        image="/images/about-lap-dat.jpg"
      />

      <section className="bg-muted py-14 md:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-5">
          {/* Form */}
          <div className="order-1 rounded-2xl border bg-card p-6 shadow-lg md:p-8 lg:col-span-3 lg:self-start">
            <LeadForm
              type="QUOTE"
              categories={categories}
              variant="full"
              storeName={storeName}
              title="Thông tin yêu cầu báo giá"
              description="Các trường có dấu * là bắt buộc. Càng chi tiết (loại rèm, kích thước, số cửa), báo giá càng chính xác."
              submitLabel="Gửi yêu cầu báo giá"
            />
          </div>

          {/* Sidebar */}
          <div className="order-2 space-y-6 lg:col-span-2">
            <div className="relative overflow-hidden rounded-2xl bg-brand-dark p-6 text-white">
              <Image src="/images/cta-bg.jpg" alt="" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover opacity-25" />
              <div className="relative">
                <p className="text-sm text-white/80">Cần báo giá ngay?</p>
                <a href={telHref(s.hotline)} className="mt-1 inline-flex items-center gap-2 text-2xl font-extrabold text-amber-300 hover:underline">
                  <Phone className="size-6" /> {s.hotline}
                </a>
                {s.zalo && (
                  <a href={zaloHref(s.zalo)} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white">
                    <ZaloIcon className="size-5" /> Nhắn Zalo: {s.zalo}
                  </a>
                )}
                {s.workingHours && (
                  <p className="mt-3 inline-flex items-center gap-2 text-sm text-white/85">
                    <Clock className="size-4" /> {s.workingHours}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">Vì sao chọn chúng tôi</p>
              <h2 className="mt-1 text-xl font-bold text-brand-dark md:text-2xl">{storeName} cam kết</h2>
              <ul className="mt-5 space-y-4">
                {REASONS.map((r) => (
                  <li key={r.title} className="flex gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-primary">
                      <r.Icon className="size-5" />
                    </span>
                    <div>
                      <p className="font-semibold">{r.title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{r.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
              {s.warrantyText && (
                <p className="mt-5 flex items-start gap-2 rounded-xl bg-brand-light p-3 text-sm">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{s.warrantyText}</span>
                </p>
              )}
            </div>

            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">Quy trình</p>
              <h2 className="mt-1 mb-5 text-xl font-bold text-brand-dark">6 bước từ báo giá đến lắp đặt</h2>
              <ProcessStepsCompact />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
