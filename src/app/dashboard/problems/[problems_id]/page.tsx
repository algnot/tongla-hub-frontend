/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import CodeEditor from "@/components/coding-editor";
import MarkdownComponent from "@/components/mark-down";
import { useAlertContext } from "@/components/provider/alert-provider";
import { useLoadingContext } from "@/components/provider/loading-provider";
import { useNavigateContext } from "@/components/provider/navigation-provider";
import TestCaseComponent, { TestCaseProps } from "@/components/test-case";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useUserData } from "@/hooks/use-user";
import { BackendClient } from "@/lib/request";
import { isErrorResponse } from "@/types/payload";
import { Question } from "@/types/request";
import { v4 as uuidv4 } from "uuid";
import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getItem, removeItem, setItem } from "@/lib/storage";

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
    "detail" | "customInput" | "testCase" | "yourSubmit"
  >("detail");

  const [isSessionStart, setIsSessionStart] = useState<boolean>(false);

  const fetchQuestionData = async (forceReload: boolean) => {
    const { problems_id } = await params;
    const problemId = Array.isArray(problems_id) ? problems_id[0] : problems_id;
    setProblemId(problemId);
    if (!forceReload) {
      setFullLoading(true);
    }

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
    let startCode = "";
    if (response.submit_info.id != 0) {
      if (response.submit_info.status == "PENDING") {
        setTimeout(() => {
          fetchQuestionData(true);
        }, 5000);
      }
      startCode = response.submit_info.code.replace(/\\n/g, "\n");
      setActiveTab("yourSubmit");
    } else {
      startCode = response.start_code.replace(/\\n/g, "\n");
    }
    onChangeCode(startCode);
    setQuestionData(response);
    setStdin(response.test_cases[0].input);
    setFullLoading(false);

    const sessionId = getItem("sessionId");
    if (sessionId) {
      handleSwitchSession(
        startCode,
        response?.title ?? "",
        response?.description ?? "",
        response.test_cases[0].input
      );
    }

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
            run_time_ms: response.runtime,
          },
        },
      ];
    }
    setTestCase(result);
    setLoading(false);
  };

  const onFillAnswer = () => {
    onChangeCode(questionData?.answer_code ?? "");
  };

  const onFillStartCode = () => {
    onChangeCode(questionData?.start_code ?? "");
  };

  const onSubmitCode = () => {
    setAlert(
      "Confirm Submit",
      "Do you want to submit this code?",
      async () => {
        setFullLoading(true);
        const response = await client.submitCode({
          question_id: parseInt(problemId),
          code: code,
        });

        if (isErrorResponse(response)) {
          setFullLoading(false);
          setAlert("Error", response.message, 0, true);
          return;
        }

        setAlert(
          "Submited",
          "your code is submitted",
          async () => {
            setFullLoading(false);
            fetchQuestionData(false);
          },
          false
        );
      },
      true
    );
  };

  useEffect(() => {
    fetchQuestionData(false);
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

  const handleCopy = () => {
    navigator.clipboard
      .writeText(window.location.host + "/code-with-friend/" + channelId)
      .catch((err) => {
        console.error("Error copying text: ", err);
      });
  };

  // web socket module
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [channelId, setChannelId] = useState<string>("");
  const [socketUserId, setSocketUserId] = useState<string>("");
  const startSession = (
    initCode: string,
    title: string,
    description: string,
    stdin: string
  ) => {
    let channelId = uuidv4();
    const sessionId = getItem("sessionId");
    if (sessionId) {
      channelId = sessionId;
    } else {
      setItem("sessionId", channelId);
    }
    const socketId = uuidv4();
    setChannelId(channelId);
    setSocketUserId(socketId);
    const socket = new WebSocket(
      `${process.env.NEXT_PUBLIC_SOCKET_PATH}/${channelId}`
    );

    socket.onmessage = (event) => {
      const { codeChange, userId, action } = JSON.parse(event.data);
      if (userId == socketId) {
        return;
      }
      if (action == "changeCode") {
        setCode(codeChange);
      } else if (action == "connected") {
        socket.send(
          JSON.stringify({
            action: "initCode",
            userId: socketId,
            codeChange: initCode,
            description: description,
            title: title,
            stdin: stdin,
          })
        );
      }
    };
    socket.onerror = () => {
      setAlert(
        "Code with friend error :(",
        "Code with friend is disconnected",
        0,
        true
      );
    };
    socket.onclose = () => {
      setAlert(
        "Code with friend disconnected",
        "Code with friend is disconnected",
        0,
        true
      );
      setChannelId("");
      setIsSessionStart(false);
      setSocketUserId("");
      removeItem("sessionId");
    };
    setWs(socket);
  };

  const onChangeCode = (value: string) => {
    setCode(value);
    if (ws) {
      ws.send(
        JSON.stringify({
          action: "changeCode",
          userId: socketUserId,
          codeChange: value,
          description: questionData?.description,
          title: questionData?.title,
          stdin: stdin
        })
      );
    }
  };

  const handleSwitchSession = (
    initCode: string,
    title: string,
    description: string,
    stdin: string
  ) => {
    if (!isSessionStart) {
      startSession(initCode, title, description, stdin);
    } else {
      removeItem("sessionId");
      setChannelId("");
      ws?.close();
    }
    setIsSessionStart((v) => !v);
  };

  return (
    <div className="w-full mx-auto p-4">
      <div className="flex justify-end mb-4 gap-2">
        <Button onClick={onSubmitCode}>
          {questionData?.submit_info.id != 0 ? "Resubmit Code" : "Submit Code"}
        </Button>
        {(userData?.role == "ADMIN" ||
          userData?.uid == questionData?.owner.id) && (
          <>
            <Link href={`/dashboard/problems/${problemId}/edit`}>
              <Button>Edit Problem</Button>
            </Link>
            <Button variant="outline" onClick={onFillAnswer}>
              Fill Answer
            </Button>
          </>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
        {/* left component */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between mb-4">
            <Button>Python (3.10)</Button>
            <Button variant="outline" onClick={onFillStartCode}>
              Reset Code
            </Button>
          </div>
          <CodeEditor
            value={code}
            onChange={(newCode) => onChangeCode(newCode)}
          />
          <div className="border rounded-lg p-4 mt-3">
            <div className="flex gap-3 items-center">
              <Switch
                id="isSessionStart"
                checked={isSessionStart}
                onCheckedChange={() =>
                  handleSwitchSession(
                    code,
                    questionData?.title ?? "",
                    questionData?.description ?? "",
                    stdin
                  )
                }
              />
              <div>
                <div className="text-md">Code with friend</div>
                <div className="text-sm text-gray-500">
                  Anyone with the link can edit this code
                </div>
              </div>
            </div>
            {isSessionStart && (
              <div className="flex gap-2 items-center mt-3">
                <Input
                  disabled
                  className="flex-grow"
                  value={
                    window.location.host + "/code-with-friend/" + channelId
                  }
                />
                <Button onClick={handleCopy}>Copy Link</Button>
              </div>
            )}
          </div>
        </div>

        {/* right component */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between mb-4">
            <div className="flex gap-2 flex-wrap">
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
              {questionData?.submit_info.id != 0 && (
                <Button
                  variant={activeTab === "yourSubmit" ? "default" : "outline"}
                  onClick={() => setActiveTab("yourSubmit")}
                >
                  Your Submit
                </Button>
              )}
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

          {activeTab === "yourSubmit" &&
            questionData?.submit_info.status != "PENDING" && (
              <>
                <div
                  className={`text-xl mb-3 ${
                    questionData?.submit_info.score ==
                    questionData?.submit_info.max_score
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  Score: {questionData?.submit_info.score}/
                  {questionData?.submit_info.max_score} (
                  {(
                    ((questionData?.submit_info.score ?? 0) /
                      (questionData?.submit_info.max_score ?? 1)) *
                    100
                  ).toFixed(2)}
                  %)
                </div>
                <div className="max-h-[550px] h-[550px] overflow-y-scroll">
                  {questionData?.submit_info.info.map((value, index) => {
                    return (
                      <TestCaseComponent
                        key={index}
                        test_name={`Case ${index + 1}`}
                        forceCorrect={value.score == 1}
                        showOnlyOutput={true}
                        expected={{
                          expected: "hidden expected",
                          expected_run_time_ms: value.expected_run_time_ms,
                          id: value.test_case_id,
                          input: "hidden input",
                        }}
                        output={{
                          output: value.description,
                          run_time_ms: value.output.runtime,
                        }}
                        loading={false}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={() => {
                      onChangeCode(questionData?.submit_info.code ?? "");
                    }}
                    variant="outline"
                  >
                    Your Submit Code
                  </Button>
                </div>
              </>
            )}

          {activeTab === "yourSubmit" &&
            questionData?.submit_info.status === "PENDING" && (
              <div className="flex justify-center items-center text-2xl gap-2 pt-4">
                <span>Your submission is pending review.</span>
                <RefreshCw className="animate-spin" size={24} />
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
