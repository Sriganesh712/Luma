import { extractTextFromPDF } from "../services/pdfService.js";

export const handlePdfUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const extractedText = await extractTextFromPDF(req.file.path);

    res.json({
      message: "PDF uploaded successfully",
      charactersExtracted: extractedText.length,
      text: extractedText,
    });
  } catch (err) {
    console.error("❌ PDF ERROR FULL:", err);
    res.status(500).json({ error: "Failed to process PDF", details: err.message });
  }
};