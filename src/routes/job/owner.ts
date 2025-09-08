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
router.get('/:jobId', expressAsyncHandler(getJobApplications as any));
router.post('/', expressAsyncHandler(createJob as any));
router.patch('/:jobId ', expressAsyncHandler(updateJob as any));
router.delete('/:jobId :', expressAsyncHandler(deleteJob as any));
router.patch('/:applicationId', expressAsyncHandler(updateApplicationStatus as any));

export default router;
