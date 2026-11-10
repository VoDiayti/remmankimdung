import { Award, Building, Layers, Users } from "lucide-react";
import type { Setting } from "@/db/types";
import { gridRevealDelay } from "@/lib/reveal";
import { CountUp, RevealSection } from "@/components/public/reveal";

type StatsProps = Pick<Setting, "statCustomers" | "statYears" | "statProjects" | "statProducts">;

/** Con số ấn tượng – nền xanh đậm; số đếm lên khi cuộn tới, thẻ sáng viền khi rê chuột */
export function StatsSection({ statCustomers, statYears, statProjects, statProducts }: StatsProps) {
  const stats = [
    { value: statCustomers, suffix: "+", label: "Khách hàng tin chọn", Icon: Users },
    { value: statYears, suffix: "+", label: "Năm kinh nghiệm", Icon: Award },
    { value: statProjects, suffix: "+", label: "Công trình đã thi công", Icon: Building },
    { value: statProducts, suffix: "+", label: "Mẫu rèm có sẵn", Icon: Layers },
  ].filter((s): s is typeof s & { value: number } => s.value != null && s.value > 0);

  if (stats.length === 0) return null;

  return (
    <RevealSection className="relative overflow-hidden bg-brand-dark py-16 text-white md:py-24">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/60 via-brand-dark to-brand-dark" aria-hidden="true" />
      <div className="absolute -left-20 top-0 size-72 animate-glow rounded-full bg-cta/20 blur-3xl motion-reduce:animate-none" aria-hidden="true" />
      <div className="absolute -right-16 bottom-0 size-80 animate-glow rounded-full bg-primary/40 blur-3xl [animation-delay:-3.5s] motion-reduce:animate-none" aria-hidden="true" />
      {/* Lưới mảnh mờ phía sau */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.04)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        aria-hidden="true"
      />
      <div className="container-page relative">
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-12">
          <p data-reveal className="flex items-center justify-center gap-3 text-sm font-semibold uppercase tracking-wider text-amber-300">
            <span aria-hidden="true" className="h-0.5 w-8 rounded-full bg-amber-300" />
            Con số ấn tượng
            <span aria-hidden="true" className="h-0.5 w-8 rounded-full bg-amber-300" />
          </p>
          <h2 data-reveal style={gridRevealDelay(1, 4, 80)} className="mt-3 text-balance text-2xl font-bold md:text-4xl">
            Niềm tin được xây dựng qua từng bộ rèm
          </h2>
        </div>
        <ul className={`grid grid-cols-2 gap-4 md:gap-6 ${stats.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
          {stats.map((s, i) => (
            <li key={s.label} data-reveal="zoom" style={gridRevealDelay(i, 4, 120, 150)}>
              <div className="group h-full rounded-2xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-300/40 hover:bg-white/10 hover:shadow-2xl hover:shadow-black/20 md:p-7">
                <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white/10 text-amber-300 ring-1 ring-white/10 transition-all duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-amber-300 group-hover:text-brand-dark">
                  <s.Icon className="size-7" />
                </span>
                <p className="mt-4 text-3xl font-extrabold tabular-nums md:text-5xl">
                  <CountUp to={s.value} duration={2000} delay={250 + (i % 4) * 120} />
                  <span className="text-amber-300">{s.suffix}</span>
                </p>
                <p className="mt-1.5 text-sm text-white/80 md:text-base">{s.label}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </RevealSection>
  );
}
