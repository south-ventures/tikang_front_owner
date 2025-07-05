import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import GuestRedirectModal from './GuestRedirectModal';

export default function DashboardNavBar() {
  const { user, logout } = useAuth();
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [problemText, setProblemText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitProblem = async () => {
    if (!problemText.trim()) return alert("Please describe your problem.");
    setSubmitting(true);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL_OWNER}/submit-problem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.user_id,
          message: problemText,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Problem submitted successfully.");
        setProblemText('');
        setShowReportModal(false);
      } else {
        alert(data.message || "Failed to submit.");
      }
    } catch (err) {
      console.error("Error submitting problem:", err);
      alert("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <nav className="w-full bg-white shadow-md px-6 py-4 flex justify-center relative z-50">
        <div className="flex items-center gap-6 text-gray-700 text-sm font-medium">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link to="/dashboard">
            <img
              src={`${process.env.REACT_APP_API_URL}/uploads/logo/logo.png`}
              alt="Tikang Logo"
              className="h-16 w-auto object-contain cursor-pointer"
              onError={e => { e.currentTarget.src = '/fallback-logo.png'; }} // optional fallback
            />
            </Link>
          </div>

          {/* Profile & Actions */}
          {user && (
            <div className="flex items-center gap-3">
              <Link to="/account">
                <FaUserCircle className="text-2xl hover:text-blue-500 transition cursor-pointer" />
              </Link>

              {/* Switch to Guest */}
              <button
                onClick={() => setShowGuestModal(true)}
                className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition"
              >
                Switch to Guest
              </button>

              {/* Report a Problem */}
              <button
                onClick={() => setShowReportModal(true)}
                className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition"
              >
                Report
              </button>

              {/* Logout */}
              <button
                onClick={logout}
                className="px-3 py-1 text-xs font-medium bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Guest Redirect Modal */}
      {showGuestModal && (
        <GuestRedirectModal
          isOpen={showGuestModal}
          onClose={() => setShowGuestModal(false)}
          otherRoles={user?.other_role}
          userType={user?.user_type}
          userId={user?.user_id}
        />
      )}

      {/* Report a Problem Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center px-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl animate-fadeIn">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Report a Problem</h3>
            <textarea
              rows={4}
              className="w-full border rounded-md p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
              placeholder="Describe the issue you're facing..."
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
            ></textarea>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitProblem}
                disabled={submitting}
                className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md text-sm"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
