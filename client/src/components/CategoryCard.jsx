import React from 'react';
import { Link } from 'react-router-dom';
import styles from './CategoryCard.module.css';

const CategoryCard = ({ category }) => {
  const catParam = category.name || category._id;
  return (
    <Link to={`/menu?category=${encodeURIComponent(catParam.toLowerCase())}`} className={styles.card}>
      <div className={styles.iconWrapper} style={{ background: category.color || 'var(--surface-2)' }}>
        <span className={styles.icon}>{category.icon || '🍽️'}</span>
      </div>
      <p className={styles.name}>{category.name}</p>
      {category.count !== undefined && (
        <span className={styles.count}>{category.count} items</span>
      )}
    </Link>
  );
};

export default CategoryCard;
