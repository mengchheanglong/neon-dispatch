import type { Position } from "./position";

/**
 * OrderStatus: the lifecycle of one delivery.
 *
 * pending    -> created, waiting for a rider (initial state)
 * assigned   -> a rider picked the order up as their task
 * delivered  -> rider reached the destination (terminal state)
 *
 * kept as a string union so TypeScript flags every switch that
 * misses a case, and so Phase 3 dispatch logic must handle all states.
 */
export const ORDER_STATUSES = ["pending", "assigned", "delivered"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/**
 * Order: one delivery job, from a shop to a fixed destination.
 *
 * The order owns the delivery's *facts* (what, from, to). It does not
 * own movement or decision-making - that is dispatch's job in a later
 * phase. `assignedRiderId` stays null until a rider takes the job.
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
}
