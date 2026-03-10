import express from 'express';
import { requireAuth, requireRole } from '../middlewares/authMiddleware.js';
import { validate, createAssignmentSchema } from '../middlewares/validate.js';
import {
  listAssignments, getAssignment, createAssignment,
  publishAssignment, listSubmissions, submitAssignment, gradeSubmission,
  deleteAssignment, updateAssignmentStatus,
} from '../controllers/assignmentController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/',                                          listAssignments);
router.get('/:id',                                       getAssignment);
router.post('/',         requireRole('teacher', 'admin'), validate(createAssignmentSchema), createAssignment);
router.patch('/:id/publish', requireRole('teacher', 'admin'), publishAssignment);
router.get('/:id/submissions', requireRole('teacher', 'admin'), listSubmissions);
router.post('/:id/submit', requireRole('student'),       submitAssignment);
router.patch('/submissions/:id/grade', requireRole('teacher', 'admin'), gradeSubmission);
router.delete('/:id',                  requireRole('teacher', 'admin'), deleteAssignment);
router.patch('/:id/status',            requireRole('teacher', 'admin'), updateAssignmentStatus);

export default router;
