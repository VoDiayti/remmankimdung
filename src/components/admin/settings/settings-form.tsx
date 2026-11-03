"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { Setting } from "@/db/types";
import { settingsSchema, type SettingsFormValues } from "@/lib/validations/settings";
import { updateSettings } from "@/actions/settings";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubmitButton } from "@/components/admin/submit-button";
import { ImageFieldWithLibrary } from "@/components/admin/media/image-field-with-library";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { TextField } from "@/components/admin/banners/text-field";
import { applyFieldErrors } from "@/components/admin/banners/form-utils";

type FieldName = keyof SettingsFormValues;

/** Nhóm trường theo tab – dùng để nhảy tới tab có lỗi khi submit */
const TABS: { value: string; label: string; fields: FieldName[] }[] = [
  { value: "company", label: "Cửa hàng", fields: ["companyName", "shortName", "slogan", "logo", "taxCode", "foundedYear"] },
  { value: "contact", label: "Liên hệ", fields: ["hotline", "zalo", "email", "address", "mapEmbedUrl", "workingHours"] },
  { value: "social", label: "Mạng xã hội", fields: ["facebook", "youtube", "tiktok", "messenger"] },
  { value: "stats", label: "Số liệu nổi bật", fields: ["statCustomers", "statYears", "statProjects", "statProducts"] },
  { value: "home", label: "Trang chủ", fields: ["priceTableEnabled", "priceTableTitle", "introVideoUrl", "warrantyText"] },
  { value: "about", label: "Giới thiệu", fields: ["aboutShort", "aboutContent", "vision", "mission"] },
  { value: "seo", label: "SEO", fields: ["metaTitle", "metaDescription", "ogImage"] },
];

const str = (v: string | number | null | undefined) => (v == null ? "" : String(v));

/** Lấy id video YouTube từ các dạng link phổ biến (watch?v=, youtu.be/, shorts/, embed/) */
function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

export function SettingsForm({ initialData }: { initialData: Setting }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState(TABS[0].value);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      companyName: str(initialData.companyName),
      shortName: str(initialData.shortName),
      slogan: str(initialData.slogan),
      logo: initialData.logo ?? null,
      taxCode: str(initialData.taxCode),
      foundedYear: str(initialData.foundedYear),
      hotline: str(initialData.hotline),
      zalo: str(initialData.zalo),
      email: str(initialData.email),
      address: str(initialData.address),
      mapEmbedUrl: str(initialData.mapEmbedUrl),
      workingHours: str(initialData.workingHours),
      facebook: str(initialData.facebook),
      youtube: str(initialData.youtube),
      tiktok: str(initialData.tiktok),
      messenger: str(initialData.messenger),
      statCustomers: str(initialData.statCustomers),
      statYears: str(initialData.statYears),
      statProjects: str(initialData.statProjects),
      statProducts: str(initialData.statProducts),
      aboutShort: str(initialData.aboutShort),
      aboutContent: str(initialData.aboutContent),
      vision: str(initialData.vision),
      mission: str(initialData.mission),
      warrantyText: str(initialData.warrantyText),
      introVideoUrl: str(initialData.introVideoUrl),
      priceTableTitle: str(initialData.priceTableTitle),
      priceTableEnabled: initialData.priceTableEnabled,
      metaTitle: str(initialData.metaTitle),
      metaDescription: str(initialData.metaDescription),
      ogImage: initialData.ogImage ?? null,
    },
  });

  const mapEmbedUrl = useWatch({ control: form.control, name: "mapEmbedUrl" });
  const introVideoUrl = useWatch({ control: form.control, name: "introVideoUrl" });
  const videoId = introVideoUrl ? youtubeId(introVideoUrl) : null;

  /** Chuyển sang tab chứa trường lỗi đầu tiên */
  const focusErrorTab = (names: string[]) => {
    const target = TABS.find((t) => t.fields.some((f) => names.includes(f)));
    if (target) setTab(target.value);
  };

  const onInvalid = (errors: FieldErrors<SettingsFormValues>) => {
    focusErrorTab(Object.keys(errors));
    toast.error("Vui lòng kiểm tra lại các trường được đánh dấu đỏ.");
  };

  const onSubmit = (values: SettingsFormValues) => {
    startTransition(async () => {
      const result = await updateSettings(values);
      if (result.success) {
        toast.success(result.message);
        form.reset(values);
        router.refresh();
      } else {
        toast.error(result.message);
        applyFieldErrors(form, result.fieldErrors);
        if (result.fieldErrors) focusErrorTab(Object.keys(result.fieldErrors));
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="h-auto w-full flex-wrap justify-start">
            {TABS.map((t) => <TabsTrigger key={t.value} value={t.value} className="flex-none">{t.label}</TabsTrigger>)}
          </TabsList>

          {/* Cửa hàng */}
          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cửa hàng</CardTitle>
                <CardDescription>Hiển thị ở header, footer, trang giới thiệu và dữ liệu Organization cho Google.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                  <TextField control={form.control} name="companyName" label="Tên cửa hàng / công ty" required placeholder="Công ty TNHH Rèm Màn ..." />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField control={form.control} name="shortName" label="Tên thương hiệu ngắn" placeholder="Vd: Rèm Niji" description="Hiện trên menu, tiêu đề trang và nơi hẹp." />
                    <TextField control={form.control} name="foundedYear" label="Năm thành lập" inputMode="numeric" placeholder="2016" />
                  </div>
                  <TextField control={form.control} name="slogan" label="Slogan" placeholder="Rèm đẹp cho mọi không gian – Giá tận xưởng" />
                  <TextField control={form.control} name="taxCode" label="Mã số thuế" placeholder="0300000000" />
                </div>
                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo</FormLabel>
                      <ImageFieldWithLibrary value={field.value} onChange={field.onChange} aspect="video" />
                      <FormDescription>Ảnh PNG/SVG nền trong, chiều cao tối thiểu 80px.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Liên hệ */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Liên hệ</CardTitle>
                <CardDescription>Hotline và Zalo hiển thị ở nút liên hệ nổi trên mọi trang; địa chỉ là showroom / xưởng.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <TextField control={form.control} name="hotline" label="Hotline" required type="tel" placeholder="0909 000 000" />
                  <TextField control={form.control} name="zalo" label="Số Zalo" type="tel" placeholder="0909000000" description="Để trống sẽ dùng hotline." />
                  <TextField control={form.control} name="email" label="Email liên hệ" type="email" placeholder="lienhe@remniji.vn" />
                </div>
                <TextField control={form.control} name="address" label="Địa chỉ showroom" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" />
                <TextField control={form.control} name="workingHours" label="Giờ làm việc" placeholder="Thứ 2 – Chủ nhật: 8:00 – 20:00" />
                <FormField
                  control={form.control}
                  name="mapEmbedUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link nhúng Google Maps</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder="https://www.google.com/maps/embed?pb=..."
                          onChange={(e) => {
                            // Cho phép dán cả mã <iframe>, hệ thống tự lấy phần src
                            const raw = e.target.value;
                            const match = raw.match(/src=["']([^"']+)["']/);
                            field.onChange(match ? match[1] : raw);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Cách lấy: mở Google Maps → tìm địa chỉ showroom → bấm <strong>Chia sẻ</strong> → tab <strong>Nhúng bản đồ</strong> → <strong>Sao chép HTML</strong>, rồi dán vào đây (có thể dán nguyên mã iframe, hệ thống tự tách link).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {mapEmbedUrl && (
                  <iframe
                    src={mapEmbedUrl}
                    title="Xem trước bản đồ"
                    className="h-56 w-full rounded-lg border"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mạng xã hội */}
          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Mạng xã hội</CardTitle>
                <CardDescription>Để trống mục nào thì icon mạng xã hội đó sẽ không hiển thị.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <TextField control={form.control} name="facebook" label="Facebook" type="url" placeholder="https://www.facebook.com/remniji" />
                <TextField control={form.control} name="youtube" label="YouTube" type="url" placeholder="https://www.youtube.com/@remniji" />
                <TextField control={form.control} name="tiktok" label="TikTok" type="url" placeholder="https://www.tiktok.com/@remniji" />
                <TextField control={form.control} name="messenger" label="Messenger" type="url" placeholder="https://m.me/remniji" />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Số liệu */}
          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Số liệu nổi bật</CardTitle>
                <CardDescription>Khối “Con số ấn tượng” ở trang chủ. Chỉ nhập số, để trống sẽ ẩn mục đó.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <TextField control={form.control} name="statCustomers" label="Khách hàng" inputMode="numeric" placeholder="3500" />
                <TextField control={form.control} name="statYears" label="Năm kinh nghiệm" inputMode="numeric" placeholder="8" />
                <TextField control={form.control} name="statProjects" label="Công trình" inputMode="numeric" placeholder="1200" />
                <TextField control={form.control} name="statProducts" label="Mẫu rèm" inputMode="numeric" placeholder="500" />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trang chủ */}
          <TabsContent value="home">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bảng giá theo danh mục</CardTitle>
                  <CardDescription>
                    Khối bảng giá chia tab theo <Link href="/admin/danh-muc" className="font-medium underline underline-offset-4">danh mục rèm</Link> nằm ngay dưới banner trang chủ.
                    Chỉ sản phẩm “Đang bán” có bật “Hiện trong bảng giá” mới xuất hiện.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="priceTableEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between gap-4 rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Hiện bảng giá ở trang chủ</FormLabel>
                          <FormDescription>Tắt để ẩn toàn bộ khối này mà không cần ẩn sản phẩm.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} aria-label="Hiện bảng giá ở trang chủ" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <TextField
                    control={form.control}
                    name="priceTableTitle"
                    label="Tiêu đề khối"
                    placeholder="Bảng giá rèm cửa tham khảo"
                    maxLength={150}
                    description="Để trống sẽ dùng tiêu đề mặc định như gợi ý."
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cam kết &amp; video giới thiệu</CardTitle>
                  <CardDescription>Dòng cam kết bảo hành hiện ở trang chủ và trang chi tiết sản phẩm; video YouTube hiện ở khối giới thiệu.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <TextField
                    control={form.control}
                    name="warrantyText"
                    label="Chính sách bảo hành (ngắn)"
                    multiline
                    rows={2}
                    maxLength={300}
                    placeholder="Vd: Bảo hành 12 – 24 tháng, bảo trì trọn đời, đổi mới trong 7 ngày nếu lỗi sản xuất"
                  />
                  <TextField
                    control={form.control}
                    name="introVideoUrl"
                    label="Link video YouTube giới thiệu"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    description="Để trống để ẩn khối video ở trang chủ."
                  />
                  {introVideoUrl && (
                    videoId ? (
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                        title="Xem trước video giới thiệu"
                        className="aspect-video w-full max-w-xl rounded-lg border"
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <p className="text-sm text-destructive">Không nhận ra link YouTube – hãy dán dạng https://www.youtube.com/watch?v=... hoặc https://youtu.be/...</p>
                    )
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Giới thiệu */}
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>Giới thiệu cửa hàng</CardTitle>
                <CardDescription>Nội dung trang Giới thiệu và đoạn giới thiệu ngắn ở trang chủ.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <TextField control={form.control} name="aboutShort" label="Giới thiệu ngắn" multiline rows={4} placeholder="2–3 câu tóm tắt về cửa hàng, hiển thị ở trang chủ" maxLength={1000} />
                <FormField
                  control={form.control}
                  name="aboutContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nội dung trang Giới thiệu</FormLabel>
                      <RichTextEditor value={field.value ?? ""} onChange={field.onChange} minHeight={320} placeholder="Lịch sử hình thành, xưởng may, showroom, đội ngũ thi công, công trình tiêu biểu..." />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField control={form.control} name="vision" label="Tầm nhìn" multiline rows={4} maxLength={1000} />
                  <TextField control={form.control} name="mission" label="Sứ mệnh" multiline rows={4} maxLength={1000} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO */}
          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>SEO mặc định</CardTitle>
                <CardDescription>Dùng cho trang chủ và các trang chưa có tiêu đề/mô tả riêng.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                  <TextField control={form.control} name="metaTitle" label="Tiêu đề trang (meta title)" placeholder="Vd: Rèm Niji – Rèm cửa cao cấp, đo đạc & lắp đặt tận nơi TP.HCM" maxLength={160} description="Khuyến nghị 50–60 ký tự." />
                  <TextField control={form.control} name="metaDescription" label="Mô tả trang (meta description)" multiline rows={3} maxLength={320} description="Khuyến nghị 150–160 ký tự." />
                </div>
                <FormField
                  control={form.control}
                  name="ogImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ảnh chia sẻ mạng xã hội (OG image)</FormLabel>
                      <ImageFieldWithLibrary value={field.value} onChange={field.onChange} aspect="video" />
                      <FormDescription>Kích thước 1200×630px.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="sticky bottom-0 z-10 flex items-center justify-between gap-2 border-t bg-background/95 py-3 backdrop-blur">
          <p className="text-xs text-muted-foreground">
            {form.formState.isDirty ? "Có thay đổi chưa lưu." : "Lưu sẽ làm mới toàn bộ website."}
          </p>
          <SubmitButton pending={isPending} className="min-w-32">Lưu cài đặt</SubmitButton>
        </div>
      </form>
    </Form>
  );
}
