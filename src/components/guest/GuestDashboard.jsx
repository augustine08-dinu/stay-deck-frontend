import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { guestService } from '../../services/guestService';
import toast from 'react-hot-toast';

export default function GuestDashboard() {
  const navigate = useNavigate();
  const { propertyId, roomNumber } = useParams();
  const [loading, setLoading] = useState(true);
  const [roomData, setRoomData] = useState({ number: roomNumber || 'N/A' });
  const [propertyName, setPropertyName] = useState('');
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    console.log('🔥🔥🔥 GUEST DASHBOARD MOUNTED! 🔥🔥🔥');
    console.log('📍 PropertyId:', propertyId);
    console.log('📍 RoomNumber:', roomNumber);
    
    const token = localStorage.getItem('guestToken');
    const room = localStorage.getItem('guestRoom');
    
    if (!token || !room) {
      toast.error('Session expired. Please scan QR again.');
      navigate('/login', { replace: true });
      return;
    }

    try {
      const parsedRoom = JSON.parse(room);
      setRoomData({
        number: parsedRoom.roomNumber || roomNumber || 'N/A',
        propertyId: parsedRoom.propertyId || propertyId || ''
      });
    } catch (e) {
      console.error('Error parsing room:', e);
    }

    fetchData();
  }, [propertyId, roomNumber]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await guestService.getDashboard();
      if (data?.property?.name) {
        setPropertyName(data.property.name);
      }
      const requestsData = await guestService.getRequests();
      setRequests(requestsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceRequest = (type) => {
    navigate(`/guest/request/${propertyId}/${roomNumber}`, { 
      state: { requestType: type } 
    });
  };

  const handleFeedback = () => {
    navigate(`/guest/feedback/${propertyId}/${roomNumber}`);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your stay...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 mb-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Welcome to StayDeck</h1>
            <div className="mt-2">
              <div className="text-sm opacity-90">🏠 Room {roomData.number}</div>
              {propertyName && (
                <div className="text-sm opacity-90">📍 {propertyName}</div>
              )}
            </div>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-lg text-sm font-medium">
            Room {roomData.number}
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">🛎️ What do you need?</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { id: 'cleaning', icon: '🧹', label: 'Cleaning' },
            { id: 'towels', icon: '🛏️', label: 'Towels' },
            { id: 'toiletries', icon: '🧴', label: 'Toiletries' },
            { id: 'water', icon: '💧', label: 'Water' },
            { id: 'maintenance', icon: '🔧', label: 'Maintenance' },
            { id: 'other', icon: '🛎️', label: 'Other' }
          ].map((service) => (
            <button
              key={service.id}
              onClick={() => handleServiceRequest(service.id)}
              className="bg-gray-50 p-3 rounded-lg hover:shadow-md transition-all text-center border border-gray-100 hover:bg-blue-50"
            >
              <div className="text-2xl mb-1">{service.icon}</div>
              <div className="text-xs font-medium text-gray-700">{service.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Requests */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-800">📋 Your Requests</h3>
          <span className="text-sm text-gray-500">{requests.length} total</span>
        </div>
        {requests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📭</div>
            <p className="text-lg font-medium">No requests yet</p>
            <p className="text-sm mt-1">Tap a service above to request something!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {requests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-800 capitalize">{request.request_type}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status || 'pending'}
                    </span>
                  </div>
                  {request.description && (
                    <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                  )}
                  {request.requested_date && (
                    <p className="text-xs text-gray-400 mt-1">📅 {new Date(request.requested_date).toLocaleDateString()}</p>
                  )}
                </div>
                {request.status === 'completed' && (
                  <span className="text-green-500 text-sm">✅ Done</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <button
          onClick={handleFeedback}
          className="bg-yellow-500 text-white py-3 rounded-xl hover:bg-yellow-600 transition-colors font-medium"
        >
          ⭐ Give Feedback
        </button>
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to check out?')) {
              localStorage.removeItem('guestToken');
              localStorage.removeItem('guestRoom');
              toast.success('Checked out successfully');
              navigate('/login', { replace: true });
            }
          }}
          className="bg-gray-500 text-white py-3 rounded-xl hover:bg-gray-600 transition-colors font-medium"
        >
          🔒 Check Out
        </button>
      </div>
    </div>
  );
}