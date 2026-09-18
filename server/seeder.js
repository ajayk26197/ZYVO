/**
 * ZYVO — MongoDB Seeder
 * Seeds all 11 collections: User, Restaurant, Category, Food,
 *                            Cart, Order, Review, Coupon,
 *                            Address, Payment, Delivery
 * Run: node seeder.js
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// ─── Connect ─────────────────────────────────────────────
await mongoose.connect(process.env.MONGO_URI);
console.log('✅ Connected to:', mongoose.connection.name);

// ─── Drop old data (except users) ──────────────────────
const db = mongoose.connection.db;
const existing = await db.listCollections().toArray();
for (const col of existing) {
  if (col.name === 'users') continue; // Preserve user accounts!
  await db.collection(col.name).deleteMany({});
  console.log(`🗑  Cleared: ${col.name}`);
}

// ─── Schemas (inline for seeder) ─────────────────────────
const UserModel       = mongoose.models.User       || (await import('./models/User.js')).default;
const CategoryModel   = mongoose.models.Category   || (await import('./models/Category.js')).default;
const RestaurantModel = mongoose.models.Restaurant || (await import('./models/Restaurant.js')).default;
const FoodModel       = mongoose.models.Food       || (await import('./models/Food.js')).default;
const CouponModel     = mongoose.models.Coupon     || (await import('./models/Coupon.js')).default;
const AddressModel    = mongoose.models.Address    || (await import('./models/Address.js')).default;
const CartModel       = mongoose.models.Cart       || (await import('./models/Cart.js')).default;
const OrderModel      = mongoose.models.Order      || (await import('./models/Order.js')).default;
const ReviewModel     = mongoose.models.Review     || (await import('./models/Review.js')).default;
const PaymentModel    = mongoose.models.Payment    || (await import('./models/Payment.js')).default;
const DeliveryModel   = mongoose.models.Delivery   || (await import('./models/Delivery.js')).default;

// ═══════════════════════════════════════════
// 1. USERS (Upsert without clearing existing user accounts)
// ═══════════════════════════════════════════
const hashedPass = await bcrypt.hash('password123', 12);
const adminHashedPass = await bcrypt.hash('ajay@110.', 12);
const seedUsers = [
  { name: 'Ajay Kumar', email: 'ajay@110gmail.com', password: adminHashedPass, role: 'admin', phone: '9876543210', avatar: 'https://ui-avatars.com/api/?name=Ajay+Kumar&background=E32929&color=fff' },
  { name: 'Arjun Sharma',   email: 'arjun@example.com', password: hashedPass, role: 'user',  phone: '9123456780', avatar: 'https://ui-avatars.com/api/?name=Arjun+Sharma&background=FF611D&color=fff' },
  { name: 'Priya Patel',    email: 'priya@example.com', password: hashedPass, role: 'user',  phone: '9876501234', avatar: 'https://ui-avatars.com/api/?name=Priya+Patel&background=FFB80E&color=fff' },
];

const createdUsers = [];
for (const u of seedUsers) {
  let existingUser = await UserModel.findOne({ email: u.email });
  if (!existingUser) {
    existingUser = await UserModel.create(u);
  }
  createdUsers.push(existingUser);
}
const [admin, user1, user2] = createdUsers;
console.log('👤 Users seeded:', 3);

// ═══════════════════════════════════════════
// 2. CATEGORIES
// ═══════════════════════════════════════════
const cats = await CategoryModel.create([
  { name: 'Burgers',  icon: '🍔', color: '#fce4ec', order: 1 },
  { name: 'Pizza',    icon: '🍕', color: '#fff3e0', order: 2 },
  { name: 'Sushi',    icon: '🍣', color: '#e8f5e9', order: 3 },
  { name: 'Tacos',    icon: '🌮', color: '#fff8e1', order: 4 },
  { name: 'Salads',   icon: '🥗', color: '#e0f2f1', order: 5 },
  { name: 'Noodles',  icon: '🍜', color: '#f3e5f5', order: 6 },
  { name: 'Desserts', icon: '🍰', color: '#fce4ec', order: 7 },
  { name: 'Drinks',   icon: '🧃', color: '#e3f2fd', order: 8 },
]);
const [burgers, pizza, sushi, tacos, salads, noodles, desserts, drinks] = cats;
console.log('📂 Categories seeded:', cats.length);

// ═══════════════════════════════════════════
// 3. RESTAURANTS
// ═══════════════════════════════════════════
const [rest1, rest2] = await RestaurantModel.create([
  {
    name: 'Burger Palace', description: 'Best burgers in town', owner: admin._id,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    phone: '9000011111', email: 'burger@palace.com',
    address: { street: '12 MG Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
    cuisines: ['American', 'Fast Food'], categories: [burgers._id],
    rating: 4.7, deliveryTime: 25, deliveryFee: 49, isOpen: true, isFeatured: true,
  },
  {
    name: 'Pizza Italia', description: 'Authentic Italian pizza & pasta', owner: admin._id,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    phone: '9000022222', email: 'pizza@italia.com',
    address: { street: '5 Bandra West', city: 'Mumbai', state: 'Maharashtra', pincode: '400050' },
    cuisines: ['Italian'], categories: [pizza._id],
    rating: 4.5, deliveryTime: 30, deliveryFee: 49, isOpen: true, isFeatured: true,
  },
]);
console.log('🏪 Restaurants seeded:', 2);

// ═══════════════════════════════════════════
// 4. FOOD
// ═══════════════════════════════════════════
const foods = await FoodModel.create([
  // 🍔 Burgers (6)
  { name: 'Classic Burger',             description: 'Juicy beef patty with fresh veggies & cheese', price: 299, originalPrice: 399, discount: 25, category: burgers._id,  image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', isVeg: false, isFeatured: true,  rating: 4.8, numReviews: 234, prepTime: 20, tags: ['bestseller','cheesy'] },
  { name: 'Veggie Burger',              description: 'Crispy veggie patty with thousand island dressing', price: 249, originalPrice: 299, discount: 16, category: burgers._id,  image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400', isVeg: true,  isFeatured: false, rating: 4.5, numReviews: 120, prepTime: 15, tags: ['veg','healthy'] },
  { name: 'Double Smash Burger',        description: 'Two smashed beef patties with double cheddar cheese', price: 399, originalPrice: 499, discount: 20, category: burgers._id,  image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', isVeg: false, isFeatured: true,  rating: 4.9, numReviews: 401, prepTime: 22, tags: ['cheesy','double'] },
  { name: 'Crispy Chicken Zinger',      description: 'Crunchy fried chicken breast with garlic mayo & lettuce', price: 329, originalPrice: 419, discount: 21, category: burgers._id, image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=400', isVeg: false, isFeatured: true, rating: 4.8, numReviews: 310, prepTime: 18, tags: ['crispy','chicken'] },
  { name: 'Spicy Paneer Crunch Burger', description: 'Crispy coated paneer patty with peri-peri glaze & mint mayo', price: 279, originalPrice: 349, discount: 20, category: burgers._id, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400', isVeg: true, isFeatured: false, rating: 4.6, numReviews: 145, prepTime: 15, tags: ['paneer','spicy'] },
  { name: 'Mushroom Swiss Burger',      description: 'Sautéed cremini mushrooms with melted Swiss cheese & onions', price: 369, originalPrice: 459, discount: 19, category: burgers._id, image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400', isVeg: true, isFeatured: false, rating: 4.7, numReviews: 188, prepTime: 20, tags: ['mushroom','gourmet'] },

  // 🍕 Pizza (6)
  { name: 'Margherita Pizza',         description: 'Classic tomato base with mozzarella & fresh basil', price: 349, originalPrice: 449, discount: 22, category: pizza._id, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', isVeg: true, isFeatured: true, rating: 4.7, numReviews: 189, prepTime: 25, tags: ['classic','veg'] },
  { name: 'BBQ Chicken Pizza',        description: 'Smoky BBQ sauce with grilled chicken & onions', price: 449, originalPrice: 549, discount: 18, category: pizza._id, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400', isVeg: false, isFeatured: true, rating: 4.6, numReviews: 210, prepTime: 30, tags: ['bbq','chicken'] },
  { name: 'Pepperoni Feast',          description: 'Loaded pepperoni slices with extra mozzarella cheese', price: 499, originalPrice: 599, discount: 17, category: pizza._id, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400', isVeg: false, isFeatured: true, rating: 4.8, numReviews: 312, prepTime: 28, tags: ['pepperoni','bestseller'] },
  { name: 'Farmhouse Special Pizza',  description: 'Bell peppers, crisp onions, ripe tomatoes & mushrooms', price: 399, originalPrice: 499, discount: 20, category: pizza._id, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', isVeg: true, isFeatured: false, rating: 4.6, numReviews: 165, prepTime: 25, tags: ['farmhouse','veg'] },
  { name: 'Paneer Tikka Pizza',       description: 'Spiced tandoori paneer chunks, bell peppers & mozzarella', price: 429, originalPrice: 529, discount: 18, category: pizza._id, image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400', isVeg: true, isFeatured: true, rating: 4.7, numReviews: 240, prepTime: 26, tags: ['tandoori','paneer'] },
  { name: 'Truffle Mushroom Pizza',   description: 'Wild forest mushrooms drizzled with aromatic truffle oil', price: 549, originalPrice: 649, discount: 15, category: pizza._id, image: 'https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?w=400', isVeg: true, isFeatured: true, rating: 4.9, numReviews: 175, prepTime: 28, tags: ['truffle','gourmet'] },

  // 🍣 Sushi (6)
  { name: 'Sushi Platter',            description: 'Fresh salmon & tuna rolls with wasabi & ginger', price: 599, originalPrice: 699, discount: 14, category: sushi._id, image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400', isVeg: false, isFeatured: true, rating: 4.9, numReviews: 98, prepTime: 30, tags: ['premium','japanese'] },
  { name: 'Dragon Roll',              description: 'Crispy shrimp tempura roll topped with sliced avocado', price: 549, originalPrice: 649, discount: 15, category: sushi._id, image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400', isVeg: false, isFeatured: true, rating: 4.7, numReviews: 142, prepTime: 35, tags: ['special','shrimp'] },
  { name: 'Veggie Maki Set',          description: 'Fresh avocado, cucumber & pickled radish maki rolls', price: 399, originalPrice: 449, discount: 11, category: sushi._id, image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400', isVeg: true, isFeatured: false, rating: 4.5, numReviews: 76, prepTime: 25, tags: ['veg','healthy'] },
  { name: 'California Roll',          description: 'Crab stick, creamy avocado, crisp cucumber & sesame seeds', price: 479, originalPrice: 579, discount: 17, category: sushi._id, image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400', isVeg: false, isFeatured: false, rating: 4.6, numReviews: 112, prepTime: 25, tags: ['california','classic'] },
  { name: 'Crispy Tempura Roll',      description: 'Jumbo tempura shrimp roll with spicy sriracha mayo', price: 529, originalPrice: 629, discount: 16, category: sushi._id, image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=400', isVeg: false, isFeatured: true, rating: 4.8, numReviews: 185, prepTime: 28, tags: ['tempura','spicy'] },
  { name: 'Spicy Tuna Crunch Roll',   description: 'Yellowfin tuna, chili oil crunch, scallions & unagi sauce', price: 569, originalPrice: 669, discount: 15, category: sushi._id, image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400', isVeg: false, isFeatured: true, rating: 4.8, numReviews: 164, prepTime: 30, tags: ['tuna','spicy'] },

  // 🌮 Tacos (6)
  { name: 'Chicken Tacos',            description: 'Spicy grilled chicken with fresh mango salsa', price: 249, originalPrice: 299, discount: 17, category: tacos._id, image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400', isVeg: false, isFeatured: true, rating: 4.6, numReviews: 145, prepTime: 15, tags: ['spicy','chicken'] },
  { name: 'Fish Tacos',               description: 'Crispy battered fish with chipotle mayo & cabbage slaw', price: 299, originalPrice: 349, discount: 14, category: tacos._id, image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400', isVeg: false, isFeatured: true, rating: 4.7, numReviews: 108, prepTime: 18, tags: ['seafood','mexican'] },
  { name: 'Veggie Tacos',             description: 'Black bean & roasted corn tacos with avocado guacamole', price: 199, originalPrice: 249, discount: 20, category: tacos._id, image: 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=400', isVeg: true, isFeatured: false, rating: 4.4, numReviews: 89, prepTime: 12, tags: ['veg','mexican'] },
  { name: 'Barbacoa Beef Tacos',      description: 'Slow-cooked braised shredded beef with pickled red onions', price: 319, originalPrice: 399, discount: 20, category: tacos._id, image: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=400', isVeg: false, isFeatured: true, rating: 4.8, numReviews: 198, prepTime: 20, tags: ['beef','slowcooked'] },
  { name: 'Baja Grilled Shrimp Tacos',description: 'Citrus marinated grilled shrimp with lime avocado crema', price: 349, originalPrice: 429, discount: 18, category: tacos._id, image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400', isVeg: false, isFeatured: true, rating: 4.7, numReviews: 156, prepTime: 16, tags: ['shrimp','seafood'] },

  // 🥗 Salads (6)
  { name: 'Caesar Salad',             description: 'Crispy romaine with creamy caesar dressing & croutons', price: 199, originalPrice: 249, discount: 20, category: salads._id, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', isVeg: true, isFeatured: false, rating: 4.5, numReviews: 67, prepTime: 10, tags: ['healthy','veg'] },
  { name: 'Greek Salad',              description: 'Fresh feta cheese, kalamata olives, cucumbers & tomatoes', price: 219, originalPrice: 269, discount: 19, category: salads._id, image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', isVeg: true, isFeatured: true, rating: 4.6, numReviews: 94, prepTime: 8, tags: ['mediterranean','veg'] },
  { name: 'Quinoa Power Bowl',        description: 'Protein-packed quinoa with avocado, chickpeas & lemon dressing', price: 279, originalPrice: 329, discount: 15, category: salads._id, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', isVeg: true, isFeatured: true, rating: 4.8, numReviews: 132, prepTime: 12, tags: ['superfood','protein'] },
  { name: 'Avocado Cobb Salad',       description: 'Ripe avocado, cherry tomatoes, boiled egg, blue cheese & greens', price: 289, originalPrice: 349, discount: 17, category: salads._id, image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', isVeg: true, isFeatured: false, rating: 4.7, numReviews: 110, prepTime: 12, tags: ['avocado','healthy'] },
  { name: 'Falafel Hummus Bowl',      description: 'Crispy golden chickpea falafel with creamy hummus & feta', price: 269, originalPrice: 329, discount: 18, category: salads._id, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', isVeg: true, isFeatured: true, rating: 4.7, numReviews: 145, prepTime: 14, tags: ['falafel','vegan'] },
  { name: 'Smoked Chicken Apple Bowl',description: 'Smoked chicken breast, tart green apples, walnuts & honey mustard', price: 299, originalPrice: 369, discount: 19, category: salads._id, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', isVeg: false, isFeatured: false, rating: 4.6, numReviews: 87, prepTime: 12, tags: ['chicken','protein'] },

  // 🍜 Noodles (6)
  { name: 'Ramen Bowl',               description: 'Rich tonkotsu broth with tender chashu pork & marinated egg', price: 399, originalPrice: 449, discount: 11, category: noodles._id, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400', isVeg: false, isFeatured: true, rating: 4.8, numReviews: 212, prepTime: 25, tags: ['japanese','spicy'] },
  { name: 'Pad Thai Noodles',         description: 'Authentic Thai stir-fried rice noodles with tofu & peanuts', price: 349, originalPrice: 399, discount: 13, category: noodles._id, image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400', isVeg: false, isFeatured: true, rating: 4.6, numReviews: 167, prepTime: 20, tags: ['thai','noodles'] },
  { name: 'Hakka Noodles',            description: 'Wok-tossed Indo-Chinese veggies & garlic noodles', price: 249, originalPrice: 299, discount: 17, category: noodles._id, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400', isVeg: true, isFeatured: false, rating: 4.5, numReviews: 198, prepTime: 18, tags: ['chinesefood','spicy'] },
  { name: 'Spicy Schezwan Noodles',   description: 'Fiery wok-tossed noodles with crunchy peppers & Schezwan chili', price: 269, originalPrice: 319, discount: 15, category: noodles._id, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400', isVeg: true, isFeatured: true, rating: 4.7, numReviews: 176, prepTime: 18, tags: ['schezwan','spicy'] },
  { name: 'Chicken Yakisoba Noodles', description: 'Japanese wheat noodles with sliced chicken & sweet savory sauce', price: 329, originalPrice: 399, discount: 17, category: noodles._id, image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400', isVeg: false, isFeatured: false, rating: 4.6, numReviews: 134, prepTime: 20, tags: ['yakisoba','chicken'] },
  { name: 'Singapore Rice Vermicelli',description: 'Thin curry-infused rice noodles with crisp veggies & sprouts', price: 299, originalPrice: 369, discount: 19, category: noodles._id, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400', isVeg: true, isFeatured: false, rating: 4.5, numReviews: 102, prepTime: 16, tags: ['vermicelli','curry'] },

  // 🍰 Desserts (7)
  { name: 'Chocolate Lava',           description: 'Warm molten chocolate cake with vanilla ice cream', price: 149, originalPrice: 199, discount: 25, category: desserts._id, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400', isVeg: true, isFeatured: true, rating: 4.9, numReviews: 321, prepTime: 12, tags: ['dessert','chocolate'] },
  { name: 'Classic Tiramisu',         description: 'Rich Italian espresso-soaked ladyfingers & mascarpone', price: 199, originalPrice: 249, discount: 20, category: desserts._id, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', isVeg: true, isFeatured: true, rating: 4.8, numReviews: 187, prepTime: 10, tags: ['italian','coffee'] },
  { name: 'NY Cheesecake',            description: 'Creamy New York style cheesecake with strawberry drizzle', price: 179, originalPrice: 229, discount: 22, category: desserts._id, image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400', isVeg: true, isFeatured: true, rating: 4.7, numReviews: 245, prepTime: 8, tags: ['cheesecake','sweet'] },
  { name: 'Belgian Nutella Waffle',   description: 'Warm golden waffle loaded with rich Nutella & banana slices', price: 219, originalPrice: 279, discount: 21, category: desserts._id, image: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=400', isVeg: true, isFeatured: true, rating: 4.8, numReviews: 215, prepTime: 12, tags: ['waffle','nutella'] },
  { name: 'Red Velvet Cupcake Duo',   description: 'Moist ruby red velvet cakes with vanilla cream cheese frosting', price: 159, originalPrice: 199, discount: 20, category: desserts._id, image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=400', isVeg: true, isFeatured: false, rating: 4.6, numReviews: 128, prepTime: 5, tags: ['cupcake','redvelvet'] },
  { name: 'Gulab Jamun with Rabri',   description: 'Warm milk dumplings paired with slow-cooked saffron rabri', price: 139, originalPrice: 179, discount: 22, category: desserts._id, image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400', isVeg: true, isFeatured: true, rating: 4.9, numReviews: 289, prepTime: 6, tags: ['indian','sweet'] },
  { name: 'Cinnamon Sugar Churros',   description: 'Crispy Spanish churros dusted with cinnamon sugar & caramel dip', price: 189, originalPrice: 239, discount: 20, category: desserts._id, image: 'https://images.unsplash.com/photo-1624300629298-e9de39c13be5?w=400', isVeg: true, isFeatured: false, rating: 4.7, numReviews: 162, prepTime: 10, tags: ['churros','sweet'] },

  // 🧃 Drinks (7)
  { name: 'Mango Smoothie',           description: 'Fresh Alphonso mango blended with yogurt & honey', price: 129, originalPrice: 159, discount: 19, category: drinks._id, image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400', isVeg: true, isFeatured: false, rating: 4.7, numReviews: 178, prepTime: 5, tags: ['drink','healthy'] },
  { name: 'Iced Vanilla Latte',       description: 'Chilled double espresso shot with vanilla syrup & cold milk', price: 149, originalPrice: 179, discount: 17, category: drinks._id, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', isVeg: true, isFeatured: true, rating: 4.6, numReviews: 210, prepTime: 5, tags: ['coffee','iced'] },
  { name: 'Berry Blast Shake',        description: 'Fresh strawberries, blueberries & raspberries thick shake', price: 169, originalPrice: 199, discount: 15, category: drinks._id, image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400', isVeg: true, isFeatured: true, rating: 4.8, numReviews: 156, prepTime: 7, tags: ['berry','shake'] },
  { name: 'Caramel Cold Brew',        description: '18-hour smooth cold brew coffee with rich caramel drizzle', price: 169, originalPrice: 209, discount: 19, category: drinks._id, image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400', isVeg: true, isFeatured: true, rating: 4.8, numReviews: 195, prepTime: 5, tags: ['coldbrew','coffee'] },
  { name: 'Watermelon Mint Cooler',   description: 'Chilled fresh watermelon juice with crushed mint & lime', price: 119, originalPrice: 149, discount: 20, category: drinks._id, image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400', isVeg: true, isFeatured: false, rating: 4.6, numReviews: 132, prepTime: 4, tags: ['cooler','refreshing'] },
  { name: 'Belgian Chocolate Shake',  description: 'Thick shake made with Belgian chocolate gelato & chocochips', price: 179, originalPrice: 229, discount: 22, category: drinks._id, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400', isVeg: true, isFeatured: true, rating: 4.9, numReviews: 240, prepTime: 6, tags: ['chocolate','shake'] },
  { name: 'Blue Lagoon Mocktail',     description: 'Sparkling citrus blue curaçao cooler with lemon & fresh mint', price: 139, originalPrice: 169, discount: 18, category: drinks._id, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400', isVeg: true, isFeatured: false, rating: 4.5, numReviews: 118, prepTime: 5, tags: ['mocktail','fizzy'] },
]);
console.log('🍔 Foods seeded:', foods.length);

// ═══════════════════════════════════════════
// 5. COUPONS
// ═══════════════════════════════════════════
const expire = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
await CouponModel.create([
  { code: 'WELCOME20', type: 'percent', value: 20, minOrder: 200, maxDiscount: 100, usageLimit: 100, expiresAt: expire, description: '20% off for new users' },
  { code: 'FLAT50',    type: 'flat',    value: 50, minOrder: 300, maxDiscount: 0,   usageLimit: 200, expiresAt: expire, description: 'Flat ₹50 off on orders above ₹300' },
  { code: 'ZYVO',      type: 'percent', value: 15, minOrder: 500, maxDiscount: 150, usageLimit: 0,   expiresAt: expire, description: '15% off, max ₹150' },
  { code: 'FREEDEL',   type: 'flat',    value: 49, minOrder: 0,   maxDiscount: 49,  usageLimit: 500, expiresAt: expire, description: 'Free delivery on any order' },
]);
console.log('🎟  Coupons seeded:', 4);

// ═══════════════════════════════════════════
// 6. ADDRESSES
// ═══════════════════════════════════════════
const addr1 = await AddressModel.create({
  user: user1._id, label: 'Home', name: 'Arjun Sharma',
  phone: '9123456780', street: '45 Linking Road, Bandra',
  city: 'Mumbai', state: 'Maharashtra', pincode: '400050', isDefault: true,
});
await AddressModel.create({
  user: user1._id, label: 'Work', name: 'Arjun Sharma',
  phone: '9123456780', street: '7 BKC, Bandra Kurla Complex',
  city: 'Mumbai', state: 'Maharashtra', pincode: '400051', isDefault: false,
});
console.log('📍 Addresses seeded:', 2);

// ═══════════════════════════════════════════
// 7. CART
// ═══════════════════════════════════════════
await CartModel.create({
  user: user1._id,
  restaurant: rest1._id,
  items: [
    { food: foods[0]._id, name: foods[0].name, image: foods[0].image, price: foods[0].price, qty: 2, restaurant: rest1._id },
    { food: foods[8]._id, name: foods[8].name, image: foods[8].image, price: foods[8].price, qty: 1, restaurant: rest1._id },
  ],
});
console.log('🛒 Cart seeded: 1');

// ═══════════════════════════════════════════
// 8. ORDERS
// ═══════════════════════════════════════════
const order1 = await OrderModel.create({
  user: user1._id,
  items: [
    { food: foods[0]._id, name: foods[0].name, image: foods[0].image, price: foods[0].price, qty: 2 },
    { food: foods[9]._id, name: foods[9].name, image: foods[9].image, price: foods[9].price, qty: 1 },
  ],
  address: { name: 'Arjun Sharma', phone: '9123456780', street: '45 Linking Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400050' },
  subtotal: 727, deliveryFee: 0, discount: 0, total: 727,
  paymentMethod: 'online', paymentStatus: 'paid',
  status: 'delivered', deliveredAt: new Date(),
});
const order2 = await OrderModel.create({
  user: user2._id,
  items: [
    { food: foods[2]._id, name: foods[2].name, image: foods[2].image, price: foods[2].price, qty: 1 },
  ],
  address: { name: 'Priya Patel', phone: '9876501234', street: '22 Juhu Beach Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400049' },
  subtotal: 349, deliveryFee: 49, discount: 0, total: 398,
  paymentMethod: 'cod', paymentStatus: 'pending',
  status: 'preparing',
});
console.log('📦 Orders seeded:', 2);

// ═══════════════════════════════════════════
// 9. REVIEWS
// ═══════════════════════════════════════════
await ReviewModel.create([
  { user: user1._id, food: foods[0]._id, order: order1._id, rating: 5, comment: 'Best burger I have ever had! Crispy, juicy and perfectly seasoned. Will definitely order again! 🍔' },
  { user: user2._id, food: foods[2]._id, order: order2._id, rating: 4, comment: 'Pizza was delicious and arrived hot. Cheese was perfectly melted. Slight delay in delivery though.' },
]);
console.log('⭐ Reviews seeded:', 2);

// ═══════════════════════════════════════════
// 10. PAYMENTS
// ═══════════════════════════════════════════
await PaymentModel.create([
  {
    order: order1._id, user: user1._id, method: 'stripe',
    amount: 727, status: 'success',
    gatewayPaymentId: 'pi_mock_123456', paidAt: new Date(),
    receipt: 'receipt_001',
  },
  {
    order: order2._id, user: user2._id, method: 'cod',
    amount: 398, status: 'pending',
  },
]);
console.log('💳 Payments seeded:', 2);

// ═══════════════════════════════════════════
// 11. DELIVERY
// ═══════════════════════════════════════════
await DeliveryModel.create([
  {
    order: order1._id, user: user1._id,
    agent: { name: 'Ravi Kumar', phone: '9988776655', vehicleNo: 'MH01AB1234' },
    status: 'delivered',
    pickupAddress: { restaurant: 'Burger Palace', street: '12 MG Road', city: 'Mumbai' },
    dropAddress: { name: 'Arjun Sharma', phone: '9123456780', street: '45 Linking Road', city: 'Mumbai', pincode: '400050' },
    estimatedTime: 25, distanceKm: 3.2,
    pickedUpAt: new Date(Date.now() - 40 * 60000),
    deliveredAt: new Date(),
  },
  {
    order: order2._id, user: user2._id,
    agent: { name: 'Suresh Yadav', phone: '9977665544', vehicleNo: 'MH02CD5678' },
    status: 'on_the_way',
    pickupAddress: { restaurant: 'Pizza Italia', street: '5 Bandra West', city: 'Mumbai' },
    dropAddress: { name: 'Priya Patel', phone: '9876501234', street: '22 Juhu Beach Road', city: 'Mumbai', pincode: '400049' },
    estimatedTime: 20, distanceKm: 5.1,
    pickedUpAt: new Date(Date.now() - 10 * 60000),
  },
]);
console.log('🛵 Delivery seeded:', 2);

// ─── Summary ──────────────────────────────────────────────
console.log('\n════════════════════════════════════');
console.log('✅ ALL COLLECTIONS SEEDED SUCCESSFULLY');
console.log('   Database  :', mongoose.connection.name);
console.log('   Users     : 3  (1 admin + 2 users)');
console.log('   Restaurants: 2');
console.log('   Categories: 8');
console.log('   Foods     : 10');
console.log('   Coupons   : 4');
console.log('   Addresses : 2');
console.log('   Carts     : 1');
console.log('   Orders    : 2');
console.log('   Reviews   : 2');
console.log('   Payments  : 2');
console.log('   Deliveries: 2');
console.log('════════════════════════════════════');
console.log('\n🔑 Admin login: ajay@110gmail.com / ajay@110.');
console.log('👤 User login:  arjun@example.com / password123');

await mongoose.disconnect();
process.exit(0);
