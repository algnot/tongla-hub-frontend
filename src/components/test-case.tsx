import { TestCase } from "@/types/request";
import { ChevronDown, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import { diffChars } from "diff";

interface Output {
  output: string;
  run_time_ms: number;
}

export type TestCaseProps = {
  test_name: string;
  expected: TestCase;
  output?: Output;
  loading?: boolean;
};

export default function TestCaseComponent({
  test_name,
  expected,
  output,
  loading,
}: TestCaseProps) {
  const [isShow, setIsShow] = useState<boolean>(false);
  const isPassed = output?.output ? expected.expected === output?.output : false;

  const getWordDiff = (expected: string, actual: string) => {
    const wordDiff = diffChars(expected, actual);
    console.log(wordDiff);
    
    return wordDiff.map((wordPart, index) => (
      <span
        key={index}
        className={
          wordPart.added
            ? "bg-green-600"
            : wordPart.removed
            ? "bg-red-600"
            : ""
        }
      >
        {(wordPart.added || wordPart.removed) ? wordPart.value.replace(/\n/g, "\\n") : wordPart.value}
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center space-x-2 mb-3">
        <div className="w-4 h-4 border-4 border-t-transparent border-blue-500 border-solid rounded-full animate-spin"></div>
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div
      className="border rounded-md p-3 mb-4 cursor-pointer"
      onClick={() => setIsShow(!isShow)}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <div>{test_name}</div>
          <span
            className={`text-sm ${
              isPassed ? "text-green-600" : "text-red-600"
            }`}
          >
            {output?.run_time_ms ? (!isPassed ? "incorrect" : "correct") : ""}
          </span>
        </div>

        {isShow ? (
          <ChevronDown className="h-5 w-5 text-gray-600" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-600" />
        )}
      </div>

      {isShow && (
        <div className="mt-6">
          <div className="text-md">Input</div>
          <textarea
            disabled
            className="w-full border rounded-md p-2 h-32 overflow-y-auto whitespace-pre-wrap resize-none mt-2"
          >
            {expected.input}
          </textarea>
          <div className="text-md">Expected Output</div>
          <textarea
            disabled
            className="w-full border rounded-md p-2 h-32 overflow-y-auto whitespace-pre-wrap resize-none mt-2"
          >
            {expected.expected}
          </textarea>
          {output?.run_time_ms && (
            <>
              {/* <div className="text-md">Your Output</div>
              <textarea
                disabled
                className="w-full border rounded-md p-2 h-32 overflow-y-auto whitespace-pre-wrap resize-none mt-2"
              >
                {output?.output}
              </textarea> */}
              {!isPassed && (
                <div className="mt-4">
                  <div className="text-md">Your Output</div>
                  <div
                    className="w-full border rounded-md p-2 h-32 overflow-y-auto whitespace-pre-wrap mt-2"
                    style={{ fontFamily: "monospace" }}
                  >
                    {getWordDiff(expected.expected, output?.output || "")}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
