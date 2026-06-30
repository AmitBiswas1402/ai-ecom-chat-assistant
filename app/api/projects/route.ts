import { db } from "@/db/db";
import { chatTable, frameTable, projectTable, usersTable } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { projectId, frameId, messages, credits } = await req.json();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user?.primaryEmailAddress?.emailAddress;
    const imageUrl = messages?.[0]?.image || null;

    // ✅ Create project entry
    await db.insert(projectTable).values({
      projectId,
      createdBy: email,
    });

    // ✅ Create frame entry
    await db.insert(frameTable).values({
      frameId,
      projectId,
    });

    // ✅ Store chat messages (with image info)
    await db.insert(chatTable).values({
      chatMessage: messages,
      frameId,
      createdBy: email,
    });

    // await db
    //   .update(usersTable)
    //   .set({
    //     credits: credits - 1,
    //   })
    //   .where(eq(usersTable.email, email));

    return NextResponse.json({
      projectId,
      frameId,
      messages,
      imageUrl,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
