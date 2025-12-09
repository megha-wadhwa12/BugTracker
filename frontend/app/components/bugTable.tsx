"use client";
import StatusBadge from "./statusBadge";
import PriorityBadge from "./PriorityBadge";
import { useRouter } from "next/navigation";

interface Bug {
    _id: string;
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    status: "open" | "in-progress" | "done";
    createdAt: string;
}

interface BugTableProps {
    bugs: Bug[];
    onUpdateStatus: (id: string, status: "open" | "in-progress" | "done") => void;
    onDelete: (id: string) => void;
    isLoading?: boolean;
}

export default function BugTable({ bugs, onUpdateStatus, onDelete, isLoading }: BugTableProps) {
    const router = useRouter();

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: new Date(date).getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
        });
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Priority</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Updated</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {bugs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <p className="text-gray-500 text-sm">No bugs found. Start by creating one!</p>
                                </td>
                            </tr>
                        ) : (
                            bugs.map((bug) => (
                                <tr key={bug._id} onClick={() => router.push(`/bugs/${bug._id}`)} className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 hover:text-violet-600">{bug.title}</p>
                                            {bug.description && (
                                                <p className="text-xs text-gray-500 mt-1 truncate">{bug.description}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <PriorityBadge priority={bug.priority as "low" | "medium" | "high"} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={bug.status as "open" | "in-progress" | "done"} />
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {formatDate(bug.createdAt)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {/* Mark In Progress */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onUpdateStatus(bug._id, "in-progress");
                                                }}
                                                disabled={isLoading}
                                                title="Move to In Progress"
                                                className="p-2 rounded-md hover:bg-violet-100 text-violet-700 disabled:opacity-40"
                                            >
                                                🔄
                                            </button>


                                            {/* Mark Done */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onUpdateStatus(bug._id, "done");
                                                }}
                                                disabled={isLoading}
                                                title="Mark as Done"
                                                className="p-2 rounded-md hover:bg-emerald-100 text-emerald-700 disabled:opacity-40"
                                            >
                                                ✅
                                            </button>


                                            {/* Delete */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(bug._id);
                                                }}
                                                disabled={isLoading}
                                                title="Delete Bug"
                                                className="p-2 rounded-md hover:bg-red-100 text-red-700 disabled:opacity-40"
                                            >
                                                🗑️
                                            </button>

                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
