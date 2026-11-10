import { Drill, Palette, PhoneCall, Ruler, Scissors, ShieldCheck } from "lucide-react";
import { gridRevealDelay } from "@/lib/reveal";
import { RevealSection } from "@/components/public/reveal";
import { SectionHeading } from "@/components/public/section-heading";

export const PROCESS_STEPS = [
  { title: "Liên hệ – đặt lịch", description: "Gọi hotline, nhắn Zalo hoặc gửi yêu cầu báo giá; nhân viên xác nhận lịch hẹn trong ngày.", Icon: PhoneCall },
  { title: "Đo đạc & tư vấn tận nơi", description: "Kỹ thuật viên mang mẫu vải đến tận nhà, đo kích thước cửa chính xác và tư vấn kiểu rèm phù hợp nội thất.", Icon: Ruler },
  { title: "Chọn mẫu & báo giá", description: "Chọn chất liệu, màu sắc, phụ kiện; nhận báo giá chi tiết theo m² – rõ ràng, không phát sinh.", Icon: Palette },
  { title: "May tại xưởng 3 – 5 ngày", description: "Rèm được cắt may theo đúng kích thước thực tế tại xưởng, kiểm tra kỹ nếp gấp, đường may trước khi giao.", Icon: Scissors },
  { title: "Lắp đặt & nghiệm thu", description: "Đội thi công lắp đặt gọn gàng, hướng dẫn sử dụng; bạn kiểm tra và nghiệm thu trước khi thanh toán.", Icon: Drill },
  { title: "Bảo hành – bảo trì trọn đời", description: "Bảo hành phụ kiện, thanh ray đến 24 tháng; hỗ trợ bảo trì, chỉnh sửa trọn đời sản phẩm.", Icon: ShieldCheck },
] as const;

/** Quy trình đặt rèm 6 bước – các bước hiện lần lượt khi cuộn tới, nổi lên khi rê chuột */
export function ProcessSteps({ className = "bg-background" }: { className?: string }) {
  return (
    <RevealSection className={`relative overflow-hidden py-16 md:py-24 ${className}`}>
      {/* Chấm bi trang trí hai góc */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-6 top-16 h-40 w-40 bg-[radial-gradient(var(--color-primary)_1.5px,transparent_1.5px)] [background-size:16px_16px] opacity-20" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-6 bottom-16 h-40 w-40 bg-[radial-gradient(var(--color-primary)_1.5px,transparent_1.5px)] [background-size:16px_16px] opacity-20" />
      <div className="container-page relative">
        <SectionHeading
          label="Quy trình"
          title="6 bước để có bộ rèm đẹp như ý"
          description="Từ lúc liên hệ đến khi lắp đặt xong chỉ 3 – 5 ngày. Bạn chỉ cần chọn mẫu, mọi việc còn lại chúng tôi lo."
        />
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PROCESS_STEPS.map((step, i) => (
            <li key={step.title} data-reveal style={gridRevealDelay(i, 3, 120)}>
              <div className="group relative flex h-full gap-4 overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/25 hover:shadow-xl hover:shadow-brand-dark/10">
                {/* Vạch tiến độ chạy dọc mép trái khi rê chuột */}
                <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 origin-top scale-y-0 bg-gradient-to-b from-cta to-primary transition-transform duration-500 group-hover:scale-y-100" />
                <div className="flex shrink-0 flex-col items-center">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-light text-primary ring-1 ring-primary/10 transition-all duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/30">
                    <step.Icon className="size-6" />
                  </span>
                </div>
                <div className="relative z-10">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">Bước {i + 1}</p>
                  <h3 className="mt-1 text-lg font-bold leading-snug text-brand-dark">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
                <span
                  className="absolute right-4 top-3 select-none text-5xl font-black text-brand-light transition-all duration-500 group-hover:-translate-y-0.5 group-hover:text-cta/30"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </RevealSection>
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

