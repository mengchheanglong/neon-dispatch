import type { Order, OrderStatus } from "./order";

/**
 * Allowed status transitions for an order.
 *
 * Modeled explicitly instead of as if/else chains so the lifecycle is
 * data: the validator below, tests and future phase code all read the
 * same single source of truth.
 *
 * created   -> queued | cancelled      (entering or leaving the queue)
 * queued    -> assigned | cancelled
 * assigned  -> picked_up | cancelled   (cancel before the shop visit)
 * picked_up -> in_transit | cancelled  (cancel while still retrievable)
 * in_transit-> delivered               (committed: must finish delivery)
 * delivered -> (terminal)
 * cancelled -> (terminal)
 */
export const ORDER_STATUS_TRANSITIONS: Readonly<
  Record<OrderStatus, readonly OrderStatus[]>
> = {
  created: ["queued", "cancelled"],
  queued: ["assigned", "cancelled"],
  assigned: ["picked_up", "cancelled"],
  picked_up: ["in_transit", "cancelled"],
  in_transit: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

/** True when the lifecycle table allows moving from one status to another. */
export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return new Set(ORDER_STATUS_TRANSITIONS[from]).has(to);
}

/**
 * Explicit result of asking for a status transition.
 *
 * `{ kind: "rejected" }` - the transition is outside the lifecycle table.
 */
export type TransitionResult =
  | { kind: "accepted"; order: Order }
  | { kind: "rejected"; reason: "invalid-transition"; from: OrderStatus; to: OrderStatus };

/** Returns a new order with the requested status if the transition is valid. */
export function transitionStatus(order: Order, to: OrderStatus): TransitionResult {
  if (!canTransition(order.status, to)) {
    return {
      kind: "rejected",
      reason: "invalid-transition",
      from: order.status,
      to,
    };
  }
  return { kind: "accepted", order: { ...order, status: to } };
}
