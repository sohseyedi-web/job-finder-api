import { Router } from 'express';
import ownerRoutes from './owner';
import userRoutes from './user';

const router = Router();

router.use('/owner', ownerRoutes);
router.use('/user', userRoutes);

export default router;
