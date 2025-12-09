"use client";
import { useEffect, useState } from "react";
import axios from "axios";

interface Bug {
  _id: string;
  title: string;
  status: "open" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
}

interface ActivityItem {
  message: string;
  timestamp: string;
  bugId: string;
  bugTitle: string;
}

export default function Dashboard() {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  const loadData = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/bugs`);
      const bugList = res.data;

      setBugs(bugList);
      // 👉 Build activity from all bugs
      const merged: ActivityItem[] = [];
      // 👉 Build activity from all bugs

      bugList.forEach((bug: { activity: any[]; _id: any; title: any; }) => {
        if (bug.activity && bug.activity.length > 0) {
          bug.activity.forEach((a) => {
            merged.push({
              message: a.message,
              timestamp: a.timestamp,
              bugId: bug._id,
              bugTitle: bug.title,
            });
          });
        }
      });

      // Sort recent first
      merged.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Optional limit: last 10 items
      setActivity(merged.slice(0, 10));

    } catch (err) {
      console.error("Failed to load dashboard:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const metrics = {
    open: bugs.filter((b) => b.status === "open").length,
    inProgress: bugs.filter((b) => b.status === "in-progress").length,
    done: bugs.filter((b) => b.status === "done").length,
  };

  // Sort for recent bugs list
  const recentBugs = [...bugs]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="p-6">

      {/* TITLE */}
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p className="text-gray-600 mt-1 mb-8">Project overview and recent updates</p>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-gray-600 text-sm">Open Issues</p>
          <p className="text-4xl font-semibold mt-2">{metrics.open}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-gray-600 text-sm">In Progress</p>
          <p className="text-4xl font-semibold mt-2">{metrics.inProgress}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-gray-600 text-sm">Resolved</p>
          <p className="text-4xl font-semibold mt-2">{metrics.done}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">

        {/* RECENT ACTIVITY */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Recent Activity</h2>

          {activity.length === 0 ? (
            <p className="text-sm text-gray-500">No recent activity recorded.</p>
          ) : (
            <ul className="space-y-4">
              {activity.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-lg">📝</span>
                  <div>
                    <p className="text-gray-800 text-sm">{item.message}</p>
                    <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* RECENTLY UPDATED BUGS */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Recently Updated Bugs</h2>

          {recentBugs.length === 0 ? (
            <p className="text-sm text-gray-500">No bugs available.</p>
          ) : (
            <ul className="space-y-3">
              {recentBugs.map((bug) => (
                <li key={bug._id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <p className="text-gray-900 font-medium text-sm">{bug.title}</p>
                    <p className="text-xs text-gray-500">{bug.status}</p>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(bug.updatedAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>

    </div>
  );
}
