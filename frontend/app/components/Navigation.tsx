export default function Navigation() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BT</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Bug Tracker</h1>
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-8">
            <a
              href="/"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 pb-1 border-b-2 border-transparent hover:border-blue-600"
            >
              Dashboard
            </a>
            <a
              href="/create"
              className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-md"
            >
              + New Bug
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
