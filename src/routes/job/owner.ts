import { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import {
  createJob,
  getJobApplications,
  updateApplicationStatus,
  getOwnerJobLists,
  updateJob,
  deleteJob,
} from '@/controllers/job/owner.controller';
import { verifyAccessToken } from '@/middleware/user.middleware';

const router = Router();

router.use(verifyAccessToken);
router.get('/requests', expressAsyncHandler(getOwnerJobLists as any));
router.get('/:id', expressAsyncHandler(getJobApplications as any));
router.post('/', expressAsyncHandler(createJob as any));
router.patch('/:id', expressAsyncHandler(updateJob as any));
router.delete('/:id', expressAsyncHandler(deleteJob as any));
router.patch('/:jobId', expressAsyncHandler(updateApplicationStatus as any));

export default router;
