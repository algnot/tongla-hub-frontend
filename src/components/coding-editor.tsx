"use client";
import React, { useEffect, useState } from "react";
import AceEditor from "react-ace";
import { useTheme } from "next-themes";

import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/ext-code_lens";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-github_dark";

interface CodeEditorProps {
  className?: string;
  height?: string;
  value: string;
  onChange: (code: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  className,
  value,
  onChange,
  height,
}) => {
  const { theme } = useTheme();
  const [aceTheme, setAceTheme] = useState<string>("github");

  useEffect(() => {
    if (theme === "dark") {
      setAceTheme("github_dark");
    } else {
      setAceTheme("github");
    }
  }, [theme]);

  const handleOnChange = (code: string) => {
    onChange(code);
  };

  return (
    <AceEditor
      mode="python"
      theme={aceTheme}
      name="code_editor"
      width="100%"
      height={height ?? "500px"}
      value={value}
      onChange={(value) => {
        handleOnChange(value);
      }}
      setOptions={{
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        autoScrollEditorIntoView: true,
        showLineNumbers: true,
        enableMultiselect: true,
      }}
      className={className}
      fontSize={14}
    />
  );
};

export default CodeEditor;
