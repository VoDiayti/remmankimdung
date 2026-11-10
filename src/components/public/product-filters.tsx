"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Funnel, Search, X } from "lucide-react";
import { PRICE_RANGES, ROOM_OPTIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ALL = "__all__";

/** Các khóa URL của bộ lọc sản phẩm */
export const PRODUCT_FILTER_KEYS = ["danh-muc", "loai", "gia", "phong", "q"] as const;

type ProductFiltersProps = {
  categories: { id: string; slug: string; name: string }[];
  lines: { id: string; slug: string; name: string; categoryId: string }[];
};

function useSetParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page"); // đổi bộ lọc → về trang 1
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
}

function FilterSelect({
  param,
  label,
  options,
  allLabel,
  value,
  onChange,
}: {
  param: string;
  label: string;
  options: { value: string; label: string }[];
  allLabel: string;
  value: string;
  onChange: (value: string | null) => void;
}) {
  const current = options.some((o) => o.value === value) ? value : ALL;
  return (
    <div className="grid gap-1.5">
      <label htmlFor={`filter-${param}`} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <Select value={current} onValueChange={(v) => onChange(v === ALL ? null : v)}>
        <SelectTrigger id={`filter-${param}`} className="w-full bg-background data-[size=default]:h-11 md:data-[size=default]:h-10" aria-label={label}>
          <SelectValue placeholder={allLabel} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{allLabel}</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/** Bộ lọc sản phẩm – cập nhật trực tiếp lên URL để chia sẻ/đánh dấu được; loại rèm phụ thuộc danh mục đã chọn */
export function ProductFilters({ categories, lines }: ProductFiltersProps) {
  const searchParams = useSearchParams();
  const setParams = useSetParams();
  const urlQ = searchParams.get("q") ?? "";
  const [q, setQ] = useState(urlQ);
  // Giá trị q gần nhất đã đẩy lên URL – để phân biệt thay đổi do người dùng gõ với thay đổi từ ngoài (back/forward, nút xóa lọc)
  const [lastPushed, setLastPushed] = useState(urlQ);
  const [prevUrlQ, setPrevUrlQ] = useState(urlQ);
  if (urlQ !== prevUrlQ) {
    setPrevUrlQ(urlQ);
    if (urlQ !== lastPushed) {
      setQ(urlQ);
      setLastPushed(urlQ);
    }
  }

  // Gõ xong 450ms mới cập nhật URL
  useEffect(() => {
    const value = q.trim();
    if (value === lastPushed) return;
    const t = setTimeout(() => {
      setLastPushed(value);
      setParams({ q: value || null });
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const categorySlug = searchParams.get("danh-muc") ?? "";
  const lineSlug = searchParams.get("loai") ?? "";
  const activeCategory = categories.find((c) => c.slug === categorySlug);
  // Loại rèm chỉ hiện các loại thuộc danh mục đang chọn; chưa chọn danh mục → hiện tất cả
  const lineOptions = (activeCategory ? lines.filter((l) => l.categoryId === activeCategory.id) : lines).map((l) => ({ value: l.slug, label: l.name }));
  const activeCount = PRODUCT_FILTER_KEYS.filter((k) => searchParams.get(k)).length;

  const changeCategory = (slug: string | null) => {
    const next = categories.find((c) => c.slug === slug);
    const currentLine = lines.find((l) => l.slug === lineSlug);
    // Đổi danh mục → bỏ loại rèm không thuộc danh mục mới
    const keepLine = currentLine && (!next || currentLine.categoryId === next.id);
    setParams({ "danh-muc": slug, loai: keepLine ? lineSlug : null });
  };

  const changeLine = (slug: string | null) => {
    const line = lines.find((l) => l.slug === slug);
    const owner = line ? categories.find((c) => c.id === line.categoryId) : undefined;
    // Chọn loại rèm khi chưa chọn danh mục → tự chọn danh mục của loại đó
    setParams({ loai: slug, "danh-muc": owner ? owner.slug : categorySlug || null });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card p-4 shadow-lg shadow-brand-dark/5 md:p-5">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cta via-amber-300 to-primary" />
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="inline-flex items-center gap-2.5 font-semibold text-brand-dark">
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand-light text-primary">
            <Funnel className="size-4" />
          </span>
          Lọc sản phẩm
          {activeCount > 0 && <span className="animate-in zoom-in rounded-full bg-cta px-2 py-0.5 text-xs font-bold text-cta-foreground duration-300">{activeCount}</span>}
        </p>
        {activeCount > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={() => setParams(Object.fromEntries(PRODUCT_FILTER_KEYS.map((k) => [k, null])))}>
            <X className="size-4" /> Xóa bộ lọc
          </Button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="grid gap-1.5 sm:col-span-2 lg:col-span-4">
          <label htmlFor="product-search" className="text-xs font-medium text-muted-foreground">
            Tìm kiếm
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="product-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tên rèm, mã sản phẩm, chất liệu..."
              className="h-11 bg-background pl-9 pr-9 md:h-10"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                aria-label="Xóa tìm kiếm"
                className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
        <FilterSelect param="danh-muc" label="Danh mục" allLabel="Tất cả danh mục" options={categories.map((c) => ({ value: c.slug, label: c.name }))} value={categorySlug} onChange={changeCategory} />
        <FilterSelect param="loai" label="Loại rèm" allLabel={activeCategory ? `Tất cả ${activeCategory.name.toLowerCase()}` : "Tất cả loại rèm"} options={lineOptions} value={lineSlug} onChange={changeLine} />
        <FilterSelect param="gia" label="Khoảng giá (đ/m²)" allLabel="Mọi mức giá" options={PRICE_RANGES.map((r) => ({ value: r.value, label: r.label }))} value={searchParams.get("gia") ?? ""} onChange={(v) => setParams({ gia: v })} />
        <FilterSelect param="phong" label="Không gian lắp đặt" allLabel="Mọi không gian" options={ROOM_OPTIONS.map((r) => ({ value: r.value, label: r.label }))} value={searchParams.get("phong") ?? ""} onChange={(v) => setParams({ phong: v })} />
      </div>
    </div>
  );
}
