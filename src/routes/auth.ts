import { logout, refreshToken, signin, signup } from '@/controllers/auth.controller';
import { verifyAccessToken } from '@/middleware/user.middleware';
import express from 'express';
import expressAsyncHandler from 'express-async-handler';

const router = express.Router();

router.post('/signup', expressAsyncHandler(signup));
router.post('/signin', expressAsyncHandler(signin));
router.post('/logout', expressAsyncHandler(logout));
router.use(verifyAccessToken);
router.get('/refresh-token', expressAsyncHandler(refreshToken));

export default router;
