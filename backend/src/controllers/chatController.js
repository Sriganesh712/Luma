import { createClient } from "@supabase/supabase-js";
import { generateChatResponse, generateChatResponseStream } from "../services/openaiService.js";
import { MAX_PDF_CHARS, MAX_HISTORY_MESSAGES } from "../config/constants.js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/** POST /api/chat — non-streaming (legacy fallback) */
export const handleChat = async (req, res) => {
  try {
    const { message = "", history = [], pdfText = "" } = req.body;

    if (!message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const safePdfText = pdfText ? pdfText.substring(0, MAX_PDF_CHARS) : "";
    const safeHistory = history.slice(-MAX_HISTORY_MESSAGES).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const reply = await generateChatResponse(message, safeHistory, safePdfText);
    res.json({ reply });

  } catch (error) {
    console.error("❌ AI ERROR FULL:", error?.response?.data || error);
    res.status(500).json({ error: "AI request failed", details: error.message });
  }
};

/**
 * POST /api/chat/stream — SSE streaming with mode + class context support.
 * Body: { message, history, pdfText, classId?, mode? }
 * Streams: data: {"content":"..."}\n\n ... data: {"done":true}\n\n
 */
export const handleStreamChat = async (req, res) => {
  try {
    const { message = "", history = [], pdfText = "", classId, mode = "study" } = req.body;

    if (!message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    // SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders();

    const safePdfText = pdfText ? pdfText.substring(0, MAX_PDF_CHARS) : "";
    const safeHistory = history.slice(-MAX_HISTORY_MESSAGES).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Fetch class study materials for context (study mode only)
    let classContext = "";
    if (classId && mode !== "support") {
      try {
        const { data: materials } = await supabase
          .from("study_materials")
          .select("title, type")
          .eq("class_id", classId)
          .limit(10);

        if (materials?.length) {
          classContext = materials.map((m) => `- ${m.title} (${m.type})`).join("\n");
        }
      } catch (e) {
        console.warn("Could not fetch class materials:", e.message);
      }
    }

    const stream = await generateChatResponseStream(
      message, safeHistory, safePdfText, mode, classContext
    );

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

  } catch (error) {
    console.error("❌ STREAM CHAT ERROR:", error?.response?.data || error);
    if (!res.headersSent) {
      res.status(500).json({ error: "AI request failed", details: error.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: "AI request failed" })}\n\n`);
      res.end();
    }
  }
};