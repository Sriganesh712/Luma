import express from 'express';
import { requireAuth, requireRole } from '../middlewares/authMiddleware.js';
import {
  getStats, listUsers, listClasses, createClass,
  updateClass, deleteClass, enrollStudents, unenrollStudent,
} from '../controllers/adminController.js';

const router = express.Router();

// All admin routes require auth + admin role
router.use(requireAuth, requireRole('admin'));

router.get('/stats',                          getStats);
router.get('/users',                          listUsers);
router.get('/classes',                        listClasses);
router.post('/classes',                       createClass);
router.patch('/classes/:id',                  updateClass);
router.delete('/classes/:id',                 deleteClass);
router.post('/classes/:id/enroll',            enrollStudents);
router.delete('/classes/:id/enroll/:studentId', unenrollStudent);

export default router;
