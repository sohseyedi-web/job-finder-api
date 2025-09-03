import { completeProfile, getUserProfile, updateProfile } from '@/controllers/user.controller';
import { verifyAccessToken } from '@/middleware/user.middleware';
import { uploadPDF } from '@/utils/multer';
import express from 'express';
import expressAsyncHandler from 'express-async-handler';

const router = express.Router();
router.use(verifyAccessToken);
router.get('/profile', expressAsyncHandler(getUserProfile));
router.post('/complete', uploadPDF.single('resume'), expressAsyncHandler(completeProfile));
router.patch('/update', uploadPDF.single('resume'), expressAsyncHandler(updateProfile));

export default router;
