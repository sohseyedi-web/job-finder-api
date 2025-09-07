import { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import {
  createJob,
  applyForJob,
  getJobApplications,
  updateApplicationStatus,
  getJobs,
  getJobDetail,
} from '@/controllers/job.controller';
import { verifyAccessToken } from '@/middleware/user.middleware';

const router = Router();

router.get('/lists', expressAsyncHandler(getJobs));
router.get('/detail/:jobId', expressAsyncHandler(getJobDetail as any));
router.use(verifyAccessToken);
router.get('/:jobId', expressAsyncHandler(getJobApplications as any));
router.post('/create', expressAsyncHandler(createJob as any));
router.post('/apply', expressAsyncHandler(applyForJob as any));
router.patch('/:applicationId', expressAsyncHandler(updateApplicationStatus as any));

export default router;
