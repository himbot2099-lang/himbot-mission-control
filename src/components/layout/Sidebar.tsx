"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  KanbanSquare,
  Brain,
  Calendar,
  Users,
  Building2,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/tasks", icon: KanbanSquare, label: "Tasks" },
  { href: "/memory", icon: Brain, label: "Memory" },
  { href: "/calendar", icon: Calendar, label: "Calendar" },
  { href: "/team", icon: Users, label: "Agents" },
  { href: "/office", icon: Building2, label: "Office" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-16 lg:w-60 flex flex-col bg-sidebar border-r border-sidebar-border shrink-0 transition-all duration-300">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0 animate-pulse-glow">
          H
        </div>
        <div className="hidden lg:block overflow-hidden">
          <div className="text-sm font-semibold text-foreground truncate">Mission Control</div>
          <div className="text-xs text-muted-foreground truncate">Himbot v2</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span className="hidden lg:block truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Status */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="hidden lg:flex items-center gap-2 px-2 py-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-xs text-muted-foreground truncate">claude-sonnet-4-6</span>
        </div>
        <div className="flex lg:hidden justify-center">
          <Zap className="w-4 h-4 text-emerald-400" />
        </div>
      </div>
    </aside>
  );
}
