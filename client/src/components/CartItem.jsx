import React from 'react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';
import styles from './CartItem.module.css';

const CartItem = ({ item }) => {
  const { updateQty, removeItem } = useCart();

  return (
    <div className={styles.item}>
      <img
        src={item.image || 'https://placehold.co/80x80/E32929/fff?text=🍔'}
        alt={item.name}
        className={styles.image}
      />
      <div className={styles.details}>
        <h5 className={styles.name}>{item.name}</h5>
        <p className={styles.price}>{formatPrice(item.price)}</p>
      </div>
      <div className={styles.controls}>
        <button className={styles.qtyBtn} onClick={() => item.qty === 1 ? removeItem(item._id) : updateQty(item._id, item.qty - 1)}>
          {item.qty === 1 ? '🗑' : '−'}
        </button>
        <span className={styles.qty}>{item.qty}</span>
        <button className={styles.qtyBtn} onClick={() => updateQty(item._id, item.qty + 1)}>+</button>
      </div>
      <p className={styles.total}>{formatPrice(item.price * item.qty)}</p>
    </div>
  );
};

export default CartItem;
