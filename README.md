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

## 🗂️ Project Structure

```
ZYVO/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── admin/          # Admin Dashboard views & pages
│   │   ├── components/     # Reusable UI components (Navbar, Footer, StarRating, etc.)
│   │   ├── context/        # Auth, Cart, and Theme contexts
│   │   ├── pages/          # Home, Menu, FoodDetails, Cart, Checkout, Orders, Profile, Rewards
│   │   ├── routes/         # React Router configurations
│   │   ├── services/       # Axios API client
│   │   └── utils/          # Helpers & mock data
│   ├── public/             # Static public assets
│   ├── .env.example        # Client environment variables template
│   └── vite.config.js      # Vite build & proxy config
├── server/                 # Node.js + Express REST API
│   ├── config/             # DB & Cloudinary configuration
│   ├── controllers/        # Auth, Food, Order, Category, Review controllers
│   ├── middleware/         # Auth verification & Error handling middleware
│   ├── models/             # Mongoose Schemas (User, Food, Order, Category, Review, etc.)
│   ├── routes/             # Express API routes
│   ├── utils/              # Token generation & seeding utilities
│   ├── seeder.js           # Database seeder script
│   ├── .env.example        # Server environment variables template
│   └── server.js           # Server entry point
├── package.json            # Monorepo scripts
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/<your-username>/zyvo.git
cd zyvo
npm run install:all
```

### 2. Configure Environment Variables

**Backend (`server/.env`):**
```env
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/biterush?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

**Frontend (`client/.env`):**
```env
# Optional for local dev (Vite proxy handles /api):
VITE_API_URL=
```

### 3. Seed Sample Database (Optional)

```bash
cd server
node seeder.js
cd ..
```

### 4. Run Development Servers

```bash
npm run dev
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5001](http://localhost:5001)
- **API Health Check**: [http://localhost:5001/api/health](http://localhost:5001/api/health)

---

## 🚢 Deployment Guide

### Option 1: Split Deployment (Recommended)

#### Frontend (Vercel / Netlify)
1. Set Root Directory to `client`.
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Set Environment Variable:
   - `VITE_API_URL`: `https://your-backend-api.onrender.com`

#### Backend (Render / Railway / Fly.io / AWS)
1. Set Root Directory to `server` (or run from root with start script).
2. Build Command: `npm install`
3. Start Command: `node server.js`
4. Set Environment Variables:
   - `MONGO_URI`: `your_mongodb_atlas_connection_string`
   - `JWT_SECRET`: `your_secret_key`
   - `CLIENT_URL`: `https://your-frontend-app.vercel.app`
   - `NODE_ENV`: `production`

---

### Option 2: Monorepo Single-Server Deployment (Render / Railway / VPS / Heroku)

When deployed as a single service with `NODE_ENV=production`:
1. Build step: `npm run install:all && npm run build`
2. Start step: `cd server && npm start`
3. The Express server automatically serves the compiled `client/dist` bundle and handles all API routes seamlessly.

---

## 📡 Key API Routes

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new customer account | No |
| `POST` | `/api/auth/login` | Login user & return JWT token | No |
| `GET` | `/api/auth/profile` | Get currently logged-in user profile | Yes |
| `GET` | `/api/food` | List all foods (with search, category, veg filters) | No |
| `GET` | `/api/food/:id` | Get single food item details | No |
| `GET` | `/api/categories` | List all active categories | No |
| `GET` | `/api/orders/myorders` | Get orders for logged-in user | Yes |
| `POST` | `/api/orders` | Place a new order | Yes |
| `POST` | `/api/reviews` | Post a food review & rating | Yes |
| `GET` | `/api/admin/stats` | Admin dashboard analytics | Admin |
| `GET` | `/api/health` | Service health status | No |

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

---

## 📄 License

This project is licensed under the MIT License.
