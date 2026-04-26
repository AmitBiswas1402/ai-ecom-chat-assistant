import { db } from "@/db/db";
import { chatTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const frameId = searchParams.get("frameId");

  if (!frameId) {
    return NextResponse.json([], { status: 400 });
  }

  const result = await db
    .select()
    .from(chatTable)
    .where(eq(chatTable.frameId, frameId))
    .limit(1);

  return NextResponse.json(result.length ? result[0].chatMessage : []);
}

export async function PUT(req: NextRequest) {
  try {
    const { messages, frameId } = await req.json();

    // Actually persist chat messages to the database
    await db
      .update(chatTable)
      .set({ chatMessage: messages })
      .where(eq(chatTable.frameId, frameId));

    return NextResponse.json({ ok: true, saved: true });
  } catch (err: any) {
    console.error("PUT /api/chats error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

// Optional: accept POST as well (forward to same logic)
export async function POST(req: NextRequest) {
  return PUT(req);
}
