"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LEAD_STATUS_VALUES, type LeadStatus } from "@/db/enums";
import { LEAD_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { updateLeadStatus } from "@/actions/leads";
import { LeadStatusBadge } from "@/components/admin/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/** Select đổi trạng thái xử lý yêu cầu báo giá – lưu ngay khi chọn (dùng ở trang chi tiết và inline trong bảng) */
export function LeadStatusSelect({ id, status, className, size = "default" }: { id: string; status: LeadStatus; className?: string; size?: "sm" | "default" }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(status);

  return (
    <Select
      value={optimistic}
      disabled={pending}
      onValueChange={(value) =>
        startTransition(async () => {
          setOptimistic(value as LeadStatus);
          const result = await updateLeadStatus(id, value);
          if (result.success) {
            toast.success(result.message);
            router.refresh();
          } else {
            toast.error(result.message);
          }
        })
      }
    >
      <SelectTrigger size={size} className={cn("w-full", size === "sm" && "h-8 border-transparent bg-transparent px-1.5 shadow-none hover:bg-muted", className)} aria-label="Trạng thái xử lý">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LEAD_STATUS_VALUES.map((s) => (
          <SelectItem key={s} value={s}>
            <LeadStatusBadge status={s} /> <span className="sr-only">{LEAD_STATUS_LABELS[s]}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
