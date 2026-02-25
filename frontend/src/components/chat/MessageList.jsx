import React, { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { EmptyState } from "./EmptyState";

export const MessageList = ({
  messages,
  isTyping,
  messagesEndRef,
  onPromptClick,
}) => {
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight -
        container.scrollTop -
        container.clientHeight <
      100;

    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, messagesEndRef]);

  return (
    <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <EmptyState onPromptClick={onPromptClick} />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {isTyping && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};
