import { describe, expect, it } from "vitest";

import { checkInvariants, dispatchNext } from "./index";
import { createSeedWorld } from "../data/seed-data";
import type { Order, Rider, World } from "./index";

/** Tiny factory for hand-built worlds; mirrors the seed invariants. */
function makeOrder(partial: Partial<Order> & Pick<Order, "id">): Order {
  return {
    shopId: "shop-01",
    destination: { x: 1, y: 1 },
    assignedRiderId: null,
    status: "queued",
    createdAt: 1,
    ...partial,
  };
}

function makeRider(partial: Partial<Rider> & Pick<Rider, "id">): Rider {
  return {
    name: partial.id ?? "rider",
    location: { x: 0, y: 0 },
    isAvailable: true,
    ...partial,
  };
}

function makeWorld(orders: Order[], riders: Rider[]): World {
  return { shops: [], riders, orders };
}

describe("dispatchNext - order selection (FR1, BR4)", () => {
  it("selects the oldest waiting order", () => {
    const world = makeWorld(
      [
        makeOrder({ id: "order-b", createdAt: 5 }),
        makeOrder({ id: "order-a", createdAt: 2 }),
        makeOrder({ id: "order-c", createdAt: 9 }),
      ],
      [makeRider({ id: "rider-01" })],
    );

    const result = dispatchNext(world);

    expect(result.kind).toBe("dispatched");
    if (result.kind !== "dispatched") throw new Error("unreachable");
    expect(result.orderId).toBe("order-a");
  });

  it("breaks equal createdAt ties by lower order id", () => {
    const world = makeWorld(
      [
        makeOrder({ id: "order-b", createdAt: 2 }),
        makeOrder({ id: "order-a", createdAt: 2 }),
      ],
      [makeRider({ id: "rider-01" })],
    );

    const result = dispatchNext(world);

    expect(result.kind).toBe("dispatched");
    if (result.kind !== "dispatched") throw new Error("unreachable");
    expect(result.orderId).toBe("order-a");
  });
});

describe("dispatchNext - rider selection and consistent update (FR2, FR3, FR4, BR5)", () => {
  it("assigns the available rider with lowest id and updates order plus rider", () => {
    const world = makeWorld([makeOrder({ id: "order-01" })], [
      makeRider({ id: "rider-03", isAvailable: true }),
      makeRider({ id: "rider-01", isAvailable: true }),
      makeRider({ id: "rider-02", isAvailable: false }),
    ]);

    const result = dispatchNext(world);

    expect(result.kind).toBe("dispatched");
    if (result.kind !== "dispatched") throw new Error("unreachable");

    // deterministic rider choice (BR5)
    expect(result.riderId).toBe("rider-01");

    // FR4: order status + assignedRiderId both updated
    const dispatchedOrder = result.world.orders.find((o) => o.id === result.orderId);
    expect(dispatchedOrder?.status).toBe("assigned");
    expect(dispatchedOrder?.assignedRiderId).toBe(result.riderId);

    // FR3: the selected rider is busy afterwards
    const assignedRider = result.world.riders.find((r) => r.id === result.riderId);
    expect(assignedRider?.isAvailable).toBe(false);
  });

  it("does not give a busy rider another active delivery (BR1)", () => {
    const world = makeWorld(
      [makeOrder({ id: "order-01", assignedRiderId: null, status: "queued" })],
      [
        makeRider({ id: "rider-01", isAvailable: false }),
        makeRider({ id: "rider-02", isAvailable: true }),
      ],
    );

    const result = dispatchNext(world);

    expect(result.kind).toBe("dispatched");
    if (result.kind !== "dispatched") throw new Error("unreachable");
    // busy rider-01 must be untouched; work goes to rider-02
    expect(result.riderId).toBe("rider-02");
    expect(result.world.riders.find((r) => r.id === "rider-01")?.isAvailable).toBe(false);

    // a hand-crafted double assignment is flagged by the invariant checker
    const doubleAssigned: World = {
      ...world,
      orders: [
        makeOrder({ id: "order-x", assignedRiderId: "rider-02", status: "in_transit" }),
        makeOrder({ id: "order-y", assignedRiderId: "rider-02", status: "assigned" }),
      ],
      riders: [makeRider({ id: "rider-02", isAvailable: false })],
    };
    expect(checkInvariants(doubleAssigned)).toEqual([
      { rule: "one-active-delivery-per-rider", riderId: "rider-02" },
    ]);
  });

  it("passes the invariant checker on a freshly dispatched world", () => {
    const result = dispatchNext(createSeedWorld());
    expect(result.kind).toBe("dispatched");
    if (result.kind !== "dispatched") throw new Error("unreachable");
    expect(checkInvariants(result.world)).toEqual([]);
  });
});

describe("dispatchNext - failure modes (FR5, BR3)", () => {
  it("returns the same world unchanged when no riders are available", () => {
    const world = makeWorld([makeOrder({ id: "order-01" })], [
      makeRider({ id: "rider-01", isAvailable: false }),
    ]);

    const result = dispatchNext(world);

    expect(result).toEqual({
      kind: "failed",
      reason: "no-available-riders",
      world,
    });
    // unchanged means literally the same snapshot
    expect(result.world).toBe(world);
  });

  it("returns a failure when there are no waiting orders", () => {
    const world = makeWorld(
      [
        makeOrder({ id: "order-01", status: "delivered", assignedRiderId: "rider-01" }),
        makeOrder({ id: "order-02", status: "cancelled" }),
      ],
      [makeRider({ id: "rider-01" })],
    );

    const result = dispatchNext(world);

    expect(result).toEqual({ kind: "failed", reason: "no-waiting-orders", world });
  });

  it("treats created (not yet queued) orders as not waiting (BR3)", () => {
    const world = makeWorld(
      [makeOrder({ id: "order-01", status: "created" })],
      [makeRider({ id: "rider-01" })],
    );

    const result = dispatchNext(world);

    expect(result.kind).toBe("failed");
    if (result.kind !== "failed") throw new Error("unreachable");
    expect(result.reason).toBe("no-waiting-orders");
  });

  it("dispatches the seed queue: oldest queued order first", () => {
    const result = dispatchNext(createSeedWorld());

    // Ada and Boris hold the seed's active orders; Cleo (rider-03) is free.
    expect(result.kind).toBe("dispatched");
    if (result.kind !== "dispatched") throw new Error("unreachable");
    expect(result.orderId).toBe("order-01"); // createdAt 1, oldest queued
    expect(result.riderId).toBe("rider-03"); // only available rider
  });
});

describe("dispatchNext - determinism across riders (BR4, BR5)", () => {
  it("keeps choosing the lowest available rider id over repeated dispatches", () => {
    let world = makeWorld(
      [
        makeOrder({ id: "order-01", createdAt: 1 }),
        makeOrder({ id: "order-02", createdAt: 2 }),
        makeOrder({ id: "order-03", createdAt: 3 }),
        // stays in the queue: keeps the no-available-riders path reachable
        makeOrder({ id: "order-04", createdAt: 4 }),
      ],
      [
        makeRider({ id: "rider-02" }),
        makeRider({ id: "rider-01" }),
        makeRider({ id: "rider-03" }),
      ],
    );

    for (let i = 1; i <= 3; i++) {
      const result = dispatchNext(world);
      expect(result.kind).toBe("dispatched");
      if (result.kind !== "dispatched") throw new Error("unreachable");
      expect(result.orderId).toBe(`order-0${i}`);
      expect(result.riderId).toBe(`rider-0${i}`);
      world = result.world;
    }

    // everyone busy now; further failure is deterministic too
    expect(dispatchNext(world)).toEqual({
      kind: "failed",
      reason: "no-available-riders",
      world,
    });
  });
});

describe("dispatchNext - inconsistent inputs fail fast", () => {
  it("refuses to dispatch onto a rider that already holds an active order", () => {
    // Input is inconsistent (rider-01 available yet active); the lowest-id
    // selection would pick them, so instead of corrupting the state the
    // operation throws before returning.
    const world = makeWorld(
      [
        makeOrder({ id: "order-x", assignedRiderId: "rider-01", status: "assigned" }),
        makeOrder({ id: "order-01" }),
      ],
      [
        makeRider({ id: "rider-01", isAvailable: true }),
        makeRider({ id: "rider-02", isAvailable: false }),
      ],
    );

    expect(() => dispatchNext(world)).toThrowError(/invariant/);
  });
});

describe("dispatchNext - purity", () => {
  it("does not mutate the input snapshot (success or failure)", () => {
    const world = makeWorld(
      [
        makeOrder({ id: "order-01", createdAt: 1 }),
        makeOrder({ id: "order-02", createdAt: 2, assignedRiderId: "rider-02" }),
      ],
      [
        makeRider({ id: "rider-01", isAvailable: true }),
        makeRider({ id: "rider-02", isAvailable: false }),
      ],
    );
    const before = structuredClone(world);

    const success = dispatchNext(world);
    expect(world).toEqual(before); // untouched by the success call
    if (success.kind !== "dispatched") throw new Error("unreachable");
    expect(success.world).not.toBe(world); // a new snapshot was produced

    const drained: World = {
      ...world,
      riders: [makeRider({ id: "rider-01", isAvailable: false })],
    };
    const failure = dispatchNext(drained);
    expect(failure.kind).toBe("failed");
    expect(drained).toEqual(structuredClone(drained));
  });
});

