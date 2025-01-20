"use client";
import MDEditor from "@uiw/react-md-editor";

interface MarkdownComponentProps {
  content: string;
}

export default function MarkdownComponent({ content }: MarkdownComponentProps) {
  const formattedContent = content.replace(/\\n/g, "  \n");

  return (
    <div className="markdown border-b-[1px] pb-8 mt-6 min-w-full">
      <MDEditor
        height={700}
        preview="preview"
        contentEditable={false}
        value={formattedContent}
        className="resize-none"
      />
    </div>
  );
}
