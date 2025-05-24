"use client";
import React, { useEffect, useState } from "react";
import AceEditor from "react-ace";
import { useTheme } from "next-themes";

import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/ext-code_lens";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-github_dark";

interface CodeEditorProps {
  value?: string;
  id?: string;
  defaultValue?: string;
  height?: string;
  className?: string;
  onChange?: (code: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  className,
  value,
  defaultValue,
  id,
  onChange,
  height,
}) => {
  const { theme } = useTheme();
  const [aceTheme, setAceTheme] = useState<string>("github");
  const [code, setCode] = useState("");

  useEffect(() => {
    if (theme === "dark") {
      setAceTheme("github_dark");
    } else {
      setAceTheme("github");
    }
  }, [theme]);

  useEffect(() => {
    if (defaultValue) {
      handleOnChange(defaultValue);
    }
    if (value) {
      handleOnChange(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue]);

  const handleOnChange = (code: string) => {
    onChange?.(code);
    setCode(code);
  };

  return (
    <>
      <AceEditor
        mode="python"
        theme={aceTheme}
        name="code_editor"
        width="100%"
        height={height ?? "500px"}
        defaultValue={defaultValue}
        value={code}
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
      <textarea value={code} id={id} name={id} style={{ display: "none" }} />
    </>
  );
};

export default CodeEditor;
