"use client";
import AddTestCaseComponent, {
  AddTestCaseComponentProps,
} from "@/components/add-test-case";
import CodeEditor from "@/components/coding-editor";
import MarkdownComponent from "@/components/mark-down";
import { useAlertContext } from "@/components/provider/alert-provider";
import { useNavigateContext } from "@/components/provider/navigation-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useUserData } from "@/hooks/use-user";
import { BackendClient } from "@/lib/request";
import {
  CreateQuestionRequest,
  CreateQuestionTestCaseRequest,
  isErrorResponse,
} from "@/types/payload";
import React, { useEffect, useState } from "react";

export default function Page() {
  const client = new BackendClient();
  const [loading, setLoading] = useState<boolean>(false);
  const setAlert = useAlertContext();
  const [userData] = useUserData();
  const setNavigation = useNavigateContext();

  const [startCode, setStartCode] = useState<string>(
    "input = input()\nprint(input)"
  );
  const [answerCode, setAnswerCode] = useState<string>(
    "# Add answer code and add input test case\ninput = input()\nprint(input)"
  );
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("### hello world");
  const [rate, setRate] = useState<number>(1);
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [testCases, setTestCases] = useState<AddTestCaseComponentProps[]>([
    { input: "", expected: "" },
  ]);

  const [rightActiveTab, setRightActiveTab] = useState<"detail" | "testCase">(
    "detail"
  );

  const [leftActiveTab, setLeftActiveTab] = useState<
    "startCode" | "answerCode"
  >("startCode");

  useEffect(() => {
    setNavigation(
      [
        {
          name: "All Problems",
          path: "/dashboard/problems",
        },
      ],
      "Create Problem"
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onAddTestCase = () => {
    setTestCases((prev) => [...prev, { input: "", expected: "" }]);
  };

  const onChangeInputTestCase = (index: number, value: string) => {
    setTestCases((prev) =>
      prev.map((item, i) => (i === index ? { ...item, input: value } : item))
    );
  };

  const onRunTest = async () => {
    setLoading(true);
    for (const testCase of testCases) {
      const response = await client.executeCode({
        code: answerCode,
        stdin: testCase.input,
      });
      if (isErrorResponse(response)) {
        setAlert("Error", response.message, 0, true);
        setLoading(false);
        return;
      }
      const expected =
        response.stdout != "" ? response.stdout : response.stderr;
      testCase.expected = expected;
    }
    setLoading(false);
  };

  const validatePayload = (payload: CreateQuestionRequest): string => {
    if (!payload.title) {
      return "title is require";
    }

    if (!payload.description) {
      return "description is require";
    }

    if (!payload.start_code) {
      return "start code is require";
    }

    if (!payload.answer_code) {
      return "answer code is require";
    }

    if (payload.test_cases.length == 0) {
      return "test case is require";
    }

    for (const testCase of payload.test_cases) {
      if (!testCase.expected) {
        return "expected output is require. please click run all test case.";
      }
    }

    return "";
  };

  const preparePayload = (): CreateQuestionRequest => {
    let testCasesRequest: CreateQuestionTestCaseRequest[] = [];

    for (const testCase of testCases) {
      testCasesRequest = [
        ...testCasesRequest,
        {
          input: testCase.input,
          expected: testCase.expected,
          expected_run_time_ms: 1000,
        },
      ];
    }

    return {
      title: title,
      description: description,
      start_code: startCode,
      answer_code: answerCode,
      rate: rate,
      is_system_question: userData?.role == "ADMIN",
      is_public: isPublic,
      test_cases: testCasesRequest,
    };
  };

  const onSubmit = async () => {
    const payload = preparePayload();
    const error = validatePayload(payload);
    if (error) {
      setAlert("Error", error, 0, true);
      return;
    }

    setLoading(true);
    const response = await client.addQuestion(payload);
    if (isErrorResponse(response)) {
      setAlert("Error", response.message, 0, true);
      setLoading(false);
      return;
    }

    setAlert(
      "Created",
      "your problem is created!",
      () => {
        window.location.href = `/dashboard/problems/${response.id}`;
      },
      false
    );
  };

  return (
    <div className="w-full mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
        {/* left component */}
        <div className="border rounded-lg p-4">
          <div className="flex gap-2 mb-4">
            <Button
              onClick={() => setLeftActiveTab("startCode")}
              variant={leftActiveTab === "startCode" ? "default" : "outline"}
            >
              Start Code
            </Button>
            <Button
              onClick={() => setLeftActiveTab("answerCode")}
              variant={leftActiveTab === "answerCode" ? "default" : "outline"}
            >
              Answer Code
            </Button>
          </div>
          {leftActiveTab === "startCode" ? (
            <CodeEditor
              value={startCode}
              onChange={(newCode) => setStartCode(newCode)}
            />
          ) : (
            <CodeEditor
              value={answerCode}
              onChange={(newCode) => setAnswerCode(newCode)}
            />
          )}
        </div>

        {/* right component */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between gap-2 mb-4">
            <div className="flex gap-2">
              <Button
                onClick={() => setRightActiveTab("detail")}
                variant={rightActiveTab === "detail" ? "default" : "outline"}
              >
                Detail
              </Button>
              <Button
                onClick={() => {
                  setRightActiveTab("testCase");
                  setLeftActiveTab("answerCode");
                }}
                variant={rightActiveTab === "testCase" ? "default" : "outline"}
              >
                Test Case
              </Button>
              <div className="flex items-center space-x-2">
                <Switch
                  id="public"
                  checked={isPublic}
                  onCheckedChange={() => setIsPublic(!isPublic)}
                />
                <Label htmlFor="public">Public</Label>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onSubmit}>
                Save
              </Button>
            </div>
          </div>

          {rightActiveTab === "detail" && (
            <>
              <div className="grid grid-cols-[3fr,1fr] gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Sum A+B"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="rate">Rate</Label>
                  <Select
                    value={rate.toString()}
                    onValueChange={(value) => setRate(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select rate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <MarkdownComponent
                preview="edit"
                editable={false}
                content={description}
                onChange={setDescription}
              />
            </>
          )}

          {rightActiveTab === "testCase" && (
            <>
              <div className="max-h-[550px] h-[550px] overflow-y-scroll">
                <div className="flex justify-end items-center gap-2 mb-3">
                  <div className="text-gray-400 text-sm">
                    Test case will display only 3 case in test mode
                  </div>
                  <Button onClick={onAddTestCase}>Add Test Case</Button>
                </div>
                {testCases.map((value, index) => {
                  return (
                    <AddTestCaseComponent
                      caseName={`Case ${index + 1}`}
                      input={value.input}
                      expected={value.expected}
                      onChange={(value) => onChangeInputTestCase(index, value)}
                      key={index}
                      loading={loading}
                    />
                  );
                })}
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={onRunTest}>Run Test Case</Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
