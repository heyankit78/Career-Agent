import { db } from "@/configs/db";
import { historyTable } from "@/configs/schema"; // Make sure to import historyTable
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await currentUser();

  if (!user || !user.primaryEmailAddress?.emailAddress) {
    return NextResponse.json(
      { error: "Unauthorized or missing email address" },
      { status: 401 }
    );
  }

  const email = user.primaryEmailAddress.emailAddress;

  try {
    const historyRecords = await db
      .select({
        recordId: historyTable.recordId, // Assuming this is the rdld column
        content: historyTable.content,
      })
      .from(historyTable)
      .where(eq(historyTable.userEmail, email)); // Direct email match

    return NextResponse.json(historyRecords);
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
