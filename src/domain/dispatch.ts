import { assertInvariants } from "./invariants";
import { DISPATCHABLE_STATUSES } from "./order";
import type { World } from "./world";

/**
 * Dispatch (Phase 3): the core domain operation.
 *
 * MANUAL STEP ONLY. Nothing calls this automatically yet - the UI and
 * later phases decide when one dispatch attempt happens. The function
 * itself is pure: same input, same output, no Date(), no Math.random().
 *
 * Selection rules (deterministic, BR4):
 *  - order: oldest `createdAt` first; ties broken by order id (lower id wins).
 *  - rider: lowest rider id among riders with isAvailable === true (BR5).
 */
export type DispatchFailureReason = "no-waiting-orders" | "no-available-riders";

/**
 * Explicit result instead of null/throw:
 *  - dispatched: success; `world` is a NEW snapshot with both updates
 *    (order status + assignedRiderId and rider availability) applied
 *    consistently (FR2, FR3, FR4).
 *  - failed: why nothing happened, so callers can branch on it; the
 *    world is left exactly as passed in (FR5).
 */
export type DispatchResult =
  | { kind: "dispatched"; world: World; orderId: string; riderId: string }
  | { kind: "failed"; world: World; reason: DispatchFailureReason };

export function dispatchNext(world: World): DispatchResult {
  // 1. Pick the oldest waiting order (nullish-safe compare + id tie-break).
  const waiting = world.orders
    .filter((order) => DISPATCHABLE_STATUSES.includes(order.status))
    .sort((a, b) => a.createdAt - b.createdAt || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const target = waiting[0];
  if (!target) {
    return { kind: "failed", reason: "no-waiting-orders", world };
  }

  // 2. Pick the deterministic rider: lowest id among available ones.
  const rider = [...world.riders]
    .filter((r) => r.isAvailable)
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))[0];
  if (!rider) {
    return { kind: "failed", reason: "no-available-riders", world };
  }

  // 3. Produce the new snapshot: order and rider update together, so
  //    the pair is consistent by construction, not by side effect.
  const nextWorld: World = {
    ...world,
    orders: world.orders.map((order) =>
      order.id === target.id
        ? { ...order, status: "assigned", assignedRiderId: rider.id }
        : order,
    ),
    riders: world.riders.map((r) =>
      r.id === rider.id ? { ...r, isAvailable: false } : r,
    ),
  };

  // 4. Defense in depth: the produced snapshot must satisfy the rider
  //    invariant; a bug in selection would surface here, not corrupt state.
  assertInvariants(nextWorld);

  return { kind: "dispatched", world: nextWorld, orderId: target.id, riderId: rider.id };
}
