import React, { useState, useEffect } from "react";
import { useChat } from "./hooks/useChat";
import { MainLayout } from "./components/layout/MainLayout";

function App() {
  const {
    messages,
    setMessages, 
    inputValue,
    setInputValue,
    isLoading,
    isTyping,
    sendMessage,
    uploadPDF,
    messagesEndRef,
  } = useChat();

  // 1. Load history from storage
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('sahayak_history');
    return saved ? JSON.parse(saved) : [];
  });

  // 2. Track which chat we are currently looking at! (CRITICAL FIX)
  const [currentChatId, setCurrentChatId] = useState(null);

  // 3. AUTO-SAVE: Whenever messages change, update the current chat in history
  useEffect(() => {
    if (messages.length === 0) return; // Don't save empty chats

    setChatHistory(prevHistory => {
      const existingChatIndex = prevHistory.findIndex(c => c.id === currentChatId);
      
      const updatedChat = {
        id: currentChatId || Date.now(), // Use existing ID, or create new one
        title: messages[0].content.substring(0, 30) + '...',
        messages: [...messages]
      };

      if (existingChatIndex >= 0) {
        // Update existing chat
        const newHistory = [...prevHistory];
        newHistory[existingChatIndex] = updatedChat;
        return newHistory;
      } else {
        // It's a brand new chat, add to top of list
        setCurrentChatId(updatedChat.id); // Set the ID so future messages update it
        return [updatedChat, ...prevHistory];
      }
    });
  }, [messages]); // Runs every time a message is sent or received

  // 4. Save to local storage whenever history array changes
  useEffect(() => {
    localStorage.setItem('sahayak_history', JSON.stringify(chatHistory));
  }, [chatHistory]);

  // Handle "New Chat" button
  const handleNewChat = () => {
    setMessages([]); // Clear screen
    setCurrentChatId(null); // Reset current ID so next message creates a new history item
  };

  // Handle picking an old chat
  const handleSelectChat = (chatId) => {
    const selectedChat = chatHistory.find(chat => chat.id === chatId);
    if (selectedChat && setMessages) {
      setCurrentChatId(chatId); // Tell the app we are back in this specific chat
      setMessages(selectedChat.messages);
    }
  };

  // Handle single chat deletion
  const handleDeleteChat = (chatId) => {
    const updatedHistory = chatHistory.filter(chat => chat.id !== chatId);
    setChatHistory(updatedHistory);
    
    // If we delete the chat we are currently looking at, clear the screen
    if (currentChatId === chatId) {
      handleNewChat();
    }
  };

  return (
    <MainLayout
      messages={messages}
      inputValue={inputValue}
      setInputValue={setInputValue}
      onSend={sendMessage}
      uploadPDF={uploadPDF}
      isLoading={isLoading}
      isTyping={isTyping}
      messagesEndRef={messagesEndRef}
      // Passing props to Sidebar
      chatHistory={chatHistory}
      onNewChat={handleNewChat}
      onSelectChat={handleSelectChat}
      onDeleteChat={handleDeleteChat} // Make sure MainLayout passes this to Sidebar!
    />
  );
}

export default App;