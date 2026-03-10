import express from 'express';
import { requireAuth, requireRole } from '../middlewares/authMiddleware.js';
import { listMaterials, createMaterial, deleteMaterial } from '../controllers/materialController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/',     listMaterials);
router.post('/',    requireRole('teacher', 'admin'), createMaterial);
router.delete('/:id', requireRole('teacher', 'admin'), deleteMaterial);

export default router;
