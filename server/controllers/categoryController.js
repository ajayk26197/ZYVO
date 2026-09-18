import asyncHandler from 'express-async-handler';
import Category from '../models/Category.js';
import Food from '../models/Food.js';

export const getCategories = asyncHandler(async (_, res) => {
  const cats = await Category.find({ isActive: true }).sort({ order: 1 });
  // Append item count
  const withCount = await Promise.all(cats.map(async c => ({
    ...c.toObject(),
    count: await Food.countDocuments({ category: c._id, isAvailable: true }),
  })));
  res.json(withCount);
});

export const createCategory = asyncHandler(async (req, res) => {
  const cat = await Category.create(req.body);
  res.status(201).json(cat);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!cat) return res.status(404).json({ message: 'Category not found' });
  res.json(cat);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) return res.status(404).json({ message: 'Category not found' });
  await cat.deleteOne();
  res.json({ message: 'Category deleted' });
});
