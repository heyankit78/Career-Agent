import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/inngest/client";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { roadmapId, userInput } = await req.json();

    const auth = await currentUser();

    if (!roadmapId || !userInput) {
      return new Response("Missing roadmapId or userInput", { status: 400 });
    }

    const resultIds = await inngest.send({
      name: "AIRoadmapGeneratorFunction",
      data: {
        roadmapId: roadmapId,
        userInput: userInput,
        aiAgentType: "/ai-tools/ai-roadmap-generator",
        userEmail: auth?.primaryEmailAddress?.emailAddress || "",
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

    // Safely handle the output
    const output = runStatus?.[0]?.output?.output?.[0];

    // Ensure the response is JSON serializable
    const safeOutput = output ? JSON.parse(JSON.stringify(output)) : null;

    return NextResponse.json({
      success: true,
      data: safeOutput,
      roadmapId: roadmapId,
    });
  } catch (e) {
    console.error("Error in AI Roadmap Generator Agent:", e);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
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
