import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { File, Loader2Icon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { v4 } from "uuid";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { checkSubscription } from "@/app/actions/CheckSubscription";

interface ResumeUploadDialogProps {
  setOpenResumeDialog: (open: boolean) => void;
  openResumeDialog: boolean;
}

const ResumeUploadDialog = ({
  setOpenResumeDialog,
  openResumeDialog,
}: ResumeUploadDialogProps) => {
  const [loading, setLoading] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const router = useRouter();

  const onFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const onUploadAndAnalyse = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const recordId = v4();
      const formData = new FormData();
      formData.append("recordId", recordId);
      formData.append("resumeFile", file);

      const hasSubscriptionEnabled = await checkSubscription();

      console.log("Subscription status:---", hasSubscriptionEnabled);

      if (!hasSubscriptionEnabled) {
        const resultHistory = await axios.get("/api/history");
        const historyList = resultHistory.data;

        // Count usage by path
        const usageCounts = {
          chat: historyList.filter(
            (item: any) => item?.aiAgentType === "/ai-tools/ai-chat"
          ).length,
          resume: historyList.filter(
            (item: any) => item?.aiAgentType === "/ai-tools/ai-resume-analyzer"
          ).length,
          roadmap: historyList.filter(
            (item: any) =>
              item?.aiAgentType === "/ai-tools/ai-roadmap-generator"
          ).length,
        };

        // Check limits
        const currentPath = "/ai-tools/ai-resume-analyzer";
        let limitReached = false;
        let message = "";

        if (currentPath.includes("ai-chat") && usageCounts.chat >= 2) {
          limitReached = true;
          message =
            "Free limit reached (2 chats). Upgrade to Pro for unlimited access.";
        } else if (
          currentPath.includes("ai-resume") &&
          usageCounts.resume >= 2
        ) {
          limitReached = true;
          message =
            "Free limit reached (2 resume reviews). Upgrade to Pro for unlimited access.";
        } else if (
          currentPath.includes("ai-roadmap") &&
          usageCounts.roadmap >= 1
        ) {
          limitReached = true;
          message =
            "Free limit reached (1 roadmap). Upgrade to Pro for unlimited access.";
        }

        if (limitReached) {
          // Close the dialog
          setOpenResumeDialog(false);
          // Redirect after delay
          setTimeout(() => {
            router.push("/billing");
            toast.warning(message, { duration: 5000 });
          }, 1000);

          return null;
        }
      }
      // 1. Await the API call
      await axios.post("/api/ai-resume-analyser-agent", formData);

      // 2. Close the dialog first
      setOpenResumeDialog(false);

      // 3. Then redirect
      router.push(`/ai-tools/ai-resume-analyzer/${recordId}`);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={openResumeDialog} onOpenChange={setOpenResumeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Resume</DialogTitle>
          <DialogDescription>
            <label
              htmlFor="resumeUpload"
              className="flex items-center flex-col justify-center p-7 border border-dashed rounded-xl hover:bg-slate-100 cursor-pointer"
            >
              <File className="h-10 w-10" />
              {file ? (
                <h2 className="mt-3 text-blue-500">{file.name}</h2>
              ) : (
                <h2 className="mt-3">Click here to Upload PDF file</h2>
              )}
            </label>
            <input
              type="file"
              id="resumeUpload"
              className="opacity-0 hidden"
              accept="application/pdf"
              onChange={onFileUpload}
            />
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpenResumeDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={onUploadAndAnalyse}
            disabled={loading || !file}
            className="bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2Icon className="animate-spin mr-2" />}
            <Sparkles className="mr-2" />
            Upload & Analyse
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResumeUploadDialog;
