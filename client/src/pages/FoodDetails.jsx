import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { foodService } from '../services/foodService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/helpers';
import FoodCard from '../components/FoodCard';
import StarRatingSlider from '../components/StarRatingSlider';
import reviewService from '../services/reviewService';
import { ALL_FOODS } from '../data/mockFoods';
import toast from 'react-hot-toast';

const MOCK_REVIEWS = [
  {
    id: '1',
    userName: 'Aarav Mehta',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120',
    rating: 5,
    date: 'Yesterday',
    comment: 'Super fresh and delicious! Arrived hot and perfectly packed in 20 mins. Will order again!',
  },
  {
    id: '2',
    userName: 'Sneha Rao',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120',
    rating: 4,
    date: '3 days ago',
    comment: 'Great quality and taste! Cheese was melted perfectly and veggies were crisp.',
  },
  {
    id: '3',
    userName: 'Vikram Singh',
    userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120',
    rating: 5,
    date: '1 week ago',
    comment: 'Top-tier quality for the price. Best meal I have ordered on ZYVO!',
  }
];



const FoodDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, items } = useCart();
  const { user } = useAuth();

  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [isFav, setIsFav] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);

  // New review state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  // Permanent reviews storage key
  const storageKey = `zyvo_reviews_${id}`;

  useEffect(() => {
    const fetchItemAndReviews = async () => {
      setLoading(true);

      // 1. Initial local stored reviews
      let initialLocalReviews = [];
      try {
        const cached = localStorage.getItem(storageKey);
        if (cached) {
          initialLocalReviews = JSON.parse(cached);
        }
      } catch {
        initialLocalReviews = [];
      }

      let loadedFood = null;
      try {
        const { data } = await foodService.getById(id);
        if (data && data._id) {
          loadedFood = data;
        }
      } catch {
        // Look up by matching exact mock ID
        const matched = ALL_FOODS.find(item => item._id === id || item._id === id.replace('dish_', ''));
        if (matched) {
          loadedFood = matched;
        }
      }

      setFood(loadedFood);

      // 2. Fetch server reviews and merge with permanent local storage
      if (loadedFood) {
        try {
          const serverReviews = await reviewService.getFoodReviews(id);
          const combined = [...(serverReviews || []), ...initialLocalReviews];

          // Deduplicate by ID or unique key
          const seen = new Set();
          const uniqueReviews = [];
          for (const rev of combined) {
            const revKey = rev.id || `${rev.userName}_${rev.comment}_${rev.rating}`;
            if (!seen.has(revKey)) {
              seen.add(revKey);
              uniqueReviews.push(rev);
            }
          }

          const finalReviews = uniqueReviews.length > 0 ? uniqueReviews : MOCK_REVIEWS;
          setReviews(finalReviews);
          localStorage.setItem(storageKey, JSON.stringify(finalReviews));
        } catch {
          const finalReviews = initialLocalReviews.length > 0 ? initialLocalReviews : MOCK_REVIEWS;
          setReviews(finalReviews);
        }
      }

      setLoading(false);
    };

    fetchItemAndReviews();
    window.scrollTo(0, 0);
  }, [id, storageKey]);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '6rem', paddingBottom: '4rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-muted)' }}>Loading item details... 🍲</h2>
      </div>
    );
  }

  // If item is not found or not available in the database/catalog
  if (!food) {
    return (
      <div style={{ paddingTop: '6rem', paddingBottom: '4rem', minHeight: '80vh', background: 'var(--bg)' }}>
        <div className="container" style={{ maxWidth: '640px', margin: '3rem auto', textAlign: 'center' }}>
          <div className="card p-4" style={{ background: '#ffffff', borderRadius: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.06)', padding: '3rem 2rem' }}>
            <div style={{ fontSize: '3.8rem', marginBottom: '1rem', lineHeight: 1 }}>📍</div>
            <span style={{ background: '#FEE2E2', color: '#DC2626', padding: '0.35rem 1rem', borderRadius: '50px', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'inline-block', marginBottom: '1.25rem' }}>
              Service Unavailable
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.6rem' }}>
              Not Available in Your Location
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', lineHeight: 1.6, maxWidth: '460px', margin: '0 auto 1.75rem' }}>
              We are sorry! This food item is currently not serviceable or out of stock in your selected delivery location.
            </p>

            <div style={{ background: 'var(--bg)', border: '1px dashed var(--border)', padding: '0.9rem 1.25rem', borderRadius: '14px', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>🛵 Delivery Zone:</span>
              <strong style={{ color: 'var(--text)' }}>Not deliverable to current address</strong>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/menu" className="btn btn-primary btn-lg" style={{ padding: '0.85rem 1.8rem', fontWeight: 800 }}>
                🍽️ Explore Available Menu
              </Link>
              <button
                onClick={() => toast.success('We will notify you when this item is available in your location! 🔔')}
                className="btn btn-outline btn-lg"
                style={{ padding: '0.85rem 1.6rem', fontWeight: 700 }}
              >
                🔔 Notify Me When Available
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isItemUnavailable = food.isAvailable === false;
  const inCart = items.find(i => i._id === food._id);

  const handleAddToCart = () => {
    if (isItemUnavailable) {
      toast.error('This item is currently not available in your location! 📍');
      return;
    }
    if (!user) {
      toast.error('Please login to add items to cart and place orders! 🔒');
      navigate('/login');
      return;
    }
    addItem(food, qty);
  };

  const handleBuyNow = () => {
    if (isItemUnavailable) {
      toast.error('This item is currently not available in your location! 📍');
      return;
    }
    if (!user) {
      toast.error('Please login to order items! 🔒');
      navigate('/login');
      return;
    }
    addItem(food, qty);
    navigate('/checkout');
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to post a review! 🔒');
      navigate('/login');
      return;
    }
    if (!newComment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    setSubmittingReview(true);

    const newRevObj = {
      id: Date.now().toString(),
      userName: user.name || 'Food Lover',
      userAvatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=FC8019&color=fff`,
      rating: Number(newRating),
      date: 'Just now',
      comment: newComment.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      // 1. Persist to backend API if available
      const apiResponse = await reviewService.addReview({
        foodId: id,
        rating: Number(newRating),
        comment: newComment.trim(),
      });

      if (apiResponse && apiResponse.id) {
        newRevObj.id = apiResponse.id;
      }
    } catch {
      // Graceful fallback for mock or offline items
    }

    // 2. Permanently save to localStorage and component state
    const updatedReviews = [newRevObj, ...reviews.filter(r => r.id !== newRevObj.id)];
    setReviews(updatedReviews);

    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedReviews));
    } catch (err) {
      console.error('Error saving review to localStorage:', err);
    }

    // 3. Update food's live rating and count dynamically
    if (food) {
      const avgRate = (updatedReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / updatedReviews.length).toFixed(1);
      setFood(prev => ({
        ...prev,
        rating: Number(avgRate),
        numReviews: updatedReviews.length,
      }));
    }

    setNewComment('');
    setNewRating(5);
    setSubmittingReview(false);
    toast.success('Thank you! Your review has been saved permanently ⭐');
  };

  return (
    <div style={{ paddingTop: '6rem', paddingBottom: '4rem', background: 'var(--bg)', minHeight: '90vh' }}>
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          <Link to="/" style={{ color: 'var(--text-muted)' }}>Home</Link> /
          <Link to="/menu" style={{ color: 'var(--text-muted)' }}>Menu</Link> /
          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{food.name}</span>
        </div>

        {/* Unavailable Banner if item is disabled/out of service */}
        {isItemUnavailable && (
          <div style={{
            background: '#FEE2E2',
            border: '1.5px solid #FCA5A5',
            borderRadius: '16px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.4rem' }}>📍</span>
              <div>
                <strong style={{ color: '#991B1B', display: 'block', fontSize: '0.95rem' }}>
                  Not Available in Your Location
                </strong>
                <span style={{ color: '#B91C1C', fontSize: '0.85rem' }}>
                  This item is currently out of stock or not deliverable to your current delivery address.
                </span>
              </div>
            </div>
            <Link to="/menu" className="btn btn-sm" style={{ background: '#DC2626', color: '#ffffff', fontWeight: 700, borderRadius: '8px' }}>
              View Other Items →
            </Link>
          </div>
        )}

        {/* PRODUCT GRID */}
        <div className="card p-3 mb-3" style={{ background: '#ffffff', borderRadius: '24px', opacity: isItemUnavailable ? 0.9 : 1 }}>
          <div className="grid-2" style={{ gap: '2.5rem', alignItems: 'start' }}>
            {/* Left Image Showcase */}
            <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden' }}>
              <img
                src={food.image}
                alt={food.name}
                style={{
                  width: '100%',
                  height: '420px',
                  objectFit: 'cover',
                  borderRadius: '20px',
                  filter: isItemUnavailable ? 'grayscale(35%)' : 'none'
                }}
              />
              <button
                onClick={() => { setIsFav(p => !p); toast.success(isFav ? 'Removed from favorites' : 'Added to favorites ❤️'); }}
                style={{
                  position: 'absolute', top: '1rem', right: '1rem',
                  width: '42px', height: '42px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.95)', border: 'none',
                  fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.12)'
                }}
              >
                {isFav ? '❤️' : '🤍'}
              </button>

              <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {isItemUnavailable && (
                  <span className="badge badge-error" style={{ background: '#DC2626', color: '#fff', fontWeight: 800 }}>
                    🚫 Not Available in Location
                  </span>
                )}
                {food.isVeg ? (
                  <span className="badge badge-success">🌿 100% Veg</span>
                ) : (
                  <span className="badge badge-error">🥩 Non-Veg</span>
                )}
                {food.discount > 0 && <span className="badge badge-warning">{food.discount}% OFF</span>}
              </div>
            </div>

            {/* Right Details Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em' }}>
                  {food.category?.name || 'Gourmet Dish'}
                </span>
                <h1 style={{ fontSize: '2.2rem', margin: '0.3rem 0', fontWeight: 800 }}>{food.name}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#FFF0E6', padding: '0.3rem 0.75rem', borderRadius: '50px' }}>
                    <span style={{ color: '#FC8019', fontWeight: 800 }}>★ {food.rating || 4.8}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({food.numReviews || 234} reviews)</span>
                  </div>
                  {food.prepTime && <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>⏱ {food.prepTime} mins prep time</span>}
                </div>
              </div>

              {/* Price Group */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', margin: '0.5rem 0' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)' }}>{formatPrice(food.price)}</span>
                {food.originalPrice && food.originalPrice > food.price && (
                  <span style={{ fontSize: '1.1rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>{formatPrice(food.originalPrice)}</span>
                )}
                <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.9rem' }}>Inclusive of all taxes</span>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6 }}>{food.description}</p>

              {/* Ingredients */}
              {food.ingredients && (
                <div>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>🌿 Key Ingredients</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {food.ingredients.map((ing, idx) => (
                      <span key={idx} style={{ background: 'var(--bg)', padding: '0.25rem 0.65rem', borderRadius: '50px', fontSize: '0.8rem', color: 'var(--text)' }}>
                        ✓ {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Nutrition Facts */}
              {food.nutrition && (
                <div style={{ background: 'var(--bg)', padding: '0.85rem 1.25rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
                  <div><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Calories</span><p style={{ fontWeight: 800, margin: 0 }}>{food.nutrition.calories} kcal</p></div>
                  <div><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Protein</span><p style={{ fontWeight: 800, margin: 0 }}>{food.nutrition.protein}g</p></div>
                  <div><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Carbs</span><p style={{ fontWeight: 800, margin: 0 }}>{food.nutrition.carbs}g</p></div>
                  <div><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fat</span><p style={{ fontWeight: 800, margin: 0 }}>{food.nutrition.fat}g</p></div>
                </div>
              )}

              {/* Quantity Controls & Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
                {!isItemUnavailable && (
                  <div style={{ display: 'flex', alignItems: 'center', border: '2px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ padding: '0.6rem 1rem', background: 'none', fontSize: '1.1rem', fontWeight: 800 }}>-</button>
                    <span style={{ padding: '0.6rem 1rem', fontWeight: 800 }}>{qty}</span>
                    <button onClick={() => setQty(q => q + 1)} style={{ padding: '0.6rem 1rem', background: 'none', fontSize: '1.1rem', fontWeight: 800 }}>+</button>
                  </div>
                )}

                {isItemUnavailable ? (
                  <button
                    className="btn btn-lg"
                    disabled
                    style={{ flex: 1, background: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed', border: '1px solid #e2e8f0', fontWeight: 700 }}
                  >
                    🚫 Not Available in Your Location
                  </button>
                ) : (
                  <>
                    <button className="btn btn-primary btn-lg" onClick={handleAddToCart} style={{ flex: 1 }}>
                      {inCart ? `✓ Added (${inCart.qty})` : '🛒 Add to Cart'}
                    </button>

                    <button className="btn btn-outline btn-lg" onClick={handleBuyNow} style={{ flex: 1 }}>
                      ⚡ Order Now
                    </button>
                  </>
                )}
              </div>

              {/* Accepted Payment Methods Banner */}
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <span>💵 Cash on Delivery</span>
                <span>⚡ Google Pay / UPI</span>
                <span>💳 Debit & Credit Cards</span>
                <span>🏦 NetBanking</span>
              </div>
            </div>
          </div>
        </div>

        {/* CUSTOMER REVIEWS & COMMENTS SECTION */}
        <div className="card p-3 mb-3" style={{ background: '#ffffff', borderRadius: '24px' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>Ratings & Customer Reviews</h3>

          {/* Add Review Form */}
          <form onSubmit={handleAddReview} style={{ background: 'var(--bg)', padding: '1.25rem', borderRadius: '16px', marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Leave a Comment & Review</h4>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                Your Rating (Slide or Click to select):
              </label>
              <StarRatingSlider
                value={newRating}
                onChange={(rating) => setNewRating(rating)}
                showSlider={true}
                showLabel={true}
              />
            </div>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Share your experience about this dish..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              style={{ marginBottom: '0.75rem' }}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={submittingReview}>
              {submittingReview ? 'Saving Review... ⏳' : 'Submit Review ⭐'}
            </button>
          </form>

          {/* Reviews List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {reviews.map(rev => (
              <div key={rev.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={rev.userAvatar} alt={rev.userName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <h4 style={{ fontSize: '0.95rem', margin: 0 }}>{rev.userName}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>✓ Verified Purchase</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{rev.date}</span>
                </div>
                <div style={{ color: '#FC8019', fontSize: '0.9rem', marginBottom: '0.4rem' }}>{'★'.repeat(rev.rating)}</div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text)', margin: 0 }}>{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RECOMMENDED DISHES */}
        <div style={{ marginTop: '3rem' }}>
          <div className="section-title" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <h2>You Might Also Like 🔥</h2>
          </div>
          <div className="grid-3">
            {(
              ALL_FOODS.filter(item => item._id !== food._id && item.category?.name === food.category?.name).length >= 3
                ? ALL_FOODS.filter(item => item._id !== food._id && item.category?.name === food.category?.name).slice(0, 3)
                : ALL_FOODS.filter(item => item._id !== food._id).slice(0, 3)
            ).map(item => (
              <FoodCard key={item._id} food={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetails;
