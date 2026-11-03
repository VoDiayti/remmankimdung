import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Building, Clock, Headset, Ruler, Scissors, ShieldCheck, Sparkles, Truck, Wallet, Wrench, type LucideIcon } from "lucide-react";
import type { Service } from "@/db/types";
import { cn } from "@/lib/utils";

type ServiceCardData = Pick<Service, "title" | "slug" | "summary" | "image" | "icon" | "price" | "duration">;

/** Icon lucide theo tên lưu trong Service.icon; không khớp → icon mặc định */
const SERVICE_ICONS: Record<string, LucideIcon> = {
  Ruler,
  Wrench,
  ShieldCheck,
  Sparkles,
  Building,
  Truck,
  Headset,
  Scissors,
};

export function serviceIcon(name: string | null | undefined): LucideIcon {
  return (name && SERVICE_ICONS[name]) || BadgeCheck;
}

/** Render icon dịch vụ theo tên (tách thành component để không tạo component trong lúc render) */
export function ServiceIcon({ name, className }: { name: string | null | undefined; className?: string }) {
  const Icon = SERVICE_ICONS[name ?? ""] ?? BadgeCheck;
  return <Icon className={className} />;
}

export function ServiceCard({ service, className }: { service: ServiceCardData; className?: string }) {
  const href = `/dich-vu/${service.slug}`;
  return (
    <article className={cn("group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg", className)}>
      <Link href={href} className="relative block aspect-[16/10] overflow-hidden bg-muted" aria-label={service.title}>
        {service.image ? (
          <Image
            src={service.image}
            alt={service.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-brand-dark" />
        )}
        <span className="absolute left-4 top-4 flex size-11 items-center justify-center rounded-xl bg-white/95 text-primary shadow-sm">
          <ServiceIcon name={service.icon} className="size-5" />
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-base font-bold leading-snug md:text-lg">
          <Link href={href} className="hover:text-primary">
            {service.title}
          </Link>
        </h3>
        {service.summary && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{service.summary}</p>}
        <ul className="mt-4 space-y-1.5 text-sm">
          {service.price && (
            <li className="flex gap-2">
              <Wallet className="mt-0.5 size-4 shrink-0 text-primary" />
              <span className="font-semibold text-primary">{service.price}</span>
            </li>
          )}
          {service.duration && (
            <li className="flex gap-2">
              <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{service.duration}</span>
            </li>
          )}
        </ul>
        <Link href={href} className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-primary group-hover:gap-2">
          Xem chi tiết dịch vụ <ArrowRight className="size-4 transition-transform" />
        </Link>
      </div>
    </article>
  );
}
