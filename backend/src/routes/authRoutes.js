import express from "express";
import { register } from "../controllers/authController.js";
import { validate, registerSchema } from "../middlewares/validate.js";

const router = express.Router();

router.post("/register", validate(registerSchema), register);

export default router;
