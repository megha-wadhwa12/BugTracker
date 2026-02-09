"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

function safeFormat(ts?: string | Date | null) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default function BugDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [bug, setBug] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Local editable copy so we don't PATCH on each keystroke
  const [edit, setEdit] = useState<{ title: string; description: string; priority: string; status: string; assignedTo: string; }>({
    title: "",
    description: "",
    priority: "medium",
    status: "open",
    assignedTo: ""
  });

  const loadBug = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/bugs/${id}`);
      setBug(res.data);
      setEdit({
        title: res.data.title ?? "",
        description: res.data.description ?? "",
        priority: res.data.priority ?? "medium",
        status: res.data.status ?? "open",
        assignedTo: res.data.assignedTo ?? ""
      });
    } catch (err) {
      console.error("Failed to load bug", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBug();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const saveChanges = async () => {
    setSaving(true);
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/bugs/${id}`, {
        title: edit.title,
        description: edit.description,
        priority: edit.priority,
        status: edit.status,
        assignedTo: edit.assignedTo
      });
      await loadBug();
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-600">Loading bug details...</div>;
  if (!bug) return <div className="p-6 text-gray-600">Bug not found.</div>;

  return (
    <div className="p-6 w-full">
      {/* Layout: two columns */}
      <div className="grid grid-cols-12 gap-6">
        {/* Main column (left) */}
        <div className="col-span-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <input
                  value={edit.title}
                  onChange={(e) => setEdit({ ...edit, title: e.target.value })}
                  className="w-full text-2xl font-bold text-gray-900 bg-transparent border-b border-transparent focus:border-violet-300 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Bug ID: {bug._id}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push("/bugs")}
                  className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                >
                  Back
                </button>

                <button
                  onClick={saveChanges}
                  disabled={saving}
                  className="px-4 py-2 rounded-md bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>

            {/* meta row */}
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="text-sm text-gray-600">
                <div className="font-medium text-gray-800">Created</div>
                <div>{safeFormat(bug.createdAt)}</div>
              </div>
              <div className="text-sm text-gray-600">
                <div className="font-medium text-gray-800">Last Updated</div>
                <div>{safeFormat(bug.updatedAt ?? bug.createdAt)}</div>
              </div>
              <div className="text-sm text-gray-600">
                <div className="font-medium text-gray-800">Assignee</div>
                <div>{bug.assignedTo || "Unassigned"}</div>
              </div>
            </div>

            {/* description */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={6}
                value={edit.description}
                onChange={(e) => setEdit({ ...edit, description: e.target.value })}
                className="w-full p-3 border rounded-md"
              />
            </div>

            {/* status / priority / assignee selectors */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select
                  value={edit.status}
                  onChange={(e) => setEdit({ ...edit, status: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                <select
                  value={edit.priority}
                  onChange={(e) => setEdit({ ...edit, priority: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Assignee</label>
                <select
                  value={edit.assignedTo}
                  onChange={(e) => setEdit({ ...edit, assignedTo: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Unassigned</option>
                  <option value="Megha">Megha</option>
                  <option value="Dev1">Dev1</option>
                  <option value="Tester">Tester</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: activity */}
        <div className="col-span-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Activity</h3>

            {(!bug.activity || bug.activity.length === 0) ? (
              <p className="text-sm text-gray-500">No activity yet.</p>
            ) : (
              <ul className="space-y-4">
                {bug.activity.map((it: any, idx: number) => (
                  <li key={idx} className="flex gap-3">
                    <div className="text-lg">📝</div>
                    <div>
                      <div className="text-sm text-gray-800">{it.message}</div>
                      <div className="text-xs text-gray-500">{safeFormat(it.timestamp)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
