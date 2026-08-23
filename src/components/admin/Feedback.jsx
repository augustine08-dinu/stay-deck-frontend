import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { feedbackService } from '../../services/feedbackService';
import { useSocket } from '../../hooks/useSocket';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Feedback() {
  const { selectedProperty } = useOutletContext();
  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  const { socket } = useSocket(selectedProperty, 'property');

  useEffect(() => {
    if (selectedProperty) {
      fetchData();
    }
  }, [selectedProperty]);

  useEffect(() => {
    if (socket) {
      socket.on('new-feedback', (newFeedback) => {
        setFeedback(prev => [newFeedback, ...prev]);
        toast.success(`New feedback received: ${newFeedback.overall_rating}⭐`);
        fetchStats();
      });

      socket.on('urgent-feedback-alert', (alert) => {
        toast.error(`⚠️ Low rating alert from Room ${alert.feedback.room_id}`);
      });

      return () => {
        socket.off('new-feedback');
        socket.off('urgent-feedback-alert');
      };
    }
  }, [socket]);

  const fetchData = async () => {
    try {
      await Promise.all([fetchFeedback(), fetchStats()]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async () => {
    try {
      const filters = {};
      if (filter === 'high') filters.min_rating = 4;
      if (filter === 'low') filters.max_rating = 2;
      if (filter === 'public') filters.is_public = true;
      
      const data = await feedbackService.getAll(selectedProperty, filters);
      setFeedback(data);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error('Failed to load feedback');
    }
  };

  const fetchStats = async () => {
    try {
      const data = await feedbackService.getStats(selectedProperty);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total_reviews || 0}</div>
            <div className="text-sm text-gray-500">Total Reviews</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className={`text-2xl font-bold ${getRatingColor(Math.round(stats.avg_overall || 0))}`}>
              {stats.avg_overall ? stats.avg_overall.toFixed(1) : 'N/A'}
            </div>
            <div className="text-sm text-gray-500">Average Rating</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.positive_reviews || 0}</div>
            <div className="text-sm text-gray-500">Positive Reviews (4-5⭐)</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.negative_reviews || 0}</div>
            <div className="text-sm text-gray-500">Negative Reviews (1-2⭐)</div>
          </div>
        </div>
      )}

      {/* Detailed Stats */}
      {stats && stats.avg_overall && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Category Ratings</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Cleanliness</span>
                <span className="font-medium">{stats.avg_cleanliness?.toFixed(1) || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Staff</span>
                <span className="font-medium">{stats.avg_staff?.toFixed(1) || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Service</span>
                <span className="font-medium">{stats.avg_service?.toFixed(1) || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Room Comfort</span>
                <span className="font-medium">{stats.avg_room_comfort?.toFixed(1) || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Value</span>
                <span className="font-medium">{stats.avg_value?.toFixed(1) || 'N/A'}</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Recommendation</h4>
            <div className="flex items-center space-x-4">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.would_recommend_count || 0}
                </div>
                <div className="text-xs text-gray-500">Would Recommend</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {stats.would_not_recommend_count || 0}
                </div>
                <div className="text-xs text-gray-500">Would Not Recommend</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Public Reviews</h4>
            <div className="text-2xl font-bold text-gray-900">
              {stats.public_reviews || 0}
            </div>
            <div className="text-xs text-gray-500">
              {stats.total_reviews > 0 
                ? `${Math.round((stats.public_reviews / stats.total_reviews) * 100)}% of total`
                : 'No reviews yet'}
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          {[
            { value: 'all', label: 'All' },
            { value: 'high', label: 'High Rating (4-5⭐)' },
            { value: 'low', label: 'Low Rating (1-2⭐)' },
            { value: 'public', label: 'Public' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setFilter(option.value);
                fetchFeedback();
              }}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filter === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {feedback.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">📝</div>
            <p>No feedback yet</p>
          </div>
        ) : (
          feedback.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-4">
                    <div className={`text-xl font-bold ${getRatingColor(item.overall_rating)}`}>
                      {item.overall_rating}.0
                    </div>
                    <div className="text-lg">
                      {renderStars(item.overall_rating)}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.is_public ? 'Public' : 'Private'}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Room {item.room_number} • {item.guest_name || 'Anonymous Guest'}
                  </div>
                  {item.comment && (
                    <p className="mt-2 text-gray-700">{item.comment}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
                    <span>📅 {new Date(item.created_at).toLocaleDateString()}</span>
                    {item.cleanliness_rating && (
                      <span>🧹 Cleanliness: {item.cleanliness_rating}⭐</span>
                    )}
                    {item.staff_rating && (
                      <span>👤 Staff: {item.staff_rating}⭐</span>
                    )}
                    {item.service_rating && (
                      <span>🛎️ Service: {item.service_rating}⭐</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFeedback(item)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Feedback Details Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Feedback Details</h3>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Room</label>
                <p className="font-medium">Room {selectedFeedback.room_number}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Guest</label>
                <p>{selectedFeedback.guest_name || 'Anonymous'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Overall Rating</label>
                <div className="flex items-center space-x-2">
                  <span className={`text-xl font-bold ${getRatingColor(selectedFeedback.overall_rating)}`}>
                    {selectedFeedback.overall_rating}.0
                  </span>
                  <span className="text-lg">{renderStars(selectedFeedback.overall_rating)}</span>
                </div>
              </div>
              
              {selectedFeedback.cleanliness_rating && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Cleanliness</label>
                  <p>{selectedFeedback.cleanliness_rating}⭐</p>
                </div>
              )}
              {selectedFeedback.staff_rating && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Staff</label>
                  <p>{selectedFeedback.staff_rating}⭐</p>
                </div>
              )}
              {selectedFeedback.service_rating && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Service</label>
                  <p>{selectedFeedback.service_rating}⭐</p>
                </div>
              )}
              {selectedFeedback.room_comfort_rating && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Room Comfort</label>
                  <p>{selectedFeedback.room_comfort_rating}⭐</p>
                </div>
              )}
              {selectedFeedback.value_rating && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Value</label>
                  <p>{selectedFeedback.value_rating}⭐</p>
                </div>
              )}
              
              {selectedFeedback.comment && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Comment</label>
                  <p className="text-gray-700">{selectedFeedback.comment}</p>
                </div>
              )}
              
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Status</label>
                <p>{selectedFeedback.is_public ? 'Public' : 'Private'}</p>
              </div>
              
              {selectedFeedback.would_recommend !== undefined && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Would Recommend</label>
                  <p>{selectedFeedback.would_recommend ? '✅ Yes' : '❌ No'}</p>
                </div>
              )}
              
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Submitted</label>
                <p>{new Date(selectedFeedback.created_at).toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedFeedback(null)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}