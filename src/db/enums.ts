/**
 * Các enum của database (lưu dạng TEXT trong SQLite/D1).
 * File này không phụ thuộc gì nên dùng được ở cả server lẫn client component.
 */
export const Role = { ADMIN: "ADMIN", EDITOR: "EDITOR" } as const;
export type Role = (typeof Role)[keyof typeof Role];
export const ROLE_VALUES = Object.values(Role) as [Role, ...Role[]];

export const PostStatus = { DRAFT: "DRAFT", PUBLISHED: "PUBLISHED", SCHEDULED: "SCHEDULED" } as const;
export type PostStatus = (typeof PostStatus)[keyof typeof PostStatus];
export const POST_STATUS_VALUES = Object.values(PostStatus) as [PostStatus, ...PostStatus[]];

/** Trạng thái sản phẩm: ACTIVE = đang bán (hiện ngoài web), HIDDEN = ẩn */
export const ProductStatus = { ACTIVE: "ACTIVE", HIDDEN: "HIDDEN" } as const;
export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];
export const PRODUCT_STATUS_VALUES = Object.values(ProductStatus) as [ProductStatus, ...ProductStatus[]];

/** Đơn vị tính giá: M2 = đ/m², SET = đ/bộ, METER = đ/mét dài */
export const PriceUnit = { M2: "M2", SET: "SET", METER: "METER" } as const;
export type PriceUnit = (typeof PriceUnit)[keyof typeof PriceUnit];
export const PRICE_UNIT_VALUES = Object.values(PriceUnit) as [PriceUnit, ...PriceUnit[]];

/** Loại yêu cầu từ khách: QUOTE = báo giá, CONSULTATION = tư vấn, CONTACT = liên hệ chung */
export const LeadType = { QUOTE: "QUOTE", CONSULTATION: "CONSULTATION", CONTACT: "CONTACT" } as const;
export type LeadType = (typeof LeadType)[keyof typeof LeadType];
export const LEAD_TYPE_VALUES = Object.values(LeadType) as [LeadType, ...LeadType[]];

/** Tiến trình xử lý yêu cầu: Mới → Đã liên hệ → Đã báo giá → Đã chốt (hoặc Hủy) */
export const LeadStatus = { NEW: "NEW", CONTACTED: "CONTACTED", QUOTED: "QUOTED", WON: "WON", CANCELLED: "CANCELLED" } as const;
export type LeadStatus = (typeof LeadStatus)[keyof typeof LeadStatus];
export const LEAD_STATUS_VALUES = Object.values(LeadStatus) as [LeadStatus, ...LeadStatus[]];
