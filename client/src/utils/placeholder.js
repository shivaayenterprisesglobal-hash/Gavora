/*
 * Placeholder artwork strategy.
 *
 * Seeded products have no photography yet. Each image slot falls back to a
 * locally generated, brand-tinted field derived from the item's own name —
 * never a hotlinked photo, and never a repeated "GS" box.
 */

const PALETTES = [
  { bg: '#f4d7c8', rule: '#e3b49a', ink: '#4a241c', accent: '#c45c3e', shape: '#e8b8a0' },
  { bg: '#dce6df', rule: '#b7c9bc', ink: '#1e3328', accent: '#3d6b52', shape: '#b5cbbd' },
  { bg: '#efe3d2', rule: '#d4c0a4', ink: '#3a2a1c', accent: '#8a5a32', shape: '#ddc7a8' },
  { bg: '#e4dce8', rule: '#c8b8d0', ink: '#2c1c30', accent: '#6b4568', shape: '#d0bcd8' },
  { bg: '#dce4ee', rule: '#b8c8d8', ink: '#1c2838', accent: '#3d5270', shape: '#b4c4d6' },
  { bg: '#f0dcc4', rule: '#dcb896', ink: '#3d2a18', accent: '#a84a32', shape: '#e4c4a0' },
  { bg: '#e2e8d4', rule: '#c4d0a8', ink: '#2a3218', accent: '#5a6b38', shape: '#c8d4b0' },
  { bg: '#ead8d4', rule: '#d4b4b0', ink: '#3c201c', accent: '#8a3c2a', shape: '#e0c0b8' },
];

function hash(value) {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result = (result * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(result);
}

export function tintFor(seed = '') {
  return PALETTES[hash(String(seed)) % PALETTES.length];
}

export function layoutFor(seed = '') {
  return hash(String(seed)) % 6;
}

export default { tintFor, layoutFor };
