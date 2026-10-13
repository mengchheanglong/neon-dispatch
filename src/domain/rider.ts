import type { Position } from "./position";

/**
 * Rider: a delivery agent that can be idle or busy carrying an order.
 *
 * `isAvailable` is the simplest possible availability model for Phase 2:
 * a later phase replaces it with dispatch-driven state, so the field
 * lives inside the rider type where that change is contained.
 */
export interface Rider {
  /** Stable unique identifier, e.g. "rider-01". */
  id: string;
  /** Human-readable name shown on the dashboard. */
  name: string;
  /** Current position on the grid. */
  location: Position;
  /** True when the rider has nothing assigned and can take work. */
  isAvailable: boolean;
}
