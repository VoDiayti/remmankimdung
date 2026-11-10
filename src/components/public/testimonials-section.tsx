import Image from "next/image";
import { Quote, Star } from "lucide-react";
import type { CSSProperties } from "react";
import type { Testimonial } from "@/db/types";
import { gridRevealDelay } from "@/lib/reveal";
import { RevealSection } from "@/components/public/reveal";
import { SectionHeading } from "@/components/public/section-heading";
import { cn } from "@/lib/utils";

type TestimonialData = Pick<Testimonial, "id" | "name" | "position" | "content" | "avatar" | "rating">;

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export function TestimonialCard({ t, className }: { t: TestimonialData; className?: string }) {
  return (
    <figure
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/25 hover:shadow-xl hover:shadow-brand-dark/10",
        className
      )}
    >
      {/* Vạch màu chạy ngang mép trên khi rê chuột */}
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-cta via-amber-300 to-primary transition-transform duration-500 group-hover:scale-x-100" />
      <Quote className="size-9 origin-top-left text-cta/40 transition-all duration-500 group-hover:rotate-[-8deg] group-hover:scale-110 group-hover:text-cta/70" aria-hidden="true" />
      <div className="mt-2 flex gap-0.5" aria-label={`${t.rating} trên 5 sao`}>
        {Array.from({ length: 5 }).map((_, i) => (
          // data-pop: sao bật lên lần lượt khi thẻ hiện ra (trong RevealSection)
          <Star key={i} data-pop style={{ "--pop-i": i } as CSSProperties} className={cn("size-4", i < t.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
        ))}
      </div>
      <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-foreground/90">“{t.content}”</blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t pt-4">
        {t.avatar ? (
          <span className="relative size-12 shrink-0 overflow-hidden rounded-full bg-muted">
            <Image src={t.avatar} alt={t.name} fill sizes="48px" className="object-cover" />
          </span>
        ) : (
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{initials(t.name)}</span>
        )}
        <div className="min-w-0">
          <p className="font-semibold">{t.name}</p>
          {t.position && <p className="line-clamp-2 text-xs text-muted-foreground">{t.position}</p>}
        </div>
      </figcaption>
    </figure>
  );
}

/** Cảm nhận của khách hàng */
export function TestimonialsSection({ testimonials }: { testimonials: TestimonialData[] }) {
  if (testimonials.length === 0) return null;
  return (
    <RevealSection className="relative overflow-hidden bg-brand-light py-16 md:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-10 size-96 animate-glow rounded-full bg-white/70 blur-3xl motion-reduce:animate-none" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-0 size-80 rounded-full bg-cta/10 blur-3xl" />
      <div className="container-page relative">
        <SectionHeading
          label="Cảm nhận"
          title="Khách hàng nói gì về chúng tôi"
          description="Hàng nghìn gia đình, văn phòng và cửa hàng đã tin chọn chúng tôi để làm đẹp không gian sống và làm việc."
        />
        {/* flex-wrap + justify-center: hàng cuối thiếu thẻ vẫn được căn giữa */}
        <div className="flex flex-wrap justify-center gap-6">
          {testimonials.map((t, i) => (
            <div key={t.id} data-reveal style={gridRevealDelay(i, 3, 120)} className="w-full md:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]">
              <TestimonialCard t={t} />
            </div>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}
