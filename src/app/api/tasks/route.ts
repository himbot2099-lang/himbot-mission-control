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
    const { title, description, status = "backlog", assignee = "himbot", priority = "medium" } = body;

    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const id = await convex.mutation(api.tasks.create, {
      title,
      description,
      status,
      assignee,
      priority,
    });

    await convex.mutation(api.activities.log, {
      type: "task_created",
      description: `Task created: ${title}`,
      metadata: { taskId: id },
    });

    return NextResponse.json({ id, success: true });
  } catch (err) {
    console.error("POST /api/tasks error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const convex = getConvex();
    const tasks = await convex.query(api.tasks.list, {});
    return NextResponse.json(tasks);
  } catch (err) {
    console.error("GET /api/tasks error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
