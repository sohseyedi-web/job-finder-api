import { completeProfile, getUserProfile, updateProfile } from '@/controllers/user.controller';
import { verifyAccessToken } from '@/middleware/user.middleware';
import { uploadImage, uploadPDF } from '@/utils/multer';
import express from 'express';
import expressAsyncHandler from 'express-async-handler';

const router = express.Router();
router.use(verifyAccessToken);
router.get('/profile', expressAsyncHandler(getUserProfile));
router.post(
  '/complete',
  (req, res, next) => {
    if ((req as any).user?.role === 'USER') {
      return uploadPDF.single('resume')(req, res, next);
    } else if ((req as any).user?.role === 'OWNER') {
      return uploadImage.single('logo')(req, res, next);
    }
    next();
  },
  expressAsyncHandler(completeProfile)
);

router.patch(
  '/update',
  (req, res, next) => {
    if ((req as any).user?.role === 'USER') {
      return uploadPDF.single('resume')(req, res, next);
    } else if ((req as any).user?.role === 'OWNER') {
      return uploadImage.single('logo')(req, res, next);
    }
    next();
  },
  expressAsyncHandler(updateProfile)
);

export default router;
