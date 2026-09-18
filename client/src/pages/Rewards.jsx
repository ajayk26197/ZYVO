import React, { useState } from 'react';
import toast from 'react-hot-toast';
import styles from './Rewards.module.css';

const COUPONS = [
  {
    code: 'WELCOME50',
    title: 'Flat 50% OFF',
    desc: 'Valid on your first 3 food orders above ₹199. Maximum discount ₹150.',
    tag: '🔥 POPULAR',
    expiry: 'Expires in 6 days',
  },
  {
    code: 'ZYVO100',
    title: '₹100 Instant Cashback',
    desc: 'Get ₹100 direct cashback into your ZYVO Wallet on orders above ₹399.',
    tag: '⚡ HOT OFFER',
    expiry: 'Expires in 4 days',
  },
  {
    code: 'FREESHIP',
    title: '100% Free Delivery',
    desc: 'Enjoy zero delivery fee on any dish from top rated restaurants.',
    tag: '🛵 FREE DELIVERY',
    expiry: 'Valid all month',
  },
  {
    code: 'SUPERFOOD',
    title: '20% OFF Healthy Bowls',
    desc: 'Special discount on organic salads, fruit bowls, and protein meals.',
    tag: '🥗 HEALTHY',
    expiry: 'Expires in 12 days',
  },
];

const SCRATCH_CARDS = [
  { id: 1, title: 'Mystery Gift #1', reward: '🧃 Free Fresh Mango Smoothie on orders > ₹249!', icon: '🥤', revealed: false },
  { id: 2, title: 'Mystery Gift #2', reward: '🍰 Free Molten Choco Lava Cake!', icon: '🍰', revealed: false },
  { id: 3, title: 'Mystery Gift #3', reward: '🪙 Bonus 150 ZYVO Coins added!', icon: '🪙', revealed: false },
];

const Rewards = () => {
  const [coins, setCoins] = useState(250);
  const [claimedStreak, setClaimedStreak] = useState(false);
  const [cards, setCards] = useState(SCRATCH_CARDS);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code ${code} copied to clipboard! 🎟️`);
  };

  const handleClaimStreak = () => {
    if (claimedStreak) {
      toast.error('You already claimed today\'s check-in bonus! ⏰');
      return;
    }
    setCoins(prev => prev + 25);
    setClaimedStreak(true);
    toast.success('🎉 +25 ZYVO Coins claimed! Daily streak updated.');
  };

  const handleRevealScratchCard = (id) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, revealed: true } : c));
    const target = cards.find(c => c.id === id);
    if (target && !target.revealed) {
      toast.success(`🎉 Congratulations! You unlocked: ${target.reward}`);
    }
  };

  return (
    <div className={styles.page}>
      <div className="container">
        
        {/* Header */}
        <div className={styles.header}>
          <h1>🎁 ZYVO Rewards & Loyalty Club</h1>
          <p>Earn ZYVO Coins on every order, claim instant promo coupons, and scratch daily mystery gifts!</p>
        </div>

        {/* Hero Coins Balance Card */}
        <div className={styles.heroBalanceCard}>
          <div className={styles.heroTop}>
            <div>
              <span className={styles.coinsBadge}>🌟 REWARDS BALANCE</span>
              <div className={styles.coinAmount}>
                <span>🪙 {coins}</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>ZYVO Coins</span>
              </div>
              <p className={styles.coinSub}>1 ZYVO Coin = ₹1 Discount on Checkout. Use coins on any order!</p>
            </div>

            <button
              className="btn btn-outline"
              onClick={handleClaimStreak}
              disabled={claimedStreak}
              style={{
                background: '#ffffff',
                color: 'var(--primary)',
                border: 'none',
                fontWeight: 800,
                padding: '0.85rem 1.5rem',
                borderRadius: '14px',
              }}
            >
              {claimedStreak ? '✓ Daily Bonus Claimed 🎉' : '🔥 Claim Daily Bonus (+25 Coins)'}
            </button>
          </div>

          {/* Tier Progress */}
          <div className={styles.tierProgress}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 700 }}>
              <span>🏆 Gold Gourmet VIP Level</span>
              <span>800 / 1000 Coins to Diamond VIP</span>
            </div>
            <div className={styles.progressBarBg}>
              <div className={styles.progressBarFill} style={{ width: '80%' }} />
            </div>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)' }}>
              Unlock 15% cashback & VIP Priority Delivery partner assignment at 1000 coins!
            </span>
          </div>
        </div>

        {/* Section Title 1: Promo Coupons */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.3rem' }}>🎟️ Available Promo Coupons & Cashbacks</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>Apply these verified promo codes at checkout for maximum savings</p>
        </div>

        {/* Coupons Grid */}
        <div className={styles.couponsGrid}>
          {COUPONS.map((cpn) => (
            <div key={cpn.code} className={styles.couponCard}>
              <div>
                <div className={styles.couponHeader}>
                  <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{cpn.title}</h3>
                  <span className={styles.couponTag}>{cpn.tag}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.5rem 0 0.75rem' }}>{cpn.desc}</p>
                <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>⏱ {cpn.expiry}</span>
              </div>

              <div className={styles.couponCodeBox}>
                <span className={styles.codeText}>{cpn.code}</span>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleCopyCode(cpn.code)}
                  style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
                >
                  Copy Code 📋
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Section Title 2: Mystery Scratch Cards */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.3rem' }}>🎁 Daily Mystery Scratch Cards</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>Tap any card to scratch and reveal your guaranteed daily foodie gift</p>
        </div>

        {/* Scratch Cards Grid */}
        <div className={styles.scratchGrid}>
          {cards.map((card) => (
            <div
              key={card.id}
              className={styles.scratchCard}
              onClick={() => handleRevealScratchCard(card.id)}
            >
              <span className={styles.scratchIcon}>{card.revealed ? card.icon : '❓'}</span>
              <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.4rem', color: '#ffffff' }}>{card.title}</h3>
              {card.revealed ? (
                <p style={{ fontSize: '0.88rem', color: '#86efac', fontWeight: 700, margin: 0 }}>{card.reward}</p>
              ) : (
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>Tap to scratch & reveal gift 👆</p>
              )}
            </div>
          ))}
        </div>

        {/* How Rewards Work Banner */}
        <div className="card p-3" style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⚡</span> How ZYVO Rewards Work
          </h3>
          <div className="grid-3" style={{ gap: '1.25rem' }}>
            <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: '14px' }}>
              <span style={{ fontSize: '2rem' }}>🍕</span>
              <h4 style={{ fontSize: '0.95rem', margin: '0.5rem 0 0.2rem' }}>1. Order Food</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Order your favorite meals from top dishes & restaurants.</p>
            </div>
            <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: '14px' }}>
              <span style={{ fontSize: '2rem' }}>🪙</span>
              <h4 style={{ fontSize: '0.95rem', margin: '0.5rem 0 0.2rem' }}>2. Earn ZYVO Coins</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Get 10% back in ZYVO Coins automatically on every completed order.</p>
            </div>
            <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: '14px' }}>
              <span style={{ fontSize: '2rem' }}>🎉</span>
              <h4 style={{ fontSize: '0.95rem', margin: '0.5rem 0 0.2rem' }}>3. Redeem for FREE Meals</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Use ZYVO Coins at checkout to get flat instant discounts on any food!</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Rewards;
