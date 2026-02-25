import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { OpenAI } from "openai";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" })); // Prevent huge body crashes

/* =============================
   CONFIGURATION
============================= */

if (!process.env.HF_TOKEN) {
  console.error("❌ HF_TOKEN not found in .env file");
  process.exit(1);
}

const client = new OpenAI({
  baseURL: "https://models.github.ai/inference",
  apiKey: process.env.GITHUB_TOKEN,
});

const SYSTEM_PROMPT = `
You are Sahayak, an academic AI mentor.

Rules:
- Provide structured and concise explanations.
- Use bullet points where helpful.
- Explain complex ideas in simple terms.
- Stay factual and avoid speculation.
- Maintain a helpful, professional tone.
`;

/* =============================
   HELPER LIMITS
============================= */

// Keep prompt size safe for Mistral-7B
const MAX_PDF_CHARS = 10000;
const MAX_HISTORY_MESSAGES = 6;

/* =============================
   MULTER CONFIG
============================= */

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new Error("Only PDF files are allowed"));
    } else {
      cb(null, true);
    }
  },
});

/* =============================
   CHAT ROUTE
============================= */

app.post("/api/chat", async (req, res) => {
  try {
    const { message = "", history = [], pdfText = "" } = req.body;

    if (!message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Limit PDF text
    const safePdfText = pdfText
      ? pdfText.substring(0, MAX_PDF_CHARS)
      : "";

    // Limit history to last N messages
    const safeHistory = history
      .slice(-MAX_HISTORY_MESSAGES)
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    let finalSystemPrompt = SYSTEM_PROMPT;

    if (safePdfText) {
      finalSystemPrompt += `\n\nReference material from uploaded PDF:\n${safePdfText}`;
    }

    const messages = [
      { role: "system", content: finalSystemPrompt },
      ...safeHistory,
      { role: "user", content: message }
    ];

    const completion = await client.chat.completions.create({
      model: "openai/gpt-4o",
      temperature: 0.7,
      messages,
    });

    const reply =
      completion?.choices?.[0]?.message?.content ||
      "No response generated.";

    res.json({ reply });

  } catch (error) {
    console.error("❌ AI ERROR FULL:", error?.response?.data || error);

    res.status(500).json({
      error: "AI request failed",
      details: error.message,
    });
  }
});

/* =============================
   PDF UPLOAD ROUTE
============================= */

app.post("/api/upload-pdf", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileBuffer = fs.readFileSync(req.file.path);
    const uint8Array = new Uint8Array(fileBuffer);

    let standardFontPath = path.join(
      __dirname,
      "node_modules",
      "pdfjs-dist",
      "standard_fonts"
    );

    standardFontPath = standardFontPath.replace(/\\/g, "/") + "/";

    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      standardFontDataUrl: standardFontPath,
    });

    const pdfDocument = await loadingTask.promise;

    let fullText = "";

    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");
      fullText += pageText + " ";
    }

    const extractedText = fullText.replace(/\s+/g, " ").trim();

    fs.unlinkSync(req.file.path);

    res.json({
      message: "PDF uploaded successfully",
      charactersExtracted: extractedText.length,
      text: extractedText,
    });

  } catch (err) {
    console.error("❌ PDF ERROR FULL:", err);

    res.status(500).json({
      error: "Failed to process PDF",
      details: err.message,
    });
  }
});

/* =============================
   HEALTH CHECK
============================= */

app.get("/", (req, res) => {
  res.send("AI Mentor Backend Running 🚀");
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});