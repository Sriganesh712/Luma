import express from "express";
import { requireAuth, requireRole } from "../middlewares/authMiddleware.js";
import { generateAssignment, evaluateSubmission } from "../controllers/aiController.js";

const router = express.Router();

router.use(requireAuth);

/** Generate assignment questions from topic + materials */
router.post("/generate-assignment", requireRole("teacher", "admin"), generateAssignment);

/** AI-evaluate all written answers in a submission */
router.post("/evaluate-submission/:submissionId", requireRole("teacher", "admin"), evaluateSubmission);

export default router;
