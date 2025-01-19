"use client";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

interface MarkdownComponentProps {
  content: string;
}

export default function MarkdownComponent({ content }: MarkdownComponentProps) {
  const formattedContent = content.replace(/\\n/g, "  \n");

  return (
    <div className="markdown border-b-[1px] pb-8 mt-6 min-w-full">
      <Markdown remarkPlugins={[remarkGfm, remarkBreaks]}>
        {formattedContent}
      </Markdown>
    </div>
  );
}
