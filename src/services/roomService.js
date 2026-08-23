import api from './api';

export const roomService = {
  create: async (propertyId, roomData) => {
    const response = await api.post(`/properties/${propertyId}/rooms`, roomData);
    return response.data;
  },
  
  bulkCreate: async (propertyId, rooms) => {
    const response = await api.post(`/properties/${propertyId}/rooms/bulk`, { rooms });
    return response.data;
  },
  
  getAll: async (propertyId) => {
    const response = await api.get(`/properties/${propertyId}/rooms`);
    return response.data;
  },
  
  getById: async (roomId) => {
    const response = await api.get(`/rooms/${roomId}`);
    return response.data;
  },
  
  update: async (roomId, roomData) => {
    const response = await api.put(`/rooms/${roomId}`, roomData);
    return response.data;
  },
  
  updateStatus: async (roomId, status) => {
    try {
      console.log('📤 Updating room status:', roomId, 'to:', status);
      // Use the standalone route
      const response = await api.patch(`/rooms/${roomId}/status`, { status });
      console.log('✅ Status update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Status update error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  delete: async (roomId) => {
    const response = await api.delete(`/rooms/${roomId}`);
    return response.data;
  }
};