import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const MessageBubble = ({ message }) => {
  const isUser = message.role === "user";

  /* =========================
     USER MESSAGE (BUBBLE)
     ========================= */
  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="max-w-xs sm:max-w-md lg:max-w-xl px-4 py-3 rounded-3xl bg-accent-500 text-white shadow-md">

          {/* Text Content */}
          {message.content && (
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          )}

          {/* File Attachment Preview */}
          {message.file && (
            <div className="mt-3 flex items-center gap-2 bg-white/20 px-3 py-2 rounded-xl text-sm">
              <span>📄</span>
              <div className="flex flex-col">
                <span className="font-medium">
                  {message.file.name}
                </span>
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

  /* =========================
     AI MESSAGE (NO BUBBLE)
     ========================= */
  return (
    <div className="w-full animate-fade-in">
      <div className="prose prose-sm sm:prose-base max-w-none text-slate-800">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: (props) => (
              <h1 className="text-lg font-semibold mt-4 mb-2" {...props} />
            ),
            h2: (props) => (
              <h2 className="text-base font-semibold mt-3 mb-1" {...props} />
            ),
            strong: (props) => (
              <strong className="font-semibold text-accent-600" {...props} />
            ),
            ul: (props) => (
              <ul className="list-disc pl-5 space-y-1 my-2" {...props} />
            ),
            ol: (props) => (
              <ol className="list-decimal pl-5 space-y-1 my-2" {...props} />
            ),
            p: (props) => (
              <p className="mb-3 leading-relaxed" {...props} />
            ),
            code: ({ inline, children, ...props }) =>
              inline ? (
                <code
                  className="bg-slate-100 px-1 py-0.5 rounded text-sm"
                  {...props}
                >
                  {children}
                </code>
              ) : (
                <pre className="bg-slate-100 p-3 rounded-xl overflow-x-auto my-3">
                  <code {...props}>{children}</code>
                </pre>
              ),
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
};