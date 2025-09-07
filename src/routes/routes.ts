import express from 'express';
import authRoutes from './auth';
import userRoutes from './user';
import jobRoutes from './job';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/job', jobRoutes);

export default router;
