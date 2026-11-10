"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type ProductImage = { src: string; alt: string };

const NAV_BUTTON =
  "absolute top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-dark shadow-lg backdrop-blur transition-all duration-300 hover:scale-110 hover:bg-white active:scale-95";

/**
 * Ảnh sản phẩm: ảnh chính (đổi ảnh mờ chuyển, rê chuột phóng to theo con trỏ để xem chất vải, vuốt trên điện thoại)
 * + hàng ảnh nhỏ + xem toàn màn hình (phím ← → để chuyển ảnh).
 */
export function ProductGallery({ images, className }: { images: ProductImage[]; className?: string }) {
  const count = images.length;
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  /** Vị trí con trỏ (%) khi đang phóng to bằng chuột; null = không phóng to */
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const touchX = useRef<number | null>(null);

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  // Xem toàn màn hình: phím mũi tên chuyển ảnh
  useEffect(() => {
    if (!open || count < 2) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + count) % count);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % count);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, count]);

  if (count === 0) return null;
  const current = images[index];

  const swipe = {
    onTouchStart: (e: React.TouchEvent) => {
      touchX.current = e.touches[0]?.clientX ?? null;
    },
    onTouchEnd: (e: React.TouchEvent) => {
      if (touchX.current == null) return;
      const dx = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
      if (Math.abs(dx) > 40) go(dx < 0 ? index + 1 : index - 1);
      touchX.current = null;
    },
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Ảnh chính */}
      <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted shadow-xl shadow-brand-dark/10" {...swipe}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          onPointerMove={(e) => {
            if (e.pointerType !== "mouse") return;
            const r = e.currentTarget.getBoundingClientRect();
            setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
          }}
          onPointerLeave={() => setZoom(null)}
          className="absolute inset-0 cursor-zoom-in"
          aria-label={`Xem ảnh lớn: ${current.alt}`}
        >
          {/* Xếp chồng mọi ảnh, ảnh đang chọn hiện rõ → đổi ảnh mờ chuyển mượt, không phải tải lại */}
          {images.map((img, i) => (
            <Image
              key={img.src}
              src={img.src}
              alt={img.alt}
              fill
              loading={i === 0 ? "eager" : undefined}
              fetchPriority={i === 0 ? "high" : undefined}
              sizes="(max-width: 1024px) 100vw, 66vw"
              className={cn(
                "object-cover transition-[opacity,scale] duration-500 ease-out motion-reduce:transition-none",
                i === index ? "opacity-100" : "opacity-0",
                i === index && zoom ? "scale-[1.8] duration-200" : "scale-100"
              )}
              style={i === index && zoom ? { transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
            />
          ))}
        </button>

        {count > 1 && (
          <>
            <button type="button" onClick={() => go(index - 1)} aria-label="Ảnh trước" className={cn(NAV_BUTTON, "left-3 md:opacity-0 md:group-hover:opacity-100")}>
              <ChevronLeft className="size-5" />
            </button>
            <button type="button" onClick={() => go(index + 1)} aria-label="Ảnh sau" className={cn(NAV_BUTTON, "right-3 md:opacity-0 md:group-hover:opacity-100")}>
              <ChevronRight className="size-5" />
            </button>
            <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-brand-dark/70 px-2.5 py-1 text-xs font-semibold tabular-nums text-white backdrop-blur">
              {index + 1} / {count}
            </span>
          </>
        )}
        <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-brand-dark shadow-md backdrop-blur transition-all duration-300 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
          <Expand className="size-3.5" /> Bấm để phóng to
        </span>
      </div>

      {/* Ảnh nhỏ */}
      {count > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => go(i)}
              aria-label={`Xem ảnh ${i + 1}`}
              aria-current={i === index}
              className={cn(
                "relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-xl bg-muted ring-2 ring-offset-2 ring-offset-background transition-all duration-300 sm:w-24",
                i === index ? "ring-cta" : "opacity-70 ring-transparent hover:-translate-y-0.5 hover:opacity-100"
              )}
            >
              <Image src={img.src} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Xem toàn màn hình */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton={false} className="max-w-[calc(100%-1rem)] gap-0 border-none bg-brand-dark/95 p-2 shadow-2xl sm:max-w-5xl sm:p-3">
          <DialogTitle className="sr-only">{current.alt}</DialogTitle>
          <DialogDescription className="sr-only">
            Ảnh {index + 1} / {count}. Dùng phím mũi tên trái phải để chuyển ảnh.
          </DialogDescription>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl" {...swipe}>
            {images.map((img, i) => (
              <Image
                key={img.src}
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 1024px"
                className={cn("object-contain transition-opacity duration-500", i === index ? "opacity-100" : "opacity-0")}
              />
            ))}
            {count > 1 && (
              <>
                <button type="button" onClick={() => go(index - 1)} aria-label="Ảnh trước" className={cn(NAV_BUTTON, "left-3")}>
                  <ChevronLeft className="size-5" />
                </button>
                <button type="button" onClick={() => go(index + 1)} aria-label="Ảnh sau" className={cn(NAV_BUTTON, "right-3")}>
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}
            <DialogClose className="absolute right-3 top-3 z-10 flex size-10 items-center justify-center rounded-full bg-white/90 text-brand-dark shadow-lg transition-transform duration-300 hover:rotate-90 hover:bg-white">
              <X className="size-5" />
              <span className="sr-only">Đóng</span>
            </DialogClose>
          </div>
          <p className="px-1 pt-2 text-center text-sm text-white/80">
            {current.alt}
            {count > 1 && (
              <span className="ml-2 tabular-nums text-amber-300">
                {index + 1} / {count}
              </span>
            )}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
