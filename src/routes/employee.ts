import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import {
  changeActiveOwnerJob,
  getAllNotifications,
  getProcessesLists,
  markNotificationAsReadForEmployee,
} from '../controllers/employee.controller';
import { verifyAccessToken } from '@/middleware/user.middleware';

const router = express.Router();

router.use(verifyAccessToken);
router.patch('/change-active', expressAsyncHandler(changeActiveOwnerJob as any));
router.get('/process', expressAsyncHandler(getProcessesLists as any));
router.get('/all-notifications', expressAsyncHandler(getAllNotifications as any));
router.patch('/read/:id', expressAsyncHandler(markNotificationAsReadForEmployee as any));

export default router;
