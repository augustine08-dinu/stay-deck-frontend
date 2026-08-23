import api from './api';

export const guestService = {
  verifyRoom: async (propertyId, roomNumber, pin) => {
    try {
      const response = await api.post('/guest/verify', { 
        propertyId, 
        roomNumber, 
        pin 
      });
      return response.data;
    } catch (error) {
      console.error('Verify room error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  getDashboard: async () => {
    try {
      const response = await api.get('/guest/dashboard');
      console.log('📡 getDashboard response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get dashboard error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  getRequests: async () => {
    try {
      const response = await api.get('/guest/requests');
      console.log('📡 getRequests response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get requests error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  createRequest: async (requestData) => {
    try {
      const response = await api.post('/guest/requests', requestData);
      return response.data;
    } catch (error) {
      console.error('Create request error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  submitFeedback: async (feedbackData) => {
    try {
      const response = await api.post('/guest/feedback', feedbackData);
      return response.data;
    } catch (error) {
      console.error('Submit feedback error:', error.response?.data || error.message);
      throw error;
    }
  }
};