import React, { useEffect, useState, useRef } from "react";
import {
  FaCheckCircle,
  FaHistory,
  FaTimesCircle,
  FaEye,
  FaTimes,
  FaSearch,FaUser, FaCalendarAlt, FaUsers, FaTag, FaMoneyBillWave,
  FaMapMarkerAlt, FaBed, FaHome, FaFileInvoice,  FaExclamationTriangle, FaEdit
} from "react-icons/fa";
import DashboardNavBar from "../../components/Navbar";
import DashboardTabs from "./DashboardTabs";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";
import { format } from "date-fns";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import WarningPopup from '../../components/WarningPopup';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MetricCard = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-2xl p-5 shadow-md flex items-center space-x-4 border-l-4 border-blue-500">
    <div className={`text-${color}-600 text-3xl`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <h4 className="text-xl font-semibold">{value}</h4>
    </div>
  </div>
);

const BookingTable = ({ title, bookings, onViewMore, color = "white" }) => {
  const bgMap = {
    white: "bg-white/80",
    blue: "bg-blue-50",
    green: "bg-green-50",
    red: "bg-red-50",
  };

  return (
    <div className={`${bgMap[color]} rounded-xl shadow-lg overflow-hidden mb-12`}>
      <div className="flex justify-between items-center px-6 pt-4 pb-2">
        <h3 className="text-lg font-bold text-gray-700">{title}</h3>
      </div>
      <div className="max-h-[550px] overflow-y-auto overflow-x-auto">
        <table className="w-full text-sm sm:text-base table-fixed">
          <thead className="sticky top-0 bg-white backdrop-blur-md z-10 shadow-sm">
            <tr className="text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              <th className="w-[14%] px-6 py-3">Customer</th>
              <th className="w-[12%] px-6 py-3">Check-In</th>
              <th className="w-[12%] px-6 py-3">Check-Out</th>
              <th className="w-[18%] px-6 py-3">Guests</th>
              <th className="w-[12%] px-6 py-3">Type</th>
              <th className="w-[12%] px-6 py-3">Total</th>
              <th className="w-[12%] px-6 py-3">Status</th>
              <th className="w-[8%] px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bookings.map((b) => (
              <tr key={b.booking_id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium text-gray-900 truncate">{b.full_name}</td>
                <td className="px-6 py-4 text-gray-700">{format(new Date(b.check_in_date), "MM/dd/yyyy")}</td>
                <td className="px-6 py-4 text-gray-700">{format(new Date(b.check_out_date), "MM/dd/yyyy")}</td>
                <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                  {b.num_adults} Adults, {b.num_children} Children
                </td>
                <td className="px-6 py-4 text-gray-700 capitalize">{b.stay_type}</td>
                <td className="px-6 py-4 text-gray-700">₱{parseFloat(b.total_price).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                    b.booking_status === "confirmed"
                      ? "bg-blue-100 text-blue-700"
                      : b.booking_status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {b.booking_status.charAt(0).toUpperCase() + b.booking_status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                    onClick={() => onViewMore(b)}
                  >
                    <FaEye /> View More
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const BookingModal = ({ booking, onClose, onRefresh }) => {
  const modalRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleAcceptBooking = async () => {
    console.log("Accepting booking:", booking.booking_id);
  
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL_OWNER}/change-bookingstatus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          booking_id: booking.booking_id,
          new_status: "confirmed"
        })
      });
  
      const data = await res.json();
      console.log("Response from server:", data);
  
      if (res.ok) {
        alert("Booking accepted successfully!");
        await onRefresh();
        onClose();
      } else {
        alert("Failed to accept booking.");
      }
    } catch (err) {
      console.error("Error updating booking status:", err);
      alert("Something went wrong.");
    }
  };

  if (!booking) return null;

  const receiptUrl = booking.gcash_receipt
    ? `${process.env.REACT_APP_API_URL}${booking.gcash_receipt}`
    : null;

  const showAccept = booking.booking_status === "pending";
  const showReschedule = !["pending", "completed", "cancelled"].includes(booking.booking_status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
      <div
        ref={modalRef}
        className="bg-white p-6 rounded-2xl max-w-3xl w-full relative shadow-2xl border border-gray-200"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <FaFileInvoice className="text-blue-500" /> Booking Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <FaUser className="text-blue-400" />
            <p><strong>Customer:</strong> {booking.full_name}</p>
          </div>
          <div className="flex items-center gap-2">
            <FaFileInvoice className="text-gray-400" />
            <p><strong>Booking ID:</strong> {booking.booking_id}</p>
          </div>
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-green-500" />
            <p><strong>Check-In:</strong> {new Date(booking.check_in_date).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-red-500" />
            <p><strong>Check-Out:</strong> {new Date(booking.check_out_date).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <FaUsers className="text-purple-500" />
            <p><strong>Guests:</strong> {booking.num_adults} Adults, {booking.num_children} Children</p>
          </div>
          <div className="flex items-center gap-2">
            <FaTag className="text-yellow-500" />
            <p><strong>Stay Type:</strong> {booking.stay_type}</p>
          </div>
          <div className="flex items-center gap-2">
            <FaMoneyBillWave className="text-green-600" />
            <p><strong>Total:</strong> ₱{parseFloat(booking.total_price).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <FaCheckCircle className="text-indigo-500" />
            <p><strong>Payment Status:</strong> {booking.payment_status}</p>
          </div>
          <div className="flex items-center gap-2">
            <FaCheckCircle className="text-pink-500" />
            <p><strong>Status:</strong> {booking.booking_status}</p>
          </div>
          <div className="flex items-center gap-2">
            <FaBed className="text-gray-600" />
            <p><strong>Room:</strong> {booking.room_name || "N/A"}</p>
          </div>
          <div className="flex items-center gap-2">
            <FaHome className="text-orange-500" />
            <p><strong>Property:</strong> {booking.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-blue-600" />
            <p><strong>Location:</strong> {booking.city}, {booking.province}, {booking.country}</p>
          </div>
        </div>

        {receiptUrl && (
          <div className="mt-6 text-center bg-gray-50 p-4 rounded-xl border">
            <p className="mb-2 font-semibold text-gray-700 flex items-center justify-center gap-2">
              <FaFileInvoice className="text-blue-500" /> GCash Receipt
            </p>
            <a
              href={receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-sm text-blue-600 underline hover:text-blue-800"
            >
              View Receipt
            </a>
            <div className="mt-3">
              <img
                src={receiptUrl}
                alt="GCash Receipt"
                className="max-h-64 mx-auto rounded-lg shadow border"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-3">
        {showAccept && (
          <button
            onClick={handleAcceptBooking}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Accept Booking
          </button>
        )}
          <button className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
            <FaExclamationTriangle /> Report Booking
          </button>
          {showReschedule && (
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
              <FaEdit /> Reschedule
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


export default function Bookings() {
  const { user, loading, fetchUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [lastCheck, setLastCheck] = useState(Date.now());

  const [calendarBookings, setCalendarBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const bookingsOnSelectedDate = bookings.filter((b) => {
    const checkIn = new Date(b.check_in_date).toDateString();
    return checkIn === selectedDate.toDateString();
  });

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const booked = bookings.some(b => {
        const d = new Date(b.check_in_date);
        return d.toDateString() === date.toDateString();
      });
      return booked ? 'bg-blue-100 text-blue-700 font-semibold' : null;
    }
    return null;
  };

  useEffect(() => {
    const init = async () => {
      if (!user && !loading) {
        const fetched = await fetchUser();
        if (!fetched) return navigate("/login");
        await loadBookings(fetched.userId);
      } else if (user?.userId) {
        await loadBookings(user.userId);
      }
      setInitializing(false);
    };
    init();
  }, [user, loading, fetchUser, navigate]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL_OWNER}/new-entry`);
        const data = await res.json();
  
        if (data?.new || data?.timestamp > lastCheck) {
          // New entry detected
          setLastCheck(Date.now());
          if (user?.userId) {
            await loadBookings(user.userId); // Refresh bookings
          }
        }
      } catch (err) {
        console.error("Error checking for new entry:", err);
      }
    }, 10000); // Poll every 10 seconds
  
    return () => clearInterval(interval); // Clean up on unmount
  }, [user, lastCheck]);

  useEffect(() => {
    console.log("Fetched bookings:", bookings);
    console.log("Upcoming:", getUpcomingBookings());
    console.log("Ongoing:", getOngoingBookings());
    console.log("Completed:", getCompletedBookings());
    console.log("Cancelled:", getCancelledBookings());
  }, [bookings]);
  

  const loadBookings = async (lessorId) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL_OWNER}/bookings/lessor/${lessorId}`);
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : data?.bookings || []);
    } catch (err) {
      console.error("Error loading bookings:", err);
      setBookings([]);
    }
  };

  const now = new Date();

  const matchesSearch = (b) => {
    const q = search.toLowerCase();
    return (
      b.full_name?.toLowerCase().includes(q) ||
      b.title?.toLowerCase().includes(q)
    );
  };

  const getUpcomingBookings = () =>
    bookings.filter(b =>
      new Date(b.check_in_date) > now &&
      b.booking_status !== 'cancelled' &&
      matchesSearch(b)
    );
  
  const getOngoingBookings = () =>
    bookings.filter(b => {
      const checkIn = new Date(b.check_in_date);
      const checkOut = new Date(b.check_out_date);
      return (
        checkIn <= now &&
        checkOut >= now &&
        b.booking_status !== 'cancelled' &&
        matchesSearch(b)
      );
    });
  
  const getCompletedBookings = () =>
    bookings.filter(b =>
      new Date(b.check_out_date) < now &&
      b.booking_status === 'completed' &&
      matchesSearch(b)
    );
  
  const getCancelledBookings = () =>
    bookings.filter(b =>
      b.booking_status === 'cancelled' &&
      matchesSearch(b)
    );

    const [tableFilters, setTableFilters] = useState({
      upcoming: true,
      ongoing: true,
      completed: true,
      cancelled: true
    });
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    
    const toggleFilter = (key) => {
      setTableFilters(prev => ({ ...prev, [key]: !prev[key] }));
    };

  if (loading || initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <DashboardNavBar />
      <DashboardTabs />
      <div className="pt-36 px-6 pb-20 bg-gray-100 min-h-screen">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-700 mb-6">Booking Overview</h1>
  
          {/* Booking Calendar Section */}
          <div className="w-full bg-white p-6 rounded-2xl shadow mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Booking Calendar</h2>
            <div className="w-full flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                tileClassName={tileClassName}
                className="text-sm shadow-lg rounded-xl border p-4 w-full max-w-md mx-auto xl:mx-0"
              />
              <div className="flex-1">
                {bookingsOnSelectedDate.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bookingsOnSelectedDate.map((b) => (
                      <div key={b.booking_id} className="bg-white border border-gray-200 rounded-lg shadow p-4">
                        <img
                          src={`${process.env.REACT_APP_API_URL}${b.thumbnail_url?.[0] || '/default.png'}`}
                          alt={b.title}
                          className="w-full h-40 object-cover rounded-md mb-3"
                        />
                        <h3 className="font-bold text-lg text-gray-700 mb-1">{b.title}</h3>
                        <p className="text-gray-600 text-sm">{b.room_name} - {b.room_type}</p>
                        <p className="text-gray-600 text-sm">{b.city}, {b.province}, {b.country}</p>
                        <p className="text-gray-500 text-sm">
                          {format(new Date(b.check_in_date), 'MMM dd')} - {format(new Date(b.check_out_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 mt-2 text-center text-sm">No bookings for the selected date.</p>
                )}
              </div>
            </div>
          </div>
  
          {/* Search and Filter Controls */}
          <div className="flex justify-between items-center mb-6 relative">
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or property"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              </div>
  
              {/* Filters */}
              <div className="relative">
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="px-3 py-2 border rounded-md bg-white shadow hover:bg-gray-100 text-sm"
                >
                  Filters
                </button>
  
                {showFilterDropdown && (
                  <div className="absolute top-12 right-0 bg-white shadow-lg rounded-md border w-52 z-50 p-3 space-y-2">
                    {[
                      { key: "upcoming", label: "Upcoming Bookings" },
                      { key: "ongoing", label: "Ongoing Bookings" },
                      { key: "completed", label: "Completed Bookings" },
                      { key: "cancelled", label: "Cancelled Bookings" }
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={tableFilters[key]}
                          onChange={() => toggleFilter(key)}
                          className="accent-blue-600"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
  
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <MetricCard icon={<FaCheckCircle />} label="Upcoming Bookings" value={getUpcomingBookings().length} color="blue" />
            <MetricCard icon={<FaCheckCircle />} label="Ongoing Bookings" value={getOngoingBookings().length} color="green" />
            <MetricCard icon={<FaHistory />} label="Completed Bookings" value={getCompletedBookings().length} color="gray" />
            <MetricCard icon={<FaTimesCircle />} label="Cancelled Bookings" value={getCancelledBookings().length} color="red" />
          </div>
  
          {/* Booking Tables */}
          {(() => {
            const components = [];
            if (tableFilters.upcoming) components.push(
              <BookingTable key="upcoming" title="Upcoming Bookings" bookings={getUpcomingBookings()} onViewMore={setSelectedBooking} color="blue" />
            );
            if (tableFilters.ongoing) components.push(
              <BookingTable key="ongoing" title="Ongoing Bookings" bookings={getOngoingBookings()} onViewMore={setSelectedBooking} color="green" />
            );
            if (tableFilters.completed) components.push(
              <BookingTable key="completed" title="Completed Bookings" bookings={getCompletedBookings()} onViewMore={setSelectedBooking} color="gray" />
            );
            if (tableFilters.cancelled) components.push(
              <BookingTable key="cancelled" title="Cancelled Bookings" bookings={getCancelledBookings()} onViewMore={setSelectedBooking} color="red" />
            );
  
            const columnClass =
              components.length >= 4 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2" :
              components.length === 3 ? "grid-cols-1 sm:grid-cols-2" :
              "grid-cols-1";
  
            return (
              <div className={`grid ${columnClass} gap-6`}>
                {components}
              </div>
            );
          })()}
        </div>
      </div>
      {selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onRefresh={() => loadBookings(user.user_id)}
        />
      )}
    </>
  );
}  