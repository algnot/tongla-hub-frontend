"use client";
import MDEditor, { PreviewType } from "@uiw/react-md-editor";

interface MarkdownComponentProps {
  content: string;
  preview: PreviewType;
  onChange?: (content: string) => void;
  editable?: boolean;
}

export default function MarkdownComponent({ content, preview, editable, onChange }: MarkdownComponentProps) {
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
    <div className="markdown mt-6 min-w-full">
      <MDEditor
        height={600}
        preview={preview}
        contentEditable={editable}
        value={content}
        onChange={handleOnchange}
        className="resize-none"
      />
    </div>
  );
}
