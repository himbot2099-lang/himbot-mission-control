"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  Zap,
  AlertCircle,
  Clock,
  Hash,
  Cpu,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  idle: {
    label: "Idle",
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
    dot: "bg-slate-400",
    icon: Clock,
    pulse: false,
  },
  working: {
    label: "Working",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/30",
    dot: "bg-indigo-400",
    icon: Activity,
    pulse: true,
  },
  error: {
    label: "Error",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    dot: "bg-red-400",
    icon: AlertCircle,
    pulse: false,
  },
};

const AGENT_COLORS: Record<string, string> = {
  Researcher: "from-blue-500/20 to-cyan-500/10",
  Coder: "from-emerald-500/20 to-teal-500/10",
  Writer: "from-purple-500/20 to-pink-500/10",
  "Fact Extractor": "from-amber-500/20 to-orange-500/10",
  Monitor: "from-red-500/20 to-rose-500/10",
  Designer: "from-fuchsia-500/20 to-purple-500/10",
  Analyst: "from-indigo-500/20 to-blue-500/10",
  Ops: "from-slate-500/20 to-zinc-500/10",
};

interface Agent {
  _id: Id<"agents">;
  name: string;
  role: string;
  description: string;
  status: "idle" | "working" | "error";
  currentTask?: string;
  lastActive: number;
  totalRuns: number;
  avatar?: string;
}

function AgentCard({ agent }: { agent: Agent }) {
  const statusConfig = STATUS_CONFIG[agent.status];
  const StatusIcon = statusConfig.icon;
  const gradient = AGENT_COLORS[agent.name] ?? "from-slate-500/20 to-zinc-500/10";

  return (
    <Card className={cn(
      "border card-glow overflow-hidden transition-all duration-300",
      statusConfig.border
    )}>
      {/* Gradient top bar */}
      <div className={cn("h-1 w-full bg-gradient-to-r", gradient)} />

      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-gradient-to-br",
            gradient
          )}>
            {agent.avatar || "🤖"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-semibold text-foreground truncate">{agent.name}</h3>
            </div>
            <p className="text-xs text-muted-foreground">{agent.role}</p>
          </div>
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0",
            statusConfig.bg,
            statusConfig.color
          )}>
            <div className={cn(
              "w-1.5 h-1.5 rounded-full shrink-0",
              statusConfig.dot,
              statusConfig.pulse && "animate-pulse"
            )} />
            {statusConfig.label}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">{agent.description}</p>

        {/* Current task (if working) */}
        {agent.currentTask && agent.status === "working" && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <Zap className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
            <p className="text-xs text-indigo-300 leading-relaxed">{agent.currentTask}</p>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{formatDistanceToNow(new Date(agent.lastActive), { addSuffix: true })}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Hash className="w-3 h-3" />
            <span>{agent.totalRuns} runs</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatSummary({ agents }: { agents: Agent[] }) {
  const working = agents.filter((a) => a.status === "working").length;
  const idle = agents.filter((a) => a.status === "idle").length;
  const error = agents.filter((a) => a.status === "error").length;
  const totalRuns = agents.reduce((sum, a) => sum + a.totalRuns, 0);

  return (
    <div className="grid grid-cols-4 gap-3">
      {[
        { label: "Total Agents", value: agents.length, color: "text-foreground" },
        { label: "Working", value: working, color: "text-indigo-400" },
        { label: "Idle", value: idle, color: "text-slate-400" },
        { label: "Total Runs", value: totalRuns, color: "text-amber-400" },
      ].map((stat) => (
        <div key={stat.label} className="bg-card/80 border border-border/50 rounded-lg p-3 text-center">
          <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function TeamPage() {
  const agents = useQuery(api.agents.list, {});
  const seedAgents = useMutation(api.agents.seed);

  useEffect(() => {
    if (agents !== undefined && agents.length === 0) {
      seedAgents({});
    }
  }, [agents, seedAgents]);

  const isLoading = agents === undefined;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Agent Roster</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Himbot&apos;s specialized sub-agent team
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            {agents?.filter((a) => a.status === "working").length ?? 0} working now
          </span>
        </div>
      </div>

      {/* Stats */}
      {agents && agents.length > 0 && <StatSummary agents={agents} />}

      {/* Agent Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border border-border/50">
              <CardContent className="p-5 h-44 animate-pulse" />
            </Card>
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Cpu className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Loading agent roster...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <AgentCard key={agent._id} agent={agent} />
          ))}
        </div>
      )}

      {/* Integration note */}
      <div className="text-center py-4 border-t border-border/30">
        <p className="text-xs text-muted-foreground">
          Agent status is updated in real-time via{" "}
          <code className="bg-muted/50 px-1.5 py-0.5 rounded text-xs font-mono">POST /api/agents</code>
        </p>
      </div>
    </div>
  );
}
