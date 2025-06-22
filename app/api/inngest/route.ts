import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import {
  AICareerChatAgentFunction,
  AICareerResumeAnalyserFunction,
  AIRoadmapGeneratorFunction,
} from "@/inngest/functions";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    AICareerChatAgentFunction,
    AICareerResumeAnalyserFunction,
    AIRoadmapGeneratorFunction,
  ],
});
