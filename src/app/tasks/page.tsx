"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { formatDistanceToNow } from "date-fns";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Flag, User, Bot, GripVertical, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type TaskStatus = "backlog" | "in_progress" | "review" | "done";
type TaskPriority = "low" | "medium" | "high" | "urgent";
type TaskAssignee = "ryan" | "himbot";

interface Task {
  _id: Id<"tasks">;
  title: string;
  description?: string;
  status: TaskStatus;
  assignee: TaskAssignee;
  priority: TaskPriority;
  createdAt: number;
  updatedAt: number;
}

const COLUMNS: { id: TaskStatus; label: string; color: string; bg: string; accent: string }[] = [
  { id: "backlog", label: "Backlog", color: "text-slate-400", bg: "bg-slate-500/10", accent: "border-slate-500/30" },
  { id: "in_progress", label: "In Progress", color: "text-indigo-400", bg: "bg-indigo-500/10", accent: "border-indigo-500/30" },
  { id: "review", label: "Review", color: "text-amber-400", bg: "bg-amber-500/10", accent: "border-amber-500/30" },
  { id: "done", label: "Done", color: "text-emerald-400", bg: "bg-emerald-500/10", accent: "border-emerald-500/30" },
];

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; dot: string }> = {
  low: { label: "Low", color: "text-slate-400", dot: "bg-slate-400" },
  medium: { label: "Medium", color: "text-blue-400", dot: "bg-blue-400" },
  high: { label: "High", color: "text-amber-400", dot: "bg-amber-400" },
  urgent: { label: "Urgent", color: "text-red-400", dot: "bg-red-400" },
};

function TaskCard({ task, isDragging = false }: { task: Task; isDragging?: boolean }) {
  const removeTask = useMutation(api.tasks.remove);
  const priority = PRIORITY_CONFIG[task.priority];

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isSortableDragging && !isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-24 rounded-lg border border-dashed border-border/50 bg-card/30"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative bg-card border border-border/50 rounded-lg p-3 space-y-2.5 card-glow cursor-default",
        isDragging && "shadow-lg shadow-black/30 rotate-1 scale-105"
      )}
    >
      <div className="flex items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
        </div>
        <p className="text-sm font-medium text-foreground flex-1 leading-snug">{task.title}</p>
        <button
          onClick={() => removeTask({ id: task._id })}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {task.description && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 pl-5">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between pl-5">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
          <span className={`text-xs font-medium ${priority.color}`}>{priority.label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {task.assignee === "himbot" ? (
            <Bot className="w-3 h-3 text-indigo-400" />
          ) : (
            <User className="w-3 h-3 text-purple-400" />
          )}
          <span className="text-xs text-muted-foreground capitalize">{task.assignee}</span>
        </div>
      </div>

      <div className="pl-5">
        <span className="text-xs text-muted-foreground/60">
          {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
}

function AddTaskModal({
  open,
  onClose,
  defaultStatus,
}: {
  open: boolean;
  onClose: () => void;
  defaultStatus: TaskStatus;
}) {
  const createTask = useMutation(api.tasks.create);
  const logActivity = useMutation(api.activities.log);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [assignee, setAssignee] = useState<TaskAssignee>("himbot");
  const [priority, setPriority] = useState<TaskPriority>("medium");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await createTask({ title, description: description || undefined, status, assignee, priority });
    await logActivity({ type: "task_created", description: `Task created: ${title}` });
    setTitle("");
    setDescription("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border border-border/60 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details..."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLUMNS.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Assignee</Label>
              <Select value={assignee} onValueChange={(v) => setAssignee(v as TaskAssignee)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="himbot" className="text-xs">Himbot</SelectItem>
                  <SelectItem value="ryan" className="text-xs">Ryan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k} className="text-xs">{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="submit" className="flex-1 bg-primary/90 hover:bg-primary">Create Task</Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function KanbanColumn({
  column,
  tasks,
  onAddTask,
  assigneeFilter,
}: {
  column: typeof COLUMNS[0];
  tasks: Task[];
  onAddTask: (status: TaskStatus) => void;
  assigneeFilter: string;
}) {
  const filtered = assigneeFilter === "all"
    ? tasks
    : tasks.filter((t) => t.assignee === assigneeFilter);

  return (
    <div className={`flex flex-col rounded-xl border ${column.accent} ${column.bg} min-w-[280px] max-w-[320px] w-full`}>
      {/* Column Header */}
      <div className="flex items-center justify-between p-3 pb-2">
        <div className="flex items-center gap-2">
          <h3 className={`text-sm font-semibold ${column.color}`}>{column.label}</h3>
          <Badge variant="secondary" className="text-xs h-5 px-1.5">{filtered.length}</Badge>
        </div>
        <button
          onClick={() => onAddTask(column.id)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Cards */}
      <div className="flex-1 p-2 space-y-2 min-h-[100px]">
        <SortableContext items={filtered.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          {filtered.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </SortableContext>

        {filtered.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-muted-foreground/50">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}

export default function TasksPage() {
  const tasks = useQuery(api.tasks.list, {});
  const updateStatus = useMutation(api.tasks.updateStatus);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [addModalStatus, setAddModalStatus] = useState<TaskStatus | null>(null);
  const [assigneeFilter, setAssigneeFilter] = useState("all");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = tasks?.find((t) => t._id === event.active.id);
    if (task) setActiveTask(task);
  }, [tasks]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as Id<"tasks">;
    const overId = over.id as string;

    // Check if dropped over a column ID
    const targetColumn = COLUMNS.find((c) => c.id === overId);
    if (targetColumn) {
      await updateStatus({ id: taskId, status: targetColumn.id });
      return;
    }

    // Check if dropped over another task
    const targetTask = tasks?.find((t) => t._id === overId);
    if (targetTask && targetTask.status !== activeTask?.status) {
      await updateStatus({ id: taskId, status: targetTask.status });
    }
  }, [tasks, activeTask, updateStatus]);

  const tasksByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks?.filter((t) => t.status === col.id) ?? [];
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <div>
          <h1 className="text-xl font-bold">Task Board</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {tasks?.length ?? 0} total tasks · real-time sync
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filter */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            {[
              { value: "all", label: "All" },
              { value: "himbot", label: "Himbot" },
              { value: "ryan", label: "Ryan" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAssigneeFilter(opt.value)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-md font-medium transition-colors",
                  assigneeFilter === opt.value
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={() => setAddModalStatus("backlog")} className="gap-1.5">
            <Plus className="w-4 h-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full">
            {COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={tasksByStatus[column.id]}
                onAddTask={setAddModalStatus}
                assigneeFilter={assigneeFilter}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask && (
              <div className="opacity-90">
                <TaskCard task={activeTask} isDragging />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Add Task Modal */}
      <AddTaskModal
        open={addModalStatus !== null}
        onClose={() => setAddModalStatus(null)}
        defaultStatus={addModalStatus ?? "backlog"}
      />
    </div>
  );
}
