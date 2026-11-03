import { Phone, Send } from "lucide-react";
import { telHref } from "@/lib/format";
import { Button } from "@/components/ui/button";

/** Thanh hành động cố định dưới màn hình điện thoại ở trang chi tiết sản phẩm: giá + Nhận báo giá + gọi */
export function ProductQuoteBar({ hotline, price }: { hotline: string; price: string }) {
  return (
    <div
      data-mobile-bar
      className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-2 border-t bg-background/95 p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur md:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="min-w-0 flex-1 leading-tight">
        <p className="text-[11px] text-muted-foreground">Giá tham khảo</p>
        <p className="line-clamp-2 text-[13px] font-bold leading-tight text-primary">{price}</p>
      </div>
      <Button asChild variant="outline" size="lg" className="h-12 shrink-0 border-primary/30 px-4 text-primary" aria-label={`Gọi ${hotline}`}>
        <a href={telHref(hotline)}>
          <Phone className="size-5" />
        </a>
      </Button>
      <Button asChild size="lg" className="h-12 shrink-0 bg-cta px-3.5 text-sm font-semibold text-cta-foreground hover:bg-cta-hover">
        <a href="#bao-gia">
          <Send className="size-4" /> Nhận báo giá
        </a>
      </Button>
    </div>
  );
}
