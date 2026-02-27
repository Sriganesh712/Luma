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
  // 1. CATCH THE NEW PROPS FROM APP.JSX HERE:
  chatHistory,
  onNewChat,
  onSelectChat,
  onDeleteChat 
}) => {
  return (
    <div className="h-screen flex overflow-hidden bg-white">
      
      {/* 2. PASS THEM DOWN TO THE SIDEBAR HERE: */}
      <Sidebar 
        onItemClick={onNavClick} 
        messages={messages}
        chatHistory={chatHistory}
        onNewChat={onNewChat}
        onSelectChat={onSelectChat}
        onDeleteChat={onDeleteChat} 
      />

      {/* Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Scrollable Message Area */}
        <MessageList
          messages={messages}
          isTyping={isTyping}
          messagesEndRef={messagesEndRef}
          onPromptClick={(text) => onSend(text)}
        />

        {/* Fixed Input */}
        <div className="shrink-0 w-full">
          <InputDock
            inputValue={inputValue}
            setInputValue={setInputValue}
            onSend={onSend}
            uploadPDF={uploadPDF} 
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};