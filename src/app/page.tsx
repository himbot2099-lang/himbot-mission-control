"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  CheckSquare,
  Brain,
  Clock,
  Cpu,
  TrendingUp,
  Zap,
  Activity,
  ListTodo,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const activityIcons: Record<string, React.ReactNode> = {
  task_created: <ListTodo className="w-4 h-4 text-indigo-400" />,
  task_completed: <CheckSquare className="w-4 h-4 text-emerald-400" />,
  task_updated: <TrendingUp className="w-4 h-4 text-blue-400" />,
  memory_updated: <Brain className="w-4 h-4 text-purple-400" />,
  cron_ran: <Zap className="w-4 h-4 text-amber-400" />,
  agent_spawned: <Cpu className="w-4 h-4 text-cyan-400" />,
};

const activityColors: Record<string, string> = {
  task_created: "bg-indigo-500/10 border-indigo-500/20",
  task_completed: "bg-emerald-500/10 border-emerald-500/20",
  task_updated: "bg-blue-500/10 border-blue-500/20",
  memory_updated: "bg-purple-500/10 border-purple-500/20",
  cron_ran: "bg-amber-500/10 border-amber-500/20",
  agent_spawned: "bg-cyan-500/10 border-cyan-500/20",
};

function StatCard({
  title,
  value,
  subtitle,
  icon,
  accent,
  loading,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  accent: string;
  loading?: boolean;
}) {
  return (
    <Card className="card-glow border border-border/50 bg-card/80 backdrop-blur">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className={`text-3xl font-bold ${accent}`}>{value}</p>
            )}
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className={`p-2.5 rounded-lg ${accent.replace("text-", "bg-").replace("-400", "-500/15")}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const taskCounts = useQuery(api.tasks.counts, {});
  const activities = useQuery(api.activities.list, { limit: 10 });
  const agents = useQuery(api.agents.list, {});
  const cronJobs = useQuery(api.cronJobs.list, {});
  const seedAll = useMutation(api.seed.seedAll);
  const seedAgents = useMutation(api.agents.seed);
  const seedCrons = useMutation(api.cronJobs.seed);

  // Auto-seed on first load
  useEffect(() => {
    if (activities !== undefined && activities.length === 0) {
      seedAll({});
    }
    if (agents !== undefined && agents.length === 0) {
      seedAgents({});
    }
    if (cronJobs !== undefined && cronJobs.length === 0) {
      seedCrons({});
    }
  }, [activities, agents, cronJobs, seedAll, seedAgents, seedCrons]);

  const workingAgents = agents?.filter((a) => a.status === "working").length ?? 0;
  const activeJobs = cronJobs?.filter((j) => j.status === "active").length ?? 0;
  const lastActivity = activities?.[0];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Mission Control</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Online
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Tasks"
          value={taskCounts?.in_progress ?? "—"}
          subtitle={`${taskCounts?.backlog ?? 0} in backlog`}
          icon={<ListTodo className="w-5 h-5 text-indigo-400" />}
          accent="text-indigo-400"
          loading={taskCounts === undefined}
        />
        <StatCard
          title="Memory Files"
          value="—"
          subtitle="sync via API"
          icon={<Brain className="w-5 h-5 text-purple-400" />}
          accent="text-purple-400"
        />
        <StatCard
          title="Cron Jobs"
          value={activeJobs}
          subtitle="active schedules"
          icon={<Clock className="w-5 h-5 text-amber-400" />}
          accent="text-amber-400"
          loading={cronJobs === undefined}
        />
        <StatCard
          title="Agents"
          value={workingAgents}
          subtitle={`${agents?.length ?? 0} total roster`}
          icon={<Cpu className="w-5 h-5 text-cyan-400" />}
          accent="text-cyan-400"
          loading={agents === undefined}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <Card className="border border-border/50 bg-card/80 backdrop-blur h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pb-4">
              {activities === undefined ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-2.5">
                    <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-3.5 w-3/4" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))
              ) : activities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No activity yet. Push events via the API.
                </div>
              ) : (
                activities.map((activity) => (
                  <div
                    key={activity._id}
                    className={`flex items-start gap-3 p-2.5 rounded-lg border ${activityColors[activity.type] ?? "bg-muted/30 border-border/30"}`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {activityIcons[activity.type] ?? <AlertCircle className="w-4 h-4 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Task Status */}
          <Card className="border border-border/50 bg-card/80 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-primary" />
                Task Board Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {taskCounts === undefined ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-5 w-8" />
                  </div>
                ))
              ) : (
                [
                  { label: "Backlog", value: taskCounts.backlog, color: "text-slate-400", bg: "bg-slate-500/10" },
                  { label: "In Progress", value: taskCounts.in_progress, color: "text-indigo-400", bg: "bg-indigo-500/10" },
                  { label: "In Review", value: taskCounts.review, color: "text-amber-400", bg: "bg-amber-500/10" },
                  { label: "Done", value: taskCounts.done, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className={`text-sm font-semibold px-2 py-0.5 rounded ${item.color} ${item.bg}`}>
                      {item.value}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* System Info */}
          <Card className="border border-border/50 bg-card/80 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Model</span>
                <Badge variant="secondary" className="text-xs font-mono">sonnet-4-6</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform</span>
                <span className="text-foreground font-medium">OpenClaw</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Host</span>
                <span className="text-foreground font-medium">macOS (arm64)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Heartbeat</span>
                {lastActivity ? (
                  <span className="text-emerald-400 font-medium text-xs">
                    {formatDistanceToNow(new Date(lastActivity.timestamp), { addSuffix: true })}
                  </span>
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 font-medium">Online</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Agents */}
          {agents && agents.filter((a) => a.status === "working").length > 0 && (
            <Card className="border border-indigo-500/20 bg-indigo-500/5 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  Working Now
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {agents
                  .filter((a) => a.status === "working")
                  .map((agent) => (
                    <div key={agent._id} className="flex items-center gap-2">
                      <span className="text-sm">{agent.avatar || "🤖"}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground truncate">{agent.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{agent.currentTask}</p>
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse shrink-0" />
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
