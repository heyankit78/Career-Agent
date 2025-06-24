import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

type RunStatus = {
  status: string;
  output?: {
    output?: any[];
  };
};
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
// lib/inngest-utils.ts
export async function getRuns(runId: string): Promise<RunStatus[]> {
  const response = await fetch(
    `${process.env.INNGEST_SERVER_HOST}/v1/events/${runId}/runs`,
    {
      headers: {
        Authorization: `Bearer ${process.env.INNGEST_SIGNING_KEY}`,
      },
    }
  );
  const json = await response.json();
  return json.data;
}
