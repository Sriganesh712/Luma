import { z } from "zod";

/**
 * Returns an Express middleware that validates req.body against the given Zod schema.
 * On failure, responds 422 with { error, issues }.
 */
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(422).json({
        error: "Validation failed",
        issues: result.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      });
    }
    req.body = result.data; // replace with coerced/defaults-applied data
    next();
  };
}

// ── Chat ────────────────────────────────────────────────────────────────────
export const chatSchema = z.object({
  message: z.string().min(1).max(10_000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(20_000),
      })
    )
    .max(40)
    .optional()
    .default([]),
  classId: z.string().uuid().optional().nullable(),
  mode: z.enum(["study", "support"]).optional().default("study"),
});

// ── Assignment ───────────────────────────────────────────────────────────────
const questionSchema = z.object({
  question_text: z.string().min(1).max(2000),
  type: z.enum(["mcq", "written"]),
  options: z.array(z.string().max(500)).max(6).nullable().optional(),
  correct_answer: z.string().max(2000).optional().nullable(),
  points: z.number().int().min(1).max(100).default(10),
});

export const createAssignmentSchema = z.object({
  class_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  deadline: z.string().datetime({ offset: true }).optional().nullable(),
  questions: z.array(questionSchema).min(1).max(50),
});

// ── Material upload metadata ─────────────────────────────────────────────────
export const materialMetaSchema = z.object({
  class_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
  material_type: z.enum(["pdf", "video", "document", "link", "other"]).default("pdf"),
  external_url: z.string().url().optional().nullable(),
});

// ── Registration ─────────────────────────────────────────────────────────────
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(128),
  name: z.string().min(1).max(100),
  role: z.enum(["admin", "teacher", "student"]),
  institutionName: z.string().min(1).max(200).optional(),
  institutionCode: z.string().length(6).optional(),
}).refine(
  (d) => d.role === "admin" ? !!d.institutionName : !!d.institutionCode,
  { message: "Admin requires institutionName; teacher/student require institutionCode" }
);
