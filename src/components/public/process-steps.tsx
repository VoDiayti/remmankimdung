import { Drill, Palette, PhoneCall, Ruler, Scissors, ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/public/section-heading";

export const PROCESS_STEPS = [
  { title: "Liên hệ – đặt lịch", description: "Gọi hotline, nhắn Zalo hoặc gửi yêu cầu báo giá; nhân viên xác nhận lịch hẹn trong ngày.", Icon: PhoneCall },
  { title: "Đo đạc & tư vấn tận nơi", description: "Kỹ thuật viên mang mẫu vải đến tận nhà, đo kích thước cửa chính xác và tư vấn kiểu rèm phù hợp nội thất.", Icon: Ruler },
  { title: "Chọn mẫu & báo giá", description: "Chọn chất liệu, màu sắc, phụ kiện; nhận báo giá chi tiết theo m² – rõ ràng, không phát sinh.", Icon: Palette },
  { title: "May tại xưởng 3 – 5 ngày", description: "Rèm được cắt may theo đúng kích thước thực tế tại xưởng, kiểm tra kỹ nếp gấp, đường may trước khi giao.", Icon: Scissors },
  { title: "Lắp đặt & nghiệm thu", description: "Đội thi công lắp đặt gọn gàng, hướng dẫn sử dụng; bạn kiểm tra và nghiệm thu trước khi thanh toán.", Icon: Drill },
  { title: "Bảo hành – bảo trì trọn đời", description: "Bảo hành phụ kiện, thanh ray đến 24 tháng; hỗ trợ bảo trì, chỉnh sửa trọn đời sản phẩm.", Icon: ShieldCheck },
] as const;

/** Quy trình đặt rèm 6 bước */
export function ProcessSteps({ className = "bg-background" }: { className?: string }) {
  return (
    <section className={`py-14 md:py-20 ${className}`}>
      <div className="container-page">
        <SectionHeading
          label="Quy trình"
          title="6 bước để có bộ rèm đẹp như ý"
          description="Từ lúc liên hệ đến khi lắp đặt xong chỉ 3 – 5 ngày. Bạn chỉ cần chọn mẫu, mọi việc còn lại chúng tôi lo."
        />
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PROCESS_STEPS.map((step, i) => (
            <li key={step.title} className="group relative flex gap-4 rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex shrink-0 flex-col items-center">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-light text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <step.Icon className="size-6" />
                </span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary">Bước {i + 1}</p>
                <h3 className="mt-1 text-lg font-bold leading-snug">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
              <span className="absolute right-4 top-3 text-5xl font-black text-brand-light/80 select-none" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Danh sách rút gọn 6 bước (sidebar trang báo giá) */
export function ProcessStepsCompact() {
  return (
    <ol className="space-y-3">
      {PROCESS_STEPS.map((step, i) => (
        <li key={step.title} className="flex items-start gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-light text-xs font-bold text-primary">{i + 1}</span>
          <div>
            <p className="font-semibold leading-snug">{step.title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

