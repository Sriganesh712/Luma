import React, { useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
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
  const lastMessageRef = useRef(null); // Ref to track the specific last bubble
  const [showScrollButton, setShowScrollButton] = useState(false);

  // 1. Handle Scrolling Logic (The "Smart" Auto-scroll)
  useEffect(() => {
    // Small timeout to allow DOM to paint
    const scrollTimeout = setTimeout(() => {
      const lastMessage = messages[messages.length - 1];

      // If no messages, do nothing
      if (!lastMessage) return;

      // SCENARIO A: User just sent a message -> Scroll to very bottom
      if (lastMessage.role === "user") {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      } 
      // SCENARIO B: AI is replying -> Scroll to the TOP of the response
      // This lets you read the start while the text generates downwards
      else if (lastMessageRef.current) {
        lastMessageRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start", // Align top of message with top of container
        });
      }
    }, 100);

    return () => clearTimeout(scrollTimeout);
  }, [messages.length, isTyping, messagesEndRef]); // Trigger when message count changes or typing starts

  // 2. Handle Scroll Button Visibility
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Check distance from bottom
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    // Show button if we are more than 300px away from the bottom
    setShowScrollButton(distanceFromBottom > 300);
  };

  // 3. Manual "Go Down" Button Click
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  return (
    <div className="relative flex-1 overflow-hidden flex flex-col">
      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar p-4"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <EmptyState onPromptClick={onPromptClick} />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6 pb-4">
            {messages.map((message, index) => {
              const isLast = index === messages.length - 1;
              return (
                <div
                  key={message.id || index}
                  ref={isLast ? lastMessageRef : null} // Attach ref to the last bubble
                  className="scroll-mt-4" // Adds a little padding when scrolling to top
                >
                  <MessageBubble message={message} />
                </div>
              );
            })}

            {isTyping && <TypingIndicator />}

            {/* Invisible anchor at the very bottom */}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Floating "Go Down" Button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-6 right-6 p-3 bg-slate-800 text-white rounded-full shadow-lg hover:bg-slate-700 transition-all animate-in fade-in zoom-in duration-200 z-50 hover:scale-110"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};