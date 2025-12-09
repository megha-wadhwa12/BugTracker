interface StatusBadgeProps {
  status: "open" | "in-progress" | "done";
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    open: {
      bg: "bg-violet-100",
      text: "text-violet-700",
    },
    "in-progress": {
      bg: "bg-amber-100",
      text: "text-amber-700",
    },
    done: {
      bg: "bg-emerald-100",
      text: "text-emerald-700",
    },
  };

  const config = statusConfig[status];
  const label = status === "in-progress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      {label}
    </span>
  );
}
