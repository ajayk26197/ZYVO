import express from 'express';
import { getFoods, getFeatured, getFoodById, createFood, updateFood, deleteFood } from '../controllers/foodController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.get('/',           getFoods);
router.get('/featured',   getFeatured);
router.get('/:id',        getFoodById);
router.post('/',   protect, adminOnly, upload.single('image'), createFood);
router.put('/:id', protect, adminOnly, upload.single('image'), updateFood);
router.delete('/:id', protect, adminOnly, deleteFood);

export default router;
