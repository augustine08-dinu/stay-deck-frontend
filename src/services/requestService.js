import api from './api';

export const requestService = {
  getAll: async (propertyId, filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/properties/${propertyId}/requests?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Get all error:', error);
      throw error;
    }
  },
  
  getStats: async (propertyId) => {
    try {
      const response = await api.get(`/properties/${propertyId}/requests/stats`);
      return response.data;
    } catch (error) {
      console.error('Get stats error:', error);
      throw error;
    }
  },
  
  getRecent: async (propertyId, limit = 10) => {
    try {
      const response = await api.get(`/properties/${propertyId}/requests/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Get recent error:', error);
      throw error;
    }
  },
  
  getById: async (requestId) => {
    try {
      const response = await api.get(`/requests/${requestId}`);
      return response.data;
    } catch (error) {
      console.error('Get by id error:', error);
      throw error;
    }
  },
  
  update: async (requestId, updateData) => {
    try {
      console.log('📤 Updating request:', requestId);
      console.log('📤 Update data:', updateData);
      
      // Use the standalone route without propertyId
      const response = await api.put(`/requests/${requestId}`, updateData);
      
      console.log('✅ Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Update error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      throw error;
    }
  },
  
  create: async (propertyId, requestData) => {
    try {
      console.log('📤 Creating request:', requestData);
      const response = await api.post(`/properties/${propertyId}/requests`, requestData);
      console.log('✅ Create response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Create error:', error);
      throw error;
    }
  }
};