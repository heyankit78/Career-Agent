import React from "react";

const questionList = [
  "What skills do I need for a data analyst role?",
  "How do I switch careers to UX design?",
];

function EmptyState({
  setUserInput,
}: {
  setUserInput: (question: string) => void;
}) {
  return (
    <div>
      <h2 className="font-bold text-xl text-center">
        Ask anything to AI Agent
      </h2>
      <div>
        {questionList.map((question, index) => (
          <h2
            className="p-4 text-center border row rounded-lg my-3 hover:border-primary cursor-pointer"
            key={index}
            onClick={() => setUserInput(question)}
          >
            {question}
          </h2>
        ))}
      </div>
    </div>
  );
}

export default EmptyState;
