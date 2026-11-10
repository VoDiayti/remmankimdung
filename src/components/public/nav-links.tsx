"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { PUBLIC_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Menu điều hướng chính – tự đánh dấu mục đang mở */
export function NavLinks({
  orientation = "horizontal",
  onNavigate,
  className,
}: {
  orientation?: "horizontal" | "vertical";
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  return (
    <ul className={cn(orientation === "horizontal" ? "flex items-center gap-1" : "flex flex-col", className)}>
      {PUBLIC_NAV.map((item, i) => {
        const active = isActivePath(pathname, item.href);
        const vertical = orientation === "vertical";
        return (
          // Menu di động: các mục trượt vào lần lượt mỗi lần mở
          <li
            key={item.href}
            className={vertical ? "animate-in fill-mode-both fade-in slide-in-from-right-6 duration-500 motion-reduce:animate-none" : undefined}
            style={vertical ? { animationDelay: `${120 + i * 50}ms` } : undefined}
          >
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                vertical
                  ? "group flex min-h-12 items-center justify-between rounded-lg px-3 text-base font-medium transition-colors hover:bg-brand-light hover:text-primary"
                  : // Gạch chân màu vàng mọc ra từ giữa khi rê chuột; mục đang mở luôn có gạch
                    "relative inline-flex h-10 items-center whitespace-nowrap rounded-md px-2 text-sm font-medium transition-colors after:absolute after:inset-x-2 after:-bottom-0.5 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-cta after:transition-transform after:duration-300 after:ease-out hover:text-primary hover:after:scale-x-100 xl:px-2.5 xl:after:inset-x-2.5 2xl:px-3 2xl:text-[15px] 2xl:after:inset-x-3",
                active && (vertical ? "bg-brand-light text-primary" : "text-primary after:scale-x-100")
              )}
            >
              {item.label}
              {vertical && <ChevronRight className="size-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
