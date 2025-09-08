import { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import {
  applyForJob,
  getJobs,
  getJobDetail,
  getMyJobApplications,
} from '@/controllers/job/user.controller';
import { verifyAccessToken } from '@/middleware/user.middleware';

const router = Router();

router.get('/lists', expressAsyncHandler(getJobs));
router.get('/detail/:jobId', expressAsyncHandler(getJobDetail as any));
router.use(verifyAccessToken);
router.get('/requests', expressAsyncHandler(getMyJobApplications as any));
router.post('/apply', expressAsyncHandler(applyForJob as any));

export default router;
