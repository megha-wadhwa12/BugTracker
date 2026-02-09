'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bug, Search, Upload, Grid, List, MoreVertical, ChevronDown, Plus, Calendar, Bell, MessageCircle, User } from 'lucide-react'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import CreateBug from '@/app/create/page'
import { createBug } from '@/services/bugs'
import { BugFormValues, bugsFormSchema } from '@/lib/validators/bugs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import Modal from '@/components/Modal'

interface BugItem {
  _id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  status: 'open' | 'in-progress' | 'done'
  assignedTo?: string
  createdAt: string
  updatedAt: string
  projectId?: string
}

interface ProjectDetail {
  _id: string
  name: string
}

function formatTimeAgo(date: string): string {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return `${Math.floor(diffInSeconds / 604800)}w ago`
}

function getSeverityIcon(priority: string) {
  switch (priority) {
    case 'high':
      return <div className="w-2 h-2 rounded-full bg-danger" />
    case 'medium':
      return <div className="w-2 h-2 rounded-full bg-warning" />
    case 'low':
      return <div className="w-2 h-2 rounded-full bg-info" />
    default:
      return <div className="w-2 h-2 rounded-full bg-tertiary" />
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'open':
      return 'text-info'
    case 'in-progress':
      return 'text-warning'
    case 'done':
      return 'text-success'
    default:
      return 'text-secondary'
  }
}

export default function ProjectBugsPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params?.id as string

  const {
    register: registerBug,
    handleSubmit: handleSubmitCreate,
    formState: { errors: errorsCreate, isSubmitting: isSubmittingCreate },
    reset: resetCreate,
  } = useForm<BugFormValues>({
    resolver: zodResolver(bugsFormSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      status: 'open',
      assignedTo: 'UNASSIGNED',
      projectId: '',
    }
  })

  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [bugs, setBugs] = useState<BugItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const [createModalOpen, setCreateModalOpen] = useState(false)

  useEffect(() => {
    if (!projectId) return;

    const load = async () => {
      try {
        setLoading(true)
        const [projectRes, bugsRes] = await Promise.all([
          api.get(`/projects/${projectId}`),
          api.get('/bugs', {
            params: { projectId, status: statusFilter !== 'all' ? statusFilter : undefined, priority: priorityFilter !== 'all' ? priorityFilter : undefined },
          }),
        ])

        setProject(projectRes.data)
        setBugs(bugsRes.data || [])
      } catch (err: any) {
        console.error('Failed to load bugs:', err)
        toast.error(err.response?.data?.error || 'Failed to load bugs')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [projectId, statusFilter, priorityFilter])

  const filteredBugs = useMemo(() => {
    let filtered = bugs

    if (searchQuery) {
      filtered = filtered.filter(
        (bug) =>
          bug.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bug.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (assigneeFilter !== 'all') {
      filtered = filtered.filter((bug) => bug.assignedTo === assigneeFilter)
    }

    return filtered
  }, [bugs, searchQuery, assigneeFilter])

  const paginatedBugs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredBugs.slice(start, start + itemsPerPage)
  }, [filteredBugs, currentPage])

  const totalPages = Math.ceil(filteredBugs.length / itemsPerPage)

  const uniqueAssignees = useMemo(() => {
    const assignees = new Set<string>()
    bugs.forEach((bug) => {
      if (bug.assignedTo) assignees.add(bug.assignedTo)
    })
    return Array.from(assignees)
  }, [bugs])

  const handleBugClick = (bugId: string) => {
    router.push(`/projects/${projectId}/bugs/${bugId}`)
  }

  const handleCreateBug = async (data: BugFormValues) => {
    try {
      await createBug(data);
      toast.success('Bug created successfully')
      setCreateModalOpen(false)
      resetCreate()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create bug')
    }
  }

  if (!projectId) return null

  return (
    <div className="min-h-screen bg-main text-primary">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-card border-b border-default">
        <div className="h-16 px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary-soft flex items-center justify-center">
              <Bug className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-lg font-semibold text-primary">BugTrack Pro</h1>
          </div>

          <div className="flex items-center gap-2 text-sm text-tertiary">
            <Link href={`/projects/${projectId}`} className="hover:text-primary">
              {project?.name || 'Project'}
            </Link>
            <span>›</span>
            <span className="text-secondary">Bugs</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary" />
              <input
                type="text"
                placeholder="Quick find..."
                className="pl-10 pr-4 py-2 bg-input border border-default rounded-lg text-sm text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-48"
              />
            </div>
            <button className="p-2 text-secondary hover:text-primary transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-secondary hover:text-primary transition-colors">
              <MessageCircle className="w-5 h-5" />
            </button>
            <button className="w-8 h-8 rounded-full bg-primary-soft flex items-center justify-center hover:bg-primary-soft/80 transition-colors">
              <User className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-primary mb-1">All Bugs</h2>
            <p className="text-sm text-secondary">Review, track and manage issues across your project.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-default text-sm text-secondary hover:text-primary hover:bg-card-hover transition-colors">
              <Upload className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-black text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Create Bug
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border border-default rounded-xl p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary" />
                <input
                  type="text"
                  placeholder="Search bugs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-input border border-default rounded-lg text-sm text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-input border border-default rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="all">Status: All</option>
                <option value="open">Status: Open</option>
                <option value="in-progress">Status: In Progress</option>
                <option value="done">Status: Done</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="appearance-none bg-input border border-default rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="all">Priority: All</option>
                <option value="high">Priority: High</option>
                <option value="medium">Priority: Medium</option>
                <option value="low">Priority: Low</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="appearance-none bg-input border border-default rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="all">Assignee: All</option>
                {uniqueAssignees.map((assignee) => (
                  <option key={assignee} value={assignee}>
                    Assignee: {assignee}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary pointer-events-none" />
            </div>

            <div className="text-sm text-tertiary">
              Showing {filteredBugs.length} bugs
            </div>

            <div className="flex items-center gap-2 border border-default rounded-lg p-1 bg-card ml-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-primary-soft text-primary' : 'text-secondary hover:text-primary'
                  }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-primary-soft text-primary' : 'text-secondary hover:text-primary'
                  }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bugs Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-secondary">Loading bugs...</div>
          </div>
        ) : (
          <div className="bg-card border border-default rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-default">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-tertiary uppercase tracking-wider">
                      <input type="checkbox" className="rounded border-default" />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-tertiary uppercase tracking-wider">
                      BUG ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-tertiary uppercase tracking-wider">
                      TITLE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-tertiary uppercase tracking-wider">
                      SEVERITY
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-tertiary uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-tertiary uppercase tracking-wider">
                      ASSIGNEE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-tertiary uppercase tracking-wider">
                      UPDATED
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-tertiary uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-default">
                  {paginatedBugs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <p className="text-secondary text-sm">No bugs found. Start by creating one!</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedBugs.map((bug) => (
                      <tr
                        key={bug._id}
                        onClick={() => handleBugClick(bug._id)}
                        className="hover:bg-card-hover transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            onClick={(e) => e.stopPropagation()}
                            className="rounded border-default"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-primary">#{bug._id.slice(-6).toUpperCase()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-primary">{bug.title}</p>
                            {bug.description && (
                              <p className="text-xs text-tertiary mt-1">{bug.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getSeverityIcon(bug.priority)}
                            <span className="text-xs text-secondary capitalize">{bug.priority}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-medium capitalize ${getStatusColor(bug.status)}`}>
                            {bug.status === 'in-progress' ? 'In Progress' : bug.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {bug.assignedTo ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary-soft flex items-center justify-center">
                                <span className="text-xs font-semibold text-primary">
                                  {bug.assignedTo.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="text-sm text-secondary">{bug.assignedTo}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-tertiary">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-tertiary">{formatTimeAgo(bug.updatedAt)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              // Menu logic here
                            }}
                            className="p-1 rounded-lg text-tertiary hover:text-primary hover:bg-card-hover"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-default flex items-center justify-between">
                <p className="text-sm text-tertiary">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredBugs.length)} of {filteredBugs.length} results
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-lg border border-default text-sm text-secondary hover:text-primary hover:bg-card-hover disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    &lt;
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded-lg text-sm ${currentPage === page
                            ? 'bg-primary text-black font-medium'
                            : 'border border-default text-secondary hover:text-primary hover:bg-card-hover'
                            }`}
                        >
                          {page}
                        </button>
                      )
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2 text-tertiary">...</span>
                    }
                    return null
                  })}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-lg border border-default text-sm text-secondary hover:text-primary hover:bg-card-hover disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Modal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          resetCreate();
        }}
        title='Create New Bug'
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
              {...registerBug('title')}
              placeholder="e.g., App crashes on logout"
              className="w-full rounded-lg bg-[#020907] border border-[#1f2a27] px-4 py-2 text-[#e6f4f1] placeholder:text-[#6b7f79] focus:outline-none focus:ring-2 focus:ring-[#27e0a6]"
            />
            {errorsCreate.title && (
              <p className="mt-1 text-xs text-red-500">{errorsCreate.title.message}</p>
            )}
          </div>

          {/* Severity + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-[#9fb6af]">Severity</label>
              <select
                {...registerBug('priority')}
                className="w-full rounded-lg bg-[#020907] border border-[#1f2a27] px-3 py-2 text-[#e6f4f1] focus:outline-none focus:ring-2 focus:ring-[#27e0a6]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-[#9fb6af]">Status</label>
              <select
                {...registerBug('status')}
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
              {...registerBug('description')}
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
                {...registerBug('assignedTo')}
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
              <p className="text-xs text-[#6b7f79]">
                PNG, JPG, PDF up to 10MB
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => {
                setCreateModalOpen(false)
                resetCreate()
              }}
              className="text-[#9fb6af] hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmittingCreate}
              className="rounded-lg bg-[#27e0a6] px-5 py-2 font-medium text-black hover:bg-[#1fcf98] disabled:opacity-50"
            >
              {isSubmittingCreate ? 'Creating...' : 'Create Issue'}
            </button>
          </div>
        </form>

      </Modal>
    </div>
  )
}
