import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { propertyService } from '../../services/propertyService';
import { requestService } from '../../services/requestService';
import { useSocket } from '../../hooks/useSocket';
import toast from 'react-hot-toast';
import { notifyNewRequest, notifyUrgentRequest, testSound } from '../../services/notificationSound';

export default function Dashboard() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('soundEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const { socket } = useSocket(selectedProperty, 'property');

  useEffect(() => {
    localStorage.setItem('soundEnabled', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedProperty) {
      fetchStats(selectedProperty);
      fetchRecentRequests(selectedProperty);
    }
  }, [selectedProperty]);

  useEffect(() => {
    if (socket) {
      socket.on('new-request', (request) => {
        setRecentRequests(prev => [request, ...prev.slice(0, 9)]);

        if (soundEnabled) {
          if (request.priority === 'urgent' || request.priority === 'high') {
            notifyUrgentRequest(request);
          } else {
            notifyNewRequest(request);
          }
        }

        if (request.priority === 'urgent') {
          toast.error(`🔴 URGENT: ${request.request_type} from Room ${request.room_number}`);
        } else {
          toast.success(`🆕 New ${request.request_type} from Room ${request.room_number}`);
        }

        if (selectedProperty) {
          fetchStats(selectedProperty);
        }
      });

      return () => {
        socket.off('new-request');
      };
    }
  }, [socket, selectedProperty, soundEnabled]);

  const fetchData = async () => {
    try {
      const props = await propertyService.getAll();
      setProperties(props);
      if (props.length > 0) {
        setSelectedProperty(props[0].id);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (propertyId) => {
    try {
      const statsData = await propertyService.getStats(propertyId);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentRequests = async (propertyId) => {
    try {
      const requests = await requestService.getRecent(propertyId);
      setRecentRequests(requests);
    } catch (error) {
      console.error('Error fetching recent requests:', error);
    }
  };

  const handleTestSound = async () => {
    toast.info('🔊 Testing notification sound...');
    await testSound();
    setTimeout(() => toast.success('✅ Sound played!'), 1000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Welcome to StayDeck!</h2>
          <p className="text-gray-600 mb-6">
            You haven't created any properties yet. Get started by adding your first property.
          </p>
          <button
            onClick={() => window.location.href = '/admin/properties'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Property
          </button>
        </div>
      </div>
    );
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    assigned: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <div className="container mx-auto p-6">
      {/* Top Bar with Property Selector and Sound Controls */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <select
          value={selectedProperty || ''}
          onChange={(e) => setSelectedProperty(e.target.value)}
          className="border rounded-lg px-4 py-2 text-sm"
        >
          {properties.map(prop => (
            <option key={prop.id} value={prop.id}>{prop.name}</option>
          ))}
        </select>

        {/* Sound Controls */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white rounded-lg shadow px-3 py-2">
            <span className="text-sm font-medium text-gray-700">
              {soundEnabled ? '🔔 Sound ON' : '🔕 Sound OFF'}
            </span>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                soundEnabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{stats.total_rooms || 0}</div>
            <div className="text-sm text-gray-600">Total Rooms</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">{stats.occupied_rooms || 0}</div>
            <div className="text-sm text-gray-600">Occupied</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending_requests || 0}</div>
            <div className="text-sm text-gray-600">Pending Requests</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600">{stats.completed_requests || 0}</div>
            <div className="text-sm text-gray-600">Completed Today</div>
          </div>
        </div>
      )}

      {/* Recent Requests */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <span className="text-sm text-gray-500">
            {recentRequests.length} recent {recentRequests.length === 1 ? 'request' : 'requests'}
          </span>
        </div>
        <div className="divide-y">
          {recentRequests.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No recent requests</div>
          ) : (
            recentRequests.map(request => (
              <div
                key={request.id}
                className={`p-4 transition-colors ${
                  request.priority === 'urgent'
                    ? 'bg-red-50 hover:bg-red-100'
                    : request.priority === 'high'
                    ? 'bg-orange-50 hover:bg-orange-100'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Room {request.room_number}</span>
                      {request.priority === 'urgent' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white animate-pulse">
                          🔴 URGENT
                        </span>
                      )}
                      {request.priority === 'high' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500 text-white">
                          ⚠️ HIGH
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {request.request_type} - {request.description || 'No description'}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[request.status] || 'bg-gray-100 text-gray-800'}`}>
                      {request.status}
                    </span>
                    <div className="text-sm text-gray-500">
                      {new Date(request.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
