"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/", icon: "📊" },
  { label: "All Bugs", href: "/bugs", icon: "🐛" },
  { label: "New Bug", href: "/create", icon: "➕" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
      <h2 className="text-xl font-semibold mb-6 text-violet-700">BugTrack Pro</h2>

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 p-3 rounded-lg transition 
                ${active ? "bg-violet-100 text-violet-700 font-semibold" : "text-gray-700 hover:bg-gray-100"}
              `}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
