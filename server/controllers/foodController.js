import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import Food from '../models/Food.js';
import Category from '../models/Category.js';

// @desc  Get all food items (with filter/sort/search/pagination/date)
// @route GET /api/food
export const getFoods = asyncHandler(async (req, res) => {
  const { category, isVeg, sort, q, page = 1, limit = 20, date, admin } = req.query;

  // Admin mode: show ALL items regardless of availability
  const query = admin === 'true' ? {} : { isAvailable: true };

  if (category && category !== 'All') {
    if (mongoose.Types.ObjectId.isValid(category)) {
      query.category = category;
    } else {
      const catDoc = await Category.findOne({ name: new RegExp('^' + category + '$', 'i') });
      if (catDoc) {
        query.category = catDoc._id;
      } else {
        return res.json({ foods: [], total: 0, page: Number(page), pages: 0 });
      }
    }
  }

  if (isVeg === 'true') query.isVeg = true;

  if (q && q.trim()) {
    query.$or = [
      { name: { $regex: q.trim(), $options: 'i' } },
      { description: { $regex: q.trim(), $options: 'i' } }
    ];
  }

  // Date filter — match items created on that specific calendar day
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    query.createdAt = { $gte: start, $lte: end };
  }

  const sortMap = {
    'price':     { price: 1 },
    '-price':    { price: -1 },
    '-rating':   { rating: -1 },
    '-createdAt':{ createdAt: -1 },
  };
  const sortObj = sortMap[sort] || { createdAt: -1 };

  const skip = (Number(page) - 1) * Number(limit);
  const [foods, total] = await Promise.all([
    Food.find(query).populate('category', 'name icon color').sort(sortObj).skip(skip).limit(Number(limit)),
    Food.countDocuments(query),
  ]);

  res.json({ foods, total, page: Number(page), pages: Math.ceil(total / limit) });
});


// @desc  Get featured foods
// @route GET /api/food/featured
export const getFeatured = asyncHandler(async (req, res) => {
  const foods = await Food.find({ isFeatured: true, isAvailable: true })
    .populate('category','name').limit(12).sort({ rating: -1 });
  res.json(foods);
});

// @desc  Get single food
// @route GET /api/food/:id
export const getFoodById = asyncHandler(async (req, res) => {
  const food = await Food.findById(req.params.id).populate('category');
  if (!food) return res.status(404).json({ message: 'Food not found' });
  res.json(food);
});

// Helper: build image URL from uploaded file or body
const getImageUrl = (req) => {
  if (req.file) {
    // Uploaded file → serve from /uploads/<filename>
    return `/uploads/${req.file.filename}`;
  }
  return req.body.image || '';
};

// Helper: delete local image file
const deleteLocalImage = (imageUrl) => {
  if (!imageUrl || imageUrl.startsWith('http')) return; // skip external URLs
  try {
    const filename = path.basename(imageUrl);
    const filepath = path.join(process.cwd(), 'uploads', filename);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
  } catch { /* silent */ }
};

// @desc  Create food (admin)
// @route POST /api/food
export const createFood = asyncHandler(async (req, res) => {
  const image = getImageUrl(req);
  if (!image) {
    res.status(400);
    throw new Error('Image is required');
  }
  // Parse arrays sent as comma-separated strings from FormData
  const tags        = typeof req.body.tags === 'string'        ? req.body.tags.split(',').map(t => t.trim()).filter(Boolean)        : req.body.tags || [];
  const ingredients = typeof req.body.ingredients === 'string' ? req.body.ingredients.split(',').map(t => t.trim()).filter(Boolean) : req.body.ingredients || [];
  const food = await Food.create({ ...req.body, image, tags, ingredients });
  res.status(201).json(food);
});

// @desc  Update food (admin)
// @route PUT /api/food/:id
export const updateFood = asyncHandler(async (req, res) => {
  const food = await Food.findById(req.params.id);
  if (!food) return res.status(404).json({ message: 'Food not found' });

  const image = getImageUrl(req) || food.image;

  // If a new file was uploaded, delete the old local image
  if (req.file && food.image) deleteLocalImage(food.image);

  const tags        = typeof req.body.tags === 'string'        ? req.body.tags.split(',').map(t => t.trim()).filter(Boolean)        : req.body.tags || food.tags;
  const ingredients = typeof req.body.ingredients === 'string' ? req.body.ingredients.split(',').map(t => t.trim()).filter(Boolean) : req.body.ingredients || food.ingredients;

  const updated = await Food.findByIdAndUpdate(
    req.params.id,
    { ...req.body, image, tags, ingredients },
    { new: true, runValidators: true }
  );
  res.json(updated);
});

// @desc  Delete food (admin)
// @route DELETE /api/food/:id
export const deleteFood = asyncHandler(async (req, res) => {
  const food = await Food.findById(req.params.id);
  if (!food) return res.status(404).json({ message: 'Food not found' });
  deleteLocalImage(food.image);
  await food.deleteOne();
  res.json({ message: 'Food deleted' });
});
