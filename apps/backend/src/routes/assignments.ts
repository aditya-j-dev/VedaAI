import { Router } from 'express';
import { upload } from '../middleware/upload';
import { requireAuth } from '../middleware/requireAuth';
import {
  createAssignment,
  listAssignments,
  getAssignment,
  getResult,
  regenerateAssignment,
  downloadPDF,
  deleteAssignment,
} from '../controllers/assignmentController';

const router: Router = Router();

// All assignment routes require authentication
router.use(requireAuth);

router.post('/', upload.single('file'), createAssignment);
router.get('/', listAssignments);
router.get('/:id', getAssignment);
router.get('/:id/result', getResult);
router.post('/:id/regenerate', regenerateAssignment);
router.get('/:id/pdf', downloadPDF);
router.delete('/:id', deleteAssignment);

export default router;
