import AiChat from "@/app/(routes)/ai-tools/ai-chat/[chatId]/page";
import { inngest } from "@/inngest/client";
import { create } from "domain";
import { NextResponse } from "next/server";

export async function POST(req: any) {
  const { userInput } = await req.json();

  const resultIds = await inngest.send({
    name: "AICareerChatAgentFunction",
    data: {
      userInput: userInput,
      aiAgentType: "/ai-tools/ai-chat",
      createdAt: new Date().toISOString(),
    },
  });
  const runId = resultIds?.ids[0];

  let runStatus;
  while (true) {
    runStatus = await getRuns(runId);
    if (runStatus?.[0]?.status == "Completed") {
      break;
    }
    if (
      runStatus?.[0]?.status === "Failed" ||
      runStatus?.[0]?.status === "Cancelled"
    ) {
      throw new Error(`Function run ${runStatus?.[0]?.status}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return NextResponse.json(runStatus?.[0]?.output?.output?.[0]);
}

export async function getRuns(runId: string) {
  const response = await fetch(
    `${process.env.INNGEST_SERVER_HOST}/v1/events/${runId}/runs`,
    {
      headers: {
        Authorization: `Bearer ${process.env.INNGEST_SIGNING_KEY}`,
      },
    }
  );
  const json = await response.json();
  return json.data;
}
