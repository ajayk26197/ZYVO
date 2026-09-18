import express from 'express';
import { getDashboardStats, getAllUsers, toggleUser } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats',           getDashboardStats);
router.get('/users',           getAllUsers);
router.put('/users/:id/toggle',toggleUser);

export default router;
