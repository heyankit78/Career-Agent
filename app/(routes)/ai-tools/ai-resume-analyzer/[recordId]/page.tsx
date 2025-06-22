"use client";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";
import Reports from "../_components/Reports";

const AIResumeAnalyzer = () => {
  const { recordId } = useParams();
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);
  const [aiReport, setAiReport] = React.useState<any>(null);
  useEffect(() => {
    if (recordId) {
      GetResumeAnalyzerRecord();
    } else {
      console.error("recordId is not defined");
    }
  }, [recordId]);
  const GetResumeAnalyzerRecord = async () => {
    const result = await axios.get("/api/history?recordId=" + recordId);
    console.log(result.data);
    setPdfUrl(result?.data?.metadata);
    setAiReport(result?.data?.content);
  };
  return (
    <div>
      <div className="grid lg:grid-cols-5 grid-cols-1 gap-4">
        <div className="lg:col-span-2">
          <Reports aiReport={aiReport} />
        </div>

        <div className="lg:col-span-3">
          <div className=" p-4 rounded-lg">
            <h1 className="text-2xl font-bold mb-4">AI Resume Analyzer</h1>
            {pdfUrl && (
              <iframe
                src={pdfUrl + "#toolbar=0&navpanes=0&scrollbar=0"}
                height={1200}
                width={"100%"}
                className="min-w-lg border-2 border-gray-300 rounded-lg"
                title="Resume PDF"
              ></iframe>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIResumeAnalyzer;
