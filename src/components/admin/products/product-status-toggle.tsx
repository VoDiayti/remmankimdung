"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import type { ProductStatus } from "@/db/enums";
import { toggleProductStatus } from "@/actions/products";
import { ProductStatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/** Badge trạng thái + nút đổi nhanh Đang bán ⇄ Ẩn */
export function ProductStatusToggle({ id, status }: { id: string; status: ProductStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const label = status === "ACTIVE" ? "Ẩn sản phẩm" : "Mở bán sản phẩm";

  return (
    <div className="inline-flex items-center gap-1">
      <ProductStatusBadge status={status} />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={label}
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await toggleProductStatus(id);
                if (result.success) {
                  toast.success(result.message);
                  router.refresh();
                } else {
                  toast.error(result.message);
                }
              })
            }
          >
            {pending ? <LoaderCircle className="animate-spin" /> : status === "ACTIVE" ? <EyeOff className="text-muted-foreground" /> : <Eye className="text-emerald-600" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </div>
  );
}
