import React, { useRef, useState } from "react";
import { Paperclip, Send, X, Loader2, FileText } from "lucide-react";

export const InputDock = ({
  inputValue,
  setInputValue,
  onSend,
  uploadPDF,
  isLoading,
}) => {
  const fileInputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileMeta, setFileMeta] = useState(null);

  /* =========================
     SEND MESSAGE (INSTANT CLEAR)
  ========================= */
  const handleSend = () => {
    if (!inputValue.trim() && !selectedFile) return;
    if (uploading || isLoading) return;

    // Capture current values
    const textToSend = inputValue.trim();
    const fileToSend = selectedFile;

    // 🔥 CLEAR UI IMMEDIATELY
    setInputValue("");
    setSelectedFile(null);
    setFileMeta(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Send in background (no await blocking UI)
    Promise.resolve(onSend(textToSend, fileToSend))
      .catch((err) => {
        console.error("Send failed:", err);
      });
  };

  /* =========================
     FILE UPLOAD
  ========================= */
  const handleFileUpload = async (file) => {
    if (!file) return;

    try {
      setUploading(true);

      setSelectedFile(file);

      setFileMeta({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
        uploading: true,
      });

      await uploadPDF(file);

      setFileMeta({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
        uploading: false,
      });

    } catch (err) {
      console.error("Upload failed:", err);
      setSelectedFile(null);
      setFileMeta(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border-t border-slate-200 bg-white p-4">
      <div className="max-w-4xl mx-auto space-y-2">

        {/* ================= FILE PREVIEW ================= */}
        {fileMeta && (
          <div className="flex items-center justify-between bg-slate-100 px-3 py-2 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <FileText className="w-4 h-4" />
              <span>{fileMeta.name}</span>
              <span className="text-xs text-slate-500">
                ({fileMeta.size})
              </span>
              {fileMeta.uploading && (
                <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
              )}
            </div>

            {!fileMeta.uploading && (
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setFileMeta(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                className="text-slate-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* ================= INPUT ROW ================= */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl hover:bg-slate-100 transition"
            disabled={uploading || isLoading}
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

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask Sahayak anything..."
            className="flex-1 px-4 py-2 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-500"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={uploading}
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={isLoading || uploading}
            className="p-2 rounded-xl bg-accent-500 text-white hover:bg-accent-600 transition disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};