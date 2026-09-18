# 🍔 ZYVO — Premium Food Delivery Application

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-black.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A modern, responsive, full-stack food delivery web application built with **React (Vite)** on the frontend and **Node.js + Express** with **MongoDB Atlas** on the backend. Features rich animations, food customization, interactive star ratings, order tracking, admin dashboard, rewards/scratch cards, coupon codes, and dark mode support.

---

## 🌟 Key Features

- 🍕 **Dynamic Menu & Categorized Browsing**: Explore pizzas, burgers, bowls, desserts, drinks, with real-time filtering, search, and veg/non-veg tags.
- ⭐️ **Interactive Reviews & Rating System**: Smooth hover/touch Star Rating slider and live customer review submission.
- 🛒 **Full Cart & Live Checkout**: Cart drawer/page with coupon codes, tip selection, multi-address manager, and instant payment options (COD / Online).
- 🛵 **Live Order Tracker**: Multi-stage progress tracking (Order Placed ➔ Confirmed ➔ Preparing ➔ Out for Delivery ➔ Delivered) with live map visualization.
- 🎁 **Rewards & Gamification**: Daily check-in streaks, interactive scratch cards for surprise gifts, and coin balances.
- 🛡️ **Admin Management Suite**:
  - Analytics & Revenue stats
  - Food management (Add / Edit / Delete / Toggle availability)
  - Category management
  - Order status workflow management
  - Customer status toggles
  - Platform settings
- 📱 **Mobile First & Responsive**: Optimized bottom navigation, touch friendly gestures, and responsive grid layouts.
- 🔐 **Secure Authentication**: JWT-based session auth with password confirmation & validation.

---




## 🧪 Quality & Verification Checks

```bash
# Build frontend for production
npm run build --prefix client

# Run Oxlint on frontend
npm run lint --prefix client

# Test API health
curl http://localhost:5001/api/health
```


