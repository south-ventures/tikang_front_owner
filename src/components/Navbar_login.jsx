import React, { useState } from 'react';
import {
  FaSearch,
  FaCalendarAlt,
  FaShoppingCart,
  FaUserCircle,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import logo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchPopupOpen, setSearchPopupOpen] = useState(false);

  const handleChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <>
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between px-6 py-3">
        
        {/* Left: Logo + Title */}
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Tikang Logo" className="h-6 sm:h-8 object-contain" />
          <span className="text-lg sm:text-xl font-semibold text-gray-900">Homeowner Centre</span>
        </Link>

        {/* Right: Need Help */}
        <Link to="/help" className="text-sm sm:text-base text-black-600 hover:underline font-medium">
          Need help?
        </Link>
      </div>
    </nav>

      {/* Mobile Slide-Out Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="text-lg font-bold">Menu</span>
          <FaTimes
            className="text-xl cursor-pointer"
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>
        <div className="flex flex-col p-4 text-gray-700 gap-4 text-sm font-medium">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/owner" onClick={() => setMobileMenuOpen(false)}>List Your Property</Link>
          <Link to="#" onClick={() => setMobileMenuOpen(false)}>Favorites</Link>
          <Link to="#" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
            <FaShoppingCart /> Cart
          </Link>
          {user ? (
            <>
              <Link to="/account/information" onClick={() => setMobileMenuOpen(false)}>My Account</Link>
              <Link to="/account/bookings" onClick={() => setMobileMenuOpen(false)}>Bookings</Link>
              <Link to="/account/messages" onClick={() => setMobileMenuOpen(false)}>Messages</Link>
              <Link to="/account/tikangcash" onClick={() => setMobileMenuOpen(false)}>TikangCash</Link>
              <Link to="/account/reviews" onClick={() => setMobileMenuOpen(false)}>Reviews</Link>
              <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-left text-red-600">Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
              <FaUserCircle /> Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Search Popup */}
      {searchPopupOpen && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-bold">Search</span>
            <FaTimes className="text-2xl cursor-pointer" onClick={() => setSearchPopupOpen(false)} />
          </div>
          <input
            type="text"
            placeholder="Search for a place"
            className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4 text-sm"
          />
          <div className="flex items-center gap-2 mb-4">
            <FaCalendarAlt className="text-gray-500" />
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={handleChange}
              minDate={new Date()}
              placeholderText="Anytime"
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm"
              dateFormat="MMM d"
            />
          </div>
          <button
            onClick={() => setSearchPopupOpen(false)}
            className="bg-blue-500 text-white py-2 rounded-md text-sm font-semibold"
          >
            Search
          </button>
        </div>
      )}
    </>
  );
}
