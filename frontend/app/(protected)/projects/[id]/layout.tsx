"use client";

import { Bug, LayoutDashboard, FolderKanban, ListChecks, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const projectId = params?.id as string;

  const base = `/projects/${projectId}`;

  const navItems = [
    {
      label: "Dashboard",
      href: `${base}/dashboard`,
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      label: "Bugs",
      href: `${base}/bugs`,
      icon: <ListChecks className="w-4 h-4" />,
    },
    {
      label: "Kanban",
      href: `${base}/kanban`,
      icon: <FolderKanban className="w-4 h-4" />,
    },
    {
      label: "Members",
      href: `${base}/members`,
      icon: <Users className="w-4 h-4" />,
    },
  ];

  return (
    <div className="flex min-h-screen bg-main text-primary">
      {/* Project Sidebar (left) */}
      <aside className="w-64 bg-sidebar border-r border-default flex flex-col">
        <div className="px-5 py-4 flex items-center gap-2 border-b border-default">
          <div className="h-8 w-8 rounded-lg bg-primary-soft flex items-center justify-center">
            <Bug className="w-5 h-5 text-primary" />
          </div>
          <span className="text-sm font-semibold text-primary">
            BugTrack Pro
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-6">
          <div>
            <p className="px-2 mb-2 text-[11px] font-medium tracking-wide text-tertiary uppercase">
              Project
            </p>
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href.includes("/dashboard") &&
                    pathname === `/projects/${projectId}`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-primary-soft text-primary"
                        : "text-secondary hover:text-primary hover:bg-card-hover"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <p className="px-2 mb-2 text-[11px] font-medium tracking-wide text-tertiary uppercase">
              My Desk
            </p>
            <div className="space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-secondary hover:text-primary hover:bg-card-hover transition-colors">
                <span>Assigned to me</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-secondary hover:text-primary hover:bg-card-hover transition-colors">
                <span>Starred</span>
              </button>
            </div>
          </div>
        </nav>

        <div className="px-4 py-4 border-t border-default">
          <div className="bg-card border border-default rounded-lg p-3 text-xs text-secondary">
            <p className="font-medium text-primary mb-1">Pro Plan</p>
            <p className="mb-2">You&apos;re using 80% of your bug limit.</p>
            <button className="w-full h-8 rounded-md bg-primary hover:bg-primary-hover text-black font-medium text-xs">
              Upgrade Now
            </button>
          </div>
        </div>
      </aside>

      {/* Project main content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

