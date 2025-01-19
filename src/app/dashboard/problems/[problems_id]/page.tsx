/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import CodeEditor from "@/components/coding-editor";
import MarkdownComponent from "@/components/mark-down";
import { useAlertContext } from "@/components/provider/alert-provider";
import { useNavigateContext } from "@/components/provider/navigation-provider";
import TestCaseComponent, { TestCaseProps } from "@/components/test-case";
import { Button } from "@/components/ui/button";
import { BackendClient } from "@/lib/request";
import { isErrorResponse } from "@/types/payload";
import { Question } from "@/types/user";
import { useEffect, useState } from "react";

type PageProps = {
  params: Promise<{ problems_id: string[] }>;
};

export default function Page({ params }: PageProps) {
  const client = new BackendClient();
  const setAlert = useAlertContext();
  const setNavigation = useNavigateContext();
  const [questionData, setQuestionData] = useState<Question | null>(null);

  const [code, setCode] = useState<string>("");
  const [stdin, setStdin] = useState<string>("");
  const [stdout, setStdout] = useState<string>("PyDev console: starting");
  const [testCases, setTestCases] = useState<TestCaseProps[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    "detail" | "customInput" | "testCase"
  >("detail");

  const handleRun = async () => {
    setLoading(true);
    const response = await client.executeCode({
      code,
      stdin,
    });
    if (isErrorResponse(response)) {
      setAlert("Error", response.message, 0, true);
      setLoading(false);
      return;
    }
    if (response.stderr) {
      setStdout(
        `Error! run time ${response.runtime} ${response.runtime_unit}\n\noutput:\n${response.stderr}`
      );
      setLoading(false);
      return;
    }
    setStdout(
      `Success! run time ${response.runtime} ${response.runtime_unit}\n\noutput:\n${response.stdout}`
    );
    setLoading(false);
  };

  const fetchQuestionData = async () => {
    const { problems_id } = await params;
    const problemId = Array.isArray(problems_id) ? problems_id[0] : problems_id;

    const response = await client.getQuestionById(problemId);
    if (isErrorResponse(response)) {
      setAlert("Error", response.message, 0, true);
      setLoading(false);
      return;
    }

    const testCases = response.test_cases.slice(0, 3);
    let testCaseList: TestCaseProps[] = [];
    for (const testCase of testCases) {
      testCaseList = [
        ...testCaseList,
        {
          input: testCase.input,
          expectedOutput: testCase.expected,
        },
      ];
    }
    setTestCases(testCaseList);
    setCode(response.start_code.replace(/\\n/g, "\n"));
    setQuestionData(response);
    setStdin(response.test_cases[0].input);
    setNavigation(
      [
        {
          name: "All Problems",
          path: "/dashboard/problems",
        },
      ],
      response.title
    );
  };

  const handleRunAllTestCase = async () => {
    const questionDataTestCases = questionData?.test_cases?.slice(0, 3);
    setLoading(true);

    if (!questionDataTestCases) return;
    let result: TestCaseProps[] = [];

    for (const questionDataTestCase of questionDataTestCases) {
      const response = await client.executeCode({
        code,
        stdin: questionDataTestCase.input,
      });

      if (isErrorResponse(response)) {
        setAlert("Error", response.message, 0, true);
        setLoading(false);
        return;
      }

      let output = response.stdout != "" ? response.stdout : response.stderr;
      const expected = questionDataTestCase.expected;
      const runtime = response.runtime;
      if (runtime > questionDataTestCase.expected_run_time_ms) {
        output = `Run time not pass\nExpected: ${questionDataTestCase.expected_run_time_ms}ms\nUsed: ${runtime}ms`;
      }
      result = [
        ...result,
        {
          input: questionDataTestCase.input,
          expectedOutput: expected,
          actualOutput: output,
          passed: questionDataTestCase.expected == output,
        },
      ];
    }
    setTestCases(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestionData();
    setNavigation(
      [
        {
          name: "All Problems",
          path: "/dashboard/problems",
        },
      ],
      ""
    );
  }, []);

  return (
    <div className="w-full mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[90vh] overflow-y-auto">
        <div className="border rounded-lg p-4">
          <div className="flex justify-between mb-4">
            <Button>Editor</Button>
            <Button variant="outline">Python (3.10)</Button>
          </div>
          <CodeEditor value={code} onChange={(newCode) => setCode(newCode)} />
        </div>
        <div className="mb-4">
          <div className="border rounded-lg p-4">
            <div className="flex justify-between mb-4">
              <div className="flex gap-2">
                <Button
                  variant={activeTab === "detail" ? "default" : "outline"}
                  onClick={() => setActiveTab("detail")}
                >
                  Detail
                </Button>
                <Button
                  variant={activeTab === "customInput" ? "default" : "outline"}
                  onClick={() => setActiveTab("customInput")}
                >
                  Custom Input
                </Button>
                <Button
                  variant={activeTab === "testCase" ? "default" : "outline"}
                  onClick={() => setActiveTab("testCase")}
                >
                  Test Case
                </Button>
              </div>
            </div>

            {activeTab === "detail" && (
              <MarkdownComponent content={questionData?.description ?? ""} />
            )}

            {activeTab === "customInput" && (
              <>
                <label
                  htmlFor="input"
                  className="block text-md font-medium my-4"
                >
                  Input
                </label>
                <textarea
                  id="input"
                  className="w-full border rounded-md p-2 h-48 md:h-60 overflow-y-scroll resize-none"
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                />
                <div className="flex justify-end mt-4">
                  <Button onClick={handleRun} disabled={loading}>
                    {loading ? "Running..." : "Run"}
                  </Button>
                </div>
              </>
            )}

            {activeTab === "testCase" && (
              <>
                <TestCaseComponent testCases={testCases} loading={loading} />
                <div className="flex justify-end mt-4">
                  <Button onClick={handleRunAllTestCase} disabled={loading}>
                    {loading ? "Running..." : "Run All Test"}
                  </Button>
                </div>
              </>
            )}
          </div>

          {activeTab == "customInput" && (
            <div className="border rounded-lg p-4 mt-4">
              <label
                htmlFor="output"
                className="block text-md font-medium mb-4"
              >
                Output
              </label>
              <pre
                id="output"
                className="w-full border rounded-md p-2 h-48 md:h-60 overflow-y-auto whitespace-pre-wrap"
              >
                {loading ? (
                  <div className="flex justify-center items-center space-x-2">
                    <div className="w-4 h-4 border-4 border-t-transparent border-blue-500 border-solid rounded-full animate-spin"></div>
                    <span>Loading...</span>
                  </div>
                ) : (
                  stdout
                )}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
