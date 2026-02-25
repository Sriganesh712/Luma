import React from "react";
import { Sidebar } from "./Sidebar.jsx";
import { MessageList } from "../chat/MessageList";
import { InputDock } from "../chat/InputDock";

export const MainLayout = ({
  messages,
  inputValue,
  setInputValue,
  onSend,
  uploadPDF,
  isLoading,
  isTyping,
  messagesEndRef,
  onNavClick,
}) => {
  return (
    <div className="h-screen flex overflow-hidden">
      
      {/* Fixed Sidebar */}
      <Sidebar onItemClick={onNavClick} />

      {/* Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Scrollable Message Area */}
        <MessageList
          messages={messages}
          isTyping={isTyping}
          messagesEndRef={messagesEndRef}
          onPromptClick={(text) => onSend(text)}
        />

        {/* Fixed Input */}
        <InputDock
          inputValue={inputValue}
          setInputValue={setInputValue}
          onSend={onSend}
          uploadPDF={uploadPDF} 
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
