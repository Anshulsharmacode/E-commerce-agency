// design-system/tokens.ts
// ─── Single source of truth for the entire app's visual language ───

export const colors = {
  // Brand
  brand: "#6d28d9", // violet-700 — primary CTA, accents
  brandLight: "#ede9fe", // violet-100 — badge fills, hover bg
  brandMid: "#8b5cf6", // violet-500 — icons, borders
  brandText: "#4c1d95", // violet-900 — text on light brand bg

  // Surface
  bg: "#ffffff",
  surface: "#f8f7ff", // barely-violet white — cards, inputs
  surfaceAlt: "#f1f0ff", // slightly deeper surface

  // Borders
  border: "#e4e0f7", // violet-tinted divider
  borderStrong: "#c4b5fd", // violet-300 — emphasis borders

  // Text
  text: "#1e1b2e", // near-black with violet undertone
  textMuted: "#6b7280", // gray-500
  textSubtle: "#9ca3af", // gray-400

  // Semantic
  success: "#059669", // emerald-600
  successBg: "#d1fae5", // emerald-100
  warning: "#d97706", // amber-600
  warningBg: "#fef3c7",
  danger: "#dc2626",
  dangerBg: "#fee2e2",
};

export const radius = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "22px",
  pill: "999px",
};

export const shadow = {
  sm: "0 1px 3px rgba(109,40,217,0.08)",
  md: "0 4px 12px rgba(109,40,217,0.10)",
  lg: "0 8px 24px rgba(109,40,217,0.12)",
};
