import express from "express";
import { handleChat, handleStreamChat } from "../controllers/chatController.js";
import { handlePdfUpload } from "../controllers/pdfController.js";
import { upload } from "../middlewares/upload.js";
import { validate, chatSchema } from "../middlewares/validate.js";

const router = express.Router();

router.post("/chat", validate(chatSchema), handleChat);
router.post("/chat/stream", validate(chatSchema), handleStreamChat);
router.post("/upload-pdf", upload.single("file"), handlePdfUpload);

export default router;