// Nhãn tiếng Việt cho các enum trong database + dữ liệu dùng chung
import type { LeadStatus, LeadType, PostStatus, PriceUnit, ProductStatus, Role } from "@/db/enums";

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Quản trị viên",
  EDITOR: "Biên tập viên",
};

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  DRAFT: "Nháp",
  PUBLISHED: "Đã xuất bản",
  SCHEDULED: "Hẹn giờ đăng",
};

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  ACTIVE: "Đang bán",
  HIDDEN: "Ẩn",
};

/** Đơn vị tính giá hiển thị sau số tiền, vd "350.000 đ/m²" */
export const PRICE_UNIT_LABELS: Record<PriceUnit, string> = {
  M2: "đ/m²",
  SET: "đ/bộ",
  METER: "đ/mét",
};

export const LEAD_TYPE_LABELS: Record<LeadType, string> = {
  QUOTE: "Yêu cầu báo giá",
  CONSULTATION: "Tư vấn",
  CONTACT: "Liên hệ",
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Mới",
  CONTACTED: "Đã liên hệ",
  QUOTED: "Đã báo giá",
  WON: "Đã chốt",
  CANCELLED: "Hủy",
};

/** Khoảng giá (VNĐ, so với Product.priceFrom) dùng cho bộ lọc sản phẩm */
export const PRICE_RANGES = [
  { value: "duoi-300", label: "Dưới 300.000 đ", min: 0, max: 300_000 },
  { value: "300-500", label: "300.000 – 500.000 đ", min: 300_000, max: 500_000 },
  { value: "500-800", label: "500.000 – 800.000 đ", min: 500_000, max: 800_000 },
  { value: "tren-800", label: "Trên 800.000 đ", min: 800_000, max: Number.MAX_SAFE_INTEGER },
] as const;

/** Không gian lắp đặt (lưu slug trong Product.rooms dạng mảng JSON) */
export const ROOM_OPTIONS = [
  { value: "phong-khach", label: "Phòng khách" },
  { value: "phong-ngu", label: "Phòng ngủ" },
  { value: "phong-bep", label: "Phòng bếp – ăn" },
  { value: "phong-tam", label: "Phòng tắm" },
  { value: "phong-tre-em", label: "Phòng trẻ em" },
  { value: "cua-di", label: "Cửa đi – ban công" },
  { value: "van-phong", label: "Văn phòng" },
  { value: "phong-hop", label: "Phòng họp" },
  { value: "cua-hang", label: "Cửa hàng – showroom" },
] as const;
export type RoomValue = (typeof ROOM_OPTIONS)[number]["value"];
export const ROOM_LABELS: Record<string, string> = Object.fromEntries(ROOM_OPTIONS.map((r) => [r.value, r.label]));

/** Menu điều hướng trang công khai */
export const PUBLIC_NAV = [
  { href: "/", label: "Trang chủ" },
  { href: "/gioi-thieu", label: "Giới thiệu" },
  { href: "/danh-muc", label: "Danh mục rèm" },
  { href: "/san-pham", label: "Sản phẩm" },
  { href: "/dich-vu", label: "Dịch vụ" },
  { href: "/tin-tuc", label: "Tin tức" },
  { href: "/lien-he", label: "Liên hệ" },
] as const;

/** Số bài / sản phẩm mỗi trang */
export const PAGE_SIZE = 12;
export const ADMIN_PAGE_SIZE = 20;
