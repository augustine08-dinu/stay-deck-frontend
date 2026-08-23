import api from './api';

export const feedbackService = {
  getAll: async (propertyId, filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await api.get(`/properties/${propertyId}/feedback?${queryParams}`);
    return response.data;
  },
  
  getStats: async (propertyId) => {
    const response = await api.get(`/properties/${propertyId}/feedback/stats`);
    return response.data;
  },
  
  getById: async (feedbackId) => {
    const response = await api.get(`/feedback/${feedbackId}`);
    return response.data;
  }
};