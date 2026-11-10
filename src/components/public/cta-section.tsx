import Link from "next/link";
import { Phone, Send } from "lucide-react";
import { telHref } from "@/lib/format";
import { revealDelay } from "@/lib/reveal";
import { Button } from "@/components/ui/button";
import { RevealSection } from "@/components/public/reveal";

type CtaSectionProps = {
  hotline: string;
  title?: string;
  description?: string;
};

/** Dải kêu gọi hành động cuối trang: nhận báo giá + gọi hotline (hiện lên khi cuộn tới, nút có vệt sáng, chuông rung) */
export function CtaSection({
  hotline,
  title = "Sẵn sàng làm mới không gian sống?",
  description = "Để lại thông tin để được đo đạc, tư vấn tận nơi miễn phí và nhận báo giá rèm theo m² rõ ràng, giá tận xưởng.",
}: CtaSectionProps) {
  return (
    <RevealSection className="relative overflow-hidden bg-primary py-14 text-primary-foreground md:py-20">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-brand-dark" aria-hidden="true" />
      <div className="absolute -right-10 -top-10 size-64 animate-glow rounded-full bg-white/10 blur-2xl motion-reduce:animate-none" aria-hidden="true" />
      <div className="absolute -bottom-16 left-10 size-72 animate-glow rounded-full bg-cta/30 blur-3xl [animation-delay:-3.5s] motion-reduce:animate-none" aria-hidden="true" />
      {/* Nếp rèm mờ */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 w-2/3 opacity-[0.06] [background-image:repeating-linear-gradient(90deg,#fff_0,transparent_14px,#000_28px,#fff_42px)] [mask-image:linear-gradient(to_left,black,transparent)]"
      />
      <div className="container-page relative flex flex-col items-center gap-7 text-center lg:flex-row lg:justify-between lg:text-left">
        <div className="max-w-2xl">
          <h2 data-reveal className="text-balance text-2xl font-bold md:text-3xl">
            {title}
          </h2>
          <p data-reveal style={revealDelay(100)} className="mt-2 text-primary-foreground/85 md:text-lg">
            {description}
          </p>
        </div>
        <div data-reveal style={revealDelay(220)} className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button
            asChild
            size="lg"
            className="group relative h-12 overflow-hidden bg-cta px-6 text-base font-semibold text-cta-foreground shadow-lg shadow-black/15 hover:-translate-y-0.5 hover:bg-cta-hover hover:shadow-xl"
          >
            <Link href="/bao-gia">
              <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-shine bg-gradient-to-r from-transparent via-white/60 to-transparent motion-reduce:hidden" />
              <Send className="size-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /> Nhận báo giá
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 border-white/70 bg-transparent px-6 text-base font-semibold text-white hover:-translate-y-0.5 hover:bg-white hover:text-primary"
          >
            <a href={telHref(hotline)}>
              <Phone className="size-5 animate-ring motion-reduce:animate-none" /> {hotline}
            </a>
          </Button>
        </div>
      </div>
    </RevealSection>
  );
}
