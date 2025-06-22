// components/TurboNode.tsx
import React from "react";
import { Handle, Position } from "@xyflow/react";
import Link from "next/link";

const TurboNode = ({ data }: any) => {
  return (
    <div className="bg-yellow-100 border border-gray-300 rounded-lg shadow-md p-4 w-64">
      <strong className="font-bold text-lg text-gray-800">{data.title}</strong>
      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
        {data.description}
      </p>
      {data.link && (
        <Link
          href={data.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 text-sm mt-2 inline-block"
        >
          Learn more
        </Link>
      )}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default TurboNode;
