/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import CodeEditor from "@/components/coding-editor";
import MarkdownComponent from "@/components/mark-down";
import { useAlertContext } from "@/components/provider/alert-provider";
import { Button } from "@/components/ui/button";
import { BackendClient } from "@/lib/request";
import { isErrorResponse } from "@/types/payload";
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

type PageProps = {
  params: Promise<{ session_id: string[] }>;
};

export default function Page({ params }: PageProps) {
  const client = new BackendClient();
  const setAlert = useAlertContext();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [socketUserId, setSocketUserId] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [stdin, setStdin] = useState<string>("");
  const [stdout, setStdout] = useState<string>("PyDev console: starting");
  const [loading, setLoading] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<"detail" | "customInput">(
    "detail"
  );

  const fetchData = async () => {
    const { session_id } = await params;
    const sessionId = Array.isArray(session_id) ? session_id[0] : session_id;
    const socketId = uuidv4();
    setSocketUserId(socketId);

    const socket = new WebSocket(
      `${process.env.NEXT_PUBLIC_SOCKET_PATH}/${sessionId}`
    );

    socket.onmessage = (event) => {
      const { codeChange, userId, action, stdin } = JSON.parse(event.data);
      if (userId == socketId) {
        return;
      }
      if (action == "initCode") {
        const { title, description } = JSON.parse(event.data);
        setCode(codeChange);
        setTitle(title);
        setStdin(stdin);
        setDescription(description);
      } else if (action == "changeCode") {
        setCode(codeChange);
        setStdin(stdin);
      }
    };
    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          action: "connected",
          userId: socketId,
        })
      );
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
      setSocketUserId("");
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
        })
      );
    }
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

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="w-full mx-auto p-4">
      <div className="border rounded-lg p-4 mb-4 text-xl">
        Code with friend - {title}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
        {/* left component */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between mb-4">
            <Button>Python (3.10)</Button>
          </div>
          <CodeEditor
            value={code}
            onChange={(newCode) => onChangeCode(newCode)}
          />
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
            </div>
          </div>
          {activeTab === "detail" && (
            <MarkdownComponent
              editable={false}
              preview="preview"
              content={description ?? ""}
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
        </div>
      </div>
    </div>
  );
}
