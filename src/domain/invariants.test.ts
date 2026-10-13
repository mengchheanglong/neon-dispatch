import { describe, expect, it } from "vitest";

import {
  ACTIVE_ORDER_STATUSES,
  checkInvariants,
  type Order,
  type Rider,
  type World,
} from "./index";
import { createSeedWorld } from "../data/seed-data";

/** Minimal order; status/assignment overridden per case. */
function makeOrder(status: Order["status"]): Order {
  return {
    id: "order-01",
    shopId: "shop-01",
    destination: { x: 1, y: 1 },
    assignedRiderId: "rider-01",
    status,
    createdAt: 1,
  };
}

function makeRider(isAvailable: boolean): Rider {
  return { id: "rider-01", name: "rider", location: { x: 0, y: 0 }, isAvailable };
}

/** Riders referenced by an active order must be marked unavailable. */
function assertActiveRidersUnavailable(world: World): void {
  const busyRiderIds = new Set(
    world.orders
      .filter((o) => o.assignedRiderId !== null && ACTIVE_ORDER_STATUSES.includes(o.status))
      .map((o) => o.assignedRiderId),
  );
  for (const rider of world.riders) {
    if (busyRiderIds.has(rider.id)) {
      expect(rider.isAvailable, `${rider.id} holds active work but is marked available`).toBe(
        false,
      );
    }
  }
}

describe("seed data invariants", () => {
  it("marks every rider with an active assignment as unavailable", () => {
    const world = createSeedWorld();
    // Ada (order-03, assigned) and Boris (order-02, assigned) must read false.
    expect(world.riders.find((r) => r.id === "rider-01")?.isAvailable).toBe(false);
    expect(world.riders.find((r) => r.id === "rider-02")?.isAvailable).toBe(false);
    assertActiveRidersUnavailable(world);
  });

  it("never gives a rider two active orders", () => {
    expect(checkInvariants(createSeedWorld())).toEqual([]);
  });

  it("does not count delivered orders as active work", () => {
    // A delivered order with a rider attached must not violate either rule,
    // even if the rider is otherwise free.
    const world: World = {
      shops: [],
      riders: [makeRider(true)],
      orders: [makeOrder("delivered")],
    };
    expect(checkInvariants(world)).toEqual([]);
  });
});

describe("inconsistent order/rider state", () => {
  it("flags a rider that is available while holding an active delivery", () => {
    const world: World = {
      shops: [],
      riders: [makeRider(true)],
      orders: [makeOrder("assigned")],
    };
    expect(checkInvariants(world)).toEqual([
      { rule: "available-rider-holds-active-delivery", riderId: "rider-01" },
    ]);
  });

  it("flags counts from all active statuses (picked_up, in_transit)", () => {
    for (const status of ["picked_up", "in_transit"] as const) {
      const world: World = {
        shops: [],
        riders: [makeRider(true)],
        orders: [makeOrder(status)],
      };
      expect(checkInvariants(world)).toEqual([
        { rule: "available-rider-holds-active-delivery", riderId: "rider-01" },
      ]);
    }
  });
});
