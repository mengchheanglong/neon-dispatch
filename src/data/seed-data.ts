import type { Order, Rider, Shop } from "@/domain";

/**
 * Deterministic seed data for the simulation dashboard.
 *
 * Everything is hard-coded literal data: no randomness, no clocks, no
 * Date.now(). Running the app always shows the exact same state, which
 * makes the dashboard (and later phases) easy to reason about and test.
 *
 * In later phases this file is the natural seam to replace with a store
 * or reducer that mutates state - the UI only depends on the types.
 */

export const SEED_SHOPS: Shop[] = [
  { id: "shop-01", name: "Burger Barn", location: { x: 2, y: 3 } },
  { id: "shop-02", name: "Noodle Nook", location: { x: 7, y: 6 } },
];

export const SEED_RIDERS: Rider[] = [
  { id: "rider-01", name: "Ada", location: { x: 1, y: 1 }, isAvailable: true },
  { id: "rider-02", name: "Boris", location: { x: 5, y: 5 }, isAvailable: false },
  { id: "rider-03", name: "Cleo", location: { x: 8, y: 2 }, isAvailable: true },
];

export const SEED_ORDERS: Order[] = [
  {
    id: "order-01",
    shopId: "shop-01",
    destination: { x: 4, y: 7 },
    assignedRiderId: null,
    status: "pending",
  },
  {
    id: "order-02",
    shopId: "shop-01",
    destination: { x: 6, y: 2 },
    assignedRiderId: "rider-02",
    status: "assigned",
  },
  {
    id: "order-03",
    shopId: "shop-02",
    destination: { x: 1, y: 5 },
    assignedRiderId: "rider-01",
    status: "assigned",
  },
  {
    id: "order-04",
    shopId: "shop-02",
    destination: { x: 9, y: 8 },
    assignedRiderId: null,
    status: "pending",
  },
  {
    id: "order-05",
    shopId: "shop-01",
    destination: { x: 3, y: 4 },
    assignedRiderId: "rider-01",
    status: "delivered",
  },
  {
    id: "order-06",
    shopId: "shop-02",
    destination: { x: 2, y: 8 },
    assignedRiderId: "rider-02",
    status: "delivered",
  },
];

/** One consistent snapshot of simulation start state. */
export interface SeedWorld {
  shops: Shop[];
  riders: Rider[];
  orders: Order[];
}

export function createSeedWorld(): SeedWorld {
  return {
    shops: SEED_SHOPS.map((shop) => ({ ...shop, location: { ...shop.location } })),
    riders: SEED_RIDERS.map((rider) => ({ ...rider, location: { ...rider.location } })),
    orders: SEED_ORDERS.map((order) => ({
      ...order,
      destination: { ...order.destination },
    })),
  };
}
