"use client";
import CodeEditor from "@/components/coding-editor";
import { useNavigateContext } from "@/components/provider/navigation-provider";
import { Button } from "@/components/ui/button";
import { useUserData } from "@/hooks/use-user";
import { useEffect, useState } from "react";

export default function Page() {
  const [userData] = useUserData();
  const setNavigation = useNavigateContext();

  const [code, setCode] = useState("");
  const [stdin, setStdin] = useState("");
  const [stdout, setStdout] = useState("");

  const handleRun = () => {};

  useEffect(() => {
    setCode(`# Write your Python code here\n\nprint('Hello ${userData?.username ?? "World"}!')\n`);
    setStdout(`PyDev console: starting.\n\nHello ${userData?.username ?? "World"}!`);
    setNavigation([], "Playground");
    console.log(code);
    
  }, [setNavigation, userData, code]);

  return (
    <div className="w-full mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[90vh] overflow-y-auto">
        <div className="border rounded-lg p-4">
          <div className="flex justify-between mb-4">
            <div>
              <Button>Code Editor</Button>
            </div>
          </div>
          <CodeEditor value={code} onChange={(newCode) => setCode(newCode)} />
        </div>
        <div className="mb-4">
          <div className="border rounded-lg p-4">
            <Button variant="outline">Python (3.10)</Button>
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
              <Button onClick={handleRun}>Run</Button>
            </div>
          </div>
          <div>
            <label htmlFor="output" className="block text-md font-medium my-4">
              Output
            </label>
            <pre
              id="output"
              className="w-full border rounded-md p-2 h-48 md:h-60 overflow-y-auto whitespace-pre-wrap"
            >
              {stdout}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}