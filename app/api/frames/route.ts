import { db } from "@/db/db";
import { chatTable, frameTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const frameId = searchParams.get("frameId");
  const projectId = searchParams.get("projectId");

  const [frameResult, chatResult] = await Promise.all([
    // @ts-ignore
    db.select().from(frameTable).where(eq(frameTable.frameId, frameId)),
    // @ts-ignore
    db.select().from(chatTable).where(eq(chatTable.frameId, frameId)),
  ]);

  const finalResult = {
    ...frameResult[0],
    chatMessages: chatResult[0]?.chatMessage,
  };

  return NextResponse.json(finalResult);
}

export async function PUT(req: NextRequest) {
  const { designCode, frameId, projectId } = await req.json();

  await db
    .update(frameTable)
    .set({
      designCode,
    })
    .where(
      and(eq(frameTable.frameId, frameId), eq(frameTable.projectId, projectId))
    );

  return NextResponse.json({ result: "Updated!" });
}
