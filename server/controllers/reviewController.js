import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Food from '../models/Food.js';

export const addReview = asyncHandler(async (req, res) => {
  const { foodId, rating, comment, orderId } = req.body;

  if (!foodId || !rating || !comment) {
    return res.status(400).json({ message: 'foodId, rating, and comment are required' });
  }

  const isValidFoodId = mongoose.Types.ObjectId.isValid(foodId);

  let review;
  if (isValidFoodId) {
    const existing = await Review.findOne({ user: req.user._id, food: foodId });
    if (existing) {
      existing.rating = Number(rating);
      existing.comment = comment.trim();
      if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
        existing.order = orderId;
      }
      await existing.save();
      review = existing;
    } else {
      review = await Review.create({
        user: req.user._id,
        food: foodId,
        order: (orderId && mongoose.Types.ObjectId.isValid(orderId)) ? orderId : undefined,
        rating: Number(rating),
        comment: comment.trim(),
      });
    }

    // Update food aggregate rating if food exists in DB
    try {
      const reviews = await Review.find({ food: foodId });
      if (reviews.length > 0) {
        const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
        await Food.findByIdAndUpdate(foodId, {
          rating: Number(avgRating.toFixed(1)),
          numReviews: reviews.length
        });
      }
    } catch (e) {
      console.error('Error updating food aggregate rating:', e);
    }
  } else {
    // Custom/mock food id
    review = {
      _id: new mongoose.Types.ObjectId(),
      user: req.user._id,
      food: foodId,
      rating: Number(rating),
      comment: comment.trim(),
      createdAt: new Date(),
    };
  }

  // Populate user data
  const populated = {
    id: review._id?.toString() || Date.now().toString(),
    userName: req.user.name,
    userAvatar: req.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.user.name)}&background=FC8019&color=fff`,
    rating: Number(rating),
    comment: comment.trim(),
    date: 'Just now',
    createdAt: review.createdAt || new Date(),
  };

  res.status(201).json(populated);
});

export const getFoodReviews = asyncHandler(async (req, res) => {
  const { foodId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(foodId)) {
    return res.json([]);
  }

  const reviews = await Review.find({ food: foodId })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });

  const formatted = reviews.map(r => ({
    id: r._id.toString(),
    userName: r.user?.name || 'Anonymous User',
    userAvatar: r.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.user?.name || 'User')}&background=FC8019&color=fff`,
    rating: r.rating,
    comment: r.comment,
    date: new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
    createdAt: r.createdAt,
  }));

  res.json(formatted);
});
