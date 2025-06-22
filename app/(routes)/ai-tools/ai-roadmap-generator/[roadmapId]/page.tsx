"use client";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useCallback, useMemo } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import TurboNode from "../_components/TurboNode";
import { Button } from "@/components/ui/button";
import { Loader2Icon, Plus } from "lucide-react";
import RoadmapDialog from "@/app/(routes)/dashboard/_components/RoadmapDialog";
import { Skeleton } from "@/components/ui/skeleton";

interface RoadmapData {
  roadmapTitle: string;
  description: string;
  initialNodes: any[];
  initialEdges: any[];
  duration?: string;
}

const RoadmapGenerator = () => {
  const { roadmapId } = useParams();
  const [aiRoadmapData, setAiRoadmapData] = React.useState<RoadmapData | null>(
    null
  );
  const [loading, setLoading] = React.useState<boolean>(true);
  const [roadmapDialog, setRoadmapDialog] = React.useState<boolean>(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Memoize node types to prevent unnecessary recreations
  const nodeTypes = useMemo(
    () => ({
      turbo: TurboNode,
    }),
    []
  );

  const getRoadmapRecord = useCallback(async () => {
    setLoading(true);
    try {
      const result = await axios.get("/api/history?recordId=" + roadmapId);
      const data = result?.data?.content;
      setAiRoadmapData(data);
      setNodes(data?.initialNodes || []);
      setEdges(data?.initialEdges || []);
    } catch (error) {
      console.error("Failed to fetch roadmap:", error);
    } finally {
      setLoading(false);
    }
  }, [roadmapId, setNodes, setEdges]);

  useEffect(() => {
    if (roadmapId) {
      getRoadmapRecord();
    } else {
      console.error("roadmapId is not defined");
    }
  }, [roadmapId, getRoadmapRecord]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Memoize the left panel content
  const leftPanelContent = useMemo(
    () => (
      <div className="p-4 rounded-lg">
        <h1 className="text-4xl font-bold mb-4">AI Roadmap Generator</h1>
        {loading ? (
          <div>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-20 w-full mb-4" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            {aiRoadmapData ? (
              <>
                <h2 className="text-xl font-bold mb-2">
                  {aiRoadmapData.roadmapTitle}
                </h2>
                <p className="text-gray-700">{aiRoadmapData.description}</p>
                <p className="text-blue-500 mt-2 font-bold">
                  Duration : {aiRoadmapData?.duration || "Not specified"}
                </p>
                <Button
                  className="w-full"
                  onClick={() => setRoadmapDialog(true)}
                >
                  <Plus />
                  Create New
                  {/* <Plus /> */}
                </Button>
              </>
            ) : (
              <p className="text-gray-500">No roadmap data available.</p>
            )}
          </div>
        )}
      </div>
    ),
    [loading, aiRoadmapData]
  );

  // Memoize the ReactFlow component
  const reactFlowComponent = useMemo(
    () => (
      <div className="w-full h-[80vh] border rounded-lg">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>
    ),
    [nodes, edges, onNodesChange, onEdgesChange, onConnect, nodeTypes]
  );

  return (
    <div>
      <div className="grid lg:grid-cols-5 grid-cols-1 gap-4">
        <div className="lg:col-span-2">{leftPanelContent}</div>
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[80vh]">
              <Loader2Icon className="animate-spin h-10 w-10 text-blue-500" />
            </div>
          ) : (
            aiRoadmapData && reactFlowComponent
          )}
        </div>
        <RoadmapDialog
          openRoadmapDialog={roadmapDialog}
          setOpenRoadmapDialog={setRoadmapDialog}
        />
      </div>
    </div>
  );
};

export default React.memo(RoadmapGenerator);
