import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { getSettings } from "@/lib/queries/settings";
import { buildMetadata } from "@/lib/seo";
import { telHref, zaloHref } from "@/lib/format";
import { revealDelay } from "@/lib/reveal";
import { PageHero } from "@/components/public/page-hero";
import { LeadForm } from "@/components/public/lead-form";
import { SocialLinks, ZaloIcon } from "@/components/public/social-icons";
import { RevealSection } from "@/components/public/reveal";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return buildMetadata(s, {
    title: "Liên hệ",
    description: `Liên hệ ${s.companyName}: hotline ${s.hotline}${s.email ? `, email ${s.email}` : ""}${s.address ? `, showroom ${s.address}` : ""}.`,
    path: "/lien-he",
  });
}

export default async function ContactPage() {
  const s = await getSettings();
  const storeName = s.shortName || s.companyName;
  const items = [
    s.address && { Icon: MapPin, label: "Showroom – xưởng may", value: s.address, href: undefined },
    { Icon: Phone, label: "Hotline", value: s.hotline, href: telHref(s.hotline) },
    s.email && { Icon: Mail, label: "Email", value: s.email, href: `mailto:${s.email}` },
    s.workingHours && { Icon: Clock, label: "Giờ làm việc", value: s.workingHours, href: undefined },
  ].filter((x): x is { Icon: typeof MapPin; label: string; value: string; href: string | undefined } => Boolean(x));

  return (
    <>
      <PageHero
        title="Liên hệ với chúng tôi"
        description="Đội ngũ tư vấn luôn sẵn sàng giải đáp về mẫu rèm, giá, lịch đo đạc và lắp đặt. Hãy gọi, nhắn Zalo hoặc ghé showroom xem mẫu trực tiếp."
        crumbs={[{ label: "Liên hệ" }]}
      />

      {/* Thông tin bên trái và form bên phải hiện lên lúc tải trang; bản đồ hiện khi cuộn tới */}
      <section className="relative overflow-hidden bg-background py-14 md:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-20 size-[28rem] rounded-full bg-brand-light blur-3xl" />
        <div className="container-page relative grid gap-10 lg:grid-cols-5">
          {/* Thông tin liên hệ */}
          <div className="space-y-6 lg:col-span-2">
            <div className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-lg shadow-brand-dark/5 animate-fade-up [animation-delay:250ms] motion-reduce:animate-none">
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cta via-amber-300 to-primary" />
              <h2 className="text-xl font-bold text-brand-dark">{s.companyName}</h2>
              <ul className="mt-5 space-y-2">
                {items.map((it) => (
                  <li key={it.label} className="group -mx-3 flex gap-3 rounded-xl px-3 py-2 transition-colors duration-300 hover:bg-brand-light/60">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-light text-primary transition-all duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/30">
                      <it.Icon className="size-5" />
                    </span>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{it.label}</p>
                      {it.href ? (
                        <a href={it.href} className="mt-0.5 block font-semibold text-foreground transition-colors hover:text-primary">
                          {it.value}
                        </a>
                      ) : (
                        <p className="mt-0.5 font-medium">{it.value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 border-t pt-5">
                <p className="mb-3 text-sm font-semibold">Kết nối qua mạng xã hội</p>
                <SocialLinks facebook={s.facebook} youtube={s.youtube} tiktok={s.tiktok} zalo={s.zalo ? zaloHref(s.zalo) : null} messenger={s.messenger} itemClassName="bg-brand-light text-primary" />
              </div>
            </div>

            {s.zalo && (
              <a
                href={zaloHref(s.zalo)}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-[#0068ff] to-[#2b8bff] p-5 text-white shadow-lg shadow-[#0068ff]/25 transition-all duration-300 animate-fade-up [animation-delay:400ms] hover:-translate-y-1 hover:shadow-xl hover:shadow-[#0068ff]/35 motion-reduce:animate-none"
              >
                <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-shine bg-gradient-to-r from-transparent via-white/30 to-transparent motion-reduce:hidden" />
                <span className="relative flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-[#0068ff] transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110">
                  <ZaloIcon className="size-8" />
                </span>
                <span>
                  <span className="block text-xs text-white/80">Nhắn tin Zalo – gửi ảnh cửa để báo giá nhanh</span>
                  <span className="block text-lg font-bold">{s.zalo}</span>
                </span>
              </a>
            )}
          </div>

          {/* Form liên hệ: viền sáng phập phồng phía sau */}
          <div className="relative lg:col-span-3 animate-fade-up [animation-delay:350ms] motion-reduce:animate-none">
            <div aria-hidden="true" className="absolute -inset-1 animate-pulse rounded-[1.4rem] bg-gradient-to-br from-cta/60 via-amber-200/40 to-primary/60 opacity-50 blur-lg [animation-duration:4s] motion-reduce:animate-none" />
            <div className="relative h-full rounded-2xl border bg-card p-6 shadow-xl shadow-brand-dark/5 md:p-8">
              <LeadForm type="CONTACT" storeName={storeName} title="Gửi lời nhắn cho chúng tôi" description="Điền thông tin bên dưới, chúng tôi sẽ phản hồi qua điện thoại hoặc email trong giờ làm việc." />
            </div>
          </div>
        </div>
      </section>

      {s.mapEmbedUrl && (
        <RevealSection className="bg-muted py-14 md:py-20">
          <div className="container-page">
            <h2 data-reveal className="mb-6 flex items-center gap-3 text-2xl font-bold text-brand-dark md:text-3xl">
              <span aria-hidden="true" className="h-1 w-10 rounded-full bg-gradient-to-r from-cta to-amber-300" />
              Bản đồ đến showroom
            </h2>
            <div data-reveal style={revealDelay(150)} className="overflow-hidden rounded-2xl border bg-card shadow-lg">
              <iframe src={s.mapEmbedUrl} title={`Bản đồ ${s.companyName}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen className="h-[320px] w-full border-0 md:h-[440px]" />
            </div>
          </div>
        </RevealSection>
      )}
    </>
  );
}
