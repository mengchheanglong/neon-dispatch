import type { Position } from "./position";

/**
 * OrderStatus: the full planned delivery lifecycle (Phase 3).
 *
 * created    -> order exists but has not been queued yet (not dispatchable)
 * queued     -> ready for dispatch; this is the "waiting" state (FR1/BR3)
 * assigned   -> an eligible rider took the job
 * picked_up  -> goods collected from the shop
 * in_transit -> on the way to the destination
 * delivered  -> terminal: delivery complete (BR2)
 * cancelled  -> terminal: order withdrawn (BR2)
 *
 * A string union keeps TypeScript enforcing exhaustive switches, and
 * ORDER_STATUS_TRANSITIONS (see order-transitions.ts) encodes the
 * transitions themselves so they can be validated in one place.
 */
export const ORDER_STATUSES = [
  "created",
  "queued",
  "assigned",
  "picked_up",
  "in_transit",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Statuses counted as active deliveries for the rider invariant (BR1). */
export const ACTIVE_ORDER_STATUSES: readonly OrderStatus[] = [
  "assigned",
  "picked_up",
  "in_transit",
];

/** Statuses eligible for dispatch: only queued orders are "waiting" (BR3). */
export const DISPATCHABLE_STATUSES: readonly OrderStatus[] = ["queued"];

/**
 * Order: one delivery job, from a shop to a fixed destination.
 *
 * The order owns the delivery's *facts* (what, from, to, when it
 * entered the system). It does not own decisions or movement - those
 * are dispatch's job. `assignedRiderId` stays null until a rider
 * takes the job.
 */
export interface Order {
  /** Stable unique identifier, e.g. "order-01". */
  id: string;
  /** Shop the goods are picked up from. References Shop.id. */
  shopId: string;
  /** Drop-off point on the grid. */
  destination: Position;
  /** Rider currently responsible for the order. References Rider.id. */
  assignedRiderId: string | null;
  /** Current lifecycle state. */
  status: OrderStatus;
  /** Simulated clock tick when the order entered the queue; used to pick the oldest waiting order (FR1). */
  createdAt: number;
}
