import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Food from '../models/Food.js';

// @desc  Admin dashboard stats
// @route GET /api/admin/stats
export const getDashboardStats = asyncHandler(async (_, res) => {
  const [
    totalOrders, totalUsers, totalFoods,
    todayOrders, revenue, pendingOrders
  ] = await Promise.all([
    Order.countDocuments(),
    User.countDocuments({ role: 'user' }),
    Food.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } }),
    Order.aggregate([{ $match:{ status:'delivered' }},{ $group:{ _id:null, total:{ $sum:'$total' }}}]),
    Order.countDocuments({ status:'pending' }),
  ]);
  res.json({
    totalOrders, totalUsers, totalFoods, todayOrders, pendingOrders,
    totalRevenue: revenue[0]?.total || 0,
  });
});

// @desc  Get all users (admin)
// @route GET /api/admin/users
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
  res.json(users);
});

// @desc  Toggle user active status
// @route PUT /api/admin/users/:id/toggle
export const toggleUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.isActive = !user.isActive;
  await user.save();
  res.json({ isActive: user.isActive });
});
