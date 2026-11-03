"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { ProductCategory } from "@/db/types";
import { slugify } from "@/lib/slug";
import { parseStringList } from "@/lib/format";
import { productCategorySchema, type ProductCategoryFormValues } from "@/lib/validations/product-category";
import { createProductCategory, updateProductCategory } from "@/actions/product-categories";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmitButton } from "@/components/admin/submit-button";
import { ImageFieldWithLibrary } from "@/components/admin/media/image-field-with-library";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { TextField } from "@/components/admin/banners/text-field";
import { applyFieldErrors } from "@/components/admin/banners/form-utils";

const LIST_PATH = "/admin/danh-muc";

export function ProductCategoryForm({ initialData }: { initialData?: ProductCategory }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // Slug tự sinh từ tên cho tới khi người dùng sửa tay (bản ghi đang sửa: giữ slug cũ)
  const [slugLocked, setSlugLocked] = useState(!!initialData);

  const form = useForm<ProductCategoryFormValues>({
    resolver: zodResolver(productCategorySchema),
    defaultValues: {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      image: initialData?.image ?? null,
      summary: initialData?.summary ?? "",
      description: initialData?.description ?? "",
      highlightsText: parseStringList(initialData?.highlights).join("\n"),
      priceNote: initialData?.priceNote ?? "",
      isFeatured: initialData?.isFeatured ?? false,
      isActive: initialData?.isActive ?? true,
      order: String(initialData?.order ?? 0),
      metaTitle: initialData?.metaTitle ?? "",
      metaDescription: initialData?.metaDescription ?? "",
    },
  });

  const onSubmit = (values: ProductCategoryFormValues) => {
    startTransition(async () => {
      const result = initialData ? await updateProductCategory(initialData.id, values) : await createProductCategory(values);
      if (result.success) {
        toast.success(result.message);
        router.push(LIST_PATH);
        router.refresh();
      } else {
        toast.error(result.message);
        applyFieldErrors(form, result.fieldErrors);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Cột chính */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin chung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên danh mục <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Vd: Rèm vải, Rèm cuốn, Rèm cầu vồng"
                          onChange={(e) => {
                            field.onChange(e);
                            if (!slugLocked) form.setValue("slug", slugify(e.target.value), { shouldValidate: false });
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
                          value={field.value ?? ""}
                          placeholder="tu-sinh-tu-ten"
                          onChange={(e) => {
                            field.onChange(e);
                            setSlugLocked(e.target.value.trim() !== "");
                          }}
                        />
                      </FormControl>
                      <FormDescription>Địa chỉ trang: /danh-muc/{field.value || "…"}. Để trống để tự sinh từ tên.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <TextField control={form.control} name="summary" label="Tóm tắt" multiline rows={3} placeholder="Giới thiệu ngắn 1–2 câu hiển thị trên thẻ danh mục và đầu trang danh mục" />
                <TextField
                  control={form.control}
                  name="priceNote"
                  label="Dòng giá hiển thị"
                  placeholder="Vd: Giá từ 280.000 đ/m²"
                  maxLength={100}
                  description="Hiện trên thẻ danh mục ở trang chủ. Để trống sẽ không hiện."
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nội dung chi tiết</CardTitle>
                <CardDescription>Hiển thị trên trang chi tiết danh mục (/danh-muc/…).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả danh mục</FormLabel>
                      <RichTextEditor value={field.value ?? ""} onChange={field.onChange} minHeight={280} placeholder="Đặc điểm loại rèm, chất liệu, không gian phù hợp, cách chọn..." />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <TextField
                  control={form.control}
                  name="highlightsText"
                  label="Ưu điểm nổi bật"
                  multiline
                  rows={6}
                  placeholder={"Mỗi dòng một ưu điểm, vd:\nCản sáng đến 99%\nHàng trăm mẫu vải, màu sắc\nBảo hành 24 tháng"}
                  description="Mỗi dòng một mục, hiện dạng danh sách có dấu tích."
                />
              </CardContent>
            </Card>
          </div>

          {/* Cột phụ */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hiển thị</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Hiển thị trên website</FormLabel>
                        <FormDescription>Tắt để tạm ẩn danh mục và sản phẩm thuộc danh mục.</FormDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Danh mục nổi bật</FormLabel>
                        <FormDescription>Hiện ở khối danh mục trang chủ.</FormDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )}
                />
                <TextField control={form.control} name="order" label="Thứ tự" type="number" inputMode="numeric" description="Số nhỏ hiển thị trước (cũng là thứ tự tab bảng giá)." />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ảnh đại diện</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <ImageFieldWithLibrary value={field.value} onChange={field.onChange} aspect="video" />
                      <FormDescription>Ảnh ngang tỷ lệ 16:9, tối thiểu 1200×675px.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
                <CardDescription>Để trống sẽ dùng tên và tóm tắt.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <TextField control={form.control} name="metaTitle" label="Tiêu đề SEO" placeholder="Tối đa ~60 ký tự" maxLength={160} />
                <TextField control={form.control} name="metaDescription" label="Mô tả SEO" multiline rows={3} placeholder="Tối đa ~160 ký tự" maxLength={320} />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 flex justify-end gap-2 border-t bg-background/95 py-3 backdrop-blur">
          <Button type="button" variant="outline" asChild><Link href={LIST_PATH}>Hủy</Link></Button>
          <SubmitButton pending={isPending} className="min-w-28">{initialData ? "Lưu thay đổi" : "Tạo danh mục"}</SubmitButton>
        </div>
      </form>
    </Form>
  );
}
