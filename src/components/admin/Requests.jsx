import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { requestService } from '../../services/requestService';
import { roomService } from '../../services/roomService';
import { useSocket } from '../../hooks/useSocket';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import toast from 'react-hot-toast';

export default function Requests() {
  const { selectedProperty } = useOutletContext();
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [formData, setFormData] = useState({
    request_type: 'cleaning',
    description: '',
    requested_date: new Date().toISOString().split('T')[0],
    requested_time: '',
    preferred_time_slot: 'morning',
    room_id: '',
    priority: 'normal'
  });

  const { socket, isConnected } = useSocket(selectedProperty, 'property');

  useEffect(() => {
    if (selectedProperty) {
      fetchData();
      fetchRooms();
    }
  }, [selectedProperty]);

  useEffect(() => {
    if (socket) {
      socket.on('new-request', (request) => {
        setRequests(prev => [request, ...prev]);
        toast.success(`New ${request.request_type} request from Room ${request.room_number}`);
        fetchStats();
      });

      socket.on('request-updated', (updatedRequest) => {
        setRequests(prev =>
          prev.map(req =>
            req.id === updatedRequest.id ? updatedRequest : req
          )
        );
        fetchStats();
      });

      return () => {
        socket.off('new-request');
        socket.off('request-updated');
      };
    }
  }, [socket]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchRequests(), fetchStats()]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const filters = filterStatus !== 'all' ? { status: filterStatus } : {};
      const data = await requestService.getAll(selectedProperty, filters);
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
    }
  };

  const fetchStats = async () => {
    try {
      const data = await requestService.getStats(selectedProperty);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      const data = await roomService.getAll(selectedProperty);
      setRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await requestService.update(requestId, { status: newStatus });
      toast.success(`Request status updated to ${newStatus}`);
      await fetchRequests();
      await fetchStats();
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error(error.response?.data?.error || 'Failed to update request');
    }
  };

  const handleAddRequest = async (e) => {
    e.preventDefault();
    try {
      const selectedRoom = rooms.find(r => r.id === formData.room_id);
      if (!selectedRoom) {
        toast.error('Please select a valid room');
        return;
      }

      const requestData = {
        room_id: formData.room_id,
        request_type: formData.request_type,
        description: formData.description || '',
        requested_date: formData.requested_date,
        requested_time: formData.preferred_time_slot === 'custom' ? formData.requested_time : null,
        preferred_time_slot: formData.preferred_time_slot,
        priority: formData.priority || 'normal'
      };

      const response = await requestService.create(selectedProperty, requestData);

      if (response) {
        toast.success('Request added successfully!');
        setShowAddModal(false);
        setFormData({
          request_type: 'cleaning',
          description: '',
          requested_date: new Date().toISOString().split('T')[0],
          requested_time: '',
          preferred_time_slot: 'morning',
          room_id: '',
          priority: 'normal'
        });
        await fetchData();
      }
    } catch (error) {
      console.error('Error adding request:', error);
      toast.error(error.response?.data?.error || 'Failed to add request');
    }
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

  const getRequestTypeIcon = (type) => {
    const icons = {
      cleaning: '🧹',
      towels: '🛏️',
      toiletries: '🧴',
      water: '💧',
      maintenance: '🔧',
      other: '🛎️'
    };
    return icons[type] || '📋';
  };

  const getTileClassName = ({ date }) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayRequests = requests.filter(req => req.requested_date === dateStr);

    if (dayRequests.length === 0) return '';

    const hasPending = dayRequests.some(r =>
      r.status === 'pending' || r.status === 'assigned' || r.status === 'in_progress'
    );
    const allCompleted = dayRequests.every(r =>
      r.status === 'completed' || r.status === 'cancelled'
    );

    if (hasPending && !allCompleted) return 'has-pending';
    if (allCompleted) return 'has-completed';
    return 'has-request';
  };

  const getSortedRequests = () => {
    const sorted = [...requests];
    if (sortOrder === 'newest') {
      return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortOrder === 'oldest') {
      return sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortOrder === 'urgent') {
      const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      return sorted.sort((a, b) => (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2));
    }
    return sorted;
  };

  const statusOptions = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'];
  const requestTypes = ['cleaning', 'towels', 'toiletries', 'water', 'maintenance', 'other'];
  const timeSlots = ['morning', 'afternoon', 'evening', 'custom'];

  const allRequests = getSortedRequests();

  if (loading) {
    return <div className="text-center py-8">Loading requests...</div>;
  }

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total || 0}</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.assigned || 0}</div>
            <div className="text-sm text-gray-500">Assigned</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.in_progress || 0}</div>
            <div className="text-sm text-gray-500">In Progress</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed || 0}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">📅 Calendar</h3>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700"
              >
                + Add Request
              </button>
            </div>

            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              minDate={new Date()}
              tileClassName={getTileClassName}
            />

            <div className="mt-3 space-y-1 text-sm">
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-yellow-200 rounded-full mr-2"></span>
                <span className="text-gray-600">Has pending requests</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-green-200 rounded-full mr-2"></span>
                <span className="text-gray-600">All completed</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-blue-200 rounded-full mr-2"></span>
                <span className="text-gray-600">Has requests</span>
              </div>
            </div>

            {!isConnected && (
              <div className="mt-3 text-sm text-yellow-600">
                ⚠️ Realtime updates disconnected. Reconnecting...
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                📋 All Requests
                <span className="ml-2 text-sm text-gray-500 font-normal">
                  ({allRequests.length} total)
                </span>
              </h3>
              <div className="flex items-center space-x-2">
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    fetchRequests();
                  }}
                  className="border rounded-lg px-2 py-1 text-sm"
                >
                  <option value="all">All Status</option>
                  {statusOptions.map(s => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="border rounded-lg px-2 py-1 text-sm"
                >
                  <option value="newest">🕐 Newest</option>
                  <option value="oldest">🕐 Oldest</option>
                  <option value="urgent">🔴 Urgent First</option>
                </select>
              </div>
            </div>

            {allRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-lg font-medium">No requests yet</p>
                <p className="text-sm mt-1">Guest requests will appear here in real-time</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  + Add Request
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {allRequests.map(request => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getRequestTypeIcon(request.request_type)}</span>
                        <div>
                          <div className="flex items-center space-x-2 flex-wrap">
                            <span className="font-semibold text-gray-900">
                              Room {request.room_number}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                            {request.priority === 'urgent' && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                🔴 Urgent
                              </span>
                            )}
                            {request.priority === 'high' && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                ⚠️ High
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {request.description || `Request for ${request.request_type}`}
                          </p>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400 flex-wrap">
                            <span>📅 {request.requested_date}</span>
                            {request.requested_time && (
                              <span>🕐 {request.requested_time}</span>
                            )}
                            {request.preferred_time_slot && request.preferred_time_slot !== 'custom' && (
                              <span>⏰ {request.preferred_time_slot}</span>
                            )}
                            {request.assigned_staff_name && (
                              <span>👤 {request.assigned_staff_name}</span>
                            )}
                            <span>📝 {request.request_type}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <select
                        value={request.status}
                        onChange={(e) => handleStatusUpdate(request.id, e.target.value)}
                        className="border rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">📝 Add Request</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddRequest}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room *
                  </label>
                  <select
                    required
                    value={formData.room_id}
                    onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Room</option>
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>
                        Room {room.room_number} {room.room_type ? `(${room.room_type})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Request Type *
                  </label>
                  <select
                    required
                    value={formData.request_type}
                    onChange={(e) => setFormData({ ...formData, request_type: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    {requestTypes.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.requested_date}
                    onChange={(e) => setFormData({ ...formData, requested_date: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Slot
                  </label>
                  <select
                    value={formData.preferred_time_slot}
                    onChange={(e) => setFormData({ ...formData, preferred_time_slot: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    {timeSlots.map(slot => (
                      <option key={slot} value={slot}>
                        {slot.charAt(0).toUpperCase() + slot.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                {formData.preferred_time_slot === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Custom Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.requested_time}
                      onChange={(e) => setFormData({ ...formData, requested_time: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the request..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">🟢 Low</option>
                    <option value="normal">🔵 Normal</option>
                    <option value="high">🟠 High</option>
                    <option value="urgent">🔴 Urgent</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}