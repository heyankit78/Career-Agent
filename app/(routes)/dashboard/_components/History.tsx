"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { aiToolsList } from "./AITools";
import { Skeleton } from "@/components/ui/skeleton";

type HistoryItem = {
  recordId: string;
  content: any;
  createdAt: string;
  aiAgentType: string;
  id: number;
  userEmail: string;
  metadata: string;
};

function History() {
  const [userHistory, setUserHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getHistoryForThisUser();
  }, []);

  const getHistoryForThisUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/history");
      if (!response.ok) {
        throw new Error("Failed to fetch history");
      }
      const data = await response.json();
      const modifiedData = data.filter(
        (e: any) => e.content && Object.keys(e.content).length
      );
      console.log("Fetched history data:", data);
      setUserHistory(modifiedData.slice(0, 9));
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("Failed to load history. Please try again later.");
      setUserHistory([]);
    } finally {
      setLoading(false);
    }
  };
  const getToolDetails = useMemo(() => {
    return (aiAgentType: string) => {
      const tool = aiToolsList.find((tool) => tool.path === aiAgentType);
      return tool || { icon: "/default-icon.png", name: "Unknown Tool" };
    };
  }, []);
  if (loading) {
    return (
      <div className="mt-5 p-5 border rounded-xl">
        <h2 className="font-bold text-lg">Previous History</h2>
        <p className="mb-4">Loading your history...</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-[30vh]">
          {Array.from({ length: 9 }).map((_, index) => (
            <Skeleton className="h-[85px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-5 p-5 border rounded-xl">
        <h2 className="font-bold text-lg">Previous History</h2>
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (userHistory.length === 0) {
    return (
      <div className="mt-5 p-5 border rounded-xl h-[40vh]">
        <h2 className="font-bold text-lg">Previous History</h2>
        <p className="mb-4">What you previously worked on, you can find here</p>
        <div className="flex flex-col items-center justify-center gap-4 py-8 ">
          <Image src="/idea.png" alt="No history" width={50} height={50} />
          <h2 className="text-lg">You do not have any history</h2>
          <Link href="/explore">
            <Button className="mt-4">Explore AI Tools</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 p-5 border rounded-xl">
      <h2 className="font-bold text-lg">Previous History</h2>
      <p className="mb-4">What you previously worked on, you can find here</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-[30vh] m-4">
        {userHistory.map((item: HistoryItem) => {
          const tool = getToolDetails(item.aiAgentType);
          return (
            <Link
              key={item.recordId}
              href={`${item.aiAgentType}/${item.recordId}`}
              className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow hover:bg-blue-200"
            >
              <div className="flex items-center space-x-3 mb-3">
                <Image
                  src={tool.icon}
                  width={30}
                  height={30}
                  alt={`${tool.name} Icon`}
                />
                <h3 className="font-semibold text-md">{tool.name}</h3>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Created on:{" "}
                {(!isNaN(new Date(item.createdAt).getTime())
                  ? new Date(item.createdAt)
                  : new Date(
                      /[a-z]/i.test(item.createdAt)
                        ? Date.now()
                        : Number(item.createdAt)
                    )
                ).toLocaleDateString()}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default History;
