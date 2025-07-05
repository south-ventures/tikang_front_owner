import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  FaThLarge,
  FaHome,
  FaFileAlt,
  FaUsers,
} from 'react-icons/fa';

const tabs = [
  { label: 'Dashboard', icon: <FaThLarge />, path: '/dashboard' },
  { label: 'Properties', icon: <FaHome />, path: '/dashboard/properties' },
  { label: 'Bookings', icon: <FaFileAlt />, path: '/dashboard/bookings' },
  { label: 'Guests', icon: <FaUsers />, path: '/dashboard/guests' },
];

export default function DashboardTabs() {
  const { pathname } = useLocation();

  const handleRedirect = (path) => {
    if (pathname !== path) {
      window.location.href = path; // ✅ Force full page reload
    }
  };

  return (
    <div className="fixed top-[72px] left-1/2 transform -translate-x-1/2 z-40 bg-white rounded-xl shadow-md px-6 py-2 flex gap-6">
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;

        return (
          <button
            key={tab.path}
            onClick={() => handleRedirect(tab.path)}
            className={`flex items-center gap-2 text-sm font-medium transition ${
              isActive ? 'text-green-600' : 'text-gray-500 hover:text-green-600'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
