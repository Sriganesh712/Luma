import { useState, useCallback, useRef } from "react";

const API_BASE = "http://localhost:3000";

export const useChat = ({ mode = "study", classId = null } = {}) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [pdfText, setPdfText] = useState("");
  const messagesEndRef = useRef(null);
  const abortRef = useRef(null);

  /* =========================================
     Upload PDF (Extract text only)
     ========================================= */
  const uploadPDF = useCallback(async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE}/api/upload-pdf`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("PDF upload failed");

    const data = await response.json();
    setPdfText(data.text || "");
  }, []);

  /* =========================================
     Send Chat Message — SSE Streaming
     ========================================= */
  const sendMessage = useCallback(
    async (text, file) => {
      if (!text?.trim() && !file) return;

      const userMessage = {
        id: Date.now().toString(),
        role: "user",
        content: text || "",
        file: file ? { name: file.name, size: file.size, type: file.type } : null,
        timestamp: new Date(),
      };

      // Optimistic: add user message + empty AI placeholder
      const aiPlaceholderId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        userMessage,
        { id: aiPlaceholderId, role: "assistant", content: "", timestamp: new Date() },
      ]);

      setIsLoading(true);
      setIsTyping(true);

      // Cancel any in-flight request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch(`${API_BASE}/api/chat/stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            message: text,
            history: messages.map((m) => ({ role: m.role, content: m.content })),
            pdfText,
            classId: classId || undefined,
            mode,
          }),
        });

        if (!response.ok) {
          throw new Error(`Server error ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop(); // keep incomplete last line

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                // Append token to the AI placeholder message
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiPlaceholderId
                      ? { ...m, content: m.content + data.content }
                      : m
                  )
                );
              } else if (data.done) {
                setIsTyping(false);
              } else if (data.error) {
                throw new Error(data.error);
              }
            } catch {
              // Ignore parse errors on individual chunks
            }
          }
        }
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Chat error:", error);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiPlaceholderId
              ? { ...m, content: "⚠️ Unable to connect to AI service. Please try again." }
              : m
          )
        );
      } finally {
        setIsTyping(false);
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [messages, pdfText, mode, classId]
  );

  return {
    messages,
    inputValue,
    setMessages,
    setInputValue,
    isLoading,
    isTyping,
    sendMessage,
    uploadPDF,
    messagesEndRef,
  };
};