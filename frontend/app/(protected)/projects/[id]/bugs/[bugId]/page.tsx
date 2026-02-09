'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bug, ArrowLeft, Share2, MoreVertical, Edit, Trash2, User, Folder, Tag, Calendar, Clock, Bell, MessageCircle, Search } from 'lucide-react'
import api from '@/lib/axios'
import toast from 'react-hot-toast'

interface BugDetail {
  _id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  status: 'open' | 'in-progress' | 'done'
  assignedTo?: string
  createdAt: string
  updatedAt: string
  activity?: Array<{
    message: string
    timestamp: string
  }>
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

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return `${Math.floor(diffInSeconds / 604800)}w ago`
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getSeverityBadge(priority: string) {
  const colors = {
    high: 'bg-danger/10 text-danger border-danger/20',
    medium: 'bg-warning/10 text-warning border-warning/20',
    low: 'bg-info/10 text-info border-info/20',
  }
  return colors[priority as keyof typeof colors] || colors.medium
}

function getStatusBadge(status: string) {
  const colors = {
    open: 'bg-info/10 text-info border-info/20',
    'in-progress': 'bg-warning/10 text-warning border-warning/20',
    done: 'bg-success/10 text-success border-success/20',
  }
  return colors[status as keyof typeof colors] || colors.open
}

export default function BugDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params?.id as string
  const bugId = params?.bugId as string

  const [bug, setBug] = useState<BugDetail | null>(null)
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    status: 'open',
    priority: 'medium',
    assignedTo: '',
  })

  useEffect(() => {
    if (!projectId || !bugId) return

    const load = async () => {
      try {
        setLoading(true)
        const [bugRes, projectRes] = await Promise.all([
          api.get(`/bugs/${bugId}`),
          api.get(`/projects/${projectId}`),
        ])

        const bugData = bugRes.data
        setBug(bugData)
        setProject(projectRes.data)
        setEditData({
          title: bugData.title || '',
          description: bugData.description || '',
          status: bugData.status || 'open',
          priority: bugData.priority || 'medium',
          assignedTo: bugData.assignedTo || '',
        })
      } catch (err: any) {
        console.error('Failed to load bug:', err)
        toast.error(err.response?.data?.error || 'Failed to load bug')
        router.push(`/projects/${projectId}/bugs`)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [projectId, bugId, router])

  const handleSave = async () => {
    if (!bug) return

    try {
      await api.patch(`/bugs/${bugId}`, editData)
      toast.success('Bug updated successfully')
      setEditing(false)
      // Reload bug data
      const res = await api.get(`/bugs/${bugId}`)
      setBug(res.data)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update bug')
    }
  }

  const handleDelete = async () => {
    if (!bug || !confirm('Are you sure you want to delete this bug?')) return

    try {
      await api.delete(`/bugs/${bugId}`)
      toast.success('Bug deleted successfully')
      router.push(`/projects/${projectId}/bugs`)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete bug')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-main text-primary flex items-center justify-center">
        <div className="text-secondary">Loading bug details...</div>
      </div>
    )
  }

  if (!bug || !project) {
    return (
      <div className="min-h-screen bg-main text-primary flex items-center justify-center">
        <div className="text-secondary">Bug not found</div>
      </div>
    )
  }

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
              {project.name}
            </Link>
            <span>›</span>
            <Link href={`/projects/${projectId}/bugs`} className="hover:text-primary">
              Bugs
            </Link>
            <span>›</span>
            <span className="text-secondary">#{bugId.slice(-6).toUpperCase()}</span>
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
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <Link
                href={`/projects/${projectId}/bugs`}
                className="flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Bugs List
              </Link>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-card-hover transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-card-hover transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bug ID and Tags */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-medium text-primary">#{bugId.slice(-6).toUpperCase()}</span>
              <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityBadge(bug.priority)}`}>
                {bug.priority === 'high' ? 'Critical' : bug.priority === 'medium' ? 'High' : bug.priority} Severity
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium border capitalize ${getStatusBadge(bug.status)}`}>
                {bug.status === 'in-progress' ? 'In Progress' : bug.status}
              </span>
            </div>

            {/* Title */}
            {editing ? (
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                className="w-full text-2xl font-semibold text-primary bg-input border border-default rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            ) : (
              <h1 className="text-2xl font-semibold text-primary">{bug.title}</h1>
            )}

            <div className="text-sm text-tertiary">
              Reported by {bug.assignedTo || 'Unassigned'} • Reported {formatTimeAgo(bug.createdAt)}
            </div>

            {/* Description */}
            <div className="bg-card border border-default rounded-xl p-6">
              <h2 className="text-sm font-semibold text-primary mb-4">DESCRIPTION</h2>
              {editing ? (
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows={8}
                  className="w-full text-sm text-primary bg-input border border-default rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              ) : (
                <p className="text-sm text-secondary whitespace-pre-wrap">
                  {bug.description || 'No description provided.'}
                </p>
              )}
            </div>

            {/* Attachments */}
            <div className="bg-card border border-default rounded-xl p-6">
              <h2 className="text-sm font-semibold text-primary mb-4">ATTACHMENTS (0)</h2>
              <p className="text-sm text-tertiary">No attachments yet.</p>
            </div>

            {/* Activity & Comments */}
            <div className="bg-card border border-default rounded-xl p-6">
              <h2 className="text-sm font-semibold text-primary mb-4">ACTIVITY & COMMENTS</h2>
              {bug.activity && bug.activity.length > 0 ? (
                <div className="space-y-4">
                  {bug.activity.map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-soft flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-primary">{activity.message}</p>
                        <p className="text-xs text-tertiary mt-1">{formatTimeAgo(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-tertiary">No activity recorded yet.</p>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-4">
            {/* Update Status Button */}
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary hover:bg-primary-hover text-black font-medium text-sm"
              >
                <Edit className="w-4 h-4" />
                Update Status
              </button>
            ) : null}

            {editing && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-secondary mb-1">Status</label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-input border border-default rounded-lg text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-secondary mb-1">Priority</label>
                  <select
                    value={editData.priority}
                    onChange={(e) => setEditData({ ...editData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-input border border-default rounded-lg text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <button
                  onClick={handleSave}
                  className="w-full px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-black font-medium text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditing(false)
                    // Reset edit data
                    if (bug) {
                      setEditData({
                        title: bug.title || '',
                        description: bug.description || '',
                        status: bug.status || 'open',
                        priority: bug.priority || 'medium',
                        assignedTo: bug.assignedTo || '',
                      })
                    }
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-default text-secondary hover:text-primary hover:bg-card-hover text-sm"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Assignee */}
            <div className="bg-card border border-default rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-tertiary" />
                <span className="text-xs font-semibold text-tertiary uppercase">ASSIGNEE</span>
              </div>
              {bug.assignedTo ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-soft flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">
                      {bug.assignedTo.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-primary">{bug.assignedTo}</span>
                </div>
              ) : (
                <span className="text-sm text-tertiary">Unassigned</span>
              )}
            </div>

            {/* Project */}
            <div className="bg-card border border-default rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Folder className="w-4 h-4 text-tertiary" />
                <span className="text-xs font-semibold text-tertiary uppercase">PROJECT</span>
              </div>
              <span className="text-sm text-primary">{project.name}</span>
            </div>

            {/* Labels */}
            <div className="bg-card border border-default rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-tertiary" />
                <span className="text-xs font-semibold text-tertiary uppercase">LABELS</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 rounded text-xs bg-primary-soft text-primary">Bug</span>
                <button className="px-2 py-1 rounded text-xs border border-default text-tertiary hover:text-primary hover:border-primary">
                  + Add Label
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="bg-card border border-default rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-tertiary" />
                <span className="text-xs font-semibold text-tertiary uppercase">DETAILS</span>
              </div>
              <div>
                <span className="text-xs text-tertiary">Created:</span>
                <span className="text-sm text-primary ml-2">{formatDate(bug.createdAt)}</span>
              </div>
              <div>
                <span className="text-xs text-tertiary">Updated:</span>
                <span className="text-sm text-primary ml-2">{formatTimeAgo(bug.updatedAt)}</span>
              </div>
              <div>
                <span className="text-xs text-tertiary">Reporter:</span>
                <span className="text-sm text-primary ml-2">{bug.assignedTo || 'Unknown'}</span>
              </div>
            </div>

            {/* Delete Button */}
            <button
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-danger/20 text-danger hover:bg-danger/10 transition-colors text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete Bug
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
