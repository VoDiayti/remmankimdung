import { desc } from "drizzle-orm";
import { db, leads } from "@/db";
import { getSessionUser } from "@/lib/auth-guard";
import { LEAD_STATUS_LABELS, LEAD_TYPE_LABELS } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/format";
import { leadFilterWhere, parseLeadFilter } from "@/lib/validations/lead-admin";

/** Escape một ô CSV: bọc trong dấu nháy kép, nhân đôi dấu nháy bên trong */
function csvCell(value: string | number | null | undefined): string {
  if (value == null) return '""';
  const s = String(value).replace(/\r?\n/g, "\n");
  return `"${s.replace(/"/g, '""')}"`;
}

const HEADER = [
  "Thời gian", "Loại", "Họ tên", "Điện thoại", "Email", "Địa chỉ lắp đặt", "Kích thước / số cửa", "Danh mục rèm", "Sản phẩm", "Mã sản phẩm",
  "Ghi chú khách", "Trạng thái", "Ghi chú nội bộ", "Nguồn",
];

/**
 * GET /api/admin/bao-gia/export?q=&status=&type=&category=&product=
 * Xuất danh sách yêu cầu báo giá (theo cùng bộ lọc của trang /admin/bao-gia) ra CSV UTF-8 có BOM để Excel mở đúng tiếng Việt.
 */
export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return new Response("Bạn cần đăng nhập.", { status: 401 });

  const { searchParams } = new URL(request.url);
  const where = leadFilterWhere(parseLeadFilter(searchParams));

  const items = await db.query.leads.findMany({
    where,
    orderBy: [desc(leads.createdAt)],
    with: { category: { columns: { name: true } }, product: { columns: { name: true, code: true } } },
  });

  const rows = items.map((lead) =>
    [
      formatDateTime(lead.createdAt),
      LEAD_TYPE_LABELS[lead.type],
      lead.fullName,
      lead.phone,
      lead.email,
      lead.address,
      lead.size,
      lead.category?.name,
      lead.product?.name,
      lead.product?.code,
      lead.message,
      LEAD_STATUS_LABELS[lead.status],
      lead.adminNote,
      lead.source,
    ]
      .map(csvCell)
      .join(",")
  );

  const BOM = "﻿";
  const csv = BOM + [HEADER.map(csvCell).join(","), ...rows].join("\r\n") + "\r\n";
  const filename = `bao-gia-${formatDate(new Date(), "yyyy-MM-dd")}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
