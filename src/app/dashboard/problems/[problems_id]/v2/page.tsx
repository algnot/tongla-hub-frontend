/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { use, useEffect, useState } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import ResizableLayout from "@/components/resizable-layout";
import CodeEditor from "@/components/coding-editor";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
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

  return (
    <div>
      <ResizableLayout
        direction="horizontal"
        first={
          <MarkdownComponent
            editable={false}
            preview="preview"
            content={`${
              "## " + (questionData?.title ?? "Problems " + problems_id)
            }\n ${questionData?.description ?? ""}`}
            height="calc(100vh - 64px)"
            hideToolbar
          />
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
                      <Play className="w-4 h-4 mr-1" />
                      run
                    </Button>
                  </div>
                </div>

                <div>
                  {activeTab === "output" ? (
                    <pre
                      id="output"
                      className="w-full border-t-2 p-2 overflow-y-auto whitespace-pre-wrap text-sm"
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
