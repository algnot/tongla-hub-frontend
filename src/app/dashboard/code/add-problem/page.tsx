"use client";
import CodeEditor from "@/components/coding-editor";
import MarkdownComponent from "@/components/mark-down";
import { useNavigateContext } from "@/components/provider/navigation-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useEffect, useState } from "react";

export default function Page() {
  const setNavigation = useNavigateContext();
  const [startCode, setStartCode] = useState<string>(
    "# Start code will show when user start problem\ninput = input()\nprint(input)"
  );
  const [answerCode, setAnswerCode] = useState<string>(
    "# Add answer code and add input test case\ninput = input()\nprint(input)"
  );

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("### hello world");

  const [rightActiveTab, setRightActiveTab] = useState<"detail" | "testCase">(
    "detail"
  );
  const [leftActiveTab, setLeftightActiveTab] = useState<
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
              onClick={() => setLeftightActiveTab("startCode")}
              variant={leftActiveTab === "startCode" ? "default" : "outline"}
            >
              Start Code
            </Button>
            <Button
              onClick={() => setLeftightActiveTab("answerCode")}
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
                onClick={() => setRightActiveTab("testCase")}
                variant={rightActiveTab === "testCase" ? "default" : "outline"}
              >
                Test Case
              </Button>
            </div>
            <Button variant="outline">Save</Button>
          </div>
          {rightActiveTab === "detail" && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Sum A+B"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <MarkdownComponent
                preview="edit"
                editable={false}
                content={description}
                onChange={setDescription}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
