import { inngest } from "@/inngest/client";
import { getRuns } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userInput } = await req.json();

  const resultIds = await inngest.send({
    name: "AICareerChatAgentFunction",
    data: {
      userInput,
      aiAgentType: "/ai-tools/ai-chat",
      createdAt: new Date().toISOString(),
    },
  });

  const runId = resultIds?.ids[0];

  let runStatus;
  while (true) {
    runStatus = await getRuns(runId);
    const status = runStatus?.[0]?.status;

    if (status === "Completed") break;
    if (status === "Failed" || status === "Cancelled") {
      throw new Error(`Function run ${status}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return NextResponse.json(runStatus?.[0]?.output?.output?.[0]);
}
