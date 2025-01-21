/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import CodeEditor from "@/components/coding-editor";
import MarkdownComponent from "@/components/mark-down";
import { useAlertContext } from "@/components/provider/alert-provider";
import { useLoadingContext } from "@/components/provider/loading-provider";
import { useNavigateContext } from "@/components/provider/navigation-provider";
import TestCaseComponent, { TestCaseProps } from "@/components/test-case";
import { Button } from "@/components/ui/button";
import { useUserData } from "@/hooks/use-user";
import { BackendClient } from "@/lib/request";
import { isErrorResponse } from "@/types/payload";
import { Question } from "@/types/request";
import Link from "next/link";
import { useEffect, useState } from "react";

type PageProps = {
  params: Promise<{ problems_id: string[] }>;
};

export default function Page({ params }: PageProps) {
  const client = new BackendClient();
  const [userData] = useUserData();
  const setAlert = useAlertContext();
  const setNavigation = useNavigateContext();
  const [questionData, setQuestionData] = useState<Question | null>(null);
  const [testCase, setTestCase] = useState<TestCaseProps[]>([]);
  const setFullLoading = useLoadingContext();

  const [problemId, setProblemId] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [stdin, setStdin] = useState<string>("");
  const [stdout, setStdout] = useState<string>("PyDev console: starting");

  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    "detail" | "customInput" | "testCase"
  >("detail");

  const fetchQuestionData = async () => {
    const { problems_id } = await params;
    const problemId = Array.isArray(problems_id) ? problems_id[0] : problems_id;
    setProblemId(problemId);
    setFullLoading(true);

    const response = await client.getQuestionById(problemId);
    if (isErrorResponse(response)) {
      setAlert("Error", response.message, 0, true);
      setLoading(false);
      return;
    }

    let testCaseList: TestCaseProps[] = [];
    let count = 1;
    for (const testCase of response.test_cases.slice(0, 3)) {
      testCaseList = [
        ...testCaseList,
        {
          expected: testCase,
          test_name: `Case ${count++}`,
        },
      ];
    }
    setTestCase(testCaseList);
    setCode(response.start_code.replace(/\\n/g, "\n"));
    setQuestionData(response);
    setStdin(response.test_cases[0].input);
    setFullLoading(false);
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

  const handleRunAllTestCase = async () => {
    const testCases = questionData?.test_cases?.slice(0, 3);
    setLoading(true);

    if (!testCases) return;

    let result: TestCaseProps[] = [];
    let count = 1;
    for (const testCase of testCases) {
      const response = await client.executeCode({
        code,
        stdin: testCase.input,
      });

      if (isErrorResponse(response)) {
        setAlert("Error", response.message, 0, true);
        setLoading(false);
        return;
      }

      let output = response.stdout != "" ? response.stdout : response.stderr;
      if (response.runtime > testCase.expected_run_time_ms) {
        output = `Run time not pass\nExpected: ${testCase.expected_run_time_ms}ms\nUsed: ${response.runtime}ms`;
      }
      result = [
        ...result,
        {
          expected: testCase,
          test_name: `Case ${count++}`,
          output: {
            output: output,
            run_time_ms: response.runtime
          }
        },
      ];
    }
    setTestCase(result);
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
      {userData?.role == "ADMIN" && userData.uid == questionData?.owner.id && (
        <div className="flex justify-end mb-4">
          <Link href={`/dashboard/problems/${problemId}/edit`}>
            <Button>Edit Problem</Button>
          </Link>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
        {/* left component */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between mb-4">
            <Button>Editor</Button>
            <Button variant="outline">Python (3.10)</Button>
          </div>
          <CodeEditor value={code} onChange={(newCode) => setCode(newCode)} />
        </div>

        {/* right component */}
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
            <MarkdownComponent
              editable={false}
              preview="preview"
              content={questionData?.description ?? ""}
            />
          )}

          {activeTab === "customInput" && (
            <>
              <label htmlFor="input" className="block text-md font-medium my-4">
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
              <div className="mt-4">
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
            </>
          )}

          {activeTab === "testCase" && (
            <>
              <div className="max-h-[550px] h-[550px] overflow-y-scroll">
                {testCase.map((value, index) => {
                    return (
                      <TestCaseComponent
                        key={index}
                        test_name={`Case ${index + 1}`}
                        expected={value.expected}
                        output={value.output}
                        loading={loading}
                      />
                    );
                  })}
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={handleRunAllTestCase} disabled={loading}>
                  {loading ? "Running..." : "Run All Test"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
