import Link from "next/link";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { getSettings } from "@/lib/queries/settings";
import { telHref, zaloHref } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/public/brand-logo";
import { NavLinks } from "@/components/public/nav-links";
import { MobileMenu } from "@/components/public/mobile-menu";
import { SocialLinks } from "@/components/public/social-icons";
import { StickyHeader } from "@/components/public/sticky-header";

/** Header trang công khai: thanh thông tin + logo, menu, hotline, CTA "Nhận báo giá" (sticky) */
export async function SiteHeader() {
  const s = await getSettings();
  const social = {
    facebook: s.facebook,
    youtube: s.youtube,
    tiktok: s.tiktok,
    zalo: s.zalo ? zaloHref(s.zalo) : null,
    messenger: s.messenger,
  };

  return (
    // md+: top âm bằng chiều cao thanh thông tin → thanh này cuộn khuất tự nhiên, thanh chính vẫn dính (không giật layout)
    <StickyHeader className="group/header sticky top-0 z-40 shadow-sm transition-shadow duration-300 data-scrolled:shadow-lg data-scrolled:shadow-brand-dark/10 md:-top-9">
      {/* Thanh thông tin trên cùng – chỉ hiện trên màn hình lớn */}
      <div className="hidden bg-brand-dark text-xs text-white/85 md:block">
        <div className="container-page flex h-9 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-5">
            {s.address && (
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <MapPin className="size-3.5 shrink-0 text-amber-300" />
                <span className="truncate">{s.address}</span>
              </span>
            )}
            {s.workingHours && (
              <span className="hidden items-center gap-1.5 lg:inline-flex">
                <Clock className="size-3.5 shrink-0 text-amber-300" />
                {s.workingHours}
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-4">
            {s.email && (
              <a href={`mailto:${s.email}`} className="inline-flex items-center gap-1.5 hover:text-white">
                <Mail className="size-3.5 text-amber-300" />
                {s.email}
              </a>
            )}
            <SocialLinks {...social} className="gap-1" itemClassName="size-7 bg-transparent hover:bg-white/15 hover:text-white [&_svg]:size-4" />
          </div>
        </div>
      </div>

      {/* Thanh chính */}
      <div className="relative border-b bg-background/95 backdrop-blur transition-colors duration-300 supports-[backdrop-filter]:bg-background/90 group-data-scrolled/header:border-transparent supports-[backdrop-filter]:group-data-scrolled/header:bg-background/80">
        {/* Thanh tiến độ đọc trang */}
        <div aria-hidden="true" className="scroll-progress absolute inset-x-0 -bottom-px h-0.5 origin-left bg-gradient-to-r from-cta via-amber-300 to-primary" />
        <div className="container-page flex h-16 items-center justify-between gap-3 md:h-[4.5rem]">
          {/* Logo ngang đã có tên thương hiệu → không hiện thêm tên công ty bên cạnh (tránh tràn header ở 768–1023px) */}
          <BrandLogo logo={s.logo} companyName={s.companyName} shortName={s.shortName} showName={false} />

          {/* Menu ngang hiện từ 1024px (1024–1279px thu gọn khoảng cách); dưới đó dùng menu di động để không bị tràn */}
          <nav aria-label="Menu chính" className="hidden lg:block">
            <NavLinks className="gap-0 xl:gap-1" />
          </nav>

          <div className="flex items-center gap-2">
            {/* Hotline (1024–1179px không đủ chỗ cạnh menu ngang → dùng nút gọi nhanh bên dưới) */}
            <a
              href={telHref(s.hotline)}
              className="hidden shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-primary/20 bg-brand-light py-1.5 pl-1.5 pr-4 text-primary transition-colors hover:bg-primary hover:text-primary-foreground md:flex lg:hidden min-[73.75rem]:flex"
            >
              <span className="relative flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <span aria-hidden="true" className="absolute inset-0 animate-soft-ping rounded-full bg-primary/50 motion-reduce:hidden" />
                <Phone className="relative size-4 animate-ring motion-reduce:animate-none" />
              </span>
              <span className="leading-tight">
                <span className="hidden text-[10px] font-medium uppercase tracking-wide opacity-80 2xl:block">Hotline tư vấn</span>
                <span className="block text-sm font-bold">{s.hotline}</span>
              </span>
            </a>
            {/* Gọi nhanh: di động và 1024–1179px */}
            <Button asChild variant="outline" size="icon-lg" className="shrink-0 border-primary/30 text-primary md:hidden lg:inline-flex min-[73.75rem]:hidden" aria-label={`Gọi ${s.hotline}`}>
              <a href={telHref(s.hotline)}>
                <Phone className="size-5" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              className="group relative hidden h-11 shrink-0 overflow-hidden whitespace-nowrap bg-cta px-5 font-semibold text-cta-foreground shadow-md shadow-cta/30 hover:-translate-y-0.5 hover:bg-cta-hover hover:shadow-lg hover:shadow-cta/40 sm:inline-flex"
            >
              <Link href="/bao-gia">
                {/* Vệt sáng lướt qua định kỳ */}
                <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-shine bg-gradient-to-r from-transparent via-white/60 to-transparent motion-reduce:hidden" />
                <Send className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /> Nhận báo giá
              </Link>
            </Button>
            <MobileMenu logo={s.logo} companyName={s.companyName} shortName={s.shortName} hotline={s.hotline} social={social} />
          </div>
        </div>
      </div>
    </StickyHeader>
  );
}
