import type { Order } from "./order";
import type { Rider } from "./rider";
import type { Shop } from "./shop";

/**
 * World: one immutable snapshot of the whole simulation state.
 *
 * Domain operations (like dispatchNext) take a World by value and
 * return a NEW World rather than mutating the input, so they stay
 * pure and independently testable.
 */
export interface World {
  shops: Shop[];
  riders: Rider[];
  orders: Order[];
}
