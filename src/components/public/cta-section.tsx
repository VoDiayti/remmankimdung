import Link from "next/link";
import { Phone, Send } from "lucide-react";
import { telHref } from "@/lib/format";
import { Button } from "@/components/ui/button";

type CtaSectionProps = {
  hotline: string;
  title?: string;
  description?: string;
};

/** Dải kêu gọi hành động: nhận báo giá + gọi hotline */
export function CtaSection({
  hotline,
  title = "Sẵn sàng làm mới không gian sống?",
  description = "Để lại thông tin để được đo đạc, tư vấn tận nơi miễn phí và nhận báo giá rèm theo m² rõ ràng, giá tận xưởng.",
}: CtaSectionProps) {
  return (
    <section className="relative overflow-hidden bg-primary py-12 text-primary-foreground md:py-16">
      <div className="absolute -right-10 -top-10 size-64 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
      <div className="absolute -bottom-16 left-10 size-64 rounded-full bg-cta/30 blur-3xl" aria-hidden="true" />
      <div className="container-page relative flex flex-col items-center gap-6 text-center lg:flex-row lg:justify-between lg:text-left">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold md:text-3xl">{title}</h2>
          <p className="mt-2 text-primary-foreground/85 md:text-lg">{description}</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button asChild size="lg" className="h-12 bg-cta px-6 text-base font-semibold text-cta-foreground hover:bg-cta-hover">
            <Link href="/bao-gia">
              <Send className="size-5" /> Nhận báo giá
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 border-white/70 bg-transparent px-6 text-base font-semibold text-white hover:bg-white hover:text-primary">
            <a href={telHref(hotline)}>
              <Phone className="size-5" /> {hotline}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
