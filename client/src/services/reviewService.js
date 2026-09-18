import api from './api';

export const reviewService = {
  getFoodReviews: async (foodId) => {
    try {
      const res = await api.get(`/reviews/food/${foodId}`);
      return res.data;
    } catch {
      return [];
    }
  },

  addReview: async ({ foodId, rating, comment, orderId }) => {
    const res = await api.post('/reviews', { foodId, rating, comment, orderId });
    return res.data;
  },
};

export default reviewService;
