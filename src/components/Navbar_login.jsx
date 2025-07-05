import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuth } from '../context/AuthContext';
import GuestRedirectModal from './GuestRedirectModal';

export default function NavBar() {
  const { user } = useAuth();
  const [showGuestModal, setShowGuestModal] = useState(false);

  const isGuestInRole =
    user?.other_role?.includes?.('guest') || user?.user_type === 'guest';

  return (
    <>
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between px-6 py-3">
          {/* Left: Logo + Title */}
          <Link to="/" className="flex items-center gap-3">
              <img
              src={`${process.env.REACT_APP_API_URL}/uploads/logo/logo.png`}
              alt="Tikang Logo"
              className="h-16 w-auto object-contain cursor-pointer"
              onError={e => { e.currentTarget.src = '/fallback-logo.png'; }} // optional fallback
            />
            <span className="text-lg sm:text-xl font-semibold text-gray-900">
              Homeowner Centre
            </span>
          </Link>

          {/* Right: Buttons */}
          <div className="flex items-center gap-4">
            {isGuestInRole && (
              <button
                onClick={() => setShowGuestModal(true)}
                className="text-sm sm:text-base text-green-600 font-medium hover:underline"
              >
                Switch to Guest
              </button>
            )}
            <Link
              to="/help"
              className="text-sm sm:text-base text-black-600 hover:underline font-medium"
            >
              Need help?
            </Link>
          </div>
        </div>
      </nav>

      {/* Guest Modal */}
      {showGuestModal && (
        <GuestRedirectModal
          isOpen={showGuestModal}
          onClose={() => setShowGuestModal(false)}
          otherRoles={user?.other_role}
          userType={user?.user_type}
          userId={user?.user_id}
        />
      )}
    </>
  );
}
