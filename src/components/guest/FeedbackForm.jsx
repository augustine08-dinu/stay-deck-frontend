import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { guestService } from '../../services/guestService';
import toast from 'react-hot-toast';

export default function FeedbackForm() {
  const navigate = useNavigate();
  const { propertyId, roomNumber } = useParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    overall_rating: 5,
    cleanliness_rating: 5,
    staff_rating: 5,
    service_rating: 5,
    room_comfort_rating: 5,
    value_rating: 5,
    comment: '',
    would_recommend: true
  });
  const [responseMessage, setResponseMessage] = useState('');
  const [showGoogleReview, setShowGoogleReview] = useState(false);

  const ratings = [
    { value: 5, label: 'Excellent 🌟' },
    { value: 4, label: 'Good 👍' },
    { value: 3, label: 'Average 🤔' },
    { value: 2, label: 'Poor 😕' },
    { value: 1, label: 'Terrible 😡' }
  ];

  const ratingCategories = [
    { key: 'overall_rating', label: 'Overall Experience' },
    { key: 'cleanliness_rating', label: 'Cleanliness' },
    { key: 'staff_rating', label: 'Staff Service' },
    { key: 'service_rating', label: 'Room Service' },
    { key: 'room_comfort_rating', label: 'Room Comfort' },
    { key: 'value_rating', label: 'Value for Money' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await guestService.submitFeedback(formData);
      
      setResponseMessage(response.responseMessage);
      setShowGoogleReview(response.showGoogleReview);
      
      toast.success('Thank you for your feedback!');
      
      if (response.showGoogleReview) {
        const shouldReview = window.confirm(
          `${response.responseMessage}\n\nWould you like to leave a Google review?`
        );
        if (shouldReview) {
          window.open('https://g.page/r/...', '_blank');
        }
        navigate(`/guest/dashboard/${propertyId}/${roomNumber}`);
      } else {
        setTimeout(() => {
          navigate(`/guest/dashboard/${propertyId}/${roomNumber}`);
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(error.response?.data?.error || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (category, value) => {
    setFormData({ ...formData, [category]: value });
  };

  const renderStars = (rating, interactive = false, onChange) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange && onChange(star)}
            className={`text-2xl transition-colors ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            } ${interactive ? 'hover:scale-110' : ''}`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">⭐</div>
          <h2 className="text-2xl font-bold text-gray-900">How was your stay?</h2>
          <p className="text-sm text-gray-500">Room {roomNumber}</p>
        </div>

        {responseMessage ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {responseMessage}
            </h3>
            <p className="text-gray-500">
              Redirecting to dashboard...
            </p>
            {showGoogleReview && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  Would you like to share your experience on Google?
                </p>
                <button
                  onClick={() => {
                    window.open('https://g.page/r/...', '_blank');
                  }}
                  className="mt-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Leave Google Review
                </button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {ratingCategories.map((category) => (
              <div key={category.key} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    {category.label}
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">
                      {ratings.find(r => r.value === formData[category.key])?.label || ''}
                    </span>
                    {renderStars(
                      formData[category.key],
                      true,
                      (value) => handleRatingChange(category.key, value)
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Would you recommend us to others?
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, would_recommend: true })}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    formData.would_recommend
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ✅ Yes
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, would_recommend: false })}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    !formData.would_recommend
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ❌ No
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What could we improve? (Optional)
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                rows="4"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Tell us about your experience..."
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => navigate(`/guest/dashboard/${propertyId}/${roomNumber}`)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Skip
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}