import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

// ── Email validation ──
const ALLOWED_DOMAINS = [
  'gmail.com', 'googlemail.com',
  'yahoo.com', 'yahoo.in', 'yahoo.co.in', 'yahoo.co.uk',
  'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
  'icloud.com', 'me.com', 'mac.com',
  'aol.com', 'zoho.com', 'zohomail.in',
  'protonmail.com', 'proton.me',
  'rediffmail.com', 'yandex.com',
];

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const validateEmail = (email) => {
  if (!email || !EMAIL_REGEX.test(email)) {
    return 'Please enter a valid email address';
  }
  const domain = email.split('@')[1].toLowerCase();
  if (!ALLOWED_DOMAINS.includes(domain)) {
    return `Email domain "${domain}" is not allowed. Use Gmail, Yahoo, Outlook, etc.`;
  }
  return null;
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields are required' });

  // Validate email format & domain
  const emailError = validateEmail(email);
  if (emailError) return res.status(400).json({ message: emailError });

  // Validate name (min 2 chars, no numbers-only)
  const trimmedName = name.trim();
  if (trimmedName.length < 2)
    return res.status(400).json({ message: 'Name must be at least 2 characters' });

  // Validate password strength
  if (password.length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters' });

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(409).json({ message: 'Email already registered' });

  const user = await User.create({ name: trimmedName, email: email.toLowerCase(), password });
  res.status(201).json({
    token: generateToken(user._id),
    user:  { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  const cleanEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: cleanEmail }).select('+password');
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: 'Invalid email or password' });

  if (!user.isActive) return res.status(403).json({ message: 'Account disabled' });

  res.json({
    token: generateToken(user._id),
    user:  { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
  });
});

// @desc    Get profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = asyncHandler(async (req, res) => {
  res.json(req.user);
});

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { name, email, phone, avatar, addresses } = req.body;
  if (name)      user.name      = name;
  if (email)     user.email     = email;
  if (phone)     user.phone     = phone;
  if (avatar)    user.avatar    = avatar;
  if (addresses) user.addresses = addresses;
  const updated = await user.save();
  res.json(updated);
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword)))
    return res.status(400).json({ message: 'Current password incorrect' });
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated successfully' });
});
