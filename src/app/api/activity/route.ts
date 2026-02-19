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
    const { type, description, metadata } = body;

    if (!type || !description) {
      return NextResponse.json({ error: "type and description are required" }, { status: 400 });
    }

    const id = await convex.mutation(api.activities.log, {
      type,
      description,
      metadata,
    });

    return NextResponse.json({ id, success: true });
  } catch (err) {
    console.error("POST /api/activity error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const convex = getConvex();
    const activities = await convex.query(api.activities.list, { limit: 50 });
    return NextResponse.json(activities);
  } catch (err) {
    console.error("GET /api/activity error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
