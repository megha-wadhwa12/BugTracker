interface PriorityBadgeProps {
  priority: "low" | "medium" | "high";
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const priorityConfig = {
    high: {
      bg: "bg-red-100",
      text: "text-red-700",
    },
    medium: {
      bg: "bg-amber-100",
      text: "text-amber-700",
    },
    low: {
      bg: "bg-emerald-100",
      text: "text-emerald-700",
    },
  };

  const config = priorityConfig[priority];
  const label = priority.charAt(0).toUpperCase() + priority.slice(1);

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      {label}
    </span>
  );
}
