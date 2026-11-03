import { Building, Headset, Ruler, Scissors, ShieldCheck, Sparkles, Truck, Wrench, type LucideIcon } from "lucide-react";

/** Icon lucide cho phép chọn cho dịch vụ (lưu tên icon trong Service.icon) */
export const SERVICE_ICONS: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "Ruler", label: "Thước đo – tư vấn, đo đạc", icon: Ruler },
  { value: "Wrench", label: "Cờ lê – lắp đặt, sửa chữa", icon: Wrench },
  { value: "ShieldCheck", label: "Khiên – bảo hành, bảo trì", icon: ShieldCheck },
  { value: "Sparkles", label: "Lấp lánh – vệ sinh, giặt rèm", icon: Sparkles },
  { value: "Building", label: "Tòa nhà – rèm công trình, văn phòng", icon: Building },
  { value: "Truck", label: "Xe tải – vận chuyển, giao hàng", icon: Truck },
  { value: "Headset", label: "Tai nghe – hỗ trợ khách hàng", icon: Headset },
  { value: "Scissors", label: "Kéo – may đo, gia công", icon: Scissors },
];

export const SERVICE_ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(SERVICE_ICONS.map((i) => [i.value, i.icon]));
