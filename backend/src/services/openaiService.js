import { OpenAI } from "openai";
import { SYSTEM_PROMPT, SUPPORT_SYSTEM_PROMPT } from "../config/constants.js";

const client = new OpenAI({
  baseURL: "https://models.github.ai/inference",
  apiKey: process.env.GITHUB_TOKEN,
});

/** Non-streaming chat (legacy, kept for fallback) */
export const generateChatResponse = async (message, safeHistory, safePdfText) => {
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

  return completion?.choices?.[0]?.message?.content || "No response generated.";
};

/**
 * Streaming chat — returns an async iterable of chunks.
 * @param {string} mode - "study" | "support"
 * @param {string} classContext - optional class materials summary
 */
export const generateChatResponseStream = async (message, safeHistory, safePdfText, mode = "study", classContext = "") => {
  let finalSystemPrompt = mode === "support" ? SUPPORT_SYSTEM_PROMPT : SYSTEM_PROMPT;

  if (mode !== "support") {
    if (safePdfText) {
      finalSystemPrompt += `\n\nReference material from uploaded PDF:\n${safePdfText}`;
    }
    if (classContext) {
      finalSystemPrompt += `\n\nClass study materials available to students:\n${classContext}\nUse these materials to give context-aware answers.`;
    }
  }

  const messages = [
    { role: "system", content: finalSystemPrompt },
    ...safeHistory,
    { role: "user", content: message }
  ];

  return client.chat.completions.create({
    model: "openai/gpt-4o",
    temperature: 0.7,
    messages,
    stream: true,
  });
};

/**
 * Generate assignment questions from a topic + optional material text.
 * Returns an array of question objects.
 */
export const generateAssignmentQuestions = async (topic, materialText, type, numQuestions, difficulty) => {
  const qType = type === "mixed" ? "a mix of MCQ and written" : type === "mcq" ? "MCQ (multiple choice)" : "written answer";
  const prompt = `Generate exactly ${numQuestions} ${qType} questions for a student assessment.

Topic: ${topic}
Difficulty: ${difficulty}
${materialText ? `\nStudy material context:\n${materialText.substring(0, 6000)}` : ""}

Return a JSON object with a "questions" array. Each question must have:
- question_text: string
- type: "mcq" or "written"
- options: for MCQ only — array of {label, text} with labels A B C D; for written set to null
- correct_answer: for MCQ — the correct letter (A/B/C/D); for written — a brief model answer string
- points: integer (10 for MCQ, 15-20 for written)

Example format:
{"questions": [{"question_text":"...","type":"mcq","options":[{"label":"A","text":"..."},...],"correct_answer":"B","points":10}]}`;

  const completion = await client.chat.completions.create({
    model: "openai/gpt-4o",
    temperature: 0.5,
    messages: [
      { role: "system", content: "You are an expert educator. Return ONLY valid JSON, no markdown fences." },
      { role: "user", content: prompt }
    ],
  });

  const raw = completion?.choices?.[0]?.message?.content?.trim() || '{"questions":[]}';
  try {
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : (parsed.questions ?? []);
  } catch {
    return [];
  }
};

/**
 * Evaluate an array of written answers with AI.
 * Each item: { answerId, questionText, studentAnswer, modelAnswer, maxPoints }
 * Returns: [{ answerId, score, feedback }]
 */
export const evaluateWrittenAnswers = async (answersToEvaluate) => {
  if (!answersToEvaluate.length) return [];

  const prompt = `You are a teacher grading student written answers. Evaluate each answer fairly and constructively.

${answersToEvaluate.map((a, i) => `
Answer ${i + 1}:
  answerId: "${a.answerId}"
  Question: ${a.questionText}
  Model/Expected Answer: ${a.modelAnswer || "(use your expert judgment)"}
  Student Answer: ${a.studentAnswer || "(no answer provided)"}
  Max Points: ${a.maxPoints}
`).join("\n")}

Return a JSON object with a "results" array. Each result must have:
- answerId: the exact answerId string provided above
- score: integer from 0 to maxPoints (0 if no answer)
- feedback: 1-2 sentence constructive feedback for the student

Example: {"results":[{"answerId":"abc123","score":8,"feedback":"Good explanation, but missed the key formula."}]}`;

  const completion = await client.chat.completions.create({
    model: "openai/gpt-4o",
    temperature: 0.3,
    messages: [
      { role: "system", content: "You are an expert teacher grader. Return ONLY valid JSON, no markdown fences." },
      { role: "user", content: prompt }
    ],
  });

  const raw = completion?.choices?.[0]?.message?.content?.trim() || '{"results":[]}';
  try {
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : (parsed.results ?? []);
  } catch {
    return [];
  }
};