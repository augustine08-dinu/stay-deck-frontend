import React, { createContext, useState, useContext, useEffect } from 'react';
import { guestService } from '../services/guestService';

const GuestContext = createContext();

export const useGuest = () => {
  const context = useContext(GuestContext);
  if (!context) {
    throw new Error('useGuest must be used within GuestProvider');
  }
  return context;
};

export const GuestProvider = ({ children }) => {
  const [guestData, setGuestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roomData, setRoomData] = useState(null);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    loadGuestData();
  }, []);

  const loadGuestData = async () => {
    const token = localStorage.getItem('guestToken');
    const room = JSON.parse(localStorage.getItem('guestRoom') || '{}');
    
    if (token && room.roomId) {
      setRoomData(room);
      await fetchGuestDashboard();
      await fetchGuestRequests();
    }
    setLoading(false);
  };

  const fetchGuestDashboard = async () => {
    try {
      const data = await guestService.getDashboard();
      setGuestData(data);
      return data;
    } catch (error) {
      console.error('Error fetching guest dashboard:', error);
      if (error.response?.status === 401) {
        // Token expired, clear storage
        localStorage.removeItem('guestToken');
        localStorage.removeItem('guestRoom');
        setRoomData(null);
        setGuestData(null);
      }
      throw error;
    }
  };

  const fetchGuestRequests = async () => {
    try {
      const data = await guestService.getRequests();
      setRequests(data);
      return data;
    } catch (error) {
      console.error('Error fetching guest requests:', error);
      throw error;
    }
  };

  const createRequest = async (requestData) => {
    try {
      const newRequest = await guestService.createRequest(requestData);
      setRequests(prev => [newRequest, ...prev]);
      return newRequest;
    } catch (error) {
      console.error('Error creating request:', error);
      throw error;
    }
  };

  const submitFeedback = async (feedbackData) => {
    try {
      const response = await guestService.submitFeedback(feedbackData);
      return response;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  };

  const logoutGuest = () => {
    localStorage.removeItem('guestToken');
    localStorage.removeItem('guestRoom');
    setGuestData(null);
    setRoomData(null);
    setRequests([]);
  };

  const updateRequestStatus = (requestId, newStatus) => {
    setRequests(prev =>
      prev.map(req =>
        req.id === requestId ? { ...req, status: newStatus } : req
      )
    );
  };

  const value = {
    guestData,
    roomData,
    requests,
    loading,
    fetchGuestDashboard,
    fetchGuestRequests,
    createRequest,
    submitFeedback,
    logoutGuest,
    updateRequestStatus
  };

  return (
    <GuestContext.Provider value={value}>
      {children}
    </GuestContext.Provider>
  );
};