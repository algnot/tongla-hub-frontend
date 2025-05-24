/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { use, useEffect, useState } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import ResizableLayout from "@/components/resizable-layout";
import CodeEditor from "@/components/coding-editor";
import { Button } from "@/components/ui/button";
import { LucideBeaker, Play } from "lucide-react";
import MarkdownComponent from "@/components/mark-down";
import { useHelperContext } from "@/components/provider/helper-provider";
import { isErrorResponse } from "@/types/payload";
import { useNavigateContext } from "@/components/provider/navigation-provider";
import { Question } from "@/types/request";

type PageProps = {
  params: Promise<{ problems_id: string }>;
};

export default function Page({ params }: PageProps) {
  const { problems_id } = use(params);
  const setNavigation = useNavigateContext();
  const { backendClient, setFullLoading } = useHelperContext()();

  const [questionData, setQuestionData] = useState<Question | null>(null);
  const [code, setCode] = useState<string>("print('hellp world')\n");
  const [stdin, setStdin] = useState<string>("");
  const [stdout, setStdout] = useState<string>("PyDev console: starting");

  const [codeRuning, setCodeRuning] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"output" | "input">("output");
  const { setOpen } = useSidebar();
  const [editorHeight, setEditorHeight] = useState<number>(500);

  useEffect(() => {
    setOpen(false);
    fetchQuestionData();
  }, []);

  const fetchQuestionData = async () => {
    setFullLoading(true);
    const response = await backendClient.getQuestionById(problems_id);
    setFullLoading(false);
    if (isErrorResponse(response)) {
      return;
    }

    setQuestionData(response);
    setStdin(response.test_cases[0].input);

    let startCode = "";
    if (response.submit_info.id != 0) {
      if (response.submit_info.status == "PENDING") {
        setTimeout(() => {
          fetchQuestionData();
        }, 5000);
      }
      startCode = response.submit_info.code.replace(/\\n/g, "\n");
    } else {
      startCode = response.start_code.replace(/\\n/g, "\n");
    }
    setCode(startCode);

    setNavigation(
      [
        {
          name: "All Problems",
          path: "/dashboard/problems",
        },
      ],
      response.title,
    );
  };

  const handleRun = async () => {
    if (codeRuning) {
      return;
    }
    setActiveTab("output");
    setCodeRuning(true);
    const response = await backendClient.executeCode({
      code,
      stdin,
    });
    setCodeRuning(false);
    if (isErrorResponse(response)) {
      return;
    }
    if (response.stderr) {
      setStdout(
        `Error! run time ${response.runtime} ${response.runtime_unit}\n\noutput:\n${response.stderr}`,
      );
      return;
    }
    setStdout(
      `Success! run time ${response.runtime} ${response.runtime_unit}\n\noutput:\n${response.stdout}`,
    );
  };

  const runTests = async () => {
    if (codeRuning) return;

    setActiveTab("output");
    setCodeRuning(true);

    let message = "";

    const testCases = questionData?.test_cases ?? [];

    let correct = 0
    let fail = 0
    for (let index = 0; index < testCases.length; index++) {
      const testCase = testCases[index];
      const response = await backendClient.executeCode({
        code,
        stdin: testCase.input,
      });

      if (isErrorResponse(response)) {
        continue;
      }

      const output = response.stderr ? response.stderr : response.stdout;
      if (output === testCase.expected) {
        correct += 1;
      } else {
        fail += 1;
      }

      message += `Test Case ${index + 1}: ${
        output === testCase.expected ? "Passed ✅" : "failed ❌"
      } \n>>> Input:\n${
        testCase.input
      }\n---\n>>> Output:\n${output}---\n>>> Matches the expected output:\n${
        testCase.expected
      }=========\n\n`;
    }

    message = `==== Result ====\n${correct}/${fail + correct} (${((correct / (fail + correct)) * 100)}%)\n\n` + message

    setStdout(message);
    setCodeRuning(false);
  };

  return (
    <div>
      <ResizableLayout
        direction="horizontal"
        first={
          <div>
            <div className="bg-[hsl(var(--editor-background))] h-[45px] flex items-end justify-between">
              <div className="bg-[hsl(var(--code-background))] h-[40px] w-fit px-4 py-2 rounded-t-md text-sm font-bold flex justify-center items-center">
                {questionData?.title}
              </div>
            </div>
            <MarkdownComponent
              editable={false}
              preview="preview"
              content={`${questionData?.description ?? ""}`}
              height="calc(100vh - 64px - 45px)"
              hideToolbar
            />
          </div>
        }
        second={
          <ResizableLayout
            direction="vertical"
            initialSize={500}
            onResize={setEditorHeight}
            first={
              <div>
                <div className="bg-[hsl(var(--editor-background))] h-[45px] flex items-end justify-between">
                  <div className="bg-[hsl(var(--code-background))] h-[40px] w-fit px-4 py-2 rounded-t-md text-sm font-bold flex justify-center items-center">
                    main.py
                  </div>
                  <div className="h-[45px] flex justify-center items-center mr-2">
                    <Button
                      className="h-[30px]"
                      onClick={runTests}
                      disabled={codeRuning}
                      type="button"
                    >
                      <LucideBeaker className="w-4 h-4" />
                      run tests
                    </Button>
                  </div>
                </div>

                <CodeEditor
                  className="h-full"
                  height={`calc(${editorHeight}px - 45px)`}
                  value={code}
                  onChange={setCode}
                />
              </div>
            }
            second={
              <div>
                <div className="bg-[hsl(var(--editor-background))] h-[45px] flex items-end justify-between">
                  <div className="flex">
                    <button
                      onClick={() => setActiveTab("output")}
                      className={`h-[40px] w-fit px-4 py-2 rounded-t-md text-sm font-bold flex justify-center items-center ${
                        activeTab === "output"
                          ? "bg-[hsl(var(--code-background))]"
                          : ""
                      }`}
                    >
                      output
                    </button>
                    <button
                      onClick={() => setActiveTab("input")}
                      className={`h-[40px] w-fit px-4 py-2 rounded-t-md text-sm font-bold flex justify-center items-center ${
                        activeTab === "input"
                          ? "bg-[hsl(var(--code-background))]"
                          : ""
                      }`}
                    >
                      input
                    </button>
                  </div>

                  <div className="h-[45px] flex justify-center items-center mr-2">
                    <Button
                      className="h-[30px]"
                      onClick={handleRun}
                      disabled={codeRuning}
                      type="button"
                    >
                      <Play className="w-4 h-4" />
                      run
                    </Button>
                  </div>
                </div>

                <div>
                  {activeTab === "output" ? (
                    <pre
                      id="output"
                      className="w-full border-t-2 p-2 overflow-y-auto whitespace-pre-wrap text-sm border-none bg-[hsl(var(--code-background))]"
                      style={{
                        height: `calc(100vh - ${editorHeight}px - 64px - 45px)`,
                      }}
                    >
                      {codeRuning ? (
                        <div className="flex justify-center items-center space-x-2">
                          <div className="w-4 h-4 border-4 border-t-transparent border-blue-500 border-solid rounded-full animate-spin"></div>
                          <span>Loading...</span>
                        </div>
                      ) : (
                        stdout
                      )}
                    </pre>
                  ) : (
                    <CodeEditor
                      className="h-full"
                      height={`calc(100vh - ${editorHeight}px - 64px - 45px)`}
                      value={stdin}
                      onChange={setStdin}
                    />
                  )}
                </div>
              </div>
            }
          />
        }
      />
    </div>
  );
}
