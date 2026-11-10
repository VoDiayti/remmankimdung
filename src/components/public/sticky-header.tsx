"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Thẻ <header> dính trên cùng, gắn `data-scrolled` khi trang đã cuộn xuống
 * để đổi giao diện (đổ bóng, nền trong mờ) bằng variant `data-scrolled:` / `group-data-scrolled/header:`.
 */
export function StickyHeader({ className, children }: { className?: string; children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setScrolled(window.scrollY > 40);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <header data-scrolled={scrolled ? "" : undefined} className={className}>
      {children}
    </header>
  );
}
