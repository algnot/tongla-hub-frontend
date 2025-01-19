"use client";
import CodeEditor from "@/components/coding-editor";
import { useAlertContext } from "@/components/provider/alert-provider";
import { useNavigateContext } from "@/components/provider/navigation-provider";
import { Button } from "@/components/ui/button";
import { useUserData } from "@/hooks/use-user";
import { BackendClient } from "@/lib/request";
import { isErrorResponse } from "@/types/payload";
import { useEffect, useState } from "react";

export default function Page() {
  const setAlert = useAlertContext();
  const client = new BackendClient();
  const [userData] = useUserData();
  const setNavigation = useNavigateContext();

  const [code, setCode] = useState<string>("");
  const [stdin, setStdin] = useState<string>("");
  const [stdout, setStdout] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleRun = async () => {
    setLoading(true);

    const response = await client.executeCode({
      code, stdin
    });

    if (isErrorResponse(response)) {
      setAlert("Error", response.message, 0, true);
      setLoading(false);
      return;
    }

    if (response.stderr) {
      setStdout(`Error! run time ${response.runtime} ${response.runtime_unit}\n\noutput:\n${response.stderr}`);
      setLoading(false);
      return;
    }

    setStdout(`Success! run time ${response.runtime} ${response.runtime_unit}\n\noutput:\n${response.stdout}`);
    setLoading(false);
  };

  useEffect(() => {
    setCode(`# Write your Python code here\n\nprint('Hello ${userData?.username ?? "World"}!')\n`);
    setStdout(`PyDev console: starting.\n\nHello ${userData?.username ?? "World"}!`);
    setNavigation([{
        "name": "All Problems",
        "path": "/dashboard/problems"
    }], "Playground");    
  }, [setNavigation, userData]);

  return (
    <div className="w-full mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[90vh] overflow-y-auto">
        <div className="border rounded-lg p-4">
          <div className="flex justify-between mb-4">
            <div>
              <Button>Editor</Button>
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
              <Button onClick={handleRun} disabled={loading}> 
                {loading ? 'Running...' : 'Run Test'}
              </Button>
            </div>
          </div>
          <div className="border rounded-lg p-4 mt-4">
            <label htmlFor="output" className="block text-md font-medium mb-4">
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
        </div>
      </div>
    </div>
  );
}
