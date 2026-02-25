import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { OpenAI } from "openai";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* =============================
   CONFIGURATION
============================= */

if (!process.env.HF_TOKEN) {
  console.error("❌ HF_TOKEN not found in .env file");
  process.exit(1);
}

const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HF_TOKEN,
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
   MULTER CONFIG
============================= */

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
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
    // 1. Accept pdfText from the frontend request body!
    const { message, history = [], pdfText = "" } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message is required" });
    }

    let finalSystemPrompt = SYSTEM_PROMPT;

    // 2. Use the pdfText passed from the frontend
    if (pdfText && pdfText.trim() !== "") {
      finalSystemPrompt += `\n\nReference material from uploaded PDF:\n${pdfText.substring(0, 4000)}`;
    }

    const messages = [
      { role: "system", content: finalSystemPrompt },
      ...history,
      { role: "user", content: message }
    ];

    const completion = await client.chat.completions.create({
      model: "mistralai/Mistral-7B-Instruct-v0.2:together",
      temperature: 0.7,
      messages,
    });

    const reply = completion.choices[0]?.message?.content || "No response generated.";

    res.json({ reply });

  } catch (error) {
    console.error("❌ AI ERROR:", error);
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

    let standardFontPath = path.join(__dirname, "node_modules", "pdfjs-dist", "standard_fonts");
    standardFontPath = standardFontPath.replace(/\\/g, "/") + "/";

    const loadingTask = pdfjsLib.getDocument({ 
        data: uint8Array,
        standardFontDataUrl: standardFontPath
    });
    
    const pdfDocument = await loadingTask.promise;

    let fullText = "";

    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(" ");
      fullText += pageText + " ";
    }

    const extractedText = fullText.replace(/\s+/g, " ").trim();
    fs.unlinkSync(req.file.path);

    // 3. Send the extracted text BACK to the frontend
    res.json({
      message: "PDF uploaded successfully",
      charactersExtracted: extractedText.length,
      text: extractedText // <-- The frontend will save this!
    });

  } catch (err) {
    console.error("❌ PDF ERROR FULL:", err);
    res.status(500).json({
      error: "Failed to process PDF",
      details: err.message
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