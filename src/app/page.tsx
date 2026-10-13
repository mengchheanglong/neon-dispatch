import { OrdersPanel } from "@/components/orders-panel";
import { RidersPanel } from "@/components/riders-panel";
import { ShopsPanel } from "@/components/shops-panel";
import { createSeedWorld } from "@/data/seed-data";

/**
 * Dashboard page (Phase 2).
 *
 * - Server Component: nothing is interactive yet, so no "use client",
 *   no hooks, no state.
 * - Data comes straight from the deterministic seed. Later phases swap
 *   this source for a store / reducer without touching the layout.
 */
export default function DashboardPage() {
  const { shops, riders, orders } = createSeedWorld();
  const availableRiders = riders.filter((r) => r.isAvailable).length;
  const queuedOrders = orders.filter((o) => o.status === "queued").length;

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Neon Dispatch</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {shops.length} shops · {riders.length} riders ({availableRiders} available) ·{" "}
            {orders.length} orders ({queuedOrders} queued)
          </p>
        </header>

        <div className="flex flex-col gap-6">
          <div className="grid gap-6 md:grid-cols-2">
            <ShopsPanel shops={shops} />
            <RidersPanel riders={riders} />
          </div>
          <OrdersPanel orders={orders} shops={shops} />
        </div>
      </main>
    </div>
  );
}
