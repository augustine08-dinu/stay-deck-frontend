import React, { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { guestService } from '../../services/guestService';
import toast from 'react-hot-toast';

export default function ServiceRequest() {
  const navigate = useNavigate();
  const location = useLocation();
  const { propertyId, roomNumber } = useParams();
  const requestType = location.state?.requestType || 'other';
  
  const [formData, setFormData] = useState({
    request_type: requestType,
    description: '',
    requested_date: new Date().toISOString().split('T')[0],
    requested_time: '',
    preferred_time_slot: 'morning'
  });
  const [loading, setLoading] = useState(false);

  const requestTypes = [
    { id: 'cleaning', label: '🧹 Cleaning', desc: 'Request room cleaning service' },
    { id: 'towels', label: '🛏️ Extra Towels', desc: 'Request additional towels' },
    { id: 'toiletries', label: '🧴 Toiletries', desc: 'Request toiletries (soap, shampoo, etc.)' },
    { id: 'water', label: '💧 Water', desc: 'Request drinking water' },
    { id: 'maintenance', label: '🔧 Maintenance', desc: 'Report maintenance issue' },
    { id: 'other', label: '🛎️ Other', desc: 'Other request' }
  ];

  const timeSlots = [
    { value: 'morning', label: '🌅 Morning (8AM - 12PM)' },
    { value: 'afternoon', label: '☀️ Afternoon (12PM - 5PM)' },
    { value: 'evening', label: '🌆 Evening (5PM - 9PM)' },
    { value: 'custom', label: '🕐 Custom Time' }
  ];

  const selectedType = requestTypes.find(t => t.id === requestType) || requestTypes[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        requested_date: formData.requested_date,
        requested_time: formData.preferred_time_slot === 'custom' ? formData.requested_time : null,
        preferred_time_slot: formData.preferred_time_slot
      };

      await guestService.createRequest(data);
      toast.success('✅ Request submitted successfully!');
      navigate(`/guest/dashboard/${propertyId}/${roomNumber}`);
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error(error.response?.data?.error || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">{selectedType.label}</div>
          <h2 className="text-xl font-bold text-gray-900">Service Request</h2>
          <p className="text-sm text-gray-500">Room {roomNumber}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Type
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-700">
              {selectedType.label}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              When do you need this? *
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={formData.requested_date}
              onChange={(e) => setFormData({ ...formData, requested_date: e.target.value })}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Time
            </label>
            <select
              value={formData.preferred_time_slot}
              onChange={(e) => setFormData({ ...formData, preferred_time_slot: e.target.value })}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {timeSlots.map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
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
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Tell us what you need..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(`/guest/dashboard/${propertyId}/${roomNumber}`)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}