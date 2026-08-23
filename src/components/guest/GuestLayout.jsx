import React, { useEffect } from 'react';
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';

export default function GuestLayout() {
  const navigate = useNavigate();
  const { propertyId, roomNumber } = useParams();

  useEffect(() => {
    const token = localStorage.getItem('guestToken');
    const room = localStorage.getItem('guestRoom');
    
    console.log('🔍 GuestLayout mounted');
    console.log('🔍 URL Params:', { propertyId, roomNumber });
    
    if (!token || !room) {
      console.log('❌ No guest session, redirecting to login');
      navigate('/login', { replace: true });
    }
  }, [navigate, propertyId, roomNumber]);

  const roomData = JSON.parse(localStorage.getItem('guestRoom') || '{}');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link to={`/guest/dashboard/${propertyId || roomData.propertyId || ''}/${roomNumber || roomData.roomNumber || ''}`} className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">StayDeck</span>
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Guest</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Room {roomNumber || roomData.roomNumber || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <p className="text-center text-xs text-gray-500">
            © {new Date().getFullYear()} StayDeck • Guest Portal
          </p>
        </div>
      </footer>
    </div>
  );
}