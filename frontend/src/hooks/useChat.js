import { useState, useCallback, useRef } from "react";

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [pdfText, setPdfText] = useState("");
  const messagesEndRef = useRef(null);

  /* =========================================
     Upload PDF (Extract text only)
     ========================================= */
  const uploadPDF = useCallback(async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("http://localhost:3000/api/upload-pdf", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("PDF upload failed");
    }

    const data = await response.json();

    // Store extracted text for future chat context
    setPdfText(data.text || "");
  }, []);

  /* =========================================
     Send Chat Message (Text + Optional File)
     ========================================= */
  const sendMessage = useCallback(
    async (text, file) => {
      if (!text?.trim() && !file) return;

      const userMessage = {
        id: Date.now().toString(),
        role: "user",
        content: text || "",
        file: file
          ? {
              name: file.name,
              size: file.size,
              type: file.type,
            }
          : null,
        timestamp: new Date(),
      };

      // Add user message immediately (optimistic UI)
      setMessages((prev) => [...prev, userMessage]);

      setIsLoading(true);
      setIsTyping(true);

      try {
        const response = await fetch("http://localhost:3000/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: text,
            history: [
              ...messages,
              { role: "user", content: text || "" },
            ].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            pdfText,
          }),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();

        const aiMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.reply || "No response generated.",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);
      } catch (error) {
        console.error("Chat error:", error);

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 2).toString(),
            role: "assistant",
            content: "⚠️ Unable to connect to AI service.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsTyping(false);
        setIsLoading(false);
      }
    },
    [messages, pdfText]
  );

  return {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    isTyping,
    sendMessage,
    uploadPDF,
    messagesEndRef,
  };
};