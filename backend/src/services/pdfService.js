import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const extractTextFromPDF = async (filePath) => {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const uint8Array = new Uint8Array(fileBuffer);

    let standardFontPath = path.join(__dirname, "../../node_modules/pdfjs-dist/standard_fonts");
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

    return fullText.replace(/\s+/g, " ").trim();
  } finally {
    // Optimization: Always clean up the file, even if parsing fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};