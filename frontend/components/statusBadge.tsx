interface StatusBadgeProps {
  status?: "open" | "in-progress" | "done";
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const STATUS_CONFIG = {
    open: {
      bg: "bg-info/10",
      text: "text-info",
      label: "Open",
    },
    "in-progress": {
      bg: "bg-warning/10",
      text: "text-warning",
      label: "In Progress",
    },
    done: {
      bg: "bg-success/10",
      text: "text-success",
      label: "Done",
    },
  };

  const config =
    STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? {
      bg: "bg-card",
      text: "text-tertiary",
      label: status ?? "Unknown",
    };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}
