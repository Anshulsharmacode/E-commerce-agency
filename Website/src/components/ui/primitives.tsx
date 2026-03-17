// design-system/primitives.tsx
// ─── Drop-in building blocks used across all pages ───

import { CSSProperties, ReactNode } from "react";
import { colors, radius, shadow } from "./token";

/* ══════════════════════════════════════════
   Badge — inline label pill
   Usage: <Badge>Live</Badge>
          <Badge variant="success">Active</Badge>
══════════════════════════════════════════ */
type BadgeVariant = "brand" | "success" | "warning" | "danger" | "neutral";

const badgeMap: Record<
  BadgeVariant,
  { bg: string; color: string; border: string }
> = {
  brand: {
    bg: colors.brandLight,
    color: colors.brandText,
    border: colors.borderStrong,
  },
  success: { bg: colors.successBg, color: colors.success, border: "#6ee7b7" },
  warning: { bg: colors.warningBg, color: colors.warning, border: "#fcd34d" },
  danger: { bg: colors.dangerBg, color: colors.danger, border: "#fca5a5" },
  neutral: {
    bg: colors.surfaceAlt,
    color: colors.textMuted,
    border: colors.border,
  },
};

export function Badge({
  children,
  variant = "brand",
  icon,
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  icon?: ReactNode;
}) {
  const t = badgeMap[variant];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 12px",
        borderRadius: radius.pill,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        background: t.bg,
        color: t.color,
        border: `1px solid ${t.border}`,
      }}
    >
      {icon}
      {children}
    </span>
  );
}

/* ══════════════════════════════════════════
   StatCard — metric display
   Usage: <StatCard label="Total Offers" value={42} />
══════════════════════════════════════════ */
export function StatCard({
  label,
  value,
  icon,
  accent = false,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        background: accent ? colors.brandLight : colors.surface,
        border: `1px solid ${accent ? colors.borderStrong : colors.border}`,
        borderRadius: radius.lg,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: accent ? colors.brandMid : colors.textSubtle,
          }}
        >
          {label}
        </span>
        {icon && (
          <span style={{ color: accent ? colors.brandMid : colors.textSubtle }}>
            {icon}
          </span>
        )}
      </div>
      <span
        style={{
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: "-0.025em",
          lineHeight: 1,
          color: accent ? colors.brand : colors.text,
        }}
      >
        {value}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════
   Card — general container
   Usage: <Card>…</Card>
          <Card flat>…</Card>   ← no shadow
══════════════════════════════════════════ */
export function Card({
  children,
  flat = false,
  style,
}: {
  children: ReactNode;
  flat?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.xl,
        boxShadow: flat ? "none" : shadow.md,
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════
   Section — full-width page section wrapper
   Usage: <Section>…</Section>
══════════════════════════════════════════ */
export function Section({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <section
      style={{
        background: colors.bg,
        padding: "64px 32px",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {/* Subtle dot texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(circle, ${colors.border} 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          opacity: 0.6,
          pointerEvents: "none",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%)",
        }}
      />
      <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto" }}>
        {children}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════
   Button — primary / outline / ghost
   Usage: <Btn>Download</Btn>
          <Btn variant="outline">Open Panel</Btn>
══════════════════════════════════════════ */
type BtnVariant = "primary" | "outline" | "ghost";

export function Btn({
  children,
  variant = "primary",
  href,
  onClick,
  icon,
}: {
  children: ReactNode;
  variant?: BtnVariant;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
}) {
  const styles: Record<BtnVariant, CSSProperties> = {
    primary: {
      background: colors.brand,
      color: "#fff",
      border: `1px solid ${colors.brand}`,
      boxShadow: shadow.md,
    },
    outline: {
      background: colors.bg,
      color: colors.brand,
      border: `1px solid ${colors.borderStrong}`,
    },
    ghost: {
      background: colors.brandLight,
      color: colors.brandText,
      border: `1px solid transparent`,
    },
  };

  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "11px 22px",
    borderRadius: radius.md,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    textDecoration: "none",
    transition: "opacity .15s, transform .15s",
    ...styles[variant],
  };

  if (href)
    return (
      <a href={href} style={base}>
        {icon}
        {children}
      </a>
    );
  return (
    <button style={base} onClick={onClick}>
      {icon}
      {children}
    </button>
  );
}

/* ══════════════════════════════════════════
   Divider
══════════════════════════════════════════ */
export function Divider({ style }: { style?: CSSProperties }) {
  return (
    <hr
      style={{
        border: "none",
        borderTop: `1px solid ${colors.border}`,
        margin: "0",
        ...style,
      }}
    />
  );
}
