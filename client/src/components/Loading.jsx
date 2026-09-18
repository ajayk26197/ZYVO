import React from 'react';
import styles from './Loading.module.css';

const Loading = ({ fullscreen = false, text = 'Loading...' }) => (
  <div className={`${styles.wrapper} ${fullscreen ? styles.fullscreen : ''}`}>
    <div className={styles.spinner} />
    <p className={styles.text}>{text}</p>
  </div>
);

export const SkeletonCard = () => (
  <div className={styles.skeletonCard}>
    <div className={`skeleton ${styles.skeletonImg}`} />
    <div className={styles.skeletonBody}>
      <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '60%' }} />
      <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '90%' }} />
      <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '40%' }} />
    </div>
  </div>
);

export default Loading;
