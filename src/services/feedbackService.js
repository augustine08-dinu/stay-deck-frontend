import api from './api';

export const feedbackService = {
 getAll: async (propertyId, filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await api.get(`/properties/${propertyId}/feedback?${queryParams}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Get feedback error:', error);
    return [];
  }
},
  
  getStats: async (propertyId) => {
  try {
    const response = await api.get(`/properties/${propertyId}/feedback/stats`);
    return response.data || {};
  } catch (error) {
    console.error('Get stats error:', error);
    return {};
  }
},
  
  getById: async (feedbackId) => {
    const response = await api.get(`/feedback/${feedbackId}`);
    return response.data;
  }
};
