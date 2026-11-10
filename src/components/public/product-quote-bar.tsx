import { Phone, Send } from "lucide-react";
import { telHref } from "@/lib/format";
import { Button } from "@/components/ui/button";

/** Thanh hành động cố định dưới màn hình điện thoại ở trang chi tiết sản phẩm: giá + Nhận báo giá + gọi */
export function ProductQuoteBar({ hotline, price }: { hotline: string; price: string }) {
  return (
    <div
      data-mobile-bar
      className="fixed inset-x-0 bottom-0 z-30 flex animate-in items-center gap-2 border-t bg-background/95 p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur delay-500 duration-500 fill-mode-both slide-in-from-bottom-full motion-reduce:animate-none md:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="min-w-0 flex-1 leading-tight">
        <p className="text-[11px] text-muted-foreground">Giá tham khảo</p>
        <p className="line-clamp-2 text-[13px] font-bold leading-tight text-primary">{price}</p>
      </div>
      <Button asChild variant="outline" size="lg" className="h-12 shrink-0 border-primary/30 px-4 text-primary" aria-label={`Gọi ${hotline}`}>
        <a href={telHref(hotline)}>
          <Phone className="size-5 animate-ring motion-reduce:animate-none" />
        </a>
      </Button>
      <Button asChild size="lg" className="relative h-12 shrink-0 overflow-hidden bg-cta px-3.5 text-sm font-semibold text-cta-foreground shadow-md shadow-cta/30 hover:bg-cta-hover">
        <a href="#bao-gia">
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-shine bg-gradient-to-r from-transparent via-white/60 to-transparent motion-reduce:hidden" />
          <Send className="size-4" /> Nhận báo giá
        </a>
      </Button>
    </div>
  );
}
