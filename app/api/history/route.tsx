import { db } from "@/configs/db";
import { historyTable } from "@/configs/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: any) {
  const { recordId, content, aiAgentType } = await req.json();
  const user = await currentUser();

  try {
    const result = await db.insert(historyTable).values({
      recordId: recordId,
      content: content,
      userEmail: user?.primaryEmailAddress?.emailAddress,
      createdAt: Date.now().toString(),
      aiAgentType: aiAgentType || "", // Default to "default" if not provided
    });
    return NextResponse.json(result);
  } catch (e) {
    console.error(e); // Log the error for debugging
    return NextResponse.json({ error: e }, { status: 500 });
  }
}

export async function PUT(req: any) {
  const { recordId, content } = await req.json();
  try {
    const result = await db
      .update(historyTable)
      .set({
        content: content,
      })
      .where(eq(historyTable.recordId, recordId));
    return NextResponse.json(result);
  } catch (e) {
    console.error(e); // Log the error for debugging
    return NextResponse.json({ error: e }, { status: 500 });
  }
}
export async function GET(req: any) {
  const url = new URL(req.url);
  const recordId = url.searchParams.get("recordId");
  try {
    if (!recordId) {
      // If no recordId is provided, fetch all history records for the user
      const user = await currentUser();
      const result = await db
        .select()
        .from(historyTable)
        .where(
          eq(historyTable.userEmail, user?.primaryEmailAddress?.emailAddress)
        );
      return NextResponse.json(result);
    } else {
      const result = await db
        .select()
        .from(historyTable)
        .where(eq(historyTable.recordId, recordId));
      return NextResponse.json(result[0]);
    }
  } catch (e) {
    console.error(e); // Log the error for debugging
    return NextResponse.json({ error: e }, { status: 500 });
  }
}
