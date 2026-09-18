import express from 'express';
import {
  createOrder, getMyOrders, getOrderById, cancelOrder,
  getAllOrders, updateOrderStatus,
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.post('/',            protect, createOrder);
router.get('/myorders',     protect, getMyOrders);
router.get('/:id',          protect, getOrderById);
router.put('/:id/cancel',   protect, cancelOrder);
// Admin
router.get('/',             protect, adminOnly, getAllOrders);
router.put('/:id/status',   protect, adminOnly, updateOrderStatus);

export default router;
