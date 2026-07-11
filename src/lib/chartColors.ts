// Validated categorical palette (dark surface #18181B) — fixed hue order.
// Run `node scripts/validate_palette.js` from the dataviz skill before changing.
export const CATEGORICAL_PALETTE = [
  '#3B82F6', // blue
  '#199E70', // aqua
  '#C98500', // yellow
  '#22A559', // green
  '#9085E9', // violet
  '#E66767', // red
  '#D55181', // magenta
  '#D95926', // orange
] as const

export function categoricalColor(index: number): string {
  return CATEGORICAL_PALETTE[index % CATEGORICAL_PALETTE.length]
}

export const CHART_GRID = '#27272A'
export const CHART_AXIS_TEXT = '#71717A'
export const CHART_SURFACE = '#18181B'
