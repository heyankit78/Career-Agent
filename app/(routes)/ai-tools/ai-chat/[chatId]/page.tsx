"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoaderCircle, RefreshCcw, Send } from "lucide-react";
import EmptyState from "../_components/EmptyState";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { useParams, useRouter } from "next/navigation";
import { v4 } from "uuid";
import { create } from "domain";
import { toast } from "sonner";
import { checkSubscription } from "@/app/actions/CheckSubscription";

type Message = {
  content: string;
  role: string;
  type: string;
};

type HistoryItem = {
  recordId: string;
  content: Message[];
  createdAt?: string;
};

function AiChat() {
  const [userInput, setUserInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [userHistoryData, setUserHistoryData] = useState<HistoryItem[]>([]);
  const [messagesList, setMessageList] = useState<Message[]>([]);
  const { chatId } = useParams();
  const router = useRouter();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendFunction();
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messagesList]);

  // Initialize chat - load history or start new
  useEffect(() => {
    if (chatId) {
      loadChatHistory(chatId as string);
    }
  }, [chatId]);
  useEffect(() => {
    loadUserHistory();
  }, []);

  const loadChatHistory = async (id: string) => {
    try {
      const { data } = await axios.get(`/api/history?recordId=${id}`);
      if (data?.content) {
        setMessageList(data.content);
      } else {
        setMessageList([]);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      setMessageList([]);
    }
  };
  const HistorySidebar = useMemo(() => {
    return (
      <div className="col-span-2 bg-blue-100 p-6 rounded-xl shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-blue-900">History</h2>
        </div>
        <ul className="space-y-2">
          {userHistoryData.map((history) => {
            const firstUserMessage = history.content.find(
              (msg) => msg.role === "user"
            );
            if (!firstUserMessage) return null;

            return (
              <li
                key={history.recordId}
                className={`p-3 rounded-md cursor-pointer hover:bg-blue-200 transition-colors ${
                  chatId === history.recordId ? "bg-blue-300" : "bg-white"
                }`}
                onClick={() => {
                  setMessageList(history.content);
                  window.history.pushState(
                    null,
                    "",
                    `/ai-tools/ai-chat/${history.recordId}`
                  );
                }}
              >
                <p className="text-blue-800 line-clamp-2">
                  {firstUserMessage.content}
                </p>
                {history.createdAt && (
                  <p className="text-xs text-blue-600 mt-1">
                    {new Date(history.createdAt).toLocaleString()}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }, [userHistoryData, chatId]);
  const loadUserHistory = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/user-ai-career-chat-history");
      const uniqueHistory = data.reduce(
        (acc: HistoryItem[], current: HistoryItem) => {
          const exists = acc.some((item) => item.recordId === current.recordId);
          if (!exists && current.recordId && current.content?.length > 0) {
            acc.push(current);
          }
          return acc;
        },
        []
      );
      setUserHistoryData(uniqueHistory);
    } catch (error) {
      console.error("Error loading user history:", error);
    }
  }, []);

  const startNewChat = async () => {
    const newChatId = v4(); // Generate unique ID immediately
    setMessageList([]);
    const result = await axios
      .post("/api/history", {
        recordId: newChatId,
        content: [],
        createdAt: new Date().toISOString(),
      })
      .catch((error) => {
        console.error("Error creating new chat history:", error);
      });
    router.push(`/ai-tools/ai-chat/${newChatId}`);
  };

  async function sendFunction() {
    const input = userInput.trim();
    if (!input) return;
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
          (item: any) => item?.aiAgentType === "/ai-tools/ai-roadmap-generator"
        ).length,
      };

      // Check limits
      const currentPath = "/ai-tools/ai-chat";
      let limitReached = false;
      let message = "";

      if (currentPath.includes("ai-chat") && usageCounts.chat >= 2) {
        limitReached = true;
        message =
          "Free limit reached (2 chats). Upgrade to Pro for unlimited access.";
      } else if (currentPath.includes("ai-resume") && usageCounts.resume >= 2) {
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
        setTimeout(() => {
          router.push("/billing");
          toast.warning(message, { duration: 5000 });
        }, 1000);

        return null;
      }
    }
    setLoading(true);
    const newUserMessage: Message = {
      content: userInput,
      role: "user",
      type: "text",
    };

    setMessageList((prev) => [...prev, newUserMessage]);

    try {
      const response = await axios.post("/api/ai-career-chat-agent", {
        userInput,
      });

      const newAssistantMessage = response.data;
      setMessageList((prev) => [...prev, newAssistantMessage]);

      // Update history with both messages
      await axios.put("/api/history", {
        recordId: chatId as string,
        content: [...messagesList, newUserMessage, newAssistantMessage],
      });

      await loadUserHistory();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
      setUserInput("");
    }
  }

  return (
    <div className="grid grid-cols-12 w-full">
      <div className="px-10 md:px-24 lg:px-36 xl:px-48 col-span-10">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="py-4">
            <h2 className="font-bold text-lg">AI Career Q/A</h2>
            <p className="text-sm text-muted-foreground">
              Smarter career decisions start here - get tailored advice
            </p>
          </div>
          <Button variant="outline" onClick={startNewChat}>
            + New Chat
          </Button>
        </div>

        {/* Chat Container */}
        <div className="flex flex-col h-[75vh] border rounded-lg p-4">
          {/* Empty State or Message List */}
          {messagesList.length === 0 && (
            <EmptyState setUserInput={setUserInput} />
          )}

          <div className="flex-1 overflow-y-auto" ref={chatContainerRef}>
            {messagesList.map((msg, index) => (
              <div key={index} className="mb-2">
                {msg.role === "user" ? (
                  <div className="flex justify-end">
                    <div className="bg-black text-cyan-50 m-5 p-2 rounded-xl">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-start">
                    <div className="bg-gray-50 text-black m-5 p-2 rounded-xl">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {loading && index === messagesList.length - 1 && (
                  <div className="flex justify-start pl-5">
                    <div className="p-3 rounded-lg gap-2 bg-gray-50 ml-5 mb-5 flex">
                      <LoaderCircle className="animate-spin h-6 w-6 text-black" />
                      Thinking...
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="flex justify-between items-center gap-2 pt-4 border-t">
            <Input
              placeholder="Type your career question here..."
              className="flex-1"
              onKeyDown={handleKeyDown}
              onChange={(e) => setUserInput(e.target.value)}
              value={userInput}
              disabled={loading}
            />
            <Button size="icon" onClick={sendFunction} disabled={loading}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {HistorySidebar}
    </div>
  );
}

export default AiChat;
