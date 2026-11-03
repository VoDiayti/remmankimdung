import Link from "next/link";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { telHref, zaloHref } from "@/lib/format";
import { getSettings } from "@/lib/queries/settings";
import { getProductCategoryLinks } from "@/lib/queries/product-categories";
import { getActiveServices } from "@/lib/queries/services";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/public/brand-logo";
import { SocialLinks } from "@/components/public/social-icons";

const SUPPORT_LINKS = [
  { href: "/gioi-thieu", label: "Giới thiệu" },
  { href: "/cau-hoi-thuong-gap", label: "Câu hỏi thường gặp" },
  { href: "/tin-tuc", label: "Tin tức" },
  { href: "/lien-he", label: "Liên hệ" },
  { href: "/bao-gia", label: "Nhận báo giá" },
  { href: "/chinh-sach-bao-mat", label: "Chính sách bảo mật" },
];

/** Footer trang công khai: thông tin cửa hàng, danh mục rèm, dịch vụ, hỗ trợ */
export async function SiteFooter() {
  const [s, categories, services] = await Promise.all([getSettings(), getProductCategoryLinks(), getActiveServices()]);
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-dark text-white/80">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
        {/* Thông tin cửa hàng */}
        <div className="md:col-span-2 lg:col-span-4">
          <div className="inline-block rounded-xl bg-white px-3 py-2">
            <BrandLogo logo={s.logo} companyName={s.companyName} shortName={s.shortName} showName={false} />
          </div>
          <p className="mt-4 text-lg font-bold text-white">{s.companyName}</p>
          {s.slogan && <p className="mt-1 text-sm italic text-amber-300">{s.slogan}</p>}
          <ul className="mt-5 space-y-3 text-sm">
            {s.address && (
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-amber-300" />
                <span>{s.address}</span>
              </li>
            )}
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-amber-300" />
              <a href={telHref(s.hotline)} className="font-semibold text-white hover:text-amber-300">
                Hotline: {s.hotline}
              </a>
            </li>
            {s.email && (
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 size-4 shrink-0 text-amber-300" />
                <a href={`mailto:${s.email}`} className="hover:text-white">
                  {s.email}
                </a>
              </li>
            )}
            {s.workingHours && (
              <li className="flex gap-2.5">
                <Clock className="mt-0.5 size-4 shrink-0 text-amber-300" />
                <span>{s.workingHours}</span>
              </li>
            )}
          </ul>
          <SocialLinks facebook={s.facebook} youtube={s.youtube} tiktok={s.tiktok} zalo={s.zalo ? zaloHref(s.zalo) : null} messenger={s.messenger} className="mt-5" />
        </div>

        {/* Danh mục rèm */}
        <div className="lg:col-span-2">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Danh mục rèm</h3>
          <ul className="space-y-2.5 text-sm">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/danh-muc/${c.slug}`} className="inline-block py-0.5 transition-colors hover:text-amber-300">
                  {c.name}
                </Link>
              </li>
            ))}
            {categories.length === 0 && <li className="text-white/60">Đang cập nhật</li>}
            <li>
              <Link href="/san-pham" className="inline-block py-0.5 font-semibold text-white transition-colors hover:text-amber-300">
                Tất cả sản phẩm →
              </Link>
            </li>
          </ul>
        </div>

        {/* Dịch vụ */}
        <div className="lg:col-span-2">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Dịch vụ</h3>
          <ul className="space-y-2.5 text-sm">
            {services.map((sv) => (
              <li key={sv.slug}>
                <Link href={`/dich-vu/${sv.slug}`} className="inline-block py-0.5 transition-colors hover:text-amber-300">
                  {sv.title}
                </Link>
              </li>
            ))}
            {services.length === 0 && <li className="text-white/60">Đang cập nhật</li>}
          </ul>
        </div>

        {/* Hỗ trợ */}
        <div className="lg:col-span-2">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Hỗ trợ</h3>
          <ul className="space-y-2.5 text-sm">
            {SUPPORT_LINKS.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="inline-block py-0.5 transition-colors hover:text-amber-300">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Kết nối */}
        <div className="md:col-span-2 lg:col-span-2">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Nhận báo giá</h3>
          <p className="text-sm leading-relaxed">Đo đạc, tư vấn tận nơi miễn phí. Báo giá theo m² rõ ràng, giá tận xưởng.</p>
          <Button asChild size="lg" className="mt-4 h-12 w-full bg-cta text-base font-semibold text-cta-foreground hover:bg-cta-hover">
            <Link href="/bao-gia">
              <Send className="size-4" /> Nhận báo giá
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="mt-2 h-12 w-full border-white/30 bg-transparent text-base text-white hover:bg-white hover:text-brand-dark">
            <a href={telHref(s.hotline)}>
              <Phone className="size-4" /> {s.hotline}
            </a>
          </Button>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/60 max-sm:items-start max-sm:pr-20 sm:flex-row">
          <p>
            © {year} {s.companyName}. Bảo lưu mọi quyền.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {s.taxCode && <p>Mã số thuế: {s.taxCode}</p>}
            <Link href="/chinh-sach-bao-mat" className="transition-colors hover:text-white">
              Chính sách bảo mật
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
