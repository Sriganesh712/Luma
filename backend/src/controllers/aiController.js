import { createClient } from "@supabase/supabase-js";
import { generateAssignmentQuestions, evaluateWrittenAnswers } from "../services/openaiService.js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * POST /api/ai/generate-assignment
 * Body: { classId, materialIds, topic, type, numQuestions, difficulty }
 * Requires: teacher or admin role
 */
export async function generateAssignment(req, res) {
  try {
    const { classId, materialIds = [], topic, type = "mcq", numQuestions = 5, difficulty = "medium" } = req.body;

    if (!topic?.trim()) {
      return res.status(400).json({ error: "topic is required" });
    }
    if (!["mcq", "written", "mixed"].includes(type)) {
      return res.status(400).json({ error: "type must be mcq, written, or mixed" });
    }
    if (numQuestions < 1 || numQuestions > 20) {
      return res.status(400).json({ error: "numQuestions must be between 1 and 20" });
    }

    // Fetch material titles for context
    let materialText = "";
    if (materialIds.length > 0 && classId) {
      const { data } = await supabase
        .from("study_materials")
        .select("title, type")
        .in("id", materialIds)
        .eq("class_id", classId);

      if (data?.length) {
        materialText = data.map((m) => `${m.title} (${m.type})`).join("\n");
      }
    }

    const questions = await generateAssignmentQuestions(
      topic.trim(), materialText, type, Number(numQuestions), difficulty
    );

    res.json({ questions });
  } catch (error) {
    console.error("AI generation error:", error);
    res.status(500).json({ error: "Assignment generation failed", details: error.message });
  }
}

/**
 * POST /api/ai/evaluate-submission/:submissionId
 * Evaluates all ungraded written answers in a submission using AI.
 * Requires: teacher or admin role
 */
export async function evaluateSubmission(req, res) {
  try {
    const { submissionId } = req.params;

    // Fetch submission with all answers
    const { data: submission, error: subErr } = await supabase
      .from("submissions")
      .select("id, assignment_id, answers(*)")
      .eq("id", submissionId)
      .single();

    if (subErr || !submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    // Find written answers that haven't been scored yet (or all written, to re-evaluate)
    const writtenAnswers = (submission.answers || []).filter((a) => a.score === null);
    if (writtenAnswers.length === 0) {
      return res.json({ message: "All answers already graded", results: [] });
    }

    // Fetch question details
    const questionIds = writtenAnswers.map((a) => a.question_id);
    const { data: questions } = await supabase
      .from("questions")
      .select("id, question_text, type, correct_answer, points")
      .in("id", questionIds);

    const qMap = Object.fromEntries((questions || []).map((q) => [q.id, q]));

    const answersToEvaluate = writtenAnswers
      .filter((a) => qMap[a.question_id]?.type === "written")
      .map((a) => ({
        answerId: a.id,
        questionText: qMap[a.question_id].question_text,
        studentAnswer: a.student_answer || "",
        modelAnswer: qMap[a.question_id].correct_answer || "",
        maxPoints: qMap[a.question_id].points,
      }));

    if (answersToEvaluate.length === 0) {
      return res.json({ message: "No written answers to evaluate", results: [] });
    }

    const results = await evaluateWrittenAnswers(answersToEvaluate);

    // Save scores + AI feedback to answers table
    await Promise.all(
      results.map((r) =>
        supabase
          .from("answers")
          .update({ score: r.score, ai_feedback: r.feedback })
          .eq("id", r.answerId)
      )
    );

    // Recalculate total_score for this submission
    const { data: allAnswers } = await supabase
      .from("answers")
      .select("score")
      .eq("submission_id", submissionId);

    const totalScore = (allAnswers || []).reduce((sum, a) => sum + (a.score ?? 0), 0);
    await supabase.from("submissions").update({ total_score: totalScore }).eq("id", submissionId);

    res.json({ message: "AI evaluation complete", results, total_score: totalScore });
  } catch (error) {
    console.error("AI evaluation error:", error);
    res.status(500).json({ error: "Evaluation failed", details: error.message });
  }
}
