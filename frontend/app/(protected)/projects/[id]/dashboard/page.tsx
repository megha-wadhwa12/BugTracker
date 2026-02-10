"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Bug, Clock3, Flame, Info, Users } from "lucide-react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/axios";
import { createBug, getBugs } from "@/services/bugs";
import { BugFormValues, bugsFormSchema } from "@/lib/validators/bugs";
import Modal from "@/components/Modal";

interface BugActivity {
  message: string;
  timestamp: string;
}

interface BugItem {
  _id: string;
  title: string;
  status: "open" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  activity?: BugActivity[];
}

interface ActivityItem {
  message: string;
  timestamp: string;
  bugId: string;
  bugTitle: string;
}

interface ProjectDetail {
  _id: string;
  name: string;
  description?: string;
}

function isToday(ts: string) {
  const d = new Date(ts);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export default function ProjectDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const {
    register: registerBug,
    handleSubmit: handleSubmitCreate,
    formState: { errors: errorsCreate, isSubmitting: isSubmittingCreate },
    reset: resetCreate,
  } = useForm<BugFormValues>({
    resolver: zodResolver(bugsFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "open",
      assignedTo: "UNASSIGNED",
    },
  });

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [bugs, setBugs] = useState<BugItem[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_LOCAL_API_URL;

  const loadProjectAndBugs = async () => {
    if (!projectId) return;

    try {
      setLoading(true);

      const [projectRes, bugsRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/bugs`, {
          params: { projectId },
        }),
      ]);

      setProject(projectRes.data);

      const bugList: BugItem[] = bugsRes.data;
      setBugs(bugList);

      const merged: ActivityItem[] = [];
      bugList.forEach((bug) => {
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

      merged.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setActivity(merged.slice(0, 10));
    } catch (err) {
      console.error("Failed to load project dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBug = async (data: BugFormValues) => {
    try {
      const payload = {
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        assignedTo: data.assignedTo,
        project: projectId,
      };

      await createBug(payload);
      toast.success("Bug created successfully");
      setCreateModalOpen(false);
      resetCreate();
      router.push(`/projects/${projectId}/bugs`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create bug");
    }
  };

  useEffect(() => {
    loadProjectAndBugs();
  }, [projectId]);

  const metrics = useMemo(() => {
    const total = bugs.length;
    const open = bugs.filter((b) => b.status === "open").length;
    const inProgress = bugs.filter((b) => b.status === "in-progress").length;
    const done = bugs.filter((b) => b.status === "done").length;
    const critical = bugs.filter((b) => b.priority === "high").length;
    const resolvedToday = bugs.filter(
      (b) => b.status === "done" && isToday(b.updatedAt)
    ).length;

    return {
      total,
      open,
      inProgress,
      done,
      critical,
      resolvedToday,
    };
  }, [bugs]);

  const bugDistribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    bugs.forEach((b) => {
      const d = new Date(b.createdAt);
      const day = d.getDay(); // 0=Sun
      const index = day === 0 ? 6 : day - 1;
      counts[index] += 1;
    });
    return counts;
  }, [bugs]);

  const healthScore = useMemo(() => {
    if (metrics.total === 0) return 0;
    return Math.round((metrics.done / metrics.total) * 100);
  }, [metrics]);

  const topPerformers = useMemo(() => {
    const map: Record<string, number> = {};
    bugs.forEach((b) => {
      if (b.status === "done" && b.assignedTo) {
        map[b.assignedTo] = (map[b.assignedTo] || 0) + 1;
      }
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));
  }, [bugs]);

  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const maxDistribution = Math.max(1, ...bugDistribution);

  const recentActivity = activity;

  const recentBugs = useMemo(
    () =>
      [...bugs]
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        .slice(0, 5),
    [bugs]
  );

  if (!projectId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-main text-primary">
      <div className="px-8 py-6 space-y-8">
        {/* Top bar: breadcrumb + actions */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-tertiary">
              <Link href="/projects" className="text-muted hover:text-primary">
                Projects
              </Link>
              <span className="text-muted">›</span>
              <span className="text-secondary">
                {project?.name || "Project"}
              </span>
              <span className="text-muted">›</span>
              <span className="text-secondary">Dashboard</span>
            </div>
            <h1 className="text-2xl font-semibold text-primary">
              Project Overview
            </h1>
            <p className="text-sm text-secondary">
              Track key performance indicators and team velocity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-default text-xs text-secondary hover:bg-card-hover">
              <Clock3 className="w-4 h-4" />
              Last 30 days
            </button>

            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-black text-sm font-medium"
            >
              <Bug className="w-4 h-4" />
              Create Bug
            </button>
          </div>
        </div>

        {/* Metric row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border border-default rounded-xl p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary-soft flex items-center justify-center">
              <Info className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-tertiary uppercase tracking-wide">
                Total Active
              </p>
              <p className="text-2xl font-semibold text-primary">
                {metrics.open + metrics.inProgress}
              </p>
            </div>
          </div>

          <div className="bg-card border border-default rounded-xl p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-danger/10 flex items-center justify-center">
              <Flame className="w-5 h-5 text-danger" />
            </div>
            <div>
              <p className="text-xs text-tertiary uppercase tracking-wide">
                Critical Issues
              </p>
              <p className="text-2xl font-semibold text-primary">
                {metrics.critical}
              </p>
            </div>
          </div>

          <div className="bg-card border border-default rounded-xl p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Bug className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-tertiary uppercase tracking-wide">
                Resolved Today
              </p>
              <p className="text-2xl font-semibold text-primary">
                {metrics.resolvedToday}
              </p>
            </div>
          </div>

          <div className="bg-card border border-default rounded-xl p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-border-soft flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-tertiary uppercase tracking-wide">
                Open Bugs
              </p>
              <p className="text-2xl font-semibold text-primary">
                {metrics.open}
              </p>
            </div>
          </div>
        </div>

        {/* Main content row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Bug distribution */}
          <div className="lg:col-span-2 bg-card border border-default rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-primary">
                  Bug Distribution
                </h2>
                <p className="text-xs text-secondary mt-1">
                  Bugs created per day this week
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-end gap-3 h-40 relative">
              {bugDistribution.map((count, idx) => {
                const height =
                  maxDistribution === 0
                    ? 0
                    : Math.max(8, (count / maxDistribution) * 100);
                return (
                  <div
                    key={days[idx]}
                    className="flex flex-1 flex-col items-center justify-end gap-2 relative"
                  >
                    {count > 0 && (
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-secondary font-medium whitespace-nowrap">
                        {count}
                      </span>
                    )}
                    <div
                      className="w-full rounded-t-md bg-primary transition-all"
                      style={{
                        height: count > 0 ? `${height}px` : '0%',
                        minHeight: count > 0 ? '8px' : '0px'
                      }}
                    >
                    </div>
                    <span className="text-[11px] text-tertiary mt-1">
                      {days[idx]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Project health */}
          <div className="bg-card border border-default rounded-xl p-6 flex flex-col gap-6">
            <div>
              <h2 className="text-sm font-semibold text-primary">
                Project Health
              </h2>
              <p className="text-xs text-secondary mt-1">
                Based on resolved vs total bugs.
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div
                className="relative w-28 h-28 rounded-full"
                style={{
                  backgroundImage: `conic-gradient(var(--primary) ${healthScore * 3.6
                    }deg, var(--bg-card) 0deg)`,
                }}
              >
                <div className="absolute inset-3 rounded-full bg-main flex flex-col items-center justify-center">
                  <span className="text-xl font-semibold text-primary">
                    {healthScore}%
                  </span>
                  <span className="text-[11px] text-tertiary mt-1">
                    Healthy
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs text-secondary mb-1">
                    <span>Resolved</span>
                    <span>
                      {metrics.done}/{metrics.total}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-border-soft overflow-hidden">
                    <div
                      className="h-full bg-success"
                      style={{
                        width: `${metrics.total === 0
                          ? 0
                          : (metrics.done / metrics.total) * 100
                          }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-secondary mb-1">
                    <span>Open</span>
                    <span>{metrics.open}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-border-soft overflow-hidden">
                    <div
                      className="h-full bg-warning"
                      style={{
                        width: `${metrics.total === 0
                          ? 0
                          : (metrics.open / metrics.total) * 100
                          }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row: activity + top performers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Recent activity */}
          <div className="lg:col-span-2 bg-card border border-default rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-primary">
                Recent Activity
              </h2>
              <button className="text-xs text-green hover:underline">
                View all
              </button>
            </div>

            {recentActivity.length === 0 ? (
              <p className="text-sm text-secondary">
                No recent activity recorded.
              </p>
            ) : (
              <ul className="space-y-4">
                {recentActivity.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-sm text-secondary"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary-soft flex items-center justify-center mt-0.5">
                      <Bug className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-primary">{item.message}</p>
                      <p className="text-xs text-tertiary mt-1">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Top performers */}
          <div className="bg-card border border-default rounded-xl p-6">
            <h2 className="text-sm font-semibold text-primary mb-4">
              Top Performers
            </h2>

            {topPerformers.length === 0 ? (
              <p className="text-sm text-secondary">
                No resolved bugs yet. Once bugs are resolved with{" "}
                <span className="text-primary">assignedTo</span> set, the top
                contributors will appear here.
              </p>
            ) : (
              <ul className="space-y-4">
                {topPerformers.map((p) => (
                  <li key={p.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-soft flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">
                          {p.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-primary">{p.name}</p>
                        <p className="text-xs text-tertiary">
                          {p.count} fixed
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          resetCreate();
        }}
        title="Create New Bug"
        size="lg"
      >
        <form
          onSubmit={handleSubmitCreate(handleCreateBug)}
          className="space-y-5 scroll-auto rounded-xl bg-[#0b1412] border border-[#1f2a27] p-6 text-sm"
        >
          {/* Bug Title */}
          <div>
            <label className="block mb-1 text-[#9fb6af]">
              Bug Title <span className="text-red-500">*</span>
            </label>
            <input
              {...registerBug("title")}
              placeholder="e.g., App crashes on logout"
              className="w-full rounded-lg bg-[#020907] border border-[#1f2a27] px-4 py-2 text-[#e6f4f1] placeholder:text-[#6b7f79] focus:outline-none focus:ring-2 focus:ring-[#27e0a6]"
            />
            {errorsCreate.title && (
              <p className="mt-1 text-xs text-red-500">
                {errorsCreate.title.message}
              </p>
            )}
          </div>

          {/* Severity + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-[#9fb6af]">Severity</label>
              <select
                {...registerBug("priority")}
                className="w-full rounded-lg bg-[#020907] border border-[#1f2a27] px-3 py-2 text-[#e6f4f1] focus:outline-none focus:ring-2 focus:ring-[#27e0a6]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-[#9fb6af]">Status</label>
              <select
                {...registerBug("status")}
                className="w-full rounded-lg bg-[#020907] border border-[#1f2a27] px-3 py-2 text-[#e6f4f1] focus:outline-none focus:ring-2 focus:ring-[#27e0a6]"
              >
                <option value="open">Open</option>
                <option value="in-progress">In-Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block mb-1 text-[#9fb6af]">Description</label>
            <textarea
              {...registerBug("description")}
              rows={4}
              placeholder="Describe the bug and steps to reproduce..."
              className="w-full rounded-lg bg-[#020907] border border-[#1f2a27] px-4 py-2 text-[#e6f4f1] placeholder:text-[#6b7f79] focus:outline-none focus:ring-2 focus:ring-[#27e0a6] resize-none"
            />
            {errorsCreate.description && (
              <p className="mt-1 text-xs text-red-500">
                {errorsCreate.description.message}
              </p>
            )}
          </div>

          {/* Assign To */}
          <div>
            <label className="block mb-1 text-[#9fb6af]">Assign to</label>
            <div className="flex gap-2">
              <select
                {...registerBug("assignedTo")}
                className="flex-1 rounded-lg bg-[#020907] border border-[#1f2a27] px-3 py-2 text-[#e6f4f1] focus:outline-none focus:ring-2 focus:ring-[#27e0a6]"
              >
                <option value="UNASSIGNED">Select a team member</option>
                <option value="me">Me</option>
                <option value="dev1">Developer 1</option>
                <option value="dev2">Developer 2</option>
              </select>

              <button
                type="button"
                className="rounded-lg bg-[#10221d] border border-[#1f2a27] px-3 text-[#9fb6af] hover:text-white"
              >
                +
              </button>
            </div>
          </div>

          {/* Attachments */}
          <div>
            <label className="block mb-2 text-[#9fb6af]">Attachments</label>
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#1f2a27] bg-[#020907] py-6 text-center">
              <div className="text-[#27e0a6] mb-1">⬆️</div>
              <p className="text-[#27e0a6]">Click to upload</p>
              <p className="text-xs text-[#6b7f79]">PNG, JPG, PDF up to 10MB</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => {
                setCreateModalOpen(false);
                resetCreate();
              }}
              className="text-[#9fb6af] hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmittingCreate}
              className="rounded-lg bg-[#27e0a6] px-5 py-2 font-medium cursor-pointer text-black hover:bg-[#1fcf98] disabled:opacity-50"
            >
              {isSubmittingCreate ? "Creating..." : "Create Issue"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
