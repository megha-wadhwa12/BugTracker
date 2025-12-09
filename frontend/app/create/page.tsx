"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function CreateBug() {
  const router = useRouter();
  const [data, setData] = useState({
    title: "",
    description: "",
    priority: "medium",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!data.title.trim()) {
      setError("Title is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/bugs`, data);
      router.push("/bugs");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Failed to create bug");
      } else {
        setError("An unexpected error occurred");
      }
      setLoading(false);
    }
  };

  return (
    <div className=" min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="h-16 px-8 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">New Bug Report</h2>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-8">
        <div className="max-w-2xl">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-medium text-red-700">⚠️ {error}</p>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-8 space-y-8">
              {/* Title Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Bug Title <span className="text-violet-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Login button not working on iOS Safari"
                  value={data.title}
                  onChange={(e) => setData({ ...data, title: e.target.value })}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-2">Be specific and descriptive</p>
              </div>

              {/* Description Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                <textarea
                  placeholder="Describe the issue, steps to reproduce, and expected behavior..."
                  value={data.description}
                  onChange={(e) => setData({ ...data, description: e.target.value })}
                  disabled={loading}
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent resize-none disabled:bg-gray-100 disabled:text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-2">Include error messages, browser version, and screenshots if applicable</p>
              </div>

              {/* Priority Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Priority</label>
                <select
                  value={data.priority}
                  onChange={(e) => setData({ ...data, priority: e.target.value })}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent cursor-pointer disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  <option value="low">Low - Can wait, minor issue</option>
                  <option value="medium">Medium - Should be addressed soon</option>
                  <option value="high">High - Urgent, blocking users</option>
                </select>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="bg-gray-50 border-t border-gray-200 px-8 py-4 flex items-center justify-between">
              <button
                onClick={() => router.back()}
                disabled={loading}
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={loading}
                className="bg-violet-600 hover:bg-violet-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Creating...
                  </>
                ) : (
                  "Create Bug Report"
                )}
              </button>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-6 bg-violet-50 border border-violet-200 rounded-lg p-4">
            <p className="text-sm text-violet-900">
              <span className="font-semibold">💡 Tip:</span> Clear and detailed bug reports help the team fix issues faster. Include reproduction steps when possible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
