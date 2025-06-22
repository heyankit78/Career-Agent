"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { useState, useEffect } from "react";
import ResumeUploadDialog from "./ResumeUploadDialog";
import RoadmapDialog from "./RoadmapDialog";
import { Loader2Icon } from "lucide-react";
import { createDecipheriv } from "crypto";

type TOOL = {
  name: string;
  desc: string;
  icon: string;
  button: string;
  path: string;
};

type AiToolProps = {
  tool: TOOL;
};

export default function AiToolCard({ tool }: AiToolProps) {
  const router = useRouter();
  const uniqueChatId = uuidv4();
  const [loading, setLoading] = useState(false);
  const [openResumeDialog, setOpenResumeDialog] = useState(false);
  const [openRoadmapDialog, setOpenRoadmapDialog] = useState(false);

  // Effect to handle loading state when dialogs close
  useEffect(() => {
    if (!openResumeDialog && !openRoadmapDialog) {
      // If both dialogs are closed but loading is still true
      setLoading(false);
    }
  }, [openResumeDialog, openRoadmapDialog]);

  async function onClickFunction() {
    setLoading(true);
    try {
      if (tool.name === "AI Resume Analyzer") {
        setOpenResumeDialog(true);
        return;
      }
      if (tool.name === "Career Roadmap Generator") {
        setOpenRoadmapDialog(true);
        return;
      }

      const result = await axios.post("/api/history", {
        recordId: uniqueChatId,
        content: [],
        aiAgentType: tool.path,
        createdAt: new Date().toISOString(),
      });
      await router.push(tool.path + "/" + uniqueChatId);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
    // No finally block here - let useEffect handle dialog cases
  }

  return (
    <>
      {/* Full-screen overlay when loading */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2Icon className="animate-spin h-12 w-12 text-white" />
            <p className="text-white mt-4">Loading {tool.name}...</p>
          </div>
        </div>
      )}

      <div
        className={`p-4 bg-white border border-gray-200 rounded-xl shadow hover:shadow-md transition cursor-pointer relative ${
          loading ? "pointer-events-none" : ""
        }`}
      >
        <div className="flex items-center space-x-3 mb-3">
          <Image src={tool.icon} width={50} height={50} alt={tool.name} />
          <h2 className="font-medium text-lg">{tool.name}</h2>
        </div>
        <p className="text-gray-500 text-sm">{tool.desc}</p>
        <Button
          className="w-full mt-5"
          onClick={onClickFunction}
          disabled={loading}
        >
          {loading && <Loader2Icon className="mr-2 animate-spin" />}
          {tool.button}
        </Button>

        <ResumeUploadDialog
          setOpenResumeDialog={setOpenResumeDialog}
          openResumeDialog={openResumeDialog}
        />
        <RoadmapDialog
          setOpenRoadmapDialog={setOpenRoadmapDialog}
          openRoadmapDialog={openRoadmapDialog}
        />
      </div>
    </>
  );
}
