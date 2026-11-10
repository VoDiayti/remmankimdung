import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, Check, Phone, ShieldCheck, Users } from "lucide-react";
import type { Setting } from "@/db/types";
import { telHref } from "@/lib/format";
import { revealDelay as delay } from "@/lib/reveal";
import { Button } from "@/components/ui/button";
import { CountUp, RevealSection } from "@/components/public/reveal";

const HIGHLIGHTS = ["Xưởng may riêng, giá tận gốc", "Hơn 500 mẫu vải – chất liệu có sẵn", "Thi công đúng hẹn, dọn dẹp sạch sẽ", "Bảo trì trọn đời sản phẩm"];

type AboutSectionProps = Pick<Setting, "companyName" | "aboutShort" | "warrantyText" | "statYears" | "statCustomers" | "hotline"> & {
  storeName: string;
};

/** Trang chủ – giới thiệu ngắn: ảnh mở như kéo rèm, huy hiệu đếm số, các ý chính hiện lần lượt khi cuộn tới */
export function AboutSection({ companyName, aboutShort, warrantyText, statYears, statCustomers, hotline, storeName }: AboutSectionProps) {
  return (
    <RevealSection className="relative overflow-hidden bg-background py-16 md:py-24">
      {/* Nền trang trí */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-0 size-[28rem] rounded-full bg-brand-light blur-3xl" />

      <div className="container-page relative grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
        {/* ---------- Cột ảnh ---------- */}
        <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
          {/* Chấm bi + khung viền lệch phía sau ảnh */}
          <div
            aria-hidden="true"
            data-reveal="fade"
            className="absolute -right-3 -top-7 h-28 w-40 bg-[radial-gradient(var(--color-primary)_1.6px,transparent_1.6px)] [background-size:14px_14px] opacity-35 md:-right-8"
          />
          <div
            aria-hidden="true"
            data-reveal="fade"
            style={delay(600)}
            className="absolute inset-0 hidden translate-x-3 translate-y-3 rounded-3xl border-2 border-primary/25 sm:block md:translate-x-5 md:translate-y-5"
          />
          <div aria-hidden="true" className="absolute -bottom-10 -left-10 size-48 animate-glow rounded-full bg-cta/20 blur-3xl motion-reduce:animate-none" />

          {/* Ảnh chính: hai tấm rèm kéo sang hai bên để lộ ảnh */}
          <div data-reveal="curtain" className="relative">
            <div className="group relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl shadow-brand-dark/20">
              <div data-curtain-zoom className="absolute inset-0">
                <Image
                  src="/images/about-showroom.jpg"
                  alt={`Showroom rèm cửa ${storeName}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                />
              </div>
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-brand-dark/35 via-transparent to-transparent" />
              <span aria-hidden="true" className="curtain-panel absolute inset-y-0 left-0 w-1/2 origin-left" />
              <span aria-hidden="true" className="curtain-panel absolute inset-y-0 right-0 w-1/2 origin-right" />
            </div>
          </div>

          {/* Ảnh phụ: bay nhẹ lên xuống */}
          <div data-reveal="zoom" style={delay(900)} className="absolute -bottom-10 -right-2 hidden w-52 sm:block md:-right-6 md:w-60">
            <div className="animate-float [animation-delay:-3s] motion-reduce:animate-none">
              <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl border-4 border-background shadow-xl">
                <Image
                  src="/images/about-lap-dat.jpg"
                  alt="Kỹ thuật viên lắp đặt rèm cửa"
                  fill
                  sizes="240px"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            </div>
          </div>

          {/* Huy hiệu số năm kinh nghiệm */}
          {statYears ? (
            <div data-reveal="zoom" style={delay(700)} className="absolute -left-2 top-6 md:-left-7">
              <div className="animate-float motion-reduce:animate-none">
                <div className="flex items-center gap-3 rounded-2xl bg-cta px-4 py-3 text-cta-foreground shadow-xl shadow-cta/30 ring-4 ring-background">
                  <Award className="size-9 shrink-0" strokeWidth={1.75} />
                  <div>
                    <p className="text-3xl font-extrabold leading-none tabular-nums">
                      <CountUp to={statYears} />+
                    </p>
                    <p className="mt-0.5 text-xs font-semibold">năm kinh nghiệm</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Thẻ số khách hàng */}
          {statCustomers ? (
            <div data-reveal style={delay(1100)} className="absolute -bottom-7 left-3 md:left-8">
              <div className="animate-float [animation-delay:-1.5s] motion-reduce:animate-none">
                <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-xl backdrop-blur">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Users className="size-5" />
                  </span>
                  <div>
                    <p className="text-xl font-extrabold leading-none text-brand-dark tabular-nums">
                      <CountUp to={statCustomers} duration={2000} />+
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">khách hàng tin chọn</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* ---------- Cột nội dung ---------- */}
        <div>
          <div data-reveal className="flex items-center gap-3">
            <span aria-hidden="true" data-reveal="grow" style={delay(250)} className="h-0.5 w-10 origin-left rounded-full bg-primary" />
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Về chúng tôi</p>
          </div>
          <h2 data-reveal style={delay(100)} className="mt-3 text-balance text-2xl font-bold leading-tight text-brand-dark md:text-4xl">
            {companyName}
          </h2>
          <span
            aria-hidden="true"
            data-reveal="grow"
            style={delay(400)}
            className="mt-4 block h-1.5 w-24 origin-left rounded-full bg-gradient-to-r from-cta to-amber-300"
          />

          {aboutShort && (
            <p data-reveal style={delay(200)} className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              {aboutShort}
            </p>
          )}

          {warrantyText && (
            <div data-reveal style={delay(300)} className="mt-7">
              <div className="group relative flex items-start gap-4 overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-brand-light via-brand-light to-background p-5 transition-shadow duration-300 hover:shadow-lg hover:shadow-primary/10">
                <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <span aria-hidden="true" className="absolute inset-0 animate-soft-ping rounded-full bg-primary/40 motion-reduce:hidden" />
                  <ShieldCheck className="relative size-6" />
                </span>
                <div>
                  <p className="font-semibold text-brand-dark">Cam kết bảo hành</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{warrantyText}</p>
                </div>
                {/* Vệt sáng lướt qua khi rê chuột */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent transition-none group-hover:translate-x-[450%] group-hover:transition-transform group-hover:duration-1000 motion-reduce:hidden"
                />
              </div>
            </div>
          )}

          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {HIGHLIGHTS.map((text, i) => (
              <li key={text} data-reveal style={delay(400 + i * 100)}>
                <div className="group flex h-full items-center gap-3 rounded-xl border border-border/70 bg-card px-3.5 py-3 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-brand-light hover:shadow-md">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Check className="size-4" strokeWidth={3} />
                  </span>
                  {text}
                </div>
              </li>
            ))}
          </ul>

          <div data-reveal style={delay(500)} className="mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="group h-12 px-6 text-base shadow-lg shadow-primary/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30"
            >
              <Link href="/gioi-thieu">
                Tìm hiểu thêm <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base hover:-translate-y-0.5 hover:border-primary/40">
              <a href={telHref(hotline)}>
                <Phone className="size-5 animate-ring text-primary motion-reduce:animate-none" /> {hotline}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </RevealSection>
  );
}
