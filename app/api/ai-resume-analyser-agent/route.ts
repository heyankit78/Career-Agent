import { NextRequest, NextResponse } from "next/server";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { inngest } from "@/inngest/client";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const recordId = formData.get("recordId");
    const resumeFile: any = formData.get("resumeFile");
    const auth = await currentUser();

    if (!recordId || !resumeFile) {
      return new Response("Missing recordId or resumeFile", { status: 400 });
    }

    const loader = new WebPDFLoader(resumeFile);
    const docs = await loader.load();

    if (docs.length === 0) {
      return new Response("No documents found in the resume file", {
        status: 400,
      });
    }

    const arrayBuffer = await resumeFile.arrayBuffer();
    const base64File = Buffer.from(arrayBuffer).toString("base64");

    const resultIds = await inngest.send({
      name: "AICareerResumeAnalyserFunction",
      data: {
        recordId: recordId,
        base64File: base64File,
        pdfRawText: docs[0]?.pageContent,
        aiAgentType: "/ai-tools/ai-resume-analyzer",
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
      recordId,
    });
  } catch (e) {
    console.error("Error in AI Resume Analyser Agent:", e);
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
