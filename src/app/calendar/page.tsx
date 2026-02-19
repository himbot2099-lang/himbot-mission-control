"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Zap,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  Calendar as CalendarIcon,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function parseCronToReadable(schedule: string): string {
  const parts = schedule.trim().split(/\s+/);
  if (parts.length !== 5) return schedule;
  const [min, hour, dom, month, dow] = parts;

  if (min.startsWith("*/") && hour === "*" && dom === "*" && month === "*" && dow === "*") {
    return `Every ${min.slice(2)} minutes`;
  }
  if (min === "0" && hour !== "*" && dom === "*" && month === "*" && dow === "*") {
    return `Daily at ${hour.padStart(2, "0")}:00`;
  }
  if (min === "0" && hour !== "*" && dom === "*" && month === "*" && dow !== "*") {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return `Weekly on ${days[parseInt(dow)]} at ${hour.padStart(2, "0")}:00`;
  }
  if (min.startsWith("*/") && hour !== "*") {
    return `Every ${min.slice(2)} min (${hour})`;
  }
  return schedule;
}

function getNextRunsForMonth(schedule: string, month: Date): Date[] {
  // Simplified next-run calculation for display
  const results: Date[] = [];
  const parts = schedule.trim().split(/\s+/);
  if (parts.length !== 5) return results;
  const [min, hour, dom, , dow] = parts;

  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const days = eachDayOfInterval({ start, end });

  for (const day of days) {
    const dayOfWeek = day.getDay();

    if (dow !== "*" && parseInt(dow) !== dayOfWeek) continue;
    if (dom !== "*" && parseInt(dom) !== day.getDate()) continue;

    if (min.startsWith("*/")) {
      // Multiple runs per day
      const interval = parseInt(min.slice(2));
      const hourVal = hour === "*" ? 0 : parseInt(hour);
      for (let m = 0; m < 60; m += interval) {
        const runTime = new Date(day);
        runTime.setHours(hour === "*" ? hourVal : parseInt(hour), m, 0, 0);
        results.push(runTime);
      }
    } else if (hour !== "*") {
      const runTime = new Date(day);
      runTime.setHours(parseInt(hour), parseInt(min) || 0, 0, 0);
      results.push(runTime);
    } else {
      results.push(day);
    }
  }

  return results;
}

export default function CalendarPage() {
  const cronJobs = useQuery(api.cronJobs.list, {});
  const toggleStatus = useMutation(api.cronJobs.toggleStatus);
  const seedCrons = useMutation(api.cronJobs.seed);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());

  useEffect(() => {
    if (cronJobs !== undefined && cronJobs.length === 0) {
      seedCrons({});
    }
  }, [cronJobs, seedCrons]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd });

  // Get schedule dots for each day
  const dayJobMap = new Map<string, string[]>();
  if (cronJobs) {
    for (const job of cronJobs) {
      if (job.status !== "active") continue;
      const runs = getNextRunsForMonth(job.schedule, currentMonth);
      for (const run of runs) {
        const key = format(run, "yyyy-MM-dd");
        if (!dayJobMap.has(key)) dayJobMap.set(key, []);
        dayJobMap.get(key)!.push(job.name);
      }
    }
  }

  const selectedDayJobs = selectedDay
    ? cronJobs?.filter((job) => {
        if (job.status !== "active") return false;
        const runs = getNextRunsForMonth(job.schedule, currentMonth);
        return runs.some((r) => isSameDay(r, selectedDay));
      })
    : [];

  return (
    <div className="flex flex-col h-full p-6 gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Calendar & Cron</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {cronJobs?.filter((j) => j.status === "active").length ?? 0} active schedules
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card className="border border-border/50 bg-card/80">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  {format(currentMonth, "MMMM yyyy")}
                </CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setCurrentMonth(new Date())}>
                    Today
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Day headers */}
              <div className="grid grid-cols-7 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="text-center text-xs text-muted-foreground font-medium py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-0.5">
                {calDays.map((day) => {
                  const key = format(day, "yyyy-MM-dd");
                  const jobs = dayJobMap.get(key) ?? [];
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isSelected = selectedDay && isSameDay(day, selectedDay);
                  const isCurrentDay = isToday(day);

                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedDay(day)}
                      className={cn(
                        "relative h-14 rounded-lg p-1 text-left transition-colors",
                        isCurrentMonth ? "hover:bg-muted/50" : "opacity-30",
                        isSelected && "bg-primary/15 border border-primary/30",
                        !isSelected && isCurrentDay && "bg-muted/30"
                      )}
                    >
                      <span
                        className={cn(
                          "text-xs font-medium",
                          isCurrentDay && !isSelected ? "text-primary font-bold" : "text-foreground",
                          !isCurrentMonth && "text-muted-foreground"
                        )}
                      >
                        {format(day, "d")}
                      </span>
                      {/* Job dots */}
                      {jobs.length > 0 && (
                        <div className="absolute bottom-1 left-1 right-1 flex gap-0.5 flex-wrap">
                          {Array.from(new Set(jobs)).slice(0, 3).map((_, i) => (
                            <div key={i} className="w-1 h-1 rounded-full bg-indigo-400" />
                          ))}
                          {Array.from(new Set(jobs)).length > 3 && (
                            <span className="text-xs text-muted-foreground leading-none">+</span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected day */}
          {selectedDay && (
            <Card className="border border-border/50 bg-card/80 mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-primary" />
                  {format(selectedDay, "EEEE, MMMM d")}
                  {selectedDayJobs && selectedDayJobs.length > 0 && (
                    <Badge variant="secondary" className="text-xs">{selectedDayJobs.length} jobs</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedDayJobs || selectedDayJobs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No scheduled jobs on this day.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedDayJobs.map((job) => (
                      <div key={job._id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30">
                        <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{job.name}</p>
                          <p className="text-xs text-muted-foreground">{parseCronToReadable(job.schedule)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Cron Jobs List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Schedules</h2>
          </div>

          {cronJobs === undefined ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border border-border/50 bg-card/80 animate-pulse">
                <CardContent className="p-4 h-20" />
              </Card>
            ))
          ) : cronJobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No cron jobs yet. Push via POST /api/agents.
            </div>
          ) : (
            cronJobs.map((job) => (
              <Card key={job._id} className={cn(
                "border bg-card/80 card-glow transition-all",
                job.status === "active" ? "border-border/50" : "border-border/30 opacity-60"
              )}>
                <CardContent className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {job.status === "active" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        )}
                        <span className="text-sm font-medium truncate">{job.name}</span>
                      </div>
                      {job.description && (
                        <p className="text-xs text-muted-foreground leading-snug">{job.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => toggleStatus({ id: job._id })}
                      className={cn(
                        "shrink-0 p-1 rounded transition-colors",
                        job.status === "active"
                          ? "text-amber-400 hover:bg-amber-500/10"
                          : "text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      {job.status === "active" ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs font-mono">
                      {job.schedule}
                    </Badge>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {parseCronToReadable(job.schedule)}
                  </div>

                  <div className="flex justify-between text-xs text-muted-foreground pt-1 border-t border-border/30">
                    {job.lastRun && (
                      <span>Last: {format(new Date(job.lastRun), "HH:mm")}</span>
                    )}
                    {job.nextRun && (
                      <span className="text-indigo-400">
                        Next: {format(new Date(job.nextRun), "HH:mm")}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
