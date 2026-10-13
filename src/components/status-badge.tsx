import type { OrderStatus } from "@/domain";

/** Tailwind classes per status - plain color mapping, no state logic. */
const STATUS_STYLES: Record<OrderStatus, string> = {
  created: "bg-zinc-100 text-zinc-700",
  queued: "bg-amber-100 text-amber-800",
  assigned: "bg-sky-100 text-sky-800",
  picked_up: "bg-indigo-100 text-indigo-800",
  in_transit: "bg-violet-100 text-violet-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}
