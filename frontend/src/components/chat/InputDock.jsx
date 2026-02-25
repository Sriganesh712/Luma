import React, { useRef, useState } from "react";
import { Paperclip, Send } from "lucide-react";

export const InputDock = ({
  inputValue,
  setInputValue,
  onSend,
  isLoading,
}) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    onSend(inputValue);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await fetch("http://localhost:3000/api/upload-pdf", {
        method: "POST",
        body: formData,
      });

      alert("PDF uploaded successfully!");
    } catch (err) {
      alert("Failed to upload PDF.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border-t border-slate-200 bg-white p-4">
      <div className="flex items-center gap-3 max-w-4xl mx-auto">
        
        {/* Upload Button */}
        <button
          onClick={() => fileInputRef.current.click()}
          className="p-2 rounded-xl hover:bg-slate-100 transition"
        >
          <Paperclip className="w-5 h-5 text-slate-500" />
        </button>

        <input
          type="file"
          accept="application/pdf"
          ref={fileInputRef}
          hidden
          onChange={(e) => handleFileUpload(e.target.files[0])}
        />

        {/* Input */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={
            uploading
              ? "Uploading PDF..."
              : "Ask Sahayak anything..."
          }
          className="flex-1 px-4 py-2 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-500"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          disabled={uploading}
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="p-2 rounded-xl bg-accent-500 text-white hover:bg-accent-600 transition disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
