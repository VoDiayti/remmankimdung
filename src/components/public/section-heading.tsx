import { revealDelay } from "@/lib/reveal";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  /** Nhãn nhỏ phía trên tiêu đề (kèm vạch nhấn) */
  label?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  /** Màu chữ khi đặt trên nền tối */
  tone?: "default" | "light";
  className?: string;
  as?: "h1" | "h2";
};

/**
 * Tiêu đề section: nhãn nhỏ có vạch nhấn + tiêu đề lớn + mô tả.
 * Đặt trong <RevealSection> thì lần lượt hiện lên khi cuộn tới (ngoài đó hiển thị bình thường).
 */
export function SectionHeading({ label, title, description, align = "center", tone = "default", className, as = "h2" }: SectionHeadingProps) {
  const Tag = as;
  const center = align === "center";
  const light = tone === "light";
  const bar = cn("h-0.5 w-8 shrink-0 rounded-full", light ? "bg-amber-300" : "bg-primary");
  return (
    <div className={cn("mb-10 max-w-3xl md:mb-12", center ? "mx-auto text-center" : "text-left", className)}>
      {label && (
        <p
          data-reveal
          className={cn("mb-3 flex items-center gap-3 text-sm font-semibold uppercase tracking-wider", center && "justify-center", light ? "text-amber-300" : "text-primary")}
        >
          <span aria-hidden="true" data-reveal="grow" style={revealDelay(250)} className={cn(bar, center ? "origin-right" : "origin-left")} />
          {label}
          {center && <span aria-hidden="true" data-reveal="grow" style={revealDelay(250)} className={cn(bar, "origin-left")} />}
        </p>
      )}
      <Tag data-reveal style={revealDelay(80)} className={cn("text-balance text-2xl font-bold leading-tight md:text-4xl", light ? "text-white" : "text-brand-dark")}>
        {title}
      </Tag>
      {description && (
        <p data-reveal style={revealDelay(160)} className={cn("mt-3 text-base leading-relaxed md:text-lg", light ? "text-white/80" : "text-muted-foreground")}>
          {description}
        </p>
      )}
    </div>
  );
}
