"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Agent {
  _id: string;
  name: string;
  role: string;
  status: "idle" | "working" | "error";
  currentTask?: string;
  avatar?: string;
  totalRuns: number;
}

const DESK_POSITIONS = [
  { x: "8%", y: "15%", rotate: 0 },
  { x: "28%", y: "15%", rotate: 0 },
  { x: "48%", y: "15%", rotate: 0 },
  { x: "68%", y: "15%", rotate: 0 },
  { x: "8%", y: "50%", rotate: 0 },
  { x: "28%", y: "50%", rotate: 0 },
  { x: "48%", y: "50%", rotate: 0 },
  { x: "68%", y: "50%", rotate: 0 },
];

const AGENT_COLORS: Record<string, { desk: string; glow: string }> = {
  Researcher: { desk: "border-blue-500/40 bg-blue-500/5", glow: "shadow-blue-500/20" },
  Coder: { desk: "border-emerald-500/40 bg-emerald-500/5", glow: "shadow-emerald-500/20" },
  Writer: { desk: "border-purple-500/40 bg-purple-500/5", glow: "shadow-purple-500/20" },
  "Fact Extractor": { desk: "border-amber-500/40 bg-amber-500/5", glow: "shadow-amber-500/20" },
  Monitor: { desk: "border-red-500/40 bg-red-500/5", glow: "shadow-red-500/20" },
  Designer: { desk: "border-fuchsia-500/40 bg-fuchsia-500/5", glow: "shadow-fuchsia-500/20" },
  Analyst: { desk: "border-indigo-500/40 bg-indigo-500/5", glow: "shadow-indigo-500/20" },
  Ops: { desk: "border-slate-500/40 bg-slate-500/5", glow: "shadow-slate-500/20" },
};

function FloatingParticle({ delay }: { delay: number }) {
  return (
    <div
      className="absolute w-1 h-1 rounded-full bg-indigo-400/30 animate-float"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${3 + Math.random() * 2}s`,
      }}
    />
  );
}

function AgentDesk({
  agent,
  position,
  index,
  onClick,
  isSelected,
}: {
  agent: Agent;
  position: { x: string; y: string; rotate: number };
  index: number;
  onClick: () => void;
  isSelected: boolean;
}) {
  const colors = AGENT_COLORS[agent.name] ?? { desk: "border-border/40 bg-muted/10", glow: "shadow-border/20" };
  const isWorking = agent.status === "working";
  const isError = agent.status === "error";

  return (
    <div
      className="absolute flex flex-col items-center gap-1 cursor-pointer group"
      style={{ left: position.x, top: position.y, transform: `rotate(${position.rotate}deg)` }}
      onClick={onClick}
    >
      {/* Status speech bubble */}
      {isWorking && agent.currentTask && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-36 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-indigo-500/90 text-white text-xs px-2.5 py-1.5 rounded-lg leading-tight text-center shadow-lg">
            {agent.currentTask}
          </div>
          <div className="w-2 h-2 bg-indigo-500/90 rotate-45 mx-auto -mt-1" />
        </div>
      )}

      {/* Desk */}
      <div
        className={cn(
          "w-28 h-20 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 shadow-lg relative",
          colors.desk,
          isSelected && "scale-110 ring-2 ring-primary ring-offset-2 ring-offset-background",
          isWorking && `${colors.glow} shadow-xl`
        )}
        style={{ animationDelay: `${index * 0.3}s` }}
      >
        {/* Monitor */}
        <div className={cn(
          "w-14 h-9 rounded border flex items-center justify-center",
          isWorking
            ? "border-indigo-400/60 bg-indigo-500/20"
            : isError
            ? "border-red-400/60 bg-red-500/20"
            : "border-border/40 bg-muted/30"
        )}>
          {isWorking ? (
            <div className="text-xs font-mono text-indigo-300 animate-pulse">
              {["01", "10", "><", "{}", "//"][index % 5]}
            </div>
          ) : isError ? (
            <span className="text-red-400 text-xs">!</span>
          ) : (
            <div className="w-8 h-1 bg-muted/60 rounded" />
          )}
        </div>
        {/* Keyboard */}
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1.5 h-1 rounded-sm",
                isWorking ? "bg-indigo-400/40" : "bg-muted/40"
              )}
            />
          ))}
        </div>
      </div>

      {/* Agent Avatar */}
      <div
        className={cn(
          "relative -mt-5 w-10 h-10 rounded-full border-2 flex items-center justify-center text-xl bg-card shadow-lg transition-all",
          isWorking ? "border-indigo-400 animate-float" : "border-border/50",
          isError && "border-red-400"
        )}
        style={{ animationDelay: `${index * 0.4}s` }}
      >
        {agent.avatar || "🤖"}
        {/* Status dot */}
        <div className={cn(
          "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card",
          isWorking ? "bg-indigo-400 animate-pulse" : isError ? "bg-red-400" : "bg-slate-500"
        )} />
      </div>

      {/* Name + Role */}
      <div className="text-center">
        <div className="text-xs font-semibold text-foreground leading-tight">{agent.name}</div>
        <div className="text-xs text-muted-foreground leading-tight">{agent.role}</div>
      </div>
    </div>
  );
}

function AgentDetailPanel({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  return (
    <div className="absolute bottom-6 right-6 w-72 bg-card/95 border border-border/60 rounded-2xl shadow-2xl p-5 backdrop-blur z-30">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground text-sm"
      >
        ✕
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl border border-border/50 flex items-center justify-center text-2xl bg-muted/20">
          {agent.avatar || "🤖"}
        </div>
        <div>
          <div className="font-semibold text-foreground">{agent.name}</div>
          <div className="text-xs text-muted-foreground">{agent.role}</div>
        </div>
        <div className={cn(
          "ml-auto text-xs font-medium px-2.5 py-1 rounded-full",
          agent.status === "working" ? "bg-indigo-500/20 text-indigo-400" :
          agent.status === "error" ? "bg-red-500/20 text-red-400" :
          "bg-slate-500/20 text-slate-400"
        )}>
          {agent.status}
        </div>
      </div>

      {agent.currentTask && agent.status === "working" && (
        <div className="mb-3 p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
          <div className="text-xs text-indigo-300 font-medium mb-1">Current Task</div>
          <div className="text-xs text-indigo-200">{agent.currentTask}</div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="bg-muted/30 rounded-lg p-2">
          <div className="text-lg font-bold text-foreground">{agent.totalRuns}</div>
          <div className="text-xs text-muted-foreground">Total Runs</div>
        </div>
        <div className="bg-muted/30 rounded-lg p-2">
          <div className={cn(
            "text-sm font-semibold",
            agent.status === "working" ? "text-indigo-400" : "text-slate-400"
          )}>
            {agent.status === "working" ? "🟢 Active" : agent.status === "error" ? "🔴 Error" : "⚫ Idle"}
          </div>
          <div className="text-xs text-muted-foreground">Status</div>
        </div>
      </div>
    </div>
  );
}

export default function OfficePage() {
  const agents = useQuery(api.agents.list, {});
  const seedAgents = useMutation(api.agents.seed);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    if (agents !== undefined && agents.length === 0) {
      seedAgents({});
    }
  }, [agents, seedAgents]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const workingCount = agents?.filter((a) => a.status === "working").length ?? 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 shrink-0">
        <div>
          <h1 className="text-xl font-bold">The Office</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {workingCount} agent{workingCount !== 1 ? "s" : ""} working · hover for task details
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Live clock */}
          <div className="text-sm font-mono text-muted-foreground">
            {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-muted-foreground">Live</span>
          </div>
        </div>
      </div>

      {/* Office floor */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Grid floor pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Floating particles */}
        {Array.from({ length: 12 }).map((_, i) => (
          <FloatingParticle key={i} delay={i * 0.5} />
        ))}

        {/* Company sign */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-card/80 border border-border/50 rounded-xl px-6 py-2.5 text-center backdrop-blur shadow-lg">
            <div className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">Himbot HQ</div>
            <div className="gradient-text font-bold text-sm">Mission Control Division</div>
          </div>
        </div>

        {/* Agents at desks */}
        {agents && agents.length > 0 && (
          <div className="absolute inset-0 mt-24">
            {agents.map((agent, i) => {
              const pos = DESK_POSITIONS[i % DESK_POSITIONS.length];
              return (
                <AgentDesk
                  key={agent._id}
                  agent={agent}
                  position={pos}
                  index={i}
                  isSelected={selectedAgent?._id === agent._id}
                  onClick={() =>
                    setSelectedAgent(selectedAgent?._id === agent._id ? null : agent)
                  }
                />
              );
            })}
          </div>
        )}

        {/* Loading state */}
        {agents === undefined && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="text-4xl animate-bounce">🤖</div>
              <p className="text-sm text-muted-foreground">Agents arriving at HQ...</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {agents && agents.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="text-5xl">🏢</div>
              <p className="text-sm text-muted-foreground">Office is empty. Seeding agents...</p>
            </div>
          </div>
        )}

        {/* Water cooler / break area */}
        <div className="absolute bottom-6 left-6 opacity-60">
          <div className="flex flex-col items-center gap-1">
            <div className="text-2xl">🧃</div>
            <div className="text-xs text-muted-foreground">Break Room</div>
          </div>
        </div>

        {/* Plant decoration */}
        <div className="absolute bottom-6 left-24 opacity-50">
          <div className="flex flex-col items-center gap-1">
            <div className="text-2xl">🌱</div>
          </div>
        </div>

        {/* Coffee machine */}
        <div className="absolute bottom-6 left-44 opacity-60">
          <div className="flex flex-col items-center gap-1">
            <div className="text-2xl">☕</div>
            <div className="text-xs text-muted-foreground">Fuel Station</div>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-6 right-80 flex flex-col gap-1.5">
          {[
            { color: "bg-indigo-400", label: "Working" },
            { color: "bg-slate-500", label: "Idle" },
            { color: "bg-red-400", label: "Error" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${item.color}`} />
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        {selectedAgent && (
          <AgentDetailPanel
            agent={selectedAgent}
            onClose={() => setSelectedAgent(null)}
          />
        )}
      </div>
    </div>
  );
}
