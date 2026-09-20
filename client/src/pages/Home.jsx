import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FoodCard from '../components/FoodCard';
import CategoryCard from '../components/CategoryCard';
import { SkeletonCard } from '../components/Loading';
import { ALL_FOODS } from '../data/mockFoods';
import { foodService } from '../services/foodService';
import { useAuth } from '../context/AuthContext';
import styles from './Home.module.css';

const CATEGORIES = [
  { _id: '1', name: 'Pizza', icon: '🍕', color: '#fff3e0', count: 12 },
  { _id: '2', name: 'Burgers', icon: '🍔', color: '#fce4ec', count: 18 },
  { _id: '3', name: 'Sushi', icon: '🍣', color: '#e8f5e9', count: 8 },
  { _id: '4', name: 'Tacos', icon: '🌮', color: '#fff8e1', count: 10 },
  { _id: '5', name: 'Salads', icon: '🥗', color: '#e0f2f1', count: 7 },
  { _id: '6', name: 'Noodles', icon: '🍜', color: '#fce4ec', count: 14 },
  { _id: '7', name: 'Desserts', icon: '🍰', color: '#f3e5f5', count: 9 },
  { _id: '8', name: 'Drinks', icon: '🧃', color: '#e3f2fd', count: 11 },
];



// Category metadata for section headers
const CATEGORY_META = {
  'Pizza': { icon: '🍕', gradient: 'linear-gradient(135deg, #FF611D, #FFB80E)', tagline: 'Hand-tossed perfection in every slice' },
  'Burgers': { icon: '🍔', gradient: 'linear-gradient(135deg, #E32929, #FF611D)', tagline: 'Juicy patties, unbeatable flavor' },
  'Sushi': { icon: '🍣', gradient: 'linear-gradient(135deg, #00897B, #4DB6AC)', tagline: 'Fresh rolls, authentic Japanese craft' },
  'Tacos': { icon: '🌮', gradient: 'linear-gradient(135deg, #F9A825, #FF8F00)', tagline: 'Bold spices, vibrant fillings' },
  'Salads': { icon: '🥗', gradient: 'linear-gradient(135deg, #43A047, #66BB6A)', tagline: 'Fresh, crisp & nutrient-packed' },
  'Noodles': { icon: '🍜', gradient: 'linear-gradient(135deg, #8E24AA, #CE93D8)', tagline: 'Slurp-worthy bowls of comfort' },
  'Desserts': { icon: '🍰', gradient: 'linear-gradient(135deg, #D81B60, #F48FB1)', tagline: 'Sweet endings to every meal' },
  'Drinks': { icon: '🧃', gradient: 'linear-gradient(135deg, #1565C0, #42A5F5)', tagline: 'Refreshing sips for any mood' },
};

const Home = () => {
  const { user } = useAuth();
  const [allFoods, setAllFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await foodService.getAll();
        const foodList = Array.isArray(data) ? data : (data?.foods || []);

        const merged = [...foodList];
        for (const item of ALL_FOODS) {
          const alreadyExists = merged.some(
            existing =>
              (existing.name && item.name && existing.name.trim().toLowerCase() === item.name.trim().toLowerCase()) ||
              existing._id === item._id
          );
          if (!alreadyExists) {
            merged.push(item);
          }
        }
        setAllFoods(merged);
      } catch {
        setAllFoods(ALL_FOODS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Group foods by category
  const groupedFoods = allFoods.reduce((acc, food) => {
    const catName = typeof food.category === 'object' ? (food.category?.name || 'Other') : (food.category || 'Other');
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(food);
    return acc;
  }, {});

  // Define category display order
  const categoryOrder = ['Pizza', 'Burgers', 'Sushi', 'Tacos', 'Salads', 'Noodles', 'Desserts', 'Drinks'];

  // Helper to get category items for each section (shows only 3 items on Home page)
  const getCategoryItems = (catName, limit = 3) => {
    const list = groupedFoods[catName] || ALL_FOODS.filter(f => f.category?.name === catName);
    return limit ? list.slice(0, limit) : list;
  };

  return (
    <div className={styles.page}>
      {/* ── TOP HERO WELCOME BANNER ── */}
      <section style={{ paddingTop: '1.5rem', paddingBottom: '2.5rem' }}>
        <div className="container">
          <div className={styles.welcomeBanner}>
            {/* Left Content (Aligned below ZYVO Logo) */}
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '1rem', display: 'inline-block', fontSize: '0.8rem', fontWeight: 800 }}>
                🔥 HUNGRY? WE'VE GOT YOU COVERED
              </span>
              <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--text)', margin: '0 0 0.75rem', lineHeight: 1.2 }}>
                Welcome, <span className="gradient-text">{user ? user.name : 'Guest'}</span> 👋
              </h1>
              <p className={styles.welcomeSubtitle}>
                Hungry? We've got you covered. Explore delicious food, find something you'll love, and enjoy fast delivery right to your doorstep. 🍕🍔
              </p>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/menu" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}>
                  Order Now 🍽️
                </Link>
                <Link to="/orders?tab=current" className="btn btn-outline" style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}>
                  Track Order 🛵
                </Link>
              </div>
            </div>

            {/* Right Side Appetizing Food Animation / Video */}
            <div className={styles.welcomeVideo}>
              <video
                autoPlay
                loop
                muted
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                poster="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800"
              >
                <source src="https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-pizza-being-sliced-43281-large.mp4" type="video/mp4" />
              </video>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '1.25rem',
              }}>
                <div style={{ color: '#ffffff' }}>
                  <span className="badge badge-primary" style={{ fontSize: '0.75rem', fontWeight: 800 }}>⚡ 30-MIN DELIVERY</span>
                  <p style={{ margin: '0.3rem 0 0', fontWeight: 700, fontSize: '0.95rem' }}>Hot & Fresh Meals Delivered To You!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="section" style={{ paddingTop: '1rem' }}>
        <div className="container">
          <div className={styles.categoryGrid}>
            {CATEGORIES.map((cat, i) => {
              const catCount = (groupedFoods[cat.name] || ALL_FOODS.filter(f => f.category?.name === cat.name)).length;
              const isExtraOnMobile = i >= 4;
              return (
                <div
                  key={cat._id}
                  className={`animate-fadeInUp delay-${(i % 4) + 1} ${isExtraOnMobile ? styles.desktopOnlyCategory : ''}`}
                >
                  <CategoryCard category={{ ...cat, count: catCount }} />
                </div>
              );
            })}

            {/* Mobile "See More" Circular Card (Visible on mobile after 4 circles) */}
            <div className={`animate-fadeInUp delay-4 ${styles.mobileOnlySeeMore}`}>
              <Link to="/menu" className={styles.seeMoreCard} title="See More Categories">
                <div className={styles.seeMoreCircle}>
                  <span className={styles.seeMoreIcon}>➡️</span>
                </div>
                <span className={styles.seeMoreName}>See More</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORY-WISE FOOD SECTIONS ── */}
      {loading ? (
        <section className="section" style={{ background: 'transparent' }}>
          <div className="container">
            <div className="section-title">
              <h2 style={{ color: '#ffffff' }}>🔥 Our Specials</h2>
              <div className="divider" />
              <p style={{ color: 'rgba(255,255,255,0.9)' }}>Loading delicious items...</p>
            </div>
            <div className={styles.foodGrid}>
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        </section>
      ) : (
        categoryOrder
          .map((catName) => {
            const items = getCategoryItems(catName, 3);
            if (items.length === 0) return null;
            const meta = CATEGORY_META[catName] || { icon: '🍽️', gradient: 'linear-gradient(135deg, #FC8019, #E86F0C)', tagline: 'Delicious choices' };
            return (
              <section
                key={catName}
                className={`section ${styles.categorySection}`}
                style={{ background: 'transparent' }}
              >
                <div className="container">
                  {/* Category Section Header */}
                  <div className={styles.catSectionHeader}>
                    <div className={styles.catIconWrap} style={{ background: 'var(--primary)' }}>
                      <span className={styles.catIcon}>{meta.icon}</span>
                    </div>
                    <div className={styles.catInfo}>
                      <h2 className={styles.catTitle}>
                        {catName}
                      </h2>
                      <p className={styles.catTagline}>{meta.tagline}</p>
                    </div>
                    <Link to={`/menu?category=${catName.toLowerCase()}`} className={styles.catViewAll}>
                      View All →
                    </Link>
                  </div>

                  {/* Food Items Grid — 3 per row */}
                  <div className={styles.foodGrid}>
                    {items.map(food => (
                      <FoodCard key={food._id} food={food} />
                    ))}
                  </div>
                </div>
              </section>
            );
          })
      )}

      {/* ── CUSTOMER REVIEWS SECTION ── */}
      <section className="section" style={{ background: '#FFFFFF' }}>
        <div className="container">
          <div className="section-title">
            <h2>Loved by <span className="gradient-text">Thousands</span> ❤️</h2>
            <p>Here is what our happy foodies have to say about ZYVO</p>
            <div className="divider" />
          </div>

          <div className="grid-3">
            {[
              {
                name: 'Ananya Roy',
                role: 'Verified Foodie',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
                rating: 5,
                review: 'ZYVO is ridiculously fast! The pizza arrived piping hot in less than 22 minutes. Outstanding packing and taste!'
              },
              {
                name: 'Rohan Malhotra',
                role: 'Regular Orderer',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                rating: 5,
                review: 'The burger meal was super fresh and juicy. The live order status and delivery tracking is so smooth.'
              },
              {
                name: 'Kavita Sharma',
                role: 'Health Enthusiast',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                rating: 5,
                review: 'Love the organic salad options! Fresh veggies, great dressing, and transparent pricing without hidden fees.'
              }
            ].map((rev, i) => (
              <div key={i} className="card p-3" style={{ border: '1px solid var(--border)', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                  <img
                    src={rev.avatar}
                    alt={rev.name}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                  />
                  <div>
                    <h4 style={{ fontSize: '1rem', margin: 0 }}>{rev.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>✓ {rev.role}</span>
                  </div>
                </div>
                <div style={{ color: '#FC8019', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  {'★'.repeat(rev.rating)}
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  "{rev.review}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
