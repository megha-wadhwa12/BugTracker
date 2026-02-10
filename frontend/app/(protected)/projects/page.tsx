'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Bug, Search, Bell, MessageCircle, User, Plus, ChevronDown, Grid, List, Smartphone, Globe, Zap, Brain, Wrench, MoreVertical, Edit, Archive, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { projectFormSchema, ProjectFormValues } from '@/lib/validators/project'
import { getProjects, createProject, updateProject, deleteProject, archiveProject } from '@/services/projects'
import Modal from '@/components/Modal'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

interface Project {
  _id: string
  name: string
  description?: string
  owner: {
    _id: string
    name: string
    email: string
  }
  members?: string[]
  isArchived?: boolean
  createdAt: string
  updatedAt: string
}

const iconMap = [
  { icon: Smartphone, color: 'text-purple-400 bg-purple-400/20' },
  { icon: Globe, color: 'text-purple-400 bg-purple-400/20' },
  { icon: Zap, color: 'text-blue-400 bg-blue-400/20' },
  { icon: Brain, color: 'text-purple-400 bg-purple-400/20' },
  { icon: Wrench, color: 'text-orange-400 bg-orange-400/20' },
]

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
  
export default function ProjectsPage() {
  const pathname = usePathname()
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [archiveModalOpen, setArchiveModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const [sortFilter, setSortFilter] = useState('recently updated');
  const [statusFilter, setStatusFilter] = useState('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    formState: { errors: errorsCreate, isSubmitting: isSubmittingCreate },
    reset: resetCreate,
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: '',
      description: '',
    }
  })

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: errorsEdit, isSubmitting: isSubmittingEdit },
    reset: resetEdit,
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: '',
      description: '',
    }
  })

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      const refs = Object.values(menuRefs.current)

      const clickedInsideSomeMenu = refs.some(
        (ref) => ref && ref.contains(target)
      )

      if (!clickedInsideSomeMenu) {
        setMenuOpen(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const data = await getProjects()
      setProjects(data)
    } catch (error) {
      console.error('Failed to load projects:', error)
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (data: ProjectFormValues) => {
    try {
      await createProject(data)
      toast.success('Project created successfully')
      setCreateModalOpen(false)
      resetCreate()
      loadProjects()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create project')
    }
  }

  const handleEditProject = async (data: ProjectFormValues) => {
    if (!selectedProject) return
    try {
      await updateProject(selectedProject._id, data)
      toast.success('Project updated successfully')
      setEditModalOpen(false)
      setSelectedProject(null)
      resetEdit()
      loadProjects()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update project')
    }
  }

  const handleDeleteProject = async () => {
    if (!selectedProject) return
    try {
      await deleteProject(selectedProject._id)
      toast.success('Project deleted successfully')
      setDeleteModalOpen(false)
      setSelectedProject(null)
      loadProjects()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete project')
    }
  }

  const handleArchiveProject = async () => {
    if (!selectedProject) return
    try {
      await archiveProject(selectedProject._id, !selectedProject.isArchived)
      toast.success(`Project ${selectedProject.isArchived ? 'unarchived' : 'archived'} successfully`)
      setArchiveModalOpen(false)
      setSelectedProject(null)
      loadProjects()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to archive project')
    }
  }

  const openEditModal = (project: Project) => {
    setSelectedProject(project)
    resetEdit({
      name: project.name,
      description: project.description || '',
    })
    setEditModalOpen(true)
    setMenuOpen(null)
  }

  const openDeleteModal = (project: Project) => {
    setSelectedProject(project)
    setDeleteModalOpen(true)
    setMenuOpen(null)
  }

  const openArchiveModal = (project: Project) => {
    setSelectedProject(project)
    setArchiveModalOpen(true)
    setMenuOpen(null)
  }

  const getProjectIcon = (index: number) => {
    const iconData = iconMap[index % iconMap.length]
    const IconComponent = iconData.icon
    return { IconComponent, color: iconData.color }
  }

  const filteredProjects = useMemo(() => {
    let result = [...projects]

    // STATUS FILTER
    if (statusFilter === 'active') {
      result = result.filter(p => !p.isArchived)
    }

    if (statusFilter === 'archive') {
      result = result.filter(p => p.isArchived)
    }

    // ASSIGNEE FILTER
    if (assigneeFilter === 'me') {
      result = result.filter(
        p => p.owner?._id === currentUser?._id
      )
    }

    if (assigneeFilter === 'team') {
      result = result.filter(
        (p) => p.owner?._id !== currentUser?._id
      )
    }

    // SORT FILTER
    switch (sortFilter) {
      case 'recent':
        result.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() -
            new Date(a.updatedAt).getTime()
        )
        break

      case 'oldest':
        result.sort(
          (a, b) =>
            new Date(a.updatedAt).getTime() -
            new Date(b.updatedAt).getTime()
        )
        break

      case 'a-z':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break

      case 'z-a':
        result.sort((a, b) => b.name.localeCompare(a.name))
        break
    }

    return result
  }, [projects, sortFilter, statusFilter, assigneeFilter, currentUser])


  {
    filteredProjects.length === 0 && (
      <div className="col-span-full text-center text-secondary py-12">
        No projects found for selected filters
      </div>
    )
  }

  return (
    <div className="min-h-screen min-w-screen bg-main text-primary">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-card border-b border-default">
        <div className="h-16 px-8 flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary-soft flex items-center justify-center">
              <Bug className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-lg font-semibold text-primary">BugTrack Pro</h1>
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary" />
              <input
                type="text"
                placeholder="Search projects (Cmd+K)"
                className="w-full pl-10 pr-4 py-2 bg-input border border-default rounded-lg text-sm text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Right: Icons */}
          <div className="flex items-center gap-4 ml-6">
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
      <main className="p-8">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-4xl font-bold text-primary mb-2">Your Projects</h2>
            <p className="text-secondary text-base">
              Manage your team's software development lifecycle. Track bugs, features, and releases.
            </p>
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-black font-medium rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create New Project
          </button>
        </div>

        {/* Filter and View Options */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-tertiary">Sort:</span>
              <div className="relative">
                <select
                  value={sortFilter}
                  onChange={(e) => setSortFilter(e.target.value)}
                  className="appearance-none bg-card border border-default rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer">
                  <option value={'recent'}>Recently Updated</option>
                  <option value={'a-z'}>Name (A-Z)</option>
                  <option value={'z-a'}>Name (Z-A)</option>
                  <option value={'oldest'}>Oldest First</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-tertiary">Status:</span>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-card border border-default rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer">
                  <option value={'active'}>Active</option>
                  <option value={'archive'}>Archived</option>
                  <option value={'all'}>All</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-tertiary">Owner:</span>
              <div className="relative">
                <select
                  value={assigneeFilter}
                  onChange={(e) => setAssigneeFilter(e.target.value)}
                  className="appearance-none bg-card border border-default rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer">
                  <option value={'me'}>Me</option>
                  <option value={'all'}>All</option>
                  <option value={'team'}>Team</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary pointer-events-none" />
              </div>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 border border-default rounded-lg p-1 bg-card">
            <button className="p-2 rounded bg-primary-soft text-primary">
              <Grid className="w-4 h-4" />
            </button>
            <button className="p-2 rounded text-secondary hover:text-primary transition-colors">
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-secondary">Loading projects...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder Card */}
            <div
              onClick={() => setCreateModalOpen(true)}
              className="bg-card border border-default rounded-xl p-6 flex flex-col items-center justify-center min-h-60 hover:bg-card-hover transition-colors cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-primary-soft flex items-center justify-center mb-4">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <p className="text-primary font-medium">Start a new project</p>
            </div>

            {/* Project Cards */}
            {filteredProjects.map((project, index) => {
              const { IconComponent, color } = getProjectIcon(index)
              const memberCount = project.members?.length || 0

              return (
                <div
                  key={project._id}
                  className="bg-card border border-default rounded-xl p-6 hover:bg-card-hover transition-colors relative group"
                  onClick={() => router.push(`/projects/${project._id}/dashboard`)}
                >
                  {/* Menu Button */}
                  <div
                    className="absolute top-4 right-4"
                    ref={(el) => {
                      if (el) {
                        menuRefs.current[project._id] = el
                      } else {
                        delete menuRefs.current[project._id]
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setMenuOpen(menuOpen === project._id ? null : project._id)}
                      className="p-1.5 rounded-lg text-tertiary hover:text-primary hover:bg-card-hover transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {menuOpen === project._id && (
                      <div className="absolute right-0 top-8 mt-1 w-48 bg-card border border-default rounded-lg shadow-lg z-10">
                        <button
                          onClick={() => openEditModal(project)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-secondary hover:text-primary hover:bg-card-hover transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => openArchiveModal(project)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-secondary hover:text-primary hover:bg-card-hover transition-colors"
                        >
                          <Archive className="w-4 h-4" />
                          {project.isArchived ? 'Unarchive' : 'Archive'}
                        </button>
                        <button
                          onClick={() => openDeleteModal(project)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-card-hover transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start justify-between mb-4">
                    <div className={`${color} p-2 rounded-lg`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-tertiary mr-5">{formatTimeAgo(project.updatedAt)}</span>
                  </div>

                  <h3 className="text-lg font-semibold text-primary mb-2">{project.name}</h3>
                  <p className="text-sm text-secondary mb-4 line-clamp-2">
                    {project.description || 'No description'}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success" />
                      <span className="text-sm text-secondary">Active</span>
                    </div>

                    <div className="flex items-center -space-x-2">
                      {Array.from({ length: Math.min(memberCount, 2) }).map((_, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded-full bg-primary-soft border-2 border-card flex items-center justify-center"
                        >
                          <User className="w-3 h-3 text-primary" />
                        </div>
                      ))}
                      {memberCount > 2 && (
                        <span className="text-xs text-tertiary ml-2">+{memberCount - 2}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false)
          resetCreate()
        }}
        title="Create New Project"
        size="md"
      >
        <form onSubmit={handleSubmitCreate(handleCreateProject)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Project Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              {...registerCreate('name')}
              placeholder="Enter project name"
              className="w-full px-3 py-2 bg-input border border-default rounded-lg text-sm text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errorsCreate.name && (
              <p className="text-xs text-danger mt-1">{errorsCreate.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Description</label>
            <textarea
              {...registerCreate('description')}
              placeholder="Enter project description"
              rows={4}
              className="w-full px-3 py-2 bg-input border border-default rounded-lg text-sm text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            {errorsCreate.description && (
              <p className="text-xs text-danger mt-1">{errorsCreate.description.message}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setCreateModalOpen(false)
                resetCreate()
              }}
              className="px-4 py-2 text-sm font-medium text-secondary hover:text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingCreate}
              className="px-4 py-2 text-sm font-medium bg-primary hover:bg-primary-hover text-black rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmittingCreate ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Project Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setSelectedProject(null)
          resetEdit()
        }}
        title="Edit Project"
        size="md"
      >
        <form onSubmit={handleSubmitEdit(handleEditProject)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Project Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              {...registerEdit('name')}
              placeholder="Enter project name"
              className="w-full px-3 py-2 bg-input border border-default rounded-lg text-sm text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errorsEdit.name && (
              <p className="text-xs text-danger mt-1">{errorsEdit.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Description</label>
            <textarea
              {...registerEdit('description')}
              placeholder="Enter project description"
              rows={4}
              className="w-full px-3 py-2 bg-input border border-default rounded-lg text-sm text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            {errorsEdit.description && (
              <p className="text-xs text-danger mt-1">{errorsEdit.description.message}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setEditModalOpen(false)
                setSelectedProject(null)
                resetEdit()
              }}
              className="px-4 py-2 text-sm font-medium text-secondary hover:text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingEdit}
              className="px-4 py-2 text-sm font-medium bg-primary hover:bg-primary-hover text-black rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmittingEdit ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setSelectedProject(null)
        }}
        title="Delete Project"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-secondary">
            Are you sure you want to delete <span className="font-semibold text-primary">{selectedProject?.name}</span>? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setDeleteModalOpen(false)
                setSelectedProject(null)
              }}
              className="px-4 py-2 text-sm font-medium text-secondary hover:text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteProject}
              className="px-4 py-2 text-sm font-medium bg-danger hover:bg-danger/90 text-white rounded-lg transition-colors"
            >
              Delete Project
            </button>
          </div>
        </div>
      </Modal>

      {/* Archive Confirmation Modal */}
      <Modal
        isOpen={archiveModalOpen}
        onClose={() => {
          setArchiveModalOpen(false)
          setSelectedProject(null)
        }}
        title={selectedProject?.isArchived ? 'Unarchive Project' : 'Archive Project'}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-secondary">
            Are you sure you want to {selectedProject?.isArchived ? 'unarchive' : 'archive'}{' '}
            <span className="font-semibold text-primary">{selectedProject?.name}</span>?
          </p>
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setArchiveModalOpen(false)
                setSelectedProject(null)
              }}
              className="px-4 py-2 text-sm font-medium text-secondary hover:text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleArchiveProject}
              className="px-4 py-2 text-sm font-medium bg-primary hover:bg-primary-hover text-black rounded-lg transition-colors"
            >
              {selectedProject?.isArchived ? 'Unarchive' : 'Archive'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
