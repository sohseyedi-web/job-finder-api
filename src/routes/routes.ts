import express from 'express';
import authRoutes from './auth';
import userRoutes from './user';
import jobRoutes from './job';
import notificationRoutes from './notification';
import employeeRoutes from './employee';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/job', jobRoutes);
router.use('/notification', notificationRoutes);
router.use('/employee', employeeRoutes);

export default router;
