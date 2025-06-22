import { historyTable } from "@/configs/schema";
import { inngest } from "./client";
import { createAgent, gemini } from "@inngest/agent-kit";
import ImageKit from "imagekit";
import { db } from "@/configs/db";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  }
);

export const AICareerChatAgent = createAgent({
  name: "AICareerChatAgent",
  description: "An AI agent that answer career related questions",
  system: `You are a helpful, professional AI Career Coach Assistant. Always respond with clarity, encouragement, and actionable advice. Focus on topics related to career growth, skill development, career transitions, and industry trends. If the user asks something unrelated to careers (e.g., topics about general AI, entertainment, etc.), gently steer the conversation back to career-related questions instead.`,
  model: gemini({
    model: "gemini-2.0-flash-lite",
    apiKey: process.env.GEMINI_API_KEY,
  }),
});
export const AIRoadmapGeneratorAgent = createAgent({
  name: "AIRoadmapGeneratorAgent",
  description:
    "Generate Details Tree Like Flow Roadmap for User Input Position/Skills",
  system: `Generate a React flow tree-structured learning roadmap for user input position/skills in the following format:
vertical tree structure with meaningful x/y positions to form a flow
• Structure should be similar to roadmap.sh layout
• Steps should be ordered from fundamentals to advanced
• Include branching for different specializations (if applicable)
• Each node must have a title, short description, and learning resource link
• Use unique IDs for all nodes and edges
• Make it more specious node position,
• Give meaningful space between nodes with some padding and margin,
• Response in JSON format
{
  "roadmapTitle": "",
  "description": "<3-5 Lines>",
  "duration": "",
  "initialNodes": [
    {
      "id": "1",
      "type": "turbo",
      "position": { "x": 0, "y": 0 },
      "data": {
        "title": "Step Title",
        "description": "Short two-line explanation of what the step covers.",
        "link": "Helpful link for learning this step"
      }
    },
    ...
  ],
  "initialEdges": [
    {
      "id": "e1-2",
      "source": "1",
      "target": "2"
    },
    ...
  ]
}
`,
  model: gemini({
    model: "gemini-2.0-flash-lite",
    apiKey: process.env.GEMINI_API_KEY,
  }),
});
export const AiResumeAnalyzerAgent = createAgent({
  name: "AiResumeAnalyzerAgent",
  description: "AI Resume Analyzer Agent help to Return Report",
  system: ` You are an advanced AI Resume Analyzer Agent.
Your task is to evaluate a candidate’s resume and return a detailed analysis in the following structured JSON schema format.
The result must match the layout and structure of a visual UI that includes overall score, section scores, summary feedback, improvement tips, strengths, and weaknesses.

📥 INPUT: I will provide a plain text resume.
🎯 GOAL: Output a JSON report as per the schema below. The report should reflect:

overall_score (0-100)

overall_feedback (short message e.g., “Excellent”, “Needs improvement”)

summary_comment (1–2 sentence evaluation summary)

Section scores for:

Contact Info

Experience

Education

Skills

Each section should include:

score (as percentage)

Optional comment about that section

Tips for improvement (3–5 tips)
What’s Good (1–3 strengths)
Needs Improvement (1–3 weaknesses)
{
  "overall_score": 85,
  "overall_feedback": "Excellent",
  "summary_comment": "Your resume is strong, but there are areas to refine.",
  "sections": {
    "contact_info": {
      "score": 95,
      "comment": "Perfectly structured and complete."
    },
    "experience": {
      "score": 88,
      "comment": "Strong bullet points and impact."
    },
    "education": {
      "score": 70,
      "comment": "Consider adding relevant coursework."
    },
    "skills": {
      "score": 60,
      "comment": "Expand on specific skill proficiencies."
    }
  },
  "tips_for_improvement": [
    "Add more numbers and metrics to your experience section to show impact.",
    "Integrate more industry-specific keywords relevant to your target roles.",
    "Start bullet points with strong action verbs to make your achievements stand out."
  ],
  "whats_good": [
    "Clean and professional formatting.",
    "Clear and concise contact information.",
    "Relevant work experience."
  ],
  "needs_improvement": [
    "Skills section lacks detail.",
    "Education section could be stronger.",
    "Missing a professional summary/objective."
  ]
}
`, // You can define system instructions here
  model: gemini({
    model: "gemini-2.0-flash",
    apiKey: process.env.GEMINI_API_KEY,
  }),
});

export const AICareerChatAgentFunction = inngest.createFunction(
  { id: "AICareerChatAgentFunction" },
  { event: "AICareerChatAgentFunction" },
  async ({ event, step }) => {
    const { userInput } = event?.data;
    const result = await AICareerChatAgent.run(userInput);
    return result;
  }
);
export const AIRoadmapGeneratorFunction = inngest.createFunction(
  { id: "AIRoadmapGeneratorFunction" },
  { event: "AIRoadmapGeneratorFunction" },

  async ({ event, step }) => {
    const { userInput, userEmail, aiAgentType, roadmapId } = event?.data;
    if (!userInput || !userEmail || !aiAgentType || !roadmapId) {
      throw new Error("Missing required data for roadmap generation");
    }
    console.log("roadmapId--", roadmapId);

    console.log("userInput--", userInput);
    console.log("userEmail--", userEmail);
    console.log("aiAgentType--", aiAgentType);
    const roadmapResult = await AIRoadmapGeneratorAgent.run(userInput);
    //@ts-ignore
    const rawContent = roadmapResult.output[0]?.content;
    const rawContentJson = rawContent.replace("```json", "").replace("```", "");
    const parsedRoadmapContent = JSON.parse(rawContentJson);
    const saveToDatabase = await step.run("saveToDatabase", async () => {
      //@ts-ignore
      const result = await db.insert(historyTable).values({
        recordId: roadmapId,
        content: parsedRoadmapContent,
        aiAgentType: aiAgentType,
        metadata: userInput,
        createdAt: new Date().toISOString(),
        userEmail: userEmail,
      });
      console.log("Database save result:", result);
    });

    return parsedRoadmapContent;
  }
);
var imagekit = new ImageKit({
  //@ts-ignore
  publicKey: process.env.IMAGEKIT_PUBLIC_API_KEY,
  //@ts-ignore
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  //@ts-ignore
  privateKey: process.env.IMAGEKIT_PRIVATE_API_KEY,
});
export const AICareerResumeAnalyserFunction = inngest.createFunction(
  { id: "AICareerResumeAnalyserFunction" },
  { event: "AICareerResumeAnalyserFunction" },
  async ({ event, step }) => {
    const { recordId, base64File, pdfRawText, aiAgentType, userEmail } =
      event?.data;
    if (!recordId || !base64File || !pdfRawText || !aiAgentType || !userEmail) {
      throw new Error("Missing required data for resume analysis");
    }

    const uploadFileUrl = await step.run("uploadImage", async () => {
      const uploadResponse = await imagekit.upload({
        file: base64File,
        fileName: `resume-${recordId}.pdf`,
      });
      if (!uploadResponse || !uploadResponse.url) {
        throw new Error("Failed to upload image to ImageKit");
      }
      return uploadResponse.url;
    });
    const aiResumeReport = await AiResumeAnalyzerAgent.run(pdfRawText);
    if (!aiResumeReport) {
      throw new Error("Failed to analyze resume");
    }
    //@ts-ignore
    const rawContent = aiResumeReport.output[0]?.content;
    const rawContentJson = rawContent.replace("```json", "").replace("```", "");
    const parsedContent = JSON.parse(rawContentJson);
    // return parsedContent;

    const saveToDatabase = await step.run("saveToDatabase", async () => {
      //@ts-ignore
      const result = await db.insert(historyTable).values({
        recordId: recordId,
        content: parsedContent,
        aiAgentType: aiAgentType,
        createdAt: new Date().toISOString(),
        userEmail: userEmail,
        metadata: uploadFileUrl,
      });
      console.log("Database save result:", result);
    });
    return parsedContent;
  }
);
