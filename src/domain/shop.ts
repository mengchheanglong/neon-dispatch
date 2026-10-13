import type { Position } from "./position";

/**
 * Shop: a fixed pickup point on the map.
 *
 * A shop never moves and never changes - it is static reference data.
 * Orders reference a shop by id when they need a pickup location.
 */
export interface Shop {
  /** Stable unique identifier, e.g. "shop-01". */
  id: string;
  /** Human-readable name shown on the dashboard. */
  name: string;
  /** Where the shop sits on the grid. */
  location: Position;
}
