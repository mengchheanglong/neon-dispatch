import { ACTIVE_ORDER_STATUSES } from "./order";
import type { World } from "./world";

/**
 * Domain invariants (data always true between operations).
 *
 * INV-1 (BR1): a rider has at most one active delivery. An order is
 * "active" when its status is assigned, picked_up or in_transit —
 * delivered and cancelled are terminal and no longer count.
 *
 * INV-2: a rider holding an active delivery is not available. This is
 * the order/rider consistency check: availability and assignments must
 * agree, otherwise dispatch's eligible-rider filter would pick a
 * rider who is already working (see BR1).
 */
export type InvariantViolation =
  | { rule: "one-active-delivery-per-rider"; riderId: string }
  | { rule: "available-rider-holds-active-delivery"; riderId: string };

/**
 * Checks a whole World snapshot. Returns an empty array when the
 * snapshot is consistent, otherwise one entry per violating rider.
 *
 * dispatchNext runs this over every state it produces (defense in
 * depth): the unit tests assert it too.
 */
export function checkInvariants(world: World): InvariantViolation[] {
  const activePerRider = new Map<string, number>();

  for (const order of world.orders) {
    if (order.assignedRiderId === null) continue;
    if (!ACTIVE_ORDER_STATUSES.includes(order.status)) continue;
    const riderId = order.assignedRiderId;
    activePerRider.set(riderId, (activePerRider.get(riderId) ?? 0) + 1);
  }

  const violations: InvariantViolation[] = [];
  for (const [riderId, count] of activePerRider) {
    if (count > 1) violations.push({ rule: "one-active-delivery-per-rider", riderId });
    if (world.riders.find((r) => r.id === riderId)?.isAvailable) {
      violations.push({ rule: "available-rider-holds-active-delivery", riderId });
    }
  }
  return violations;
}

/** Assert a snapshot is consistent; used to fail fast inside dispatch. */
export function assertInvariants(world: World): void {
  if (checkInvariants(world).length > 0) {
    throw new Error(`domain invariant violated (one-active-delivery-per-rider): ${JSON.stringify(checkInvariants(world))}`);
  }
}
