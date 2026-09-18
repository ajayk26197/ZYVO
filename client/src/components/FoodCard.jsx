import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';
import styles from './FoodCard.module.css';

const FoodCard = ({ food }) => {
  const { addItem, items } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFav, setIsFav] = React.useState(false);
  const inCart = items.find(i => i._id === food._id);

  const isUnavailable = food.isAvailable === false;

  const handleAdd = (e) => {
    e.stopPropagation();
    if (isUnavailable) {
      toast.error('This item is currently not available in your location! 📍');
      return;
    }
    if (!user) {
      toast.error('Please login to add items to cart and place orders! 🔒');
      navigate('/login');
      return;
    }
    addItem(food);
  };

  const toggleFav = (e) => {
    e.stopPropagation();
    setIsFav(p => !p);
    toast.success(isFav ? 'Removed from favorites' : 'Added to favorites ❤️');
  };

  const handleCardClick = () => {
    navigate(`/food/${food._id}`);
  };

  return (
    <div className={`card ${styles.card}`} onClick={handleCardClick} style={{ opacity: isUnavailable ? 0.75 : 1 }}>
      {/* Image */}
      <div className={styles.imageWrapper}>
        <img
          src={food.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'}
          alt={food.name}
          className={styles.image}
          loading="lazy"
          style={{ filter: isUnavailable ? 'grayscale(40%)' : 'none' }}
        />
        {/* Favorite Icon */}
        <button
          className={`${styles.favBtn} ${isFav ? styles.favActive : ''}`}
          onClick={toggleFav}
          aria-label="Favorite"
        >
          {isFav ? '❤️' : '🤍'}
        </button>

        {isUnavailable && (
          <span style={{ position: 'absolute', bottom: '8px', left: '8px', right: '8px', background: 'rgba(220, 38, 38, 0.92)', color: '#ffffff', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800, textAlign: 'center', backdropFilter: 'blur(4px)' }}>
            📍 Unavailable in Location
          </span>
        )}

        {food.isVeg ? (
          <span className={styles.vegBadge}>🌿 Veg</span>
        ) : (
          <span className={styles.nonVegBadge}>🥩 Non-Veg</span>
        )}
        {food.discount > 0 && (
          <span className={styles.discountBadge}>{food.discount}% OFF</span>
        )}
        {food.isFeatured && <span className={styles.featuredBadge}>⭐ Popular</span>}
      </div>

      {/* Body */}
      <div className={styles.body}>
        <div className={styles.category}>{food.category?.name || 'Food'}</div>
        <h4 className={styles.name}>{food.name}</h4>
        <p className={styles.description}>{food.description}</p>

        {/* Rating */}
        <div className={styles.rating}>
          <span className={styles.stars}>
            {'★'.repeat(Math.round(food.rating || 4))}{'☆'.repeat(5 - Math.round(food.rating || 4))}
          </span>
          <span className={styles.ratingCount}>({food.numReviews || 0})</span>
          {food.prepTime && <span className={styles.prepTime}>⏱ {food.prepTime} min</span>}
        </div>

        {/* Price & Add */}
        <div className={styles.footer}>
          <div className={styles.priceGroup}>
            <span className={styles.price}>{formatPrice(food.price)}</span>
            {food.originalPrice && food.originalPrice > food.price && (
              <span className={styles.originalPrice}>{formatPrice(food.originalPrice)}</span>
            )}
          </div>
          {isUnavailable ? (
            <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 700, padding: '0.4rem 0.6rem', background: '#fee2e2', borderRadius: '8px' }}>
              Unavailable
            </span>
          ) : (
            <button
              className={`btn btn-primary btn-sm ${styles.addBtn} ${inCart ? styles.inCart : ''}`}
              onClick={handleAdd}
            >
              {inCart ? `✓ ${inCart.qty} in cart` : '+ Add'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
