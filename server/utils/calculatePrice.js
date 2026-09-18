const DELIVERY_FEE = 49;
const FREE_DELIVERY_THRESHOLD = 500;

export const calculatePrice = (items, coupon = null) => {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;

  let discount = 0;
  if (coupon) {
    if (subtotal >= coupon.minOrder) {
      if (coupon.type === 'percent') {
        discount = (subtotal * coupon.value) / 100;
        if (coupon.maxDiscount > 0) discount = Math.min(discount, coupon.maxDiscount);
      } else {
        discount = coupon.value;
      }
    }
  }

  const total = Math.max(0, subtotal + deliveryFee - discount);
  return { subtotal, deliveryFee, discount, total };
};
