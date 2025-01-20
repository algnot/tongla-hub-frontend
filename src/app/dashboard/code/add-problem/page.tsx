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
import { BackendClient } from "@/lib/request";
import { isErrorResponse } from "@/types/payload";
import React, { useEffect, useState } from "react";

export default function Page() {
  const client = new BackendClient();
  const [loading, setLoading] = useState<boolean>(false);
  const setAlert = useAlertContext();
  const setNavigation = useNavigateContext();

  const [startCode, setStartCode] = useState<string>(
    "# Start code will show when user start problem\ninput = input()\nprint(input)"
  );
  const [answerCode, setAnswerCode] = useState<string>(
    "# Add answer code and add input test case\ninput = input()\nprint(input)"
  );
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("### hello world");
  const [testCases, setTestCase] = useState<AddTestCaseComponentProps[]>([
    { input: "", expected: "" },
  ]);

  const [rightActiveTab, setRightActiveTab] = useState<"detail" | "testCase">(
    "detail"
  );

  const [leftActiveTab, setLeftActiveTab] = useState<
    "startCode" | "answerCode"
  >("startCode");

  const onAddTestCase = () => {
    setTestCase((prev) => [...prev, { input: "", expected: "" }]);
  };

  const onChangeInputTestCase = (index: number, value: string) => {
    setTestCase((prev) =>
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

  useEffect(() => {
    setNavigation(
      [
        {
          name: "All Problems",
          path: "/dashboard/problems",
        },
      ],
      "Create Problems"
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                <Switch id="public" />
                <Label htmlFor="public">Public</Label>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-400">
                Your changes have been saved.
              </div>
              <Button variant="outline">Save</Button>
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
                  <Select>
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
