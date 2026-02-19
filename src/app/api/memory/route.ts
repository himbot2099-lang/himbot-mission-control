import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

function getConvex() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  return new ConvexHttpClient(url);
}

type MemoryType = "daily" | "entity" | "lesson" | "decision" | "core";

function inferType(path: string): MemoryType {
  if (path === "MEMORY.md" || path.endsWith("SOUL.md") || path.endsWith("USER.md")) return "core";
  if (path.match(/\d{4}-\d{2}-\d{2}/)) return "daily";
  if (path.includes("lessons")) return "lesson";
  if (path.includes("decisions")) return "decision";
  if (path.includes("life/areas") || path.includes("entities")) return "entity";
  return "core";
}

export async function POST(req: NextRequest) {
  try {
    const convex = getConvex();
    const body = await req.json();
    const { path, content, type, title } = body;

    if (!path || !content) {
      return NextResponse.json({ error: "path and content are required" }, { status: 400 });
    }

    const memoryType: MemoryType = type || inferType(path);

    const id = await convex.mutation(api.memories.upsert, {
      path,
      content,
      type: memoryType,
      title: title || path.split("/").pop()?.replace(".md", ""),
    });

    await convex.mutation(api.activities.log, {
      type: "memory_updated",
      description: `Memory synced: ${path}`,
      metadata: { path, type: memoryType },
    });

    return NextResponse.json({ id, success: true });
  } catch (err) {
    console.error("POST /api/memory error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const convex = getConvex();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const search = searchParams.get("q");

    if (search) {
      const results = await convex.query(api.memories.search, { query: search });
      return NextResponse.json(results);
    }

    const memories = await convex.query(api.memories.list, {
      type: type as MemoryType | undefined,
    });
    return NextResponse.json(memories);
  } catch (err) {
    console.error("GET /api/memory error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
