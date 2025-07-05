import React, { useState, useEffect } from 'react';

export default function GuestRedirectModal({ isOpen, onClose, otherRoles, userType, userId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  
  useEffect(() => {
    const hasGuestAccess =
      (typeof otherRoles === 'string' && otherRoles.includes('guest')) ||
      userType === 'guest';
    setIsGuest(hasGuestAccess);
  }, [otherRoles, userType]);

  if (!isOpen) return null;

  const handleClick = async () => {
    setIsLoading(true);

    const apiUrl = process.env.REACT_APP_API_URL;         // Guest server base URL
    const guestRedirectBase = process.env.REACT_APP_CLIENT_URL; // Guest client base URL

    try {
      const endpoint = isGuest ? '/api/auto-login' : '/api/auto-login/register';

      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ user_id: userId }),
      });

      if (!res.ok) throw new Error('Failed request');

      const data = await res.json();
      const { token } = data;
      if (!token) throw new Error('No token returned');

      // Redirect to guest client with token
      window.location.href = `${guestRedirectBase}?token=${encodeURIComponent(token)}`;
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center">
      <div className="bg-white rounded-xl p-6 w-80 text-center shadow-lg">
        <h2 className="text-xl font-bold mb-4">
          {isGuest ? 'Switch to Guest Mode' : 'Become a Guest'}
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          {isGuest
            ? 'You already have a guest account. Let’s go to your guest dashboard.'
            : 'Create a guest account and explore listings as a traveler.'}
        </p>
        <button
          onClick={handleClick}
          disabled={isLoading}
          className={`px-4 py-2 rounded-full w-full font-semibold text-white ${
            isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading
            ? 'Redirecting...'
            : isGuest
            ? 'Go to Guest Dashboard'
            : 'Register as Guest'}
        </button>
        <button
          onClick={onClose}
          disabled={isLoading}
          className="mt-4 text-sm text-gray-500 underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
