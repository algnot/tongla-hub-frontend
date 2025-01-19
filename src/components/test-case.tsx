import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export type TestCaseProps = {
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
};

type TestCaseComponentProps = {
  testCases: TestCaseProps[];
  loading: boolean; 
};

const TestCaseComponent = ({ testCases, loading }: TestCaseComponentProps) => {
  const [openSections, setOpenSections] = useState<{
    input: number[];
    output: number[];
    actual: number[];  
  }>({
    input: [],
    output: [],
    actual: [],
  });

  const toggleSection = (index: number, section: "input" | "output" | "actual") => {
    setOpenSections((prevSections) => ({
      ...prevSections,
      [section]: prevSections[section].includes(index)
        ? prevSections[section].filter((i) => i !== index)
        : [...prevSections[section], index],
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center space-x-2">
        <div className="w-4 h-4 border-4 border-t-transparent border-blue-500 border-solid rounded-full animate-spin"></div>
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="max-h-[650px] overflow-y-scroll">
      {testCases.map((testCase, index) => {
        const isPassed = testCase.actualOutput === testCase.expectedOutput;

        return (
          <div key={index} className="border rounded-md p-3 mb-4">
            <div className="flex justify-between items-center">
              <span className={`text-md ${!isPassed && testCase.actualOutput ? "text-red-600" : ""}`}>Test Case {index + 1}</span>
              <span className={`text-sm ${isPassed ? "text-green-600" : "text-red-600"}`}>
                Score: {isPassed ? "1" : "0"}/1
              </span>
            </div>

            <div
              className="border rounded-md p-4 mt-2 cursor-pointer"
              onClick={() => toggleSection(index, "input")}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm">Input</span>
                {openSections.input.includes(index) ? (
                  <ChevronDown className="h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                )}
              </div>
              {openSections.input.includes(index) && (
                <textarea
                  disabled
                  className="w-full border rounded-md p-2 h-32 overflow-y-auto whitespace-pre-wrap mt-4 resize-none"
                >
                  {testCase.input}
                </textarea>
              )}
            </div>

            <div
              className="border rounded-md p-4 mt-2 cursor-pointer"
              onClick={() => toggleSection(index, "output")}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm">Expected Output</span>
                {openSections.output.includes(index) ? (
                  <ChevronDown className="h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                )}
              </div>
              {openSections.output.includes(index) && (
                <textarea
                  disabled
                  className="w-full border rounded-md p-2 h-32 overflow-y-auto whitespace-pre-wrap mt-4 resize-none"
                >
                  {testCase.expectedOutput}
                </textarea>
              )}
            </div>

            {testCase.actualOutput && (
              <div
                className="border rounded-md p-4 mt-2 cursor-pointer"
                onClick={() => toggleSection(index, "actual")}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm">Actual Output</span>
                  {openSections.actual.includes(index) ? (
                    <ChevronDown className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  )}
                </div>
                {openSections.actual.includes(index) && (
                  <textarea
                    disabled
                    className="w-full border rounded-md p-2 h-32 overflow-y-auto whitespace-pre-wrap mt-4 resize-none"
                  >
                    {testCase.actualOutput}
                  </textarea>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TestCaseComponent;
