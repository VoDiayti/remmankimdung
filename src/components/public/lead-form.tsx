"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CircleCheck, LoaderCircle, Package, Send } from "lucide-react";
import { submitLead } from "@/actions/leads-public";
import { leadFormSchema, type LeadFormInput, type LeadFormValues } from "@/lib/validations/lead";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type LeadFormProps = {
  type: "QUOTE" | "CONSULTATION" | "CONTACT";
  /** Danh sách danh mục rèm để khách chọn "Loại rèm quan tâm" */
  categories?: { id: string; name: string }[];
  /** Danh mục chọn sẵn (trang chi tiết danh mục / sản phẩm) */
  defaultCategoryId?: string;
  /** Sản phẩm đang xem (trang chi tiết sản phẩm) – ẩn ô chọn danh mục, hiện tên sản phẩm */
  productId?: string;
  productName?: string;
  variant?: "full" | "compact";
  title?: string;
  description?: string;
  submitLabel?: string;
  /** Tên cửa hàng hiển thị trong câu thông báo */
  storeName?: string;
  /** Hiển thị trên nền tối (chữ trắng) */
  tone?: "default" | "light";
  className?: string;
};

const NONE = "__none__";

/** Form yêu cầu báo giá / tư vấn / liên hệ dùng chung cho trang công khai */
export function LeadForm({
  type,
  categories = [],
  defaultCategoryId,
  productId,
  productName,
  variant = "full",
  title,
  description,
  submitLabel,
  storeName,
  tone = "default",
  className,
}: LeadFormProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const defaultValues: LeadFormInput = {
    type,
    fullName: "",
    phone: "",
    email: "",
    address: "",
    size: "",
    categoryId: defaultCategoryId ?? "",
    productId: productId ?? "",
    message: "",
    source: pathname,
    website: "",
  };

  const form = useForm<LeadFormInput, unknown, LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues,
  });

  const isContact = type === "CONTACT";
  const isCompact = variant === "compact";
  const showCategorySelect = !isContact && !productId && categories.length > 0;
  const showEmail = isContact || !isCompact;
  const showAddress = !isContact && !isCompact;
  const showSize = !isContact;
  const showMessage = isContact || !isCompact;

  const onSubmit = (values: LeadFormValues) => {
    startTransition(async () => {
      const result = await submitLead({
        ...values,
        type,
        source: pathname,
        productId: productId ?? values.productId,
        categoryId: values.categoryId || defaultCategoryId || "",
      });
      if (result.success) {
        const msg = result.message ?? `Đã nhận yêu cầu! Nhân viên ${storeName || "chúng tôi"} sẽ gọi lại trong giờ làm việc.`;
        toast.success(msg);
        setSuccessMessage(msg);
        form.reset(defaultValues);
        return;
      }
      toast.error(result.message);
      for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
        if (messages?.[0]) form.setError(field as keyof LeadFormInput, { type: "server", message: messages[0] });
      }
    });
  };

  // Điện thoại: 1 cột; từ sm: 2 cột (compact: họ tên + SĐT chiếm cả hàng, loại rèm + kích thước cùng hàng)
  const span2 = "sm:col-span-2";
  const labelClass = cn("text-sm font-medium", tone === "light" && "text-white/90");
  const inputClass = cn("h-11 bg-background text-base md:h-10 md:text-sm", tone === "light" && "border-white/20 bg-white text-foreground");
  const heading = title ?? (isContact ? "Gửi liên hệ" : type === "CONSULTATION" ? "Đăng ký tư vấn miễn phí" : "Nhận báo giá rèm cửa");
  const button = submitLabel ?? (isContact ? "Gửi liên hệ" : type === "CONSULTATION" ? "Đăng ký tư vấn" : "Nhận báo giá ngay");

  if (successMessage) {
    return (
      <div className={cn("rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center text-foreground sm:p-8", className)}>
        <CircleCheck className="mx-auto size-14 text-emerald-600" />
        <h3 className="mt-4 text-xl font-bold text-emerald-800">{isContact ? "Đã gửi liên hệ thành công" : "Đã nhận yêu cầu báo giá"}</h3>
        <p className="mt-2 text-muted-foreground">{successMessage}</p>
        <Button type="button" variant="outline" className="mt-6 h-11" onClick={() => setSuccessMessage(null)}>
          {isContact ? "Gửi liên hệ khác" : "Gửi yêu cầu khác"}
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      {(heading || description) && (
        <div className="mb-5">
          <h3 className={cn("text-xl font-bold md:text-2xl", tone === "light" ? "text-white" : "text-brand-dark")}>{heading}</h3>
          {description && <p className={cn("mt-1.5 text-sm", tone === "light" ? "text-white/80" : "text-muted-foreground")}>{description}</p>}
        </div>
      )}

      {productId && productName && (
        <p className={cn("mb-4 flex items-start gap-2 rounded-xl border border-primary/15 bg-brand-light p-3 text-sm", tone === "light" && "border-white/20 bg-white/10 text-white")}>
          <Package className={cn("mt-0.5 size-4 shrink-0", tone === "light" ? "text-amber-300" : "text-primary")} />
          <span>
            Sản phẩm quan tâm: <strong className={tone === "light" ? "text-white" : "text-foreground"}>{productName}</strong>
          </span>
        </p>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Honeypot chống spam – người dùng thật không thấy trường này */}
          <input type="text" {...form.register("website")} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem className={isCompact ? span2 : undefined}>
                  <FormLabel className={labelClass}>
                    Họ và tên <span className="text-primary">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nguyễn Văn A" autoComplete="name" className={inputClass} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className={isCompact ? span2 : undefined}>
                  <FormLabel className={labelClass}>
                    Số điện thoại <span className="text-primary">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" inputMode="tel" placeholder="09xx xxx xxx" autoComplete="tel" className={inputClass} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showEmail && (
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className={isContact ? span2 : undefined}>
                    <FormLabel className={labelClass}>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" inputMode="email" placeholder="email@example.com" autoComplete="email" className={inputClass} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {showAddress && (
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>Địa chỉ lắp đặt</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="VD: Quận 7, TP. HCM" autoComplete="street-address" className={inputClass} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {showCategorySelect && (
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem className={isCompact ? undefined : showSize ? undefined : span2}>
                    <FormLabel className={labelClass}>Loại rèm quan tâm</FormLabel>
                    <Select value={field.value || NONE} onValueChange={(v) => field.onChange(v === NONE ? "" : v)}>
                      <FormControl>
                        <SelectTrigger className={cn("w-full data-[size=default]:h-11 md:data-[size=default]:h-10", inputClass)}>
                          <SelectValue placeholder="Chọn loại rèm" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE}>Chưa rõ – cần tư vấn</SelectItem>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {showSize && (
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem className={showCategorySelect ? undefined : span2}>
                    <FormLabel className={labelClass}>Kích thước / số cửa</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="VD: 2 cửa 2,5 × 2,8 m" className={inputClass} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {showMessage && (
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className={span2}>
                    <FormLabel className={labelClass}>{isContact ? "Nội dung" : "Ghi chú"}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={isContact ? 5 : 3}
                        placeholder={isContact ? "Bạn cần chúng tôi hỗ trợ điều gì?" : "Màu sắc, chất liệu mong muốn, thời gian lắp đặt, câu hỏi cần tư vấn..."}
                        className={cn("min-h-24 text-base md:text-sm", tone === "light" && "border-white/20 bg-white text-foreground")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <Button type="submit" disabled={isPending} size="lg" className="h-12 w-full bg-cta text-base font-semibold text-cta-foreground hover:bg-cta-hover">
            {isPending ? <LoaderCircle className="size-5 animate-spin" /> : <Send className="size-5" />}
            {isPending ? "Đang gửi..." : button}
          </Button>
          <p className={cn("text-center text-xs", tone === "light" ? "text-white/70" : "text-muted-foreground")}>
            Đo đạc tận nơi miễn phí. Thông tin của bạn được bảo mật, chỉ dùng để tư vấn – báo giá theo{" "}
            <Link
              href="/chinh-sach-bao-mat"
              className={cn("font-medium underline underline-offset-2", tone === "light" ? "text-white hover:text-amber-300" : "text-primary hover:text-brand-dark")}
            >
              chính sách bảo mật
            </Link>
            .
          </p>
        </form>
      </Form>
    </div>
  );
}
