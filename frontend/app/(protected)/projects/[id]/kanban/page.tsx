'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bug, Search, Plus, Bell, MessageCircle, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { getBugs, updateBug } from '@/services/bugs'
import { getProjectById } from '@/services/projects'
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
} from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'

interface BugItem {
    _id: string
    title: string
    description?: string
    priority: 'low' | 'medium' | 'high'
    status: 'open' | 'in-progress' | 'done'
    assignedTo?: string
    createdAt: string
    updatedAt: string
    project?: string
}

interface ProjectDetail {
    _id: string
    name: string
}

function formatTimeAgo(date: string): string {
    const now = new Date()
    const past = new Date(date)
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`
    return `${Math.floor(diffInSeconds / 604800)}w`
}

function getPriorityBadge(priority: string) {
    switch (priority) {
        case 'high':
            return <span className="px-2 py-0.5 text-xs rounded-full bg-danger/10 text-danger uppercase">Critical</span>
        case 'medium':
            return <span className="px-2 py-0.5 text-xs rounded-full bg-warning/10 text-warning uppercase">High</span>
        case 'low':
            return <span className="px-2 py-0.5 text-xs rounded-full bg-info/10 text-info uppercase">Low</span>
        default:
            return null
    }
}

// Draggable Bug Card Component
function DraggableBugCard({ bug, onClick }: { bug: BugItem; onClick: () => void }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: bug._id,
        data: { bug },
    })

    const style = transform
        ? {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
            opacity: isDragging ? 0.5 : 1,
        }
        : undefined

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={(e) => {
                if (!isDragging) {
                    onClick()
                }
            }}
            className={`w-full bg-card border border-default rounded-xl p-4 hover:bg-card-hover transition-colors ${isDragging ? 'cursor-grabbing' : 'cursor-grab'
                }`}
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-tertiary">#{bug._id.slice(-6).toUpperCase()}</span>
                {getPriorityBadge(bug.priority)}
            </div>

            <h4 className="text-sm font-medium text-primary mb-2">{bug.title}</h4>

            {bug.description && <p className="text-xs text-tertiary mb-3 line-clamp-2">{bug.description}</p>}

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {bug.assignedTo && (
                        <div className="w-6 h-6 rounded-full bg-primary-soft flex items-center justify-center">
                            <span className="text-xs font-semibold text-primary">{bug.assignedTo.charAt(0).toUpperCase()}</span>
                        </div>
                    )}
                    <span className="text-xs text-tertiary">{formatTimeAgo(bug.updatedAt)}</span>
                </div>
            </div>
        </div>
    )
}

// Droppable Column Component
function DroppableColumn({
    id,
    title,
    count,
    bugs,
    onBugClick,
}: {
    id: string
    title: string
    count: number
    bugs: BugItem[]
    onBugClick: (bugId: string) => void
}) {
    const { setNodeRef, isOver } = useDroppable({
        id,
    })

    return (
        <div className="flex flex-col">
            <div className="bg-card border border-default rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">{title}</h3>
                    <span className="text-xs text-tertiary bg-input px-2 py-1 rounded-full">{count}</span>
                </div>
            </div>

            <div
                ref={setNodeRef}
                className={`space-y-3 flex-1 min-h-[200px] rounded-xl p-2 transition-colors ${isOver ? 'bg-primary-soft/20 border-2 border-primary border-dashed' : ''
                    }`}
            >
                {bugs.length === 0 ? (
                    <div className="bg-card border border-default border-dashed rounded-xl p-6 text-center">
                        <p className="text-sm text-tertiary">
                            {title === 'Backlog' && 'No bugs in backlog'}
                            {title === 'In Progress' && 'No bugs in progress'}
                            {title === 'Done' && 'No completed bugs'}
                        </p>
                    </div>
                ) : (
                    bugs.map((bug) => <DraggableBugCard key={bug._id} bug={bug} onClick={() => onBugClick(bug._id)} />)
                )}

                <button className="w-full bg-card border border-default border-dashed rounded-xl p-3 text-sm text-secondary hover:text-primary hover:bg-card-hover transition-colors flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add issue
                </button>
            </div>
        </div>
    )
}

export default function KanbanPage() {
    const params = useParams()
    const router = useRouter()
    const projectId = params?.id as string

    const [project, setProject] = useState<ProjectDetail | null>(null)
    const [bugs, setBugs] = useState<BugItem[]>([])
    const [loading, setLoading] = useState(true)
    const [activeBug, setActiveBug] = useState<BugItem | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    )

    const loadProjectAndBugs = async () => {
        if (!projectId) return

        try {
            setLoading(true)

            const [projectData, bugsData] = await Promise.all([
                getProjectById(projectId),
                getBugs({ projectId }),
            ])

            setProject(projectData)
            setBugs(bugsData || [])
        } catch (err: any) {
            console.error('Failed to load bugs:', err)
            toast.error(err.response?.data?.error || 'Failed to load bugs')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadProjectAndBugs()
    }, [projectId])

    const backlogBugs = bugs.filter((bug) => bug.status === 'open')
    const inProgressBugs = bugs.filter((bug) => bug.status === 'in-progress')
    const doneBugs = bugs.filter((bug) => bug.status === 'done')

    const handleBugClick = (bugId: string) => {
        router.push(`/projects/${projectId}/bugs/${bugId}`)
    }

    const handleDragStart = (event: DragStartEvent) => {
        const bug = event.active.data.current?.bug as BugItem
        setActiveBug(bug)
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        setActiveBug(null)

        if (!over) return

        const bugId = active.id as string
        const targetColumn = over.id as string

        // Map column IDs to status values
        const statusMap: Record<string, 'open' | 'in-progress' | 'done'> = {
            backlog: 'open',
            'in-progress': 'in-progress',
            done: 'done',
        }

        const newStatus = statusMap[targetColumn]
        if (!newStatus) return

        const bug = bugs.find((b) => b._id === bugId)
        if (!bug || bug.status === newStatus) return

        // Optimistic update
        setBugs((prevBugs) =>
            prevBugs.map((b) => (b._id === bugId ? { ...b, status: newStatus } : b))
        )

        try {
            await updateBug(bugId, { status: newStatus })
            toast.success(`Bug moved to ${targetColumn === 'backlog' ? 'Backlog' : targetColumn === 'in-progress' ? 'In Progress' : 'Done'}`)
        } catch (err: any) {
            console.error('Failed to update bug:', err)
            toast.error(err.response?.data?.error || 'Failed to update bug status')
            // Revert on error
            setBugs((prevBugs) =>
                prevBugs.map((b) => (b._id === bugId ? { ...b, status: bug.status } : b))
            )
        }
    }

    if (!projectId) return null

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
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
                            <span className="text-secondary">Kanban Board</span>
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
                            <h2 className="text-2xl font-semibold text-primary mb-1">Kanban Board</h2>
                            <p className="text-sm text-secondary">Visualize progress and move tasks through your workflow.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-black text-sm font-medium">
                                <Plus className="w-4 h-4" />
                                Create Bug
                            </button>
                        </div>
                    </div>

                    {/* Kanban Board */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-secondary">Loading kanban board...</div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-6">
                            <DroppableColumn
                                id="backlog"
                                title="Backlog"
                                count={backlogBugs.length}
                                bugs={backlogBugs}
                                onBugClick={handleBugClick}
                            />
                            <DroppableColumn
                                id="in-progress"
                                title="In Progress"
                                count={inProgressBugs.length}
                                bugs={inProgressBugs}
                                onBugClick={handleBugClick}
                            />
                            <DroppableColumn
                                id="done"
                                title="Done"
                                count={doneBugs.length}
                                bugs={doneBugs}
                                onBugClick={handleBugClick}
                            />
                        </div>
                    )}
                </main>
            </div>

            {/* Drag Overlay */}
            <DragOverlay>
                {activeBug ? (
                    <div className="w-full max-w-sm bg-card border border-primary rounded-xl p-4 shadow-lg opacity-90">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-tertiary">#{activeBug._id.slice(-6).toUpperCase()}</span>
                            {getPriorityBadge(activeBug.priority)}
                        </div>
                        <h4 className="text-sm font-medium text-primary mb-2">{activeBug.title}</h4>
                        {activeBug.description && <p className="text-xs text-tertiary mb-3 line-clamp-2">{activeBug.description}</p>}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}
