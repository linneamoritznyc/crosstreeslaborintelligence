type BadgeVariant = "success" | "warning" | "error" | "neutral";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

const COLORS: Record<BadgeVariant, string> = {
  success: "#2e7d32",
  warning: "#f57c00",
  error: "#c62828",
  neutral: "#616161",
};

export function Badge({ children, variant = "neutral" }: BadgeProps) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 12,
        fontSize: "0.75rem",
        fontWeight: 600,
        color: "#fff",
        background: COLORS[variant],
      }}
    >
      {children}
    </span>
  );
}
