"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Brain,
  Search,
  FileText,
  Calendar,
  BookOpen,
  Lightbulb,
  GitBranch,
  ChevronRight,
  Clock,
  X,
  Star,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type MemoryType = "daily" | "entity" | "lesson" | "decision" | "core";

const TYPE_CONFIG: Record<MemoryType, { icon: React.ElementType; color: string; label: string }> = {
  core: { icon: Star, color: "text-amber-400", label: "Core" },
  daily: { icon: Calendar, color: "text-blue-400", label: "Daily" },
  entity: { icon: GitBranch, color: "text-purple-400", label: "Entity" },
  lesson: { icon: Lightbulb, color: "text-emerald-400", label: "Lesson" },
  decision: { icon: BookOpen, color: "text-indigo-400", label: "Decision" },
};

const MOCK_MEMORIES = [
  {
    _id: "mock-1" as const,
    path: "MEMORY.md",
    type: "core" as MemoryType,
    title: "MEMORY.md — Long-Term Knowledge",
    content: `# MEMORY.md — Himbot's Long-Term Knowledge

## Patterns & Preferences
- Ryan prefers bullet lists over tables in all messaging platforms
- Always check ENTITY_INDEX.md before creating new entities
- When in doubt, trash > rm (recoverable beats gone forever)

## Navigation Rules
- Discord/WhatsApp: no markdown tables
- Telegram: react with approved emoji set only
- Use [[reply_to_current]] for contextual replies

## Technical Quick-Ref
- OpenClaw gateway: loopback binding only
- n8n workflows managed via webhook endpoints
- Convex is the real-time database of choice

*This is mock data. Connect Convex to see your actual memory files.*`,
    lastModified: Date.now() - 86400000,
  },
  {
    _id: "mock-2" as const,
    path: "memory/2026-02-18.md",
    type: "daily" as MemoryType,
    title: "2026-02-18 — Daily Notes",
    content: `# 2026-02-18

## Events
- Started building Himbot Mission Control app
- Subagent spawned for full build task
- Tech stack: Next.js 14 + Convex + shadcn/ui

## Key Decisions
- Dark theme with indigo/purple accents
- Desktop-first layout with sidebar nav
- Convex for real-time sync

*Connect Convex and push your actual memory files via POST /api/memory*`,
    lastModified: Date.now() - 3600000,
  },
  {
    _id: "mock-3" as const,
    path: "memory/life/areas/companies/anthropic/summary.md",
    type: "entity" as MemoryType,
    title: "Anthropic — Company Entity",
    content: `# Anthropic

**Type:** AI company  
**Role:** Claude's maker, Himbot's brain provider

## Summary
Anthropic builds Claude, the AI model powering Himbot. Ryan uses Claude Opus/Sonnet via API. Max subscription provides different context limits than API.

## Key Facts
- Claude Sonnet 4.6 is the default model
- 1M context available via API (not Max)
- Pricing matters for deep research tasks

**Links:** projects/openclaw, people/ryan`,
    lastModified: Date.now() - 172800000,
  },
  {
    _id: "mock-4" as const,
    path: "memory/lessons/2026-02-01-dedup-check.md",
    type: "lesson" as MemoryType,
    title: "Always check ENTITY_INDEX before creating",
    content: `# Lesson: ENTITY_INDEX Dedup Check

**Severity:** Important  
**Date:** 2026-02-01  
**Source:** Mistake caught in session

## What Happened
Created duplicate entity for a person already in the knowledge graph under a different slug.

## The Fix
Always read ENTITY_INDEX.md before creating any new entity. Search by first name, last name, AND full name.

## Rule
No entity creation without index check. No exceptions.`,
    lastModified: Date.now() - 432000000,
  },
];

interface Memory {
  _id: string;
  path: string;
  type: MemoryType;
  title?: string;
  content: string;
  lastModified: number;
}

function FileTreeItem({
  memory,
  selected,
  onSelect,
}: {
  memory: Memory;
  selected: boolean;
  onSelect: (m: Memory) => void;
}) {
  const config = TYPE_CONFIG[memory.type];
  const Icon = config.icon;
  const filename = memory.path.split("/").pop() ?? memory.path;

  return (
    <button
      onClick={() => onSelect(memory)}
      className={cn(
        "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-colors group",
        selected
          ? "bg-primary/15 text-foreground border border-primary/20"
          : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className={cn("w-3.5 h-3.5 shrink-0", config.color)} />
      <span className="flex-1 truncate text-xs font-medium">{filename}</span>
      {selected && <ChevronRight className="w-3 h-3 text-primary shrink-0" />}
    </button>
  );
}

export default function MemoryPage() {
  const memories = useQuery(api.memories.list, {});
  const [selected, setSelected] = useState<Memory | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<MemoryType | "all">("all");

  const displayMemories: Memory[] = (memories && memories.length > 0 ? memories : MOCK_MEMORIES) as Memory[];

  const filtered = useMemo(() => {
    return displayMemories.filter((m) => {
      const matchType = typeFilter === "all" || m.type === typeFilter;
      const matchSearch =
        !search ||
        m.path.toLowerCase().includes(search.toLowerCase()) ||
        m.content.toLowerCase().includes(search.toLowerCase()) ||
        (m.title && m.title.toLowerCase().includes(search.toLowerCase()));
      return matchType && matchSearch;
    });
  }, [displayMemories, typeFilter, search]);

  const byType = useMemo(() => {
    const groups: Record<string, Memory[]> = {};
    for (const type of Object.keys(TYPE_CONFIG)) {
      groups[type] = filtered.filter((m) => m.type === type);
    }
    return groups;
  }, [filtered]);

  const currentMemory = selected ?? (filtered[0] || null);

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-72 shrink-0 border-r border-border/50 flex flex-col">
        {/* Search */}
        <div className="p-3 border-b border-border/50 space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search memory..."
              className="pl-8 h-8 text-xs"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {/* Type filter tabs */}
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => setTypeFilter("all")}
              className={cn(
                "text-xs px-2 py-1 rounded font-medium transition-colors",
                typeFilter === "all" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              All
            </button>
            {(Object.keys(TYPE_CONFIG) as MemoryType[]).map((type) => {
              const config = TYPE_CONFIG[type];
              return (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={cn(
                    "text-xs px-2 py-1 rounded font-medium transition-colors",
                    typeFilter === type ? `bg-primary/20 text-primary` : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* File Tree */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {search || typeFilter !== "all" ? (
            <div className="space-y-1">
              {filtered.map((m) => (
                <FileTreeItem
                  key={m._id}
                  memory={m}
                  selected={currentMemory?._id === m._id}
                  onSelect={setSelected}
                />
              ))}
              {filtered.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No results</p>
              )}
            </div>
          ) : (
            (Object.entries(byType) as [MemoryType, Memory[]][]).map(([type, items]) => {
              if (items.length === 0) return null;
              const config = TYPE_CONFIG[type];
              const Icon = config.icon;
              return (
                <div key={type}>
                  <div className={`flex items-center gap-1.5 px-2 mb-1 ${config.color}`}>
                    <Icon className="w-3 h-3" />
                    <span className="text-xs font-semibold uppercase tracking-wider">{config.label}</span>
                    <span className="text-xs text-muted-foreground">({items.length})</span>
                  </div>
                  <div className="space-y-0.5">
                    {items.map((m) => (
                      <FileTreeItem
                        key={m._id}
                        memory={m}
                        selected={currentMemory?._id === m._id}
                        onSelect={setSelected}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Stats */}
        <div className="p-3 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{displayMemories.length} files</span>
            {memories && memories.length === 0 && (
              <Badge variant="secondary" className="text-xs">Mock data</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {currentMemory ? (
          <div className="max-w-3xl mx-auto p-8">
            {/* File header */}
            <div className="mb-6 pb-4 border-b border-border/50">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const config = TYPE_CONFIG[currentMemory.type];
                      const Icon = config.icon;
                      return <Icon className={`w-4 h-4 ${config.color}`} />;
                    })()}
                    <Badge variant="secondary" className="text-xs">
                      {TYPE_CONFIG[currentMemory.type].label}
                    </Badge>
                  </div>
                  <h2 className="text-lg font-semibold">{currentMemory.title || currentMemory.path.split("/").pop()}</h2>
                  <p className="text-xs text-muted-foreground font-mono">{currentMemory.path}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(currentMemory.lastModified), { addSuffix: true })}
                </div>
              </div>
            </div>

            {/* Markdown Content */}
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => <h1 className="text-xl font-bold text-foreground mb-3 mt-6 first:mt-0">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-lg font-semibold text-foreground mb-2 mt-5">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-base font-semibold text-foreground mb-2 mt-4">{children}</h3>,
                  p: ({ children }) => <p className="text-sm text-muted-foreground leading-relaxed mb-3">{children}</p>,
                  li: ({ children }) => <li className="text-sm text-muted-foreground leading-relaxed">{children}</li>,
                  code: ({ children, className }) => {
                    const isBlock = className?.includes("language-");
                    return isBlock ? (
                      <code className="block bg-muted/50 rounded-lg p-3 text-xs font-mono text-foreground overflow-x-auto">{children}</code>
                    ) : (
                      <code className="bg-muted/50 px-1.5 py-0.5 rounded text-xs font-mono text-primary">{children}</code>
                    );
                  },
                  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-primary/30 pl-4 text-muted-foreground italic">{children}</blockquote>
                  ),
                  hr: () => <hr className="border-border/50 my-4" />,
                }}
              >
                {currentMemory.content}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Brain className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">Select a file to read</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Push memory via POST /api/memory</p>
          </div>
        )}
      </div>
    </div>
  );
}
