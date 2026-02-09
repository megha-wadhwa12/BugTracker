interface PriorityBadgeProps {
  priority?: "low" | "medium" | "high";
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const PRIORITY_CONFIG = {
    high: {
      bg: "bg-danger/10",
      text: "text-danger",
      label: "High",
    },
    medium: {
      bg: "bg-warning/10",
      text: "text-warning",
      label: "Medium",
    },
    low: {
      bg: "bg-success/10",
      text: "text-success",
      label: "Low",
    },
  };

  const config =
    PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG] ?? {
      bg: "bg-card",
      text: "text-tertiary",
      label: priority ?? "Unknown",
    };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}
