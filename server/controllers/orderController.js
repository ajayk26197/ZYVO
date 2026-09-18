import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Food from '../models/Food.js';
import { calculatePrice } from '../utils/calculatePrice.js';

// @desc  Create order
// @route POST /api/orders
export const createOrder = asyncHandler(async (req, res) => {
  const { items, address, paymentMethod, coupon, notes } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No items provided for order');
  }

  const dbItems = await Promise.all(items.map(async i => {
    const targetId = i._id || i.food;
    let food = null;
    if (targetId && mongoose.Types.ObjectId.isValid(targetId)) {
      food = await Food.findById(targetId);
    }
    
    return {
      food: food ? food._id : (targetId && mongoose.Types.ObjectId.isValid(targetId) ? targetId : new mongoose.Types.ObjectId()),
      name: food ? food.name : (i.name || 'Food Item'),
      image: food ? food.image : (i.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200'),
      price: food ? food.price : (i.price || 0),
      qty: i.qty || 1,
    };
  }));

  const { subtotal, deliveryFee, discount, total } = calculatePrice(dbItems.map(i => ({ price: i.price, qty: i.qty })));

  const order = await Order.create({
    user: req.user._id,
    items: dbItems,
    address,
    subtotal: req.body.subtotal || subtotal,
    deliveryFee: req.body.deliveryFee !== undefined ? req.body.deliveryFee : deliveryFee,
    discount: req.body.discount || discount,
    total: req.body.total || total,
    paymentMethod: paymentMethod || 'cod',
    coupon: coupon || '',
    notes: notes || '',
    status: 'preparing',
    estimatedDelivery: new Date(Date.now() + 30 * 60 * 1000), // 30 min
  });

  res.status(201).json(order);
});

// @desc  Get logged-in user's orders
// @route GET /api/orders/myorders
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 });
  res.json(orders);
});

// @desc  Get single order
// @route GET /api/orders/:id
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user','name email').populate('items.food');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Access denied' });
  res.json(order);
});

// @desc  Cancel order
// @route PUT /api/orders/:id/cancel
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (!['pending','confirmed'].includes(order.status))
    return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
  order.status = 'cancelled';
  order.cancelReason = req.body.reason || 'Cancelled by user';
  await order.save();
  res.json(order);
});

// ─── ADMIN ───────────────────────────────────────────────
// @desc  Get all orders (admin)
// @route GET /api/orders
export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = status ? { status } : {};
  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('user','name email'),
    Order.countDocuments(query),
  ]);
  res.json({ orders, total });
});

// @desc  Update order status (admin)
// @route PUT /api/orders/:id/status
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  order.status = req.body.status;
  if (req.body.status === 'delivered') order.deliveredAt = new Date();
  await order.save();
  res.json(order);
});
