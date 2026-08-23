import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { guestService } from '../../services/guestService';
import toast from 'react-hot-toast';

export default function RoomEntry() {
  const { propertyId, roomNumber } = useParams();
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);

  useEffect(() => {
    if (!propertyId || !roomNumber) {
      navigate('/login');
    }
  }, [propertyId, roomNumber, navigate]);

  useEffect(() => {
    let interval;
    if (isLocked && lockTimer > 0) {
      interval = setInterval(() => {
        setLockTimer(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setAttempts(0);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLocked, lockTimer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLocked) {
      setError(`Too many failed attempts. Please wait ${lockTimer} seconds.`);
      return;
    }

    if (!pin || pin.length < 4) {
      setError('Please enter a valid PIN (minimum 4 digits)');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await guestService.verifyRoom(propertyId, roomNumber, pin);
      
      if (result.success) {
        setAttempts(0);
        
        localStorage.setItem('guestToken', result.token);
        localStorage.setItem('guestRoom', JSON.stringify({
          roomId: result.room.id,
          roomNumber: result.room.number,
          propertyId: propertyId,
          roomType: result.room.type || 'Standard'
        }));
        
        toast.success('✅ Welcome to your stay!');
        navigate(`/guest/dashboard/${propertyId}/${roomNumber}`, { 
          replace: true,
          state: { 
            roomNumber: result.room.number,
            propertyId: propertyId,
            roomId: result.room.id
          }
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      
      if (error.response?.status === 401) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= 3) {
          setIsLocked(true);
          setLockTimer(30);
          setError(`❌ Too many failed attempts. Please wait 30 seconds before trying again.`);
          toast.error('Too many failed attempts. Please wait 30 seconds.');
          setPin('');
        } else {
          const remaining = 3 - newAttempts;
          setError(`❌ Invalid PIN. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`);
          toast.error(`Invalid PIN. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`);
          setPin('');
        }
      } else if (error.response?.status === 404) {
        setError('❌ Room not found. Please check the QR code.');
        toast.error('Room not found');
      } else {
        setError('❌ Something went wrong. Please try again.');
        toast.error('Failed to verify PIN');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setPin(value);
    if (error && !isLocked) {
      setError('');
    }
  };

  if (!propertyId || !roomNumber) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid QR Code</h2>
          <p className="text-gray-600 mb-6">Please scan a valid QR code to access your room.</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-blue-600 mb-2">StayDeck</div>
          <div className="text-sm text-gray-600">Welcome to your stay</div>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Room Number</div>
            <div className="text-2xl font-bold text-gray-900">{roomNumber}</div>
          </div>
        </div>

        {error && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            isLocked ? 'bg-red-50 border border-red-200 text-red-600' : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
          }`}>
            <div className="flex items-start">
              <span className="mr-2">{isLocked ? '🔒' : '⚠️'}</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {isLocked && lockTimer > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-medium text-center">
              ⏳ Please wait {lockTimer} seconds before trying again
            </p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(lockTimer / 30) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room PIN
            </label>
            <input
              type="password"
              value={pin}
              onChange={handlePinChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest ${
                error && !isLocked ? 'border-red-500' : 'border-gray-300'
              } ${isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="Enter 4-8 digit PIN"
              maxLength="8"
              required
              disabled={isLocked || loading}
              autoFocus={!isLocked}
            />
            <p className="mt-2 text-xs text-gray-500 text-center">
              Enter the PIN provided by the property owner
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || isLocked}
            className={`w-full text-white py-3 rounded-lg transition-colors text-lg font-medium ${
              loading || isLocked 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : (
              'Enter Your Stay'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← Back to Login
          </button>
        </div>

        {!isLocked && attempts > 0 && attempts < 3 && (
          <div className="mt-4 text-center text-xs text-gray-500">
            Attempts remaining: {3 - attempts}
          </div>
        )}

        <div className="mt-4 text-center text-xs text-gray-400">
          Scan the QR code in your room to access your stay.
        </div>
      </div>
    </div>
  );
}