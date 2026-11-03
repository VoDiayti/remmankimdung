"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { Product } from "@/db/types";
import { slugify } from "@/lib/slug";
import { formatNumber, parseStringList } from "@/lib/format";
import { PRICE_UNIT_LABELS, PRODUCT_STATUS_LABELS, ROOM_OPTIONS } from "@/lib/constants";
import { NONE_VALUE } from "@/lib/validations/post";
import { PRICE_UNITS, PRODUCT_STATUSES, parseMoney, productSchema, type ProductFormValues } from "@/lib/validations/product";
import { createProduct, updateProduct } from "@/actions/products";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitButton } from "@/components/admin/submit-button";
import { ImageFieldWithLibrary } from "@/components/admin/media/image-field-with-library";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { TextField } from "@/components/admin/banners/text-field";
import { applyFieldErrors } from "@/components/admin/banners/form-utils";
import { GalleryField } from "@/components/admin/products/gallery-field";

const LIST_PATH = "/admin/san-pham";

export type ProductCategoryOption = { id: string; name: string; isActive: boolean };
export type ProductLineOption = { id: string; name: string; categoryId: string; isActive: boolean };

type ProductFormProps = {
  initialData?: Product;
  /** Danh mục (gồm cả danh mục đang ẩn, đánh dấu "(ẩn)") */
  categories: ProductCategoryOption[];
  /** Tất cả loại rèm – form tự lọc theo danh mục đang chọn */
  lines: ProductLineOption[];
};

/** 350000 → "350.000" để hiện trên ô nhập giá */
const moneyToInput = (n: number | null | undefined) => (n == null ? "" : formatNumber(n));

export function ProductForm({ initialData, categories, lines }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [slugLocked, setSlugLocked] = useState(!!initialData);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      categoryId: initialData?.categoryId ?? "",
      // Loại rèm đã bị xóa khỏi danh sách → coi như chưa phân loại
      lineId: initialData?.lineId && lines.some((l) => l.id === initialData.lineId) ? initialData.lineId : NONE_VALUE,
      code: initialData?.code ?? "",
      summary: initialData?.summary ?? "",
      description: initialData?.description ?? "",
      material: initialData?.material ?? "",
      origin: initialData?.origin ?? "",
      width: initialData?.width ?? "",
      colors: initialData?.colors ?? "",
      rooms: parseStringList(initialData?.rooms),
      featuresText: parseStringList(initialData?.features).join("\n"),
      priceFrom: moneyToInput(initialData?.priceFrom),
      priceTo: moneyToInput(initialData?.priceTo),
      priceUnit: initialData?.priceUnit ?? "M2",
      priceNote: initialData?.priceNote ?? "",
      warrantyMonths: initialData?.warrantyMonths != null ? String(initialData.warrantyMonths) : "",
      image: initialData?.image ?? null,
      gallery: parseStringList(initialData?.gallery),
      status: initialData?.status ?? "ACTIVE",
      isFeatured: initialData?.isFeatured ?? false,
      showInPriceTable: initialData?.showInPriceTable ?? true,
      metaTitle: initialData?.metaTitle ?? "",
      metaDescription: initialData?.metaDescription ?? "",
    },
  });

  const categoryId = useWatch({ control: form.control, name: "categoryId" });
  const priceUnit = useWatch({ control: form.control, name: "priceUnit" });
  // Chỉ hiện loại rèm thuộc danh mục đang chọn
  const lineOptions = lines.filter((l) => l.categoryId === categoryId);

  const onSubmit = (values: ProductFormValues) => {
    startTransition(async () => {
      const result = initialData ? await updateProduct(initialData.id, values) : await createProduct(values);
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

  /** Chuẩn hóa ô giá khi rời ô: "350000" → "350.000" */
  const formatMoneyField = (name: "priceFrom" | "priceTo") => {
    const n = parseMoney(form.getValues(name));
    form.setValue(name, n == null ? "" : formatNumber(n), { shouldDirty: true });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Thông tin */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin sản phẩm</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên sản phẩm <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Vd: Rèm vải gấm Hàn Quốc một lớp RV-101"
                          className="h-11 font-semibold md:text-base"
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
                <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
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
                        <FormDescription>Địa chỉ trang: /san-pham/{field.value || "…"}. Để trống để tự sinh.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <TextField control={form.control} name="code" label="Mã sản phẩm" placeholder="RV-101" maxLength={50} description="Mã vải / mã mẫu nội bộ." />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Danh mục <span className="text-destructive">*</span></FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Loại rèm đang chọn không thuộc danh mục mới → về "Chưa phân loại"
                            const currentLine = form.getValues("lineId");
                            if (currentLine && currentLine !== NONE_VALUE && !lines.some((l) => l.id === currentLine && l.categoryId === value)) {
                              form.setValue("lineId", NONE_VALUE, { shouldDirty: true });
                            }
                          }}
                        >
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
                    name="lineId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loại rèm</FormLabel>
                        <Select value={field.value || NONE_VALUE} onValueChange={field.onChange} disabled={!categoryId}>
                          <FormControl>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Chưa phân loại" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={NONE_VALUE}>Chưa phân loại</SelectItem>
                            {lineOptions.map((l) => (
                              <SelectItem key={l.id} value={l.id}>{l.isActive ? l.name : `${l.name} (ẩn)`}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {!categoryId
                            ? "Chọn danh mục trước."
                            : lineOptions.length === 0
                              ? <>Danh mục này chưa có loại rèm – thêm trong <Link href={`/admin/loai-rem?category=${categoryId}`} className="underline">Loại rèm</Link>.</>
                              : "Dùng cho bộ lọc “Loại rèm” ở trang sản phẩm."}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <TextField control={form.control} name="summary" label="Tóm tắt" multiline rows={3} placeholder="1–2 câu mô tả ngắn hiển thị ở thẻ sản phẩm và đầu trang chi tiết" maxLength={500} />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả chi tiết</FormLabel>
                      <RichTextEditor value={field.value ?? ""} onChange={field.onChange} minHeight={300} placeholder="Đặc điểm vải, công năng, hướng dẫn chọn kích thước, bảo quản..." />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Thông số */}
            <Card>
              <CardHeader>
                <CardTitle>Thông số</CardTitle>
                <CardDescription>Hiển thị ở bảng thông số kỹ thuật trên trang chi tiết.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField control={form.control} name="material" label="Chất liệu" placeholder="Vd: Polyester gấm Hàn Quốc" maxLength={200} />
                  <TextField control={form.control} name="origin" label="Xuất xứ" placeholder="Vd: Hàn Quốc" maxLength={100} />
                  <TextField control={form.control} name="width" label="Khổ vải / kích thước lá" placeholder="Vd: Khổ 2,8 m hoặc Lá 50 mm" maxLength={100} />
                  <TextField control={form.control} name="colors" label="Màu sắc có sẵn" placeholder="Vd: Kem, xám, nâu, xanh rêu" maxLength={200} />
                </div>
                <FormField
                  control={form.control}
                  name="rooms"
                  render={({ field }) => {
                    const selected = field.value ?? [];
                    return (
                      <FormItem>
                        <FormLabel>Không gian phù hợp</FormLabel>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {ROOM_OPTIONS.map((room) => {
                            const checked = selected.includes(room.value);
                            return (
                              <label key={room.value} className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={(value) =>
                                    field.onChange(value ? [...selected, room.value] : selected.filter((v) => v !== room.value))
                                  }
                                  aria-label={room.label}
                                />
                                {room.label}
                              </label>
                            );
                          })}
                        </div>
                        <FormDescription>Dùng cho bộ lọc “Không gian” ở trang sản phẩm.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <TextField
                  control={form.control}
                  name="featuresText"
                  label="Đặc điểm nổi bật"
                  multiline
                  rows={5}
                  placeholder={"Mỗi dòng một đặc điểm, vd:\nCản sáng 85%, chống tia UV\nVải dày 2 lớp, rủ đẹp\nDễ vệ sinh, không bám bụi"}
                  description="Mỗi dòng một mục, hiện dạng danh sách có dấu tích."
                />
              </CardContent>
            </Card>

            {/* Hình ảnh */}
            <Card>
              <CardHeader>
                <CardTitle>Hình ảnh</CardTitle>
                <CardDescription>Ảnh chính hiện ở thẻ sản phẩm; ảnh phụ hiện trong bộ sưu tập trang chi tiết.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ảnh chính</FormLabel>
                      <ImageFieldWithLibrary value={field.value} onChange={field.onChange} aspect="video" className="max-w-md" />
                      <FormDescription>Ảnh ngang tỷ lệ 4:3 hoặc 16:9, tối thiểu 1200px chiều ngang.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gallery"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ảnh phụ</FormLabel>
                      <GalleryField value={field.value ?? []} onChange={field.onChange} disabled={isPending} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Hiển thị */}
            <Card>
              <CardHeader>
                <CardTitle>Hiển thị</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trạng thái</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PRODUCT_STATUSES.map((s) => <SelectItem key={s} value={s}>{PRODUCT_STATUS_LABELS[s]}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormDescription>Chỉ sản phẩm “Đang bán” hiển thị trên website.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Sản phẩm nổi bật</FormLabel>
                        <FormDescription>Ưu tiên hiện ở trang chủ.</FormDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="showInPriceTable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Hiện trong bảng giá</FormLabel>
                        <FormDescription>Xuất hiện ở tab danh mục của bảng giá trang chủ.</FormDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Giá & bảo hành */}
            <Card>
              <CardHeader>
                <CardTitle>Giá &amp; bảo hành</CardTitle>
                <CardDescription>Để trống cả hai ô giá sẽ hiện “Liên hệ”.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="priceFrom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giá từ (đ)</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} inputMode="numeric" placeholder="350.000" onBlur={() => { field.onBlur(); formatMoneyField("priceFrom"); }} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="priceTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giá đến (đ)</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} inputMode="numeric" placeholder="520.000" onBlur={() => { field.onBlur(); formatMoneyField("priceTo"); }} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="priceUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Đơn vị tính</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PRICE_UNITS.map((u) => <SelectItem key={u} value={u}>{PRICE_UNIT_LABELS[u]}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormDescription>Hiện sau số tiền, vd “350.000 {PRICE_UNIT_LABELS[priceUnit] ?? "đ/m²"}”.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <TextField control={form.control} name="priceNote" label="Ghi chú giá" placeholder="Vd: Đã gồm phụ kiện, chưa gồm công lắp đặt" maxLength={200} />
                <TextField control={form.control} name="warrantyMonths" label="Bảo hành (tháng)" inputMode="numeric" placeholder="24" description="Để trống nếu không áp dụng." />
              </CardContent>
            </Card>

            {/* SEO */}
            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
                <CardDescription>Để trống sẽ dùng tên và tóm tắt sản phẩm.</CardDescription>
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
          <SubmitButton pending={isPending} className="min-w-28">{initialData ? "Lưu thay đổi" : "Tạo sản phẩm"}</SubmitButton>
        </div>
      </form>
    </Form>
  );
}
