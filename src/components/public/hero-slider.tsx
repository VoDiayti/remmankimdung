"use client";

import { useCallback, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Phone } from "lucide-react";
import type { Banner } from "@/db/types";
import { telHref } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type BannerData = Pick<Banner, "id" | "title" | "subtitle" | "image" | "ctaText" | "ctaLink" | "ctaText2" | "ctaLink2">;

type HeroSliderProps = {
  banners: BannerData[];
  hotline: string;
  /** Thời gian tự chuyển slide (ms) */
  interval?: number;
};

/** Độ trễ cho từng dòng chữ của slide đang hiện (hiện lần lượt) */
const stagger = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });

/**
 * Banner trang chủ – slider tự làm (không dùng thư viện ngoài).
 * Hiệu ứng: ảnh phóng chậm (Ken Burns), chữ hiện lần lượt, thanh tiến độ trên chấm đang chọn.
 * Thanh tiến độ chính là bộ hẹn giờ: chạy hết → sang slide kế; rê chuột / focus vào banner → tạm dừng đúng chỗ.
 * Người dùng bật giảm chuyển động → không tự chuyển slide.
 */
export function HeroSlider({ banners, hotline, interval = 6500 }: HeroSliderProps) {
  const count = banners.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  if (count === 0) return null;

  return (
    <section
      className="group/hero relative isolate h-[34rem] overflow-hidden bg-brand-dark text-white sm:h-[36rem] lg:h-[40rem]"
      aria-roledescription="carousel"
      aria-label="Banner giới thiệu"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      // Chỉ dừng khi focus bằng bàn phím (chạm / bấm chuột vào chấm không làm slider đứng luôn)
      onFocus={(e) => {
        if (e.target.matches(":focus-visible")) setPaused(true);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current == null) return;
        const dx = (e.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? index + 1 : index - 1);
        touchStartX.current = null;
      }}
    >
      {banners.map((b, i) => {
        const active = i === index;
        const Heading = i === 0 ? "h1" : "h2";
        // Chữ của slide đang hiện chạy hiệu ứng mỗi lần slide được chọn
        const enter = active ? "animate-hero-in motion-reduce:animate-none" : undefined;
        return (
          <div
            key={b.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${count}`}
            aria-hidden={!active}
            className={cn("absolute inset-0 transition-opacity duration-700 ease-out", active ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0")}
          >
            {/* Ken Burns: slide đang hiện phóng chậm 110%; slide vừa rời giữ nguyên tới khi mờ hẳn rồi mới trả về 100% */}
            <Image
              src={b.image}
              alt={b.title}
              fill
              // Next 16: `priority` đã bỏ – slide đầu là LCP nên tải ngay, ưu tiên cao
              loading={i === 0 ? "eager" : undefined}
              fetchPriority={i === 0 ? "high" : undefined}
              sizes="100vw"
              quality={75}
              className={cn(
                "object-cover transition-transform ease-out motion-reduce:transition-none",
                active ? "scale-110 duration-[9000ms] starting:scale-100" : "scale-100 delay-700 duration-0"
              )}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/95 via-brand-dark/75 to-brand-dark/25" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-brand-dark/80 to-transparent" />

            <div className="container-page relative flex h-full items-center pb-24 pt-6 md:pb-28">
              <div className="max-w-2xl md:pl-12">
                <p
                  className={cn(
                    "mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-200 backdrop-blur",
                    enter
                  )}
                  style={stagger(50)}
                >
                  <span aria-hidden="true" className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-300 opacity-75 motion-reduce:hidden" />
                    <span className="relative inline-flex size-2 rounded-full bg-amber-300" />
                  </span>
                  Rèm cửa đẹp – Giá tận xưởng
                </p>
                <Heading
                  className={cn("text-3xl font-extrabold leading-[1.15] text-balance drop-shadow sm:text-4xl lg:text-5xl xl:text-[3.4rem]", enter)}
                  style={stagger(150)}
                >
                  {b.title}
                </Heading>
                {b.subtitle && (
                  <p className={cn("mt-4 line-clamp-4 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg", enter)} style={stagger(300)}>
                    {b.subtitle}
                  </p>
                )}
                <div className={cn("mt-7 flex flex-wrap gap-3", enter)} style={stagger(450)}>
                  {b.ctaText && b.ctaLink && (
                    <Button
                      asChild
                      size="lg"
                      className="group relative h-12 overflow-hidden bg-cta px-6 text-base font-semibold text-cta-foreground shadow-lg shadow-cta/30 hover:-translate-y-0.5 hover:bg-cta-hover hover:shadow-xl hover:shadow-cta/40"
                    >
                      <Link href={b.ctaLink}>
                        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-shine bg-gradient-to-r from-transparent via-white/60 to-transparent motion-reduce:hidden" />
                        {b.ctaText} <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  )}
                  {b.ctaText2 && b.ctaLink2 && (
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="h-12 border-white/60 bg-white/10 px-6 text-base font-semibold text-white backdrop-blur hover:-translate-y-0.5 hover:bg-white hover:text-brand-dark"
                    >
                      <Link href={b.ctaLink2}>{b.ctaText2}</Link>
                    </Button>
                  )}
                </div>
                <a
                  href={telHref(hotline)}
                  className={cn("group mt-6 inline-flex items-center gap-2 text-sm font-medium text-white/85 hover:text-white", enter)}
                  style={stagger(600)}
                >
                  <Phone className="size-4 animate-ring text-amber-300 motion-reduce:animate-none" /> Hotline báo giá:{" "}
                  <span className="font-bold text-amber-300 underline-offset-4 group-hover:underline">{hotline}</span>
                </a>
              </div>
            </div>
          </div>
        );
      })}

      {count > 1 && (
        <>
          {/* Chấm chọn slide; chấm đang chọn có thanh tiến độ = thời gian còn lại trước khi tự chuyển */}
          <div className="absolute inset-x-0 bottom-16 z-20 flex items-center justify-center gap-2 md:bottom-[4.5rem]">
            {banners.map((b, i) => {
              const current = i === index;
              return (
                <button
                  key={b.id}
                  type="button"
                  aria-label={`Chuyển tới banner ${i + 1}`}
                  aria-current={current}
                  onClick={() => go(i)}
                  className={cn(
                    "relative h-2.5 overflow-hidden rounded-full transition-all duration-500",
                    current ? "w-12 bg-white/30" : "w-2.5 bg-white/50 hover:scale-125 hover:bg-white/80"
                  )}
                >
                  {current && (
                    <span
                      aria-hidden="true"
                      onAnimationEnd={() => go(index + 1)}
                      className="absolute inset-0 origin-left animate-slide-progress rounded-full bg-cta motion-reduce:animate-none"
                      style={{ animationDuration: `${interval}ms`, animationPlayState: paused ? "paused" : "running" }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            aria-label="Banner trước"
            onClick={() => go(index - 1)}
            className="absolute left-3 top-1/2 z-20 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur transition-all duration-300 hover:scale-110 hover:bg-white hover:text-brand-dark active:scale-95 md:flex lg:left-6"
          >
            <ChevronLeft className="size-6 transition-transform duration-300 group-hover/hero:-translate-x-0.5" />
          </button>
          <button
            type="button"
            aria-label="Banner tiếp theo"
            onClick={() => go(index + 1)}
            className="absolute right-3 top-1/2 z-20 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur transition-all duration-300 hover:scale-110 hover:bg-white hover:text-brand-dark active:scale-95 md:flex lg:right-6"
          >
            <ChevronRight className="size-6 transition-transform duration-300 group-hover/hero:translate-x-0.5" />
          </button>
        </>
      )}
    </section>
  );
}
