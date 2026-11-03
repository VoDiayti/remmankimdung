"use client";

import { useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ExternalLink, Wrench } from "lucide-react";
import { toast } from "sonner";
import { createService, updateService } from "@/actions/services";
import { slugify } from "@/lib/slug";
import { cn } from "@/lib/utils";
import { serviceSchema, type ServiceFormValues } from "@/lib/validations/service";
import { NONE_VALUE } from "@/lib/validations/post";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitButton } from "@/components/admin/submit-button";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { ImageFieldWithLibrary } from "@/components/admin/media/image-field-with-library";
import { SERVICE_ICON_MAP, SERVICE_ICONS } from "@/components/admin/services/service-icons";

export type ServiceFormInitialData = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  image: string | null;
  icon: string | null;
  price: string | null;
  duration: string | null;
  order: number;
  isActive: boolean;
};

function toDefaults(data?: ServiceFormInitialData): ServiceFormValues {
  return {
    title: data?.title ?? "",
    slug: data?.slug ?? "",
    summary: data?.summary ?? "",
    content: data?.content ?? "",
    image: data?.image ?? "",
    icon: data?.icon && data.icon in SERVICE_ICON_MAP ? data.icon : "",
    price: data?.price ?? "",
    duration: data?.duration ?? "",
    order: String(data?.order ?? 0),
    isActive: data?.isActive ?? true,
  };
}

/** Form tạo / sửa dịch vụ (tư vấn – đo đạc, lắp đặt, bảo hành, vệ sinh rèm...) */
export function ServiceForm({ initialData }: { initialData?: ServiceFormInitialData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const slugTouched = useRef(Boolean(initialData));

  const form = useForm<ServiceFormValues>({ resolver: zodResolver(serviceSchema), defaultValues: toDefaults(initialData) });
  const summary = useWatch({ control: form.control, name: "summary" });
  const icon = useWatch({ control: form.control, name: "icon" });
  const PreviewIcon = SERVICE_ICON_MAP[icon] ?? Wrench;

  const onSubmit = (values: ServiceFormValues) => {
    startTransition(async () => {
      const result = initialData ? await updateService(initialData.id, values) : await createService(values);
      if (!result.success) {
        toast.error(result.message);
        for (const [name, messages] of Object.entries(result.fieldErrors ?? {})) {
          if (name in form.getValues() && messages[0]) form.setError(name as keyof ServiceFormValues, { message: messages[0] });
        }
        return;
      }
      toast.success(result.message ?? "Đã lưu dịch vụ");
      if (!initialData) {
        router.push(result.data ? `/admin/dich-vu/${result.data.id}` : "/admin/dich-vu");
        return;
      }
      if (result.data) form.setValue("slug", result.data.slug);
      router.refresh();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader><CardTitle>Thông tin dịch vụ</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiêu đề <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Vd: Tư vấn – đo đạc tận nơi miễn phí"
                          className="h-11 font-semibold md:text-base"
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
                      <div className="flex">
                        <span className="hidden items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-xs text-muted-foreground sm:flex">/dich-vu/</span>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="tu-sinh-tu-tieu-de"
                            className="sm:rounded-l-none"
                            onChange={(e) => {
                              slugTouched.current = e.target.value.trim().length > 0;
                              field.onChange(e);
                            }}
                          />
                        </FormControl>
                      </div>
                      <FormDescription>Tự sinh từ tiêu đề khi để trống.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tóm tắt</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} placeholder="Giới thiệu ngắn hiển thị ở thẻ dịch vụ trang chủ và danh sách dịch vụ" />
                      </FormControl>
                      <FormDescription className="flex justify-between">
                        <span>Nên viết 1–2 câu, nêu rõ lợi ích cho khách.</span>
                        <span className={cn(summary.length > 500 && "text-destructive")}>{summary.length}/500</span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nội dung chi tiết</FormLabel>
                      <RichTextEditor value={field.value} onChange={field.onChange} minHeight={380} placeholder="Quy trình thực hiện, phạm vi dịch vụ, cam kết, lưu ý cho khách hàng..." />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Cài đặt</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biểu tượng</FormLabel>
                      <div className="flex items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary" aria-hidden>
                          <PreviewIcon className="size-5" />
                        </span>
                        <Select value={field.value || NONE_VALUE} onValueChange={(v) => field.onChange(v === NONE_VALUE ? "" : v)}>
                          <FormControl>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Chọn biểu tượng" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={NONE_VALUE}>
                              <Wrench className="size-4 text-muted-foreground" /> Mặc định
                            </SelectItem>
                            {SERVICE_ICONS.map((i) => (
                              <SelectItem key={i.value} value={i.value}>
                                <i.icon className="size-4 text-muted-foreground" /> {i.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <FormDescription>Hiện trên thẻ dịch vụ ở trang chủ.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá dịch vụ</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Vd: Miễn phí / Từ 150.000 đ/bộ" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thời gian thực hiện</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Vd: 1 – 2 giờ / Trong 24 giờ" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thứ tự</FormLabel>
                      <FormControl>
                        <Input {...field} inputMode="numeric" placeholder="0" />
                      </FormControl>
                      <FormDescription>Số nhỏ hiển thị trước.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between gap-3 rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Hiển thị trên website</FormLabel>
                        <FormDescription>Tắt để tạm ẩn dịch vụ.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} aria-label="Hiển thị dịch vụ" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Ảnh minh họa</CardTitle></CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <ImageFieldWithLibrary value={field.value || null} onChange={(url) => field.onChange(url ?? "")} aspect="video" />
                      <FormDescription>Ảnh ngang 16:9, hiện ở đầu trang chi tiết dịch vụ.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-between gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
          <Button type="button" variant="ghost" asChild>
            <Link href="/admin/dich-vu"><ArrowLeft /> Danh sách dịch vụ</Link>
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            {initialData?.isActive && (
              <Button type="button" variant="outline" asChild>
                <Link href={`/dich-vu/${initialData.slug}`} target="_blank"><ExternalLink /> Xem trên website</Link>
              </Button>
            )}
            <SubmitButton pending={isPending} pendingText="Đang lưu..." className="min-w-28">Lưu</SubmitButton>
          </div>
        </div>
      </form>
    </Form>
  );
}
