import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

// CRITICAL: Import the KaTeX CSS for math styling
import 'katex/dist/katex.min.css';

export const MessageBubble = ({ message }) => {
  const isUser = message.role === "user";

  // Formatting math delimiters for the chatbot's response
  const formattedContent = message.content
    ? message.content
        .replace(/\\\[/g, '$$')  // Replace \[ with $$
        .replace(/\\\]/g, '$$')  // Replace \] with $$
        .replace(/\\\(/g, '$')   // Replace \( with $
        .replace(/\\\)/g, '$')   // Replace \) with $
    : "";

  const CodeBlock = ({ inline, className, children, ...props }) => {
    const [copied, setCopied] = useState(false);
    const match = /language-(\w+)/.exec(className || "");
    const codeText = String(children).replace(/\n$/, "");

    const handleCopy = async () => {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    if (inline) {
      return (
        <code className="bg-slate-100 px-1 py-0.5 rounded text-sm" {...props}>
          {children}
        </code>
      );
    }

    return (
      <div className="relative my-4">
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 text-xs bg-slate-200 hover:bg-slate-300 px-2 py-1 rounded z-10"
        >
          {copied ? "Copied!" : "Copy"}
        </button>

        <SyntaxHighlighter
          language={match ? match[1] : "javascript"}
          style={oneDark}
          customStyle={{
            borderRadius: "12px",
            padding: "16px",
            fontSize: "0.85rem",
          }}
        >
          {codeText}
        </SyntaxHighlighter>
      </div>
    );
  };

  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="max-w-xs sm:max-w-md lg:max-w-xl px-4 py-3 rounded-3xl bg-accent-500 text-white shadow-md">
          {/* User's Text Message */}
          {message.content && (
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          )}

          {/* User's File Attachment (Restored!) */}
          {message.file && (
            <div className="mt-3 flex items-center gap-2 bg-white/20 px-3 py-2 rounded-xl text-sm">
              <span>📄</span>
              <div className="flex flex-col">
                <span className="font-medium">{message.file.name}</span>
                {message.file.size && (
                  <span className="text-xs opacity-80">
                    {(message.file.size / 1024).toFixed(1)} KB
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Chatbot's Response Bubble
  return (
    <div className="w-full animate-fade-in">
      <div className="prose prose-sm sm:prose-base max-w-none text-slate-800 leading-relaxed space-y-4">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            code: CodeBlock,
            table: (props) => (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border border-slate-300 text-sm" {...props} />
              </div>
            ),
            th: (props) => (
              <th className="border border-slate-300 px-3 py-2 bg-slate-100 text-left" {...props} />
            ),
            td: (props) => (
              <td className="border border-slate-300 px-3 py-2" {...props} />
            ),
            p: ({ children }) => <p className="mb-2">{children}</p>,
          }}
        >
          {/* We pass the formattedContent here so math works! */}
          {formattedContent}
        </ReactMarkdown>
      </div>
    </div>
  );
};