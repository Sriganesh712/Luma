import express from "express";
import { register, completeProfile } from "../controllers/authController.js";
import { validate, registerSchema, completeProfileSchema } from "../middlewares/validate.js";

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/complete-profile", validate(completeProfileSchema), completeProfile);

export default router;
