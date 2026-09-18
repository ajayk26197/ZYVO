import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import FoodCard from '../components/FoodCard';
import { SkeletonCard } from '../components/Loading';
import { ALL_FOODS } from '../data/mockFoods';
import { foodService } from '../services/foodService';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';
import styles from './Menu.module.css';

const CATS = ['All', 'Pizza', 'Burgers', 'Sushi', 'Tacos', 'Salads', 'Noodles', 'Desserts', 'Drinks'];
const CAT_ID_MAP = {
  '1': 'Pizza',
  '2': 'Burgers',
  '3': 'Sushi',
  '4': 'Tacos',
  '5': 'Salads',
  '6': 'Noodles',
  '7': 'Desserts',
  '8': 'Drinks',
};
const SORTS = [
  { value: '', label: 'Default' },
  { value: 'price', label: 'Price: Low → High' },
  { value: '-price', label: 'Price: High → Low' },
  { value: '-rating', label: 'Top Rated' },
  { value: '-createdAt', label: 'Newest' },
];

const Menu = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sort, setSort] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [rawFoods, setRawFoods] = useState([]);
  const [displayFoods, setDisplayFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync state with URL Search Params
  useEffect(() => {
    const queryQ = searchParams.get('q') || '';
    const queryCat = searchParams.get('category') || 'All';
    setSearch(queryQ);
    if (queryCat) {
      if (CAT_ID_MAP[queryCat]) {
        setActiveCategory(CAT_ID_MAP[queryCat]);
      } else {
        const matched = CATS.find(c => c.toLowerCase() === queryCat.toLowerCase());
        setActiveCategory(matched || (queryCat === 'All' ? 'All' : queryCat));
      }
    }
  }, [searchParams]);

  // Load foods from API or mock fallback
  useEffect(() => {
    let isMounted = true;
    const loadFoods = async () => {
      setLoading(true);
      try {
        const { data } = await foodService.getAll();
        const fetchedList = Array.isArray(data) ? data : (data?.foods || []);

        const merged = [...fetchedList];
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

        if (isMounted) {
          setRawFoods(merged);
        }
      } catch {
        if (isMounted) {
          setRawFoods(ALL_FOODS);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadFoods();
    return () => { isMounted = false; };
  }, []);

  // Filter & sort foods whenever search, category, vegOnly, sort or rawFoods change
  useEffect(() => {
    let filtered = [...rawFoods];

    // 1. Search Query Filter (matches name, description, or category)
    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter(item => {
        const nameMatch = item.name?.toLowerCase().includes(term);
        const descMatch = item.description?.toLowerCase().includes(term);
        const catMatch = (item.category?.name || item.category || '').toLowerCase().includes(term);
        return nameMatch || descMatch || catMatch;
      });
    }

    // 2. Category Filter
    if (activeCategory && activeCategory !== 'All') {
      filtered = filtered.filter(item => {
        const catName = item.category?.name || item.category || '';
        return catName.toLowerCase() === activeCategory.toLowerCase();
      });
    }

    // 3. Veg Only Filter
    if (vegOnly) {
      filtered = filtered.filter(item => item.isVeg);
    }

    // 4. Sorting
    if (sort === 'price') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === '-price') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sort === '-rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === '-createdAt') {
      filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    setDisplayFoods(filtered);
  }, [search, activeCategory, vegOnly, sort, rawFoods]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (search.trim()) {
      newParams.set('q', search.trim());
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams, { replace: true });
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    const newParams = new URLSearchParams(searchParams);
    if (val.trim()) {
      newParams.set('q', val.trim());
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams, { replace: true });
  };

  const handleClearSearch = () => {
    setSearch('');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('q');
    setSearchParams(newParams, { replace: true });
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat && cat !== 'All') {
      newParams.set('category', cat.toLowerCase());
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams, { replace: true });
  };

  const { itemCount, total } = useCart();

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Top Vibrant #FF5200 Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #FF5200 0%, #E04800 100%)',
          borderRadius: '24px',
          padding: '2.5rem 2rem',
          marginBottom: '2rem',
          color: '#ffffff',
          boxShadow: '0 10px 30px rgba(255, 82, 0, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}>
          <div>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.35rem 0.85rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              🍽️ ZYVO EXPLORE MENU
            </span>
            <h1 style={{ color: '#ffffff', margin: '0.5rem 0 0.25rem', fontSize: '2.2rem', fontWeight: 800 }}>
              Delicious Food Delivered Fast
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.92)', margin: 0, fontSize: '0.98rem' }}>
              Showing {displayFoods.length} {displayFoods.length === 1 ? 'dish' : 'dishes'} {search ? `matching "${search}"` : ''}
            </p>
          </div>

          {/* Interactive Search Box Form */}
          <form onSubmit={handleSearchSubmit} style={{
            background: '#ffffff',
            borderRadius: '50px',
            padding: '0.35rem 0.4rem 0.35rem 1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            minWidth: '320px',
            maxWidth: '100%',
            boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
          }}>
            <span style={{ fontSize: '1.1rem' }}>🔍</span>
            <input
              type="text"
              placeholder="Search dishes or cuisines..."
              value={search}
              onChange={handleSearchChange}
              style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontSize: '0.92rem', color: '#1F1F1F' }}
            />
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#666', padding: '0 0.2rem' }}
                title="Clear search"
              >
                ✕
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{ borderRadius: '50px', padding: '0.45rem 1.1rem', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}
            >
              Search 🔍
            </button>
          </form>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          {/* Categories */}
          <div className={styles.catTabs}>
            {CATS.map(cat => (
              <button
                key={cat}
                className={`${styles.catTab} ${activeCategory === cat ? styles.catActive : ''}`}
                onClick={() => handleCategoryChange(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Right controls */}
          <div className={styles.controls}>
            <label className={styles.vegToggle}>
              <input type="checkbox" checked={vegOnly} onChange={e => setVegOnly(e.target.checked)} />
              <span className={styles.toggleSlider} />
              <span>🌿 Veg Only</span>
            </label>
            <select className={styles.sortSelect} value={sort} onChange={e => setSort(e.target.value)}>
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : displayFoods.length === 0 ? (
          <div className={styles.empty}>
            <span>😕</span>
            <h3>No items found</h3>
            <p>We couldn't find any dishes matching "{search || activeCategory}". Try searching for something else!</p>
            <button
              className="btn btn-primary"
              onClick={() => {
                setSearch('');
                setActiveCategory('All');
                setVegOnly(false);
                setSort('');
                setSearchParams({}, { replace: true });
              }}
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid-4">
            {displayFoods.map(food => <FoodCard key={food._id} food={food} />)}
          </div>
        )}
      </div>

      {/* Sticky Cart Summary Bar */}
      {itemCount > 0 && (
        <div style={{
          position: 'sticky',
          bottom: '1.5rem',
          zIndex: 100,
          margin: '2rem auto 1rem',
          maxWidth: '560px',
          background: 'var(--primary)',
          color: '#ffffff',
          padding: '0.85rem 1.4rem',
          borderRadius: '50px',
          boxShadow: '0 10px 30px rgba(252, 128, 25, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem' }}>{itemCount} {itemCount === 1 ? 'Item' : 'Items'} | {formatPrice(total)}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Extra discounts available at checkout</div>
          </div>
          <Link to="/cart" className="btn btn-sm" style={{ background: '#ffffff', color: 'var(--primary)', fontWeight: 800 }}>
            View Cart →
          </Link>
        </div>
      )}
    </div>
  );
};

export default Menu;
