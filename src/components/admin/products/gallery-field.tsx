"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Images, Trash } from "lucide-react";
import { toast } from "sonner";
import { MediaPickerDialog } from "@/components/admin/media/media-picker-dialog";
import { MediaUploadButton } from "@/components/admin/media/media-upload-button";
import { Button } from "@/components/ui/button";

export const GALLERY_MAX = 12;

type GalleryFieldProps = {
  value: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
};

/** Danh sách ảnh phụ của sản phẩm: thêm từ thư viện / tải lên, xóa, đổi thứ tự (tối đa GALLERY_MAX ảnh) */
export function GalleryField({ value, onChange, disabled }: GalleryFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const remaining = GALLERY_MAX - value.length;

  const add = (urls: string[]) => {
    const next = [...value];
    for (const url of urls) {
      if (next.length >= GALLERY_MAX) {
        toast.error(`Tối đa ${GALLERY_MAX} ảnh phụ`);
        break;
      }
      if (!next.includes(url)) next.push(url);
    }
    onChange(next);
  };
  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {value.length === 0 ? (
        <div className="flex flex-col items-center gap-1 rounded-lg border border-dashed bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          <Images className="size-8 opacity-50" />
          <span>Chưa có ảnh phụ. Thêm ảnh góc chụp khác, ảnh chi tiết vải, ảnh thực tế tại công trình...</span>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {value.map((url, index) => (
            <li key={url} className="group relative overflow-hidden rounded-lg border bg-muted/40">
              <div className="aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element -- URL ảnh bất kỳ trong admin */}
                <img src={url} alt={`Ảnh phụ ${index + 1}`} className="h-full w-full object-cover" />
              </div>
              <span className="absolute left-1.5 top-1.5 rounded bg-background/90 px-1.5 py-0.5 text-[11px] font-medium tabular-nums">{index + 1}</span>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-background/90 p-1">
                <div className="flex gap-0.5">
                  <Button type="button" variant="ghost" size="icon-xs" aria-label="Chuyển lên trước" disabled={disabled || index === 0} onClick={() => move(index, index - 1)}>
                    <ArrowUp />
                  </Button>
                  <Button type="button" variant="ghost" size="icon-xs" aria-label="Chuyển xuống sau" disabled={disabled || index === value.length - 1} onClick={() => move(index, index + 1)}>
                    <ArrowDown />
                  </Button>
                </div>
                <Button type="button" variant="ghost" size="icon-xs" aria-label="Xóa ảnh" disabled={disabled} onClick={() => onChange(value.filter((_, i) => i !== index))}>
                  <Trash className="text-destructive" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled={disabled || remaining <= 0} onClick={() => setPickerOpen(true)}>
          <Images /> Chọn từ thư viện
        </Button>
        <MediaUploadButton
          variant="secondary"
          size="sm"
          refreshOnDone={false}
          label="Tải ảnh lên"
          onUploaded={(items) => add(items.map((i) => i.url))}
          className={disabled || remaining <= 0 ? "pointer-events-none opacity-50" : undefined}
        />
        <span className="text-xs text-muted-foreground">{value.length}/{GALLERY_MAX} ảnh · Ảnh đầu tiên hiện ngay sau ảnh chính.</span>
      </div>
      <MediaPickerDialog open={pickerOpen} onOpenChange={setPickerOpen} onSelect={(url) => add([url])} />
    </div>
  );
}
