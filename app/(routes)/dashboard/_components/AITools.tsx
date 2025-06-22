import React from "react";
import AiToolCard from "./AIToolCard";
export const aiToolsList = [
  {
    name: "AI Career Q&A Chat",
    desc: "Chat with AI Agent",
    icon: "/chatbot.png",
    button: "Ask Now",
    path: "/ai-tools/ai-chat",
  },
  {
    name: "Career Roadmap Generator",
    desc: "Build your roadmap",
    icon: "/roadmap2.png",
    button: "Generate Now",
    path: "/ai-tools/ai-roadmap-generator",
  },
  // {
  //   name: "Cover Letter Generator",
  //   desc: "Write a cover letter",
  //   icon: "/cover.png",
  //   button: "Create Now",
  //   path: "/ai-tools/cover-letter-generation",
  // },
  {
    name: "AI Resume Analyzer",
    desc: "Improve your resume",
    icon: "/resume.png",
    button: "Analyze Now",
    path: "/ai-tools/ai-resume-analyzer",
  },
];
function AiTools() {
  return (
    <div className="mt-7 p-5 bg-white border rounded-xl">
      <h2 className="font-bold text-lg">Available AI Tools</h2>
      <p>Start Building and Shape Your Career with this exciting toolkit.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5 mt-5">
        {aiToolsList.map((tool, index) => (
          <AiToolCard tool={tool} key={index} />
        ))}
      </div>
    </div>
  );
}

export default AiTools;
