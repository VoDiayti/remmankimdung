"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { createProductLine, updateProductLine } from "@/actions/product-lines";
import { slugify } from "@/lib/slug";
import { productLineSchema, type ProductLineFormValues } from "@/lib/validations/product-line";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitButton } from "@/components/admin/submit-button";
import { applyFieldErrors } from "@/components/admin/banners/form-utils";

export type ProductLineDialogData = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  description: string | null;
  order: number;
  isActive: boolean;
};

export type ProductLineCategoryOption = { id: string; name: string; isActive: boolean };

type ProductLineDialogProps = {
  line?: ProductLineDialogData;
  /** Danh mục để chọn (gồm cả danh mục đang ẩn, được đánh dấu "(ẩn)") */
  categories: ProductLineCategoryOption[];
  /** Danh mục chọn sẵn khi tạo mới (vd: đang lọc theo danh mục) */
  defaultCategoryId?: string;
};

/**
 * Dialog tạo / sửa loại rèm (dòng sản phẩm trong một danh mục).
 * Nút mở hộp thoại được tạo ngay trong client component (không nhận từ server) để Radix `asChild` luôn nhận được một React element hợp lệ.
 */
export function ProductLineDialog({ line, categories, defaultCategoryId }: ProductLineDialogProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {line ? (
          <Button variant="ghost" size="icon" aria-label="Sửa" title="Sửa"><Pencil /></Button>
        ) : (
          <Button><Plus /> Thêm loại rèm</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {/* Nội dung được mount lại mỗi lần mở → form luôn bắt đầu từ dữ liệu mới nhất */}
        <ProductLineDialogForm line={line} categories={categories} defaultCategoryId={defaultCategoryId} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function ProductLineDialogForm({ line, categories, defaultCategoryId, onDone }: ProductLineDialogProps & { onDone: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const slugTouched = useRef(Boolean(line));

  const form = useForm<ProductLineFormValues>({
    resolver: zodResolver(productLineSchema),
    defaultValues: {
      name: line?.name ?? "",
      slug: line?.slug ?? "",
      categoryId: line?.categoryId ?? (defaultCategoryId && categories.some((c) => c.id === defaultCategoryId) ? defaultCategoryId : ""),
      description: line?.description ?? "",
      order: String(line?.order ?? 0),
      isActive: line?.isActive ?? true,
    },
  });

  const onSubmit = (values: ProductLineFormValues) => {
    startTransition(async () => {
      const result = line ? await updateProductLine(line.id, values) : await createProductLine(values);
      if (result.success) {
        toast.success(result.message ?? "Đã lưu loại rèm");
        onDone();
        router.refresh();
        return;
      }
      toast.error(result.message);
      applyFieldErrors(form, result.fieldErrors);
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{line ? "Sửa loại rèm" : "Thêm loại rèm"}</DialogTitle>
        <DialogDescription>Loại rèm là nhóm sản phẩm trong một danh mục (vd: Rèm vải hệ 1 lớp, hệ 2 lớp, chống nắng 100%).</DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Danh mục <span className="text-destructive">*</span></FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.isActive ? c.name : `${c.name} (ẩn)`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {categories.length === 0 && (
                  <FormDescription>Chưa có danh mục nào – hãy <Link href="/admin/danh-muc/moi" className="underline">tạo danh mục</Link> trước.</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên loại rèm <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Vd: Rèm vải hệ 2 lớp"
                    autoFocus
                    onChange={(e) => {
                      field.onChange(e);
                      if (!slugTouched.current) form.setValue("slug", slugify(e.target.value), { shouldDirty: true });
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Đường dẫn (slug)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="tu-sinh-tu-ten"
                    onChange={(e) => {
                      slugTouched.current = e.target.value.trim().length > 0;
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormDescription>Bộ lọc công khai: /san-pham?loai={field.value || "..."}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả ngắn</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={2} placeholder="Một câu ngắn về loại rèm này, hiện ở trang danh mục" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thứ tự</FormLabel>
                  <FormControl>
                    <Input {...field} inputMode="numeric" placeholder="0" />
                  </FormControl>
                  <FormDescription>Số nhỏ xếp trước.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between gap-3 rounded-lg border p-3">
                  <FormLabel>Hiển thị</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} aria-label="Hiển thị loại rèm" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onDone} disabled={isPending}>Hủy</Button>
            <SubmitButton pending={isPending} pendingText="Đang lưu...">Lưu</SubmitButton>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
