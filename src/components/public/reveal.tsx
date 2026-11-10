"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

/** Phần tử nằm trong (hoặc đã cuộn qua) màn hình lúc tải trang → hiện ngay, không chạy hiệu ứng */
const alreadyInView = (el: Element) => el.getBoundingClientRect().top < window.innerHeight * 0.92;
const motionAllowed = () => "IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Section có hiệu ứng xuất hiện khi cuộn tới cho mọi phần tử con gắn `data-reveal`
 * ("" = trượt lên, "fade", "zoom", "grow", "curtain"); độ trễ qua biến CSS `--reveal-delay`. CSS trong globals.css.
 * Không có JS hoặc người dùng bật giảm chuyển động → nội dung hiện bình thường.
 */
export function RevealSection({ id, className, children }: { id?: string; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  // useLayoutEffect: ẩn các phần tử dưới màn hình trước khi trình duyệt vẽ → không nháy
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || !motionAllowed()) return;
    const show = (el: Element) => el.setAttribute("data-shown", "");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          show(e.target);
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
    );
    // initial: lúc tải trang, phần tử đã nằm trong màn hình thì hiện luôn (không ẩn rồi hiện lại)
    const track = (els: Iterable<Element>, initial: boolean) => {
      for (const el of els) {
        if (el.hasAttribute("data-shown")) continue;
        if (initial && alreadyInView(el)) show(el);
        else io.observe(el);
      }
    };
    track(root.querySelectorAll("[data-reveal]"), true);
    root.setAttribute("data-reveal-armed", "");

    // Nội dung đổi sau khi tải (lọc sản phẩm, phân trang…) → phần tử mới cũng chạy hiệu ứng thay vì bị ẩn
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        for (const node of r.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.matches("[data-reveal]")) track([node], false);
          track(node.querySelectorAll("[data-reveal]"), false);
        }
      }
    });
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return (
    <section ref={ref} id={id} className={className}>
      {children}
    </section>
  );
}

const NUMBER_FORMAT = new Intl.NumberFormat("vi-VN");

/** Số đếm từ 0 lên `to` khi cuộn tới. HTML server render sẵn số cuối (tốt cho SEO / không JS) */
export function CountUp({ to, duration = 1600, delay = 350 }: { to: number; duration?: number; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const text = el?.firstChild;
    if (!el || !text || !motionAllowed() || alreadyInView(el)) return;
    // Cập nhật thẳng text node (không setState mỗi khung hình)
    const render = (n: number) => (text.nodeValue = NUMBER_FORMAT.format(n));
    render(0);
    let raf = 0;
    let timer = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        timer = window.setTimeout(() => {
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / duration);
            render(Math.round(to * (1 - (1 - p) ** 3)));
            if (p < 1) raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);
        }, delay);
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      render(to);
    };
  }, [to, duration, delay]);

  return <span ref={ref}>{NUMBER_FORMAT.format(to)}</span>;
}
