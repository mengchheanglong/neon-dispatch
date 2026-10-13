/**
 * Position: a point on the 2D simulation grid.
 *
 * Kept as a plain type (not a class) so positions are cheap to create,
 * copy and compare - the whole simulation is built out of immutable
 * data like this.
 */
export interface Position {
  /** Horizontal coordinate on the grid. */
  x: number;
  /** Vertical coordinate on the grid. */
  y: number;
}
