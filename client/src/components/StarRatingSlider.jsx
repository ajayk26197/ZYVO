import React, { useState, useRef, useCallback } from 'react';
import styles from './StarRatingSlider.module.css';

const RATING_DATA = {
  1: { label: 'Terrible', emoji: '😞', desc: 'Very poor taste or service', color: '#EF4444' },
  2: { label: 'Bad', emoji: '😕', desc: 'Could have been much better', color: '#F97316' },
  3: { label: 'Average', emoji: '😊', desc: 'Decent food and experience', color: '#FBBF24' },
  4: { label: 'Very Good', emoji: '😋', desc: 'Delicious food & fast service', color: '#34D399' },
  5: { label: 'Outstanding!', emoji: '🤩', desc: 'Loved everything, top notch!', color: '#10B981' },
};

export const StarRatingSlider = ({
  value = 5,
  onChange,
  maxStars = 5,
  size = 'medium',
  showSlider = true,
  showLabel = true,
}) => {
  const [hoverRating, setHoverRating] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const starsContainerRef = useRef(null);

  const activeRating = hoverRating !== null ? hoverRating : value;
  const ratingInfo = RATING_DATA[Math.min(5, Math.max(1, Math.round(activeRating)))] || RATING_DATA[5];

  // Helper to calculate rating from pointer position
  const calculateRatingFromPos = useCallback((clientX) => {
    if (!starsContainerRef.current) return value;
    const rect = starsContainerRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const percent = Math.max(0, Math.min(1, offsetX / rect.width));
    const calculated = Math.ceil(percent * maxStars);
    return Math.max(1, Math.min(maxStars, calculated));
  }, [maxStars, value]);

  // Touch and Mouse handlers for smooth sliding across stars
  const handleTouchStart = (e) => {
    setIsDragging(true);
    const touch = e.touches[0];
    const newRate = calculateRatingFromPos(touch.clientX);
    setHoverRating(newRate);
    if (onChange) onChange(newRate);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const newRate = calculateRatingFromPos(touch.clientX);
    setHoverRating(newRate);
    if (onChange) onChange(newRate);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setHoverRating(null);
  };

  const handleMouseMoveContainer = (e) => {
    const newRate = calculateRatingFromPos(e.clientX);
    setHoverRating(newRate);
    if (isDragging && onChange) {
      onChange(newRate);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const newRate = calculateRatingFromPos(e.clientX);
    if (onChange) onChange(newRate);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSliderChange = (e) => {
    const val = Number(e.target.value);
    if (onChange) onChange(val);
  };

  return (
    <div className={`${styles.sliderRatingWrapper} ${styles[size] || ''}`} onMouseUp={handleMouseUp} onMouseLeave={() => { setHoverRating(null); setIsDragging(false); }}>
      {/* Dynamic Feedback Banner */}
      {showLabel && (
        <div className={styles.feedbackBanner} style={{ borderColor: `${ratingInfo.color}30` }}>
          <div className={styles.emojiBadge} style={{ background: `${ratingInfo.color}15` }}>
            <span className={styles.emoji}>{ratingInfo.emoji}</span>
          </div>
          <div className={styles.feedbackInfo}>
            <div className={styles.feedbackTitleRow}>
              <span className={styles.ratingScore} style={{ color: ratingInfo.color }}>
                {activeRating}.0
              </span>
              <span className={styles.ratingText}>{ratingInfo.label}</span>
            </div>
            <span className={styles.feedbackDesc}>{ratingInfo.desc}</span>
          </div>
        </div>
      )}

      {/* Interactive Sliding Stars Track */}
      <div className={styles.starsWrapper}>
        <div
          ref={starsContainerRef}
          className={`${styles.starsTrack} ${isDragging ? styles.isDragging : ''}`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseMove={handleMouseMoveContainer}
          onMouseDown={handleMouseDown}
          role="slider"
          aria-valuenow={activeRating}
          aria-valuemin={1}
          aria-valuemax={maxStars}
          tabIndex={0}
        >
          {Array.from({ length: maxStars }, (_, i) => {
            const starValue = i + 1;
            const isFilled = starValue <= activeRating;
            const isHovered = starValue === activeRating;

            return (
              <button
                key={starValue}
                type="button"
                className={`${styles.starBtn} ${isFilled ? styles.filled : ''} ${isHovered ? styles.activeStar : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onChange) onChange(starValue);
                }}
                onMouseEnter={() => setHoverRating(starValue)}
                aria-label={`Rate ${starValue} stars`}
              >
                <svg
                  className={styles.starSvg}
                  viewBox="0 0 24 24"
                  fill={isFilled ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span className={styles.starIndex}>{starValue}</span>
              </button>
            );
          })}
        </div>

        {/* Slide Hint */}
        <div className={styles.slideHint}>
          <span>👈 Slide or Tap stars 👉</span>
        </div>
      </div>

      {/* Smooth Range Slider Bar */}
      {showSlider && (
        <div className={styles.sliderBarContainer}>
          <div className={styles.sliderTrackLine}>
            <div
              className={styles.sliderProgressFill}
              style={{
                width: `${((activeRating - 1) / (maxStars - 1)) * 100}%`,
                background: `linear-gradient(90deg, #FC8019 0%, ${ratingInfo.color} 100%)`
              }}
            />
          </div>
          <input
            type="range"
            min={1}
            max={maxStars}
            step={1}
            value={activeRating}
            onChange={handleSliderChange}
            className={styles.rangeInput}
            aria-label="Star rating slider"
          />
        </div>
      )}
    </div>
  );
};

export default StarRatingSlider;
