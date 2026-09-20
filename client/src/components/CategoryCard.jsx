import React from 'react';
import { Link } from 'react-router-dom';
import styles from './CategoryCard.module.css';

const CategoryCard = ({ category }) => {
  const catParam = category.name || category._id;
  return (
    <Link to={`/menu?category=${encodeURIComponent(catParam.toLowerCase())}`} className={styles.circleCard} title={`Explore ${category.name}`}>
      <div className={styles.circleIconWrap} style={{ background: category.color || '#FFFFFF' }}>
        <span className={styles.circleIcon}>{category.icon || '🍽️'}</span>
      </div>
      <span className={styles.circleName}>{category.name}</span>
    </Link>
  );
};

export default CategoryCard;
