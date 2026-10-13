import type { Shop } from "@/domain";
import type { Order } from "@/domain";
import { StatusBadge } from "./status-badge";

/** Resolves a shop id to its display name; seed data stays consistent. */
function shopName(orders: Order, shops: Shop[]): string {
  return shops.find((s) => s.id === orders.shopId)?.name ?? orders.shopId;
}

export function OrdersPanel({ orders, shops }: { orders: Order[]; shops: Shop[] }) {
  return (
    <section className="rounded-lg border border-zinc-200 p-4">
      <h2 className="mb-3 text-lg font-semibold">Orders</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-zinc-500">
            <th className="pb-2 font-medium">Order</th>
            <th className="pb-2 font-medium">From</th>
            <th className="pb-2 font-medium">Destination</th>
            <th className="pb-2 font-medium">Rider</th>
            <th className="pb-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t border-zinc-100">
              <td className="py-2">
                {order.id}
              </td>
              <td className="py-2">{shopName(order, shops)}</td>
              <td className="py-2 font-mono">
                ({order.destination.x}, {order.destination.y})
              </td>
              <td className="py-2">{order.assignedRiderId ?? "—"}</td>
              <td className="py-2">
                <StatusBadge status={order.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
