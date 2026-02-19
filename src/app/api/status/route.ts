import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

function getConvex() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  return new ConvexHttpClient(url);
}

export async function GET() {
  try {
    const convex = getConvex();
    const [tasks, activities, agents, cronJobs] = await Promise.all([
      convex.query(api.tasks.counts, {}),
      convex.query(api.activities.list, { limit: 5 }),
      convex.query(api.agents.list, {}),
      convex.query(api.cronJobs.list, {}),
    ]);

    const workingAgents = agents.filter((a) => a.status === "working");
    const lastActivity = activities[0];

    return NextResponse.json({
      status: "online",
      timestamp: Date.now(),
      tasks,
      agents: {
        total: agents.length,
        working: workingAgents.length,
        working_names: workingAgents.map((a) => a.name),
      },
      cronJobs: {
        total: cronJobs.length,
        active: cronJobs.filter((j) => j.status === "active").length,
      },
      lastActivity: lastActivity
        ? {
            type: lastActivity.type,
            description: lastActivity.description,
            timestamp: lastActivity.timestamp,
          }
        : null,
    });
  } catch (err) {
    console.error("GET /api/status error:", err);
    return NextResponse.json({ status: "error", error: String(err) }, { status: 500 });
  }
}
