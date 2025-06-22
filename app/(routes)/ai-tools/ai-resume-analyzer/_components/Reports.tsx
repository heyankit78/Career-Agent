"use client";
import ResumeUploadDialog from "@/app/(routes)/dashboard/_components/ResumeUploadDialog";
import React from "react";

interface Section {
  score: number;
  comment: string;
  tips_for_improvement: string[];
  whats_good: string[];
  needs_improvement: string[];
}

interface AIReport {
  overall_score: number;
  overall_feedback: string;
  summary_comment: string;
  sections: {
    [key: string]: Section;
  };
  tips_for_improvement: string[];
  whats_good: string[];
  needs_improvement: string[];
}

const Reports = ({ aiReport }: { aiReport: AIReport | null }) => {
  const [openResumeDialog, setOpenResumeDialog] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  if (!aiReport) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <h3 className="text-xl font-semibold text-gray-700">
            Loading your analysis report...
          </h3>
          <p className="text-gray-500">
            This might take a moment while we process your resume.
          </p>
        </div>
      </div>
    );
  }

  const {
    overall_score,
    overall_feedback,
    summary_comment,
    sections = {},
    tips_for_improvement = [],
    whats_good = [],
    needs_improvement = [],
  } = aiReport;

  const sectionKeys = Object.keys(sections);

  return (
    <>
      <div>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-extrabold text-gray-800 gradient-component-text">
              AI Analysis Results
            </h2>
            <button
              type="button"
              onClick={() => setOpenResumeDialog(true)}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 gradient-button-bg text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i> Processing...
                </>
              ) : (
                <>
                  Re-analyze <i className="fa-solid fa-sync ml-2"></i>
                </>
              )}
            </button>
          </div>

          {/* Overall Score */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-blue-200 transition-transform duration-300 ease-in-out hover:scale-[1.01]">
            <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
              <i className="fas fa-star text-yellow-500 mr-2"></i> Overall Score
            </h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-6xl font-extrabold text-blue-600">
                {overall_score}
                <span className="text-2xl">/100</span>
              </span>
              <span
                className={`text-lg font-bold ${
                  overall_score >= 80
                    ? "text-green-500"
                    : overall_score >= 70
                    ? "text-yellow-500"
                    : "text-red-500"
                }`}
              >
                {overall_feedback}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div
                className={`h-2.5 rounded-full ${
                  overall_score >= 80
                    ? "bg-green-500"
                    : overall_score >= 70
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${overall_score}%` }}
              />
            </div>
            <p className="text-gray-600 text-sm">{summary_comment}</p>
          </div>

          {/* Section Ratings */}
          {sectionKeys.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sectionKeys.map((key) => {
                const section = sections[key];
                return (
                  <div
                    key={key}
                    className={`bg-white rounded-lg shadow-md p-5 border ${
                      section.score >= 80
                        ? "border-green-200"
                        : section.score >= 70
                        ? "border-yellow-200"
                        : "border-red-200"
                    }`}
                  >
                    <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                      <i
                        className={`fas mr-2 ${
                          key === "contact_info"
                            ? "fa-user-circle"
                            : key === "experience"
                            ? "fa-briefcase"
                            : key === "education"
                            ? "fa-graduation-cap"
                            : "fa-lightbulb"
                        } text-gray-500`}
                      ></i>
                      {key
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </h4>
                    <span
                      className={`text-4xl font-bold ${
                        section.score >= 80
                          ? "text-green-600"
                          : section.score >= 70
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {section.score}%
                    </span>
                    <p className="text-sm text-gray-600 mt-2">
                      {section.comment}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Suggestions Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div>
              <h4 className="text-lg font-bold mb-2 text-red-600">
                Needs Improvement
              </h4>
              <ul className="list-disc ml-6 text-sm text-gray-700">
                {needs_improvement.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-2 text-green-600">
                What's Good
              </h4>
              <ul className="list-disc ml-6 text-sm text-gray-700">
                {whats_good.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-2 text-yellow-600">
                Tips for Improvement
              </h4>
              <ul className="list-disc ml-6 text-sm text-gray-700">
                {tips_for_improvement.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-blue-400 text-white rounded-lg shadow-md p-6 mb-6 text-center gradient-button-bg">
            <h3 className="text-2xl font-bold mb-3">
              Ready to refine your resume? 🎯
            </h3>
            <p className="text-base mb-4">
              Make your application stand out with our premium insights and
              features.
            </p>
            <button
              type="button"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-blue-600 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
            >
              Upgrade to Premium{" "}
              <i className="fas fa-arrow-right ml-2 text-blue-600"></i>
            </button>
          </div>
        </div>
      </div>

      <ResumeUploadDialog
        openResumeDialog={openResumeDialog}
        setOpenResumeDialog={setOpenResumeDialog}
        setIsLoading={setIsLoading}
      />
    </>
  );
};

export default Reports;
