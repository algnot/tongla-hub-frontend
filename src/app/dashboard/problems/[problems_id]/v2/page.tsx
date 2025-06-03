/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { use, useEffect, useRef, useState } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import ResizableLayout from "@/components/resizable-layout";
import CodeEditor from "@/components/coding-editor";
import { Button } from "@/components/ui/button";
import { LucideBeaker, Play, Send } from "lucide-react";
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
  const { backendClient, setFullLoading, setAlert } = useHelperContext()();

  const [stdout, setStdout] = useState<string>("PyDev console: starting");
  const [codeRuning, setCodeRuning] = useState<boolean>(false);
  const [submiting, setSubmiting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"output" | "input" | "submit">(
    "output",
  );
  const { setOpen } = useSidebar();
  const [editorHeight, setEditorHeight] = useState<number>(500);

  const formRef = useRef<HTMLFormElement | null>(null);
  const [questionData, setQuestionData] = useState<Question | null>(null);

  useEffect(() => {
    if (!questionData) {
      setOpen(false);
      fetchQuestionData();
    }
  }, [questionData]);

  const fetchQuestionData = async () => {
    setFullLoading(true);
    const response = await backendClient.getQuestionById(problems_id);
    setFullLoading(false);
    if (isErrorResponse(response)) {
      return;
    }

    setQuestionData(response);
    setSubmiting(response.submit_info.status == "PENDING");
    if (response.submit_info.status == "FINISH") {
      setActiveTab("submit");
    }
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

    const form = formRef.current;
    const code = form?.formCode?.value ?? "";
    const stdin = form?.formStdin?.value ?? "";
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
    const form = formRef.current;
    const code = form?.formCode?.value ?? "";

    setActiveTab("output");
    setCodeRuning(true);

    let message = "";
    let correct = 0;
    let fail = 0;

    const testCases = questionData?.test_cases ?? [];

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

    message =
      `==== Result ====\n${correct}/${fail + correct} (${
        (correct / (fail + correct)) * 100
      }%)\n\n` + message;

    setStdout(message);
    setCodeRuning(false);
  };

  const onSubmit = async () => {
    setSubmiting(true);
    setAlert(
      "Confirm Submit",
      "Do you want to submit this code?",
      async () => {
        setFullLoading(true);
        const form = formRef.current;
        const code = form?.formCode?.value ?? "";
        const response = await backendClient.submitCode({
          question_id: parseInt(problems_id),
          code,
        });

        if (isErrorResponse(response)) {
          setFullLoading(false);
          setAlert("Error", response.message, 0, true);
          return;
        }

        setFullLoading(false);
        fetchQuestionData();
      },
      true,
    );
  };

  return (
    <form ref={formRef}>
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
                      onClick={onSubmit}
                      disabled={submiting}
                      type="button"
                    >
                      {submiting ? (
                        <>pending submit..</>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          submit
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                {questionData && (
                  <CodeEditor
                    id="formCode"
                    className="h-full"
                    height={`calc(${editorHeight}px - 45px)`}
                    defaultValue={
                      questionData?.submit_info?.code
                        ? questionData.submit_info?.code.replace(/\\n/g, "\n")
                        : questionData.start_code?.replace(/\\n/g, "\n")
                    }
                  />
                )}
              </div>
            }
            second={
              <div>
                <div className="bg-[hsl(var(--editor-background))] h-[45px] flex items-end justify-between">
                  <div className="flex">
                    <button
                      type="button"
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
                      type="button"
                      onClick={() => setActiveTab("input")}
                      className={`h-[40px] w-fit px-4 py-2 rounded-t-md text-sm font-bold flex justify-center items-center ${
                        activeTab === "input"
                          ? "bg-[hsl(var(--code-background))]"
                          : ""
                      }`}
                    >
                      input
                    </button>
                    {questionData?.submitted && (
                      <button
                        type="button"
                        onClick={() => setActiveTab("submit")}
                        className={`h-[40px] w-fit px-4 py-2 rounded-t-md text-sm font-bold flex justify-center items-center ${
                          activeTab === "submit"
                            ? "bg-[hsl(var(--code-background))]"
                            : ""
                        }`}
                      >
                        submit
                      </button>
                    )}
                  </div>

                  <div className="h-[45px] flex justify-center items-center mr-2 gap-2">
                    <Button
                      className="h-[30px]"
                      onClick={runTests}
                      disabled={codeRuning}
                      type="button"
                    >
                      <LucideBeaker className="w-4 h-4" />
                      run tests
                    </Button>
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
                  {(activeTab === "output" || activeTab === "submit") && (
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
                      ) : activeTab === "output" ? (
                        stdout
                      ) : (
                        questionData?.submit_info.info
                      )}
                    </pre>
                  )}
                  <CodeEditor
                    className={`h-full ${
                      activeTab === "input" ? "block" : "hidden"
                    }`}
                    height={`calc(100vh - ${editorHeight}px - 64px - 45px)`}
                    defaultValue={questionData?.test_cases[0]?.input ?? ""}
                    id="formStdin"
                  />
                </div>
              </div>
            }
          />
        }
      />
    </form>
  );
}
