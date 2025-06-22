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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { checkSubscription } from "@/app/actions/CheckSubscription";

interface RoadmapDialogProps {
  setOpenRoadmapDialog: (open: boolean) => void;
  openRoadmapDialog: boolean;
}

const RoadmapDialog = ({
  setOpenRoadmapDialog,
  openRoadmapDialog,
}: RoadmapDialogProps) => {
  const [loading, setLoading] = React.useState(false);
  const [userText, setUserText] = React.useState<string>("");
  const router = useRouter();

  const onGenerate = async () => {
    if (!userText) return;

    setLoading(true);
    try {
      const roadmapId = v4();
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
        const currentPath = "/ai-tools/ai-roadmap-generator";
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
          setOpenRoadmapDialog(false);
          // Redirect after delay
          setTimeout(() => {
            router.push("/billing");
            toast.warning(message, { duration: 5000 });
          }, 1000);

          return null;
        }
      }
      // 1. Await the API call
      await axios.post("/api/ai-roadmap-agent", {
        roadmapId: roadmapId,
        userInput: userText,
      });

      // 2. Close the dialog first
      setOpenRoadmapDialog(false);

      // 3. Then redirect
      router.push(`/ai-tools/ai-roadmap-generator/${roadmapId}`);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={openRoadmapDialog} onOpenChange={setOpenRoadmapDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Roadmap</DialogTitle>
          <DialogDescription asChild>
            <div className="mt-4">
              <Input
                type="text"
                placeholder="E.g Data Scientist, Full Stack Developer, etc."
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                className="w-full"
              />
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpenRoadmapDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={onGenerate}
            disabled={loading || !userText}
            className="bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2Icon className="animate-spin mr-2" />}
            <Sparkles className="mr-2" />
            Generate Roadmap
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoadmapDialog;
