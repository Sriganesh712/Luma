import React from 'react';
import { MessageList } from './MessageList';

export const ChatArea = ({ messages, isTyping, messagesEndRef }) => {
  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-slate-50 to-slate-50/50">
      <MessageList messages={messages} isTyping={isTyping} messagesEndRef={messagesEndRef} />
    </div>
  );
};
