import {
  Blinds, ClipboardList, FileText, FolderOpen, Handshake, Image as ImageIcon, LayoutDashboard, LayoutList, MessageCircle, Package, PanelTop, Quote,
  Settings, Tag, UserCog, Wrench, type LucideIcon,
} from "lucide-react";

export type AdminNavItem = { href: string; label: string; icon: LucideIcon; adminOnly?: boolean };
export type AdminNavGroup = { title: string; items: AdminNavItem[] };

/** Cấu trúc menu admin – thêm module mới tại đây */
export const ADMIN_NAV: AdminNavGroup[] = [
  {
    title: "Tổng quan",
    items: [{ href: "/admin", label: "Bảng điều khiển", icon: LayoutDashboard }],
  },
  {
    title: "Sản phẩm",
    items: [
      { href: "/admin/danh-muc", label: "Danh mục rèm", icon: Blinds },
      { href: "/admin/loai-rem", label: "Loại rèm", icon: LayoutList },
      { href: "/admin/san-pham", label: "Sản phẩm", icon: Package },
      { href: "/admin/dich-vu", label: "Dịch vụ", icon: Wrench },
    ],
  },
  {
    title: "Khách hàng",
    items: [{ href: "/admin/bao-gia", label: "Yêu cầu báo giá", icon: ClipboardList }],
  },
  {
    title: "Nội dung",
    items: [
      { href: "/admin/bai-viet", label: "Bài viết", icon: FileText },
      { href: "/admin/chuyen-muc", label: "Chuyên mục", icon: FolderOpen },
      { href: "/admin/the", label: "Thẻ (tag)", icon: Tag },
    ],
  },
  {
    title: "Trang chủ",
    items: [
      { href: "/admin/banner", label: "Banner", icon: PanelTop },
      { href: "/admin/cam-nhan", label: "Cảm nhận khách hàng", icon: Quote },
      { href: "/admin/faq", label: "Câu hỏi thường gặp", icon: MessageCircle },
      { href: "/admin/doi-tac", label: "Đối tác / Thương hiệu", icon: Handshake },
    ],
  },
  {
    title: "Hệ thống",
    items: [
      { href: "/admin/thu-vien-anh", label: "Thư viện ảnh", icon: ImageIcon },
      { href: "/admin/cai-dat", label: "Cài đặt chung", icon: Settings },
      { href: "/admin/tai-khoan", label: "Tài khoản admin", icon: UserCog, adminOnly: true },
    ],
  },
];
