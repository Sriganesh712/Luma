import { useState, useCallback, useRef } from 'react';

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const sendMessage = useCallback(async (text, file = null) => {
    if (!text.trim() && !file) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text || '',
      fileName: file ? file.name : null,
      fileType: file ? file.type : null,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      let response;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("message", text);

        response = await fetch("http://localhost:3000/api/chat/upload-pdf", {
          method: "POST",
          body: formData,
        });

      } else {
        // ---------------------------
        // NORMAL TEXT CHAT
        // ---------------------------
        response = await fetch("http://localhost:3000/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: text,
            history: messages.map(m => ({
              role: m.role,
              content: m.content
            }))
          }),
        });
      }

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || "File processed successfully.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error("Chat error:", error);

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: "⚠️ Unable to connect to AI service.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  }, [messages]);

  return {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    isTyping,
    sendMessage,
    messagesEndRef,
  };
};
