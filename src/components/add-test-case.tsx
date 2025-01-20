import { ChevronDown, ChevronRight } from "lucide-react";
import React, { useState } from "react";

export interface AddTestCaseComponentProps {
  caseName?: string;
  input: string;
  onChange?: (value: string) => void;
  expected: string;
  loading?: boolean;
}

export default function AddTestCaseComponent({
  caseName,
  input,
  onChange,
  expected,
  loading
}: AddTestCaseComponentProps) {
  const [isShow, setIsShow] = useState<boolean>(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center space-x-2 mb-3">
        <div className="w-4 h-4 border-4 border-t-transparent border-blue-500 border-solid rounded-full animate-spin"></div>
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="border rounded-md p-3 mb-4 cursor-pointer">
      <div
        className="flex justify-between items-center"
        onClick={() => setIsShow(!isShow)}
      >
        <span>{caseName}</span>
        {isShow ? (
          <ChevronDown className="h-5 w-5 text-gray-600" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-600" />
        )}
      </div>

      {isShow && (
        <div className="mt-3">
          <div className="text-md">Input</div>
          {onChange && (
            <textarea
              onChange={(e) => onChange(e.target.value)}
              className="w-full border rounded-md p-2 h-32 overflow-y-auto whitespace-pre-wrap resize-none mt-2"
            >
              {input}
            </textarea>
          )}
          <div className="text-md">Expected Output</div>
          <span className="text-sm text-gray-400">
            fill answer code and click run test case for set expected output
          </span>
          <textarea
            disabled
            className="w-full border rounded-md p-2 h-32 overflow-y-auto whitespace-pre-wrap resize-none mt-2"
          >
            {expected}
          </textarea>
        </div>
      )}
    </div>
  );
}
