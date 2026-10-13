import { describe, expect, it } from "vitest";

import { canTransition, transitionStatus, ORDER_STATUS_TRANSITIONS } from "./order-transitions";
import type { Order } from "./order";

/** Minimal queued order; status is overridden per case. */
function makeOrderWithStatus(status: Order["status"]): Order {
  return {
    id: "order-01",
    shopId: "shop-01",
    destination: { x: 1, y: 1 },
    assignedRiderId: null,
    status,
    createdAt: 1,
  };
}

describe("order status transitions", () => {
  it("accepts the full happy path: created -> ... -> delivered", () => {
    const path = ["queued", "assigned", "picked_up", "in_transit", "delivered"] as const;

    let order = makeOrderWithStatus("created");
    for (const next of path) {
      const result = transitionStatus(order, next);
      expect(result.kind).toBe("accepted");
      if (result.kind !== "accepted") throw new Error("unreachable");
      order = result.order;
      expect(order.status).toBe(next);
    }
    expect(order.status).toBe("delivered");
  });

  it("accepts a cancellation while the delivery is still retrievable", () => {
    for (const from of ["created", "queued", "assigned", "picked_up", "in_transit"] as const) {
      const result = transitionStatus(makeOrderWithStatus(from), "cancelled");
      expect(result.kind).toBe("accepted");
      if (result.kind !== "accepted") throw new Error("unreachable");
      expect(result.order.status).toBe("cancelled");
    }
  });

  it("rejects transitions that skip or reverse the lifecycle", () => {
    expect(canTransition("created", "delivered")).toBe(false);
    expect(canTransition("queued", "picked_up")).toBe(false);
    expect(canTransition("in_transit", "picked_up")).toBe(false);
    expect(canTransition("in_transit", "assigned")).toBe(false);

    const result = transitionStatus(makeOrderWithStatus("queued"), "picked_up");
    expect(result).toEqual({
      kind: "rejected",
      reason: "invalid-transition",
      from: "queued",
      to: "picked_up",
    });
  });

  it("treats delivered and cancelled as terminal states", () => {
    expect(ORDER_STATUS_TRANSITIONS.delivered).toEqual([]);
    expect(ORDER_STATUS_TRANSITIONS.cancelled).toEqual([]);
    expect(canTransition("delivered", "cancelled")).toBe(false);
    expect(canTransition("cancelled", "queued")).toBe(false);
  });
});
