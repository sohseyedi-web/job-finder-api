import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { changeActiveOwnerJob } from '../controllers/employee.controller';
import { verifyAccessToken } from '@/middleware/user.middleware';

const router = express.Router();

router.use(verifyAccessToken);
router.patch('/change-active', expressAsyncHandler(changeActiveOwnerJob as any));
router.get('/process', expressAsyncHandler(changeActiveOwnerJob as any));

export default router;
