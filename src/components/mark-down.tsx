"use client";
import MDEditor, { PreviewType } from "@uiw/react-md-editor";

interface MarkdownComponentProps {
  content: string;
  preview: PreviewType;
  onChange?: (content: string) => void;
  editable?: boolean;
  hideToolbar?: boolean;
  height?: string;
}

export default function MarkdownComponent({ content, preview, editable, onChange, hideToolbar=false, height="600px" }: MarkdownComponentProps) {
  const handleOnchange = (value: string | undefined) => {
    if (!value || !onChange) {
      if(onChange){
        onChange("");
      }
      return;
    }
    onChange(value)
  }
  return (
    <div className="markdown min-w-full">
      <MDEditor
        height={height}
        preview={preview}
        contentEditable={editable}
        value={content}
        onChange={handleOnchange}
        className="resize-none"
        hideToolbar={hideToolbar}
      />
    </div>
  );
}
