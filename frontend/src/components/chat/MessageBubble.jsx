import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const MessageBubble = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } animate-fade-in`}
    >
      <div
        className={`max-w-xs sm:max-w-md lg:max-w-xl px-4 py-3 rounded-3xl ${
          isUser
            ? "bg-accent-500 text-white shadow-md"
            : "bg-white border border-slate-200 text-slate-900 shadow-base"
        }`}
      >
        {isUser ? (
          <p className="text-base leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        ) : (
          <div className="prose prose-sm sm:prose-base max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ node, ...props }) => (
                  <h1 className="text-lg font-semibold mt-2 mb-2" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-base font-semibold mt-2 mb-1" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-semibold text-accent-600" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc pl-5 space-y-1 my-2" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal pl-5 space-y-1 my-2" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="mb-2 leading-relaxed" {...props} />
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
                    <pre className="bg-slate-100 p-3 rounded-xl overflow-x-auto my-2">
                      <code {...props}>{children}</code>
                    </pre>
                  ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};
