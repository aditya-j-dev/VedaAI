import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profileController';
import { upload } from '../middleware/upload';

const router: Router = Router();
router.get('/', getProfile);
router.put('/', upload.single('avatar'), updateProfile);

export default router;
