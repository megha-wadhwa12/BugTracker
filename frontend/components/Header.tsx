"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";


export default function Header() {
    const pathname = usePathname();
    if (pathname === "/create") return null;
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="h-16 px-8 flex items-center justify-between">
        {/* Left: Title area */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search bugs..."
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/create"
            className="bg-violet-600 hover:bg-violet-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200"
          >
            + New Bug
          </Link>
        </div>
      </div>
    </header>
  );
}
