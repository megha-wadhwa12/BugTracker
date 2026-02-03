"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import BugTable from "../../../components/bugTable";
import FilterPanel from "../../../components/FilterPanel";

interface Bug {
  _id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "open" | "in-progress" | "done";
  createdAt: string;
}

export default function BugsPage() {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [filters, setFilters] = useState({ status: "", priority: "" });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const q = [];
    if (filters.status) q.push(`status=${filters.status}`);
    if (filters.priority) q.push(`priority=${filters.priority}`);

    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/bugs` + (q.length ? `?${q.join("&")}` : ""));
      setBugs(res.data);
    } catch (error) {
      console.error("Failed to fetch bugs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: "open" | "in-progress" | "done") => {
    await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/bugs/${id}`, { status });
    load();
  };

  const removeBug = async (id: string) => {
    await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/bugs/${id}`);
    load();
  };

  const metrics = {
    open: bugs.filter(b => b.status === "open").length,
    inProgress: bugs.filter(b => b.status === "in-progress").length,
    done: bugs.filter(b => b.status === "done").length,
  };

  return (
    <div className="p-6">

      {/* PAGE TITLE */}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">All Bugs</h1>
      <p className="text-gray-600 mb-8">Track and manage all issues in one place.</p>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-gray-600 text-sm">Open Issues</p>
          <p className="text-3xl font-semibold">{metrics.open}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-gray-600 text-sm">In Progress</p>
          <p className="text-3xl font-semibold">{metrics.inProgress}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-gray-600 text-sm">Resolved</p>
          <p className="text-3xl font-semibold">{metrics.done}</p>
        </div>
      </div>

      {/* FILTERS */}
      <FilterPanel
        statusFilter={filters.status}
        priorityFilter={filters.priority}
        onStatusChange={(status: string) => setFilters({ ...filters, status })}
        onPriorityChange={(priority: string) => setFilters({ ...filters, priority })}
        onApply={load}
      />

      {/* TABLE */}
      <div className="mt-8">
        <BugTable
          bugs={bugs}
          onUpdateStatus={updateStatus}
          onDelete={removeBug}
          isLoading={loading}
        />
      </div>
    </div>
  );
}
