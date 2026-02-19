import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

function getConvex() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  return new ConvexHttpClient(url);
}

export async function POST(req: NextRequest) {
  try {
    const convex = getConvex();
    const body = await req.json();
    const {
      name,
      role,
      description = "",
      status = "idle",
      currentTask,
      totalRuns = 0,
      avatar,
    } = body;

    if (!name || !role) {
      return NextResponse.json({ error: "name and role are required" }, { status: 400 });
    }

    const id = await convex.mutation(api.agents.upsert, {
      name,
      role,
      description,
      status,
      currentTask,
      lastActive: Date.now(),
      totalRuns,
      avatar,
    });

    await convex.mutation(api.activities.log, {
      type: "agent_spawned",
      description: status === "working"
        ? `Agent ${name} started working: ${currentTask || "unknown task"}`
        : `Agent ${name} status updated to ${status}`,
      metadata: { agent: name, status },
    });

    return NextResponse.json({ id, success: true });
  } catch (err) {
    console.error("POST /api/agents error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const convex = getConvex();
    const agents = await convex.query(api.agents.list, {});
    return NextResponse.json(agents);
  } catch (err) {
    console.error("GET /api/agents error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
