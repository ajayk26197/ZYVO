import api from './api';

export const foodService = {
  getAll:      (params) => api.get('/food', { params }),
  getById:     (id)     => api.get(`/food/${id}`),
  getByCategory:(cat)   => api.get('/food', { params: { category: cat } }),
  search:      (q)      => api.get('/food/search', { params: { q } }),
  getFeatured: ()       => api.get('/food/featured'),
  // Admin
  create: (data) => api.post('/food', data),
  update: (id, data) => api.put(`/food/${id}`, data),
  delete: (id)       => api.delete(`/food/${id}`),
};
