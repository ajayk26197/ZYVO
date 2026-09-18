import api from './api';

export const orderService = {
  create:    (data) => api.post('/orders', data),
  getMyOrders: ()   => api.get('/orders/myorders'),
  getById:   (id)   => api.get(`/orders/${id}`),
  cancel:    (id)   => api.put(`/orders/${id}/cancel`),
  // Admin
  getAll:    (params) => api.get('/orders', { params }),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};
