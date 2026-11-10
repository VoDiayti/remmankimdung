import Image from "next/image";
import { Building } from "lucide-react";
import type { Partner } from "@/db/types";
import { revealDelay } from "@/lib/reveal";
import { RevealSection } from "@/components/public/reveal";
import { SectionHeading } from "@/components/public/section-heading";

type PartnerData = Pick<Partner, "id" | "name" | "logo" | "website">;

function PartnerItem({ p }: { p: PartnerData }) {
  const inner = p.logo ? (
    <span className="relative block h-12 w-36">
      <Image src={p.logo} alt={p.name} fill sizes="144px" className="object-contain opacity-70 grayscale transition-all duration-300 hover:scale-105 hover:opacity-100 hover:grayscale-0" />
    </span>
  ) : (
    <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border bg-card px-4 py-2.5 text-sm font-semibold text-brand-dark shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary hover:shadow-md">
      <Building className="size-4 text-primary" /> {p.name}
    </span>
  );
  if (p.website) {
    return (
      <a href={p.website} target="_blank" rel="noopener noreferrer nofollow" title={p.name} className="shrink-0">
        {inner}
      </a>
    );
  }
  return <span className="shrink-0">{inner}</span>;
}

/** Đối tác & thương hiệu vải – chạy ngang liên tục (marquee) */
export function PartnersSection({ partners }: { partners: PartnerData[] }) {
  if (partners.length === 0) return null;
  const loop = [...partners, ...partners];
  return (
    <RevealSection className="bg-background py-16 md:py-24">
      <div className="container-page">
        <SectionHeading label="Đối tác" title="Đối tác & thương hiệu vải" description="Vải, phụ kiện và thanh ray chính hãng từ các thương hiệu uy tín – đảm bảo độ bền và màu sắc đồng nhất." className="mb-8" />
      </div>
      <div data-reveal="fade" style={revealDelay(250)} className="group relative overflow-hidden py-2" aria-label="Danh sách đối tác">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />
        <div className="flex w-max animate-marquee items-center gap-5 px-2 group-hover:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:w-full">
          {loop.map((p, i) => (
            <PartnerItem key={`${p.id}-${i}`} p={p} />
          ))}
        </div>
      </div>
    </RevealSection>
  );
}
