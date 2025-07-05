  import React, { useEffect, useState, useRef, useCallback, useMemo   } from "react";
  import {
    FaCheckCircle,
    FaHistory,
    FaTimesCircle,
    FaEye,
    FaTimes,
    FaSearch,FaUser, FaCalendarAlt, FaUsers, FaTag, FaMoneyBillWave,
    FaMapMarkerAlt, FaBed, FaHome, FaFileInvoice,  FaExclamationTriangle, FaEdit, FaCommentDots, FaCalendarTimes
  } from "react-icons/fa";
  import DashboardNavBar from "../../components/Navbar";
  import DashboardTabs from "./DashboardTabs";
  import { useAuth } from "../../context/AuthContext";
  import { useNavigate } from "react-router-dom";
  import LoadingSpinner from "../../components/LoadingSpinner";
  import { format } from "date-fns";
  import Calendar from 'react-calendar';
  import 'react-calendar/dist/Calendar.css';
  import 'react-toastify/dist/ReactToastify.css';
  import DatePicker from "react-datepicker";
  import "react-datepicker/dist/react-datepicker.css";

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

const CancelBookingModal = ({ booking, onClose, onRefresh }) => {
  const [reason, setReason] = useState("");

  const handleCancel = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL_OWNER}/cancel-booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: booking.booking_id,
          reason,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(
          booking.booking_status === "pending"
            ? "Booking declined successfully!"
            : "Booking cancelled successfully!"
        );
        await onRefresh?.();
        onClose();
      } else {
        alert(data.message || "Action failed.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong.");
    }
  };

  if (!booking) return null;

  const isDecline = booking.booking_status === "pending";
  const actionText = isDecline ? "Decline Booking" : "Cancel Booking";
  const promptText = isDecline
    ? "declining"
    : "cancelling";

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-lg relative"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
        >
          <FaTimes />
        </button>
        <h2 className="text-xl font-bold text-gray-800 mb-4">{actionText}</h2>
        <p className="text-sm text-gray-600 mb-2">
          Please provide a reason for {promptText} this booking.
        </p>
        <textarea
          rows={4}
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
          placeholder="Enter reason..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleCancel}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-semibold"
          >
            {actionText}
          </button>
        </div>
      </div>
    </div>
  );
}

const RescheduleModal = ({ booking, onClose, onSubmit, onRefresh }) => {
  const [checkIn, setCheckIn] = useState(new Date(booking.check_in_date));
  const [checkOut, setCheckOut] = useState(new Date(booking.check_out_date));

  const formatDateLocal = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months start at 0
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`; // YYYY-MM-DD
  };
  
  const handleReschedule = async () => {
    if (!checkIn || !checkOut || checkIn >= checkOut) {
      alert("Invalid date range.");
      return;
    }
  
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL_OWNER}/reschedule-booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: booking.booking_id,
          new_check_in: formatDateLocal(checkIn),     // ✅ fixed for PH timezone
          new_check_out: formatDateLocal(checkOut),   // ✅ fixed
        }),
      });
  
      const data = await res.json();
      if (res.ok) {
        alert('Booking rescheduled successfully.');
        onRefresh?.();
        onClose();
      } else {
        alert(data.message || 'Failed to reschedule.');
      }
    } catch (err) {
      console.error(err);
      alert('Server error.');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white p-6 rounded-xl w-full max-w-lg shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-gray-800">Reschedule Booking</h2>

        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Check-In Date</label>
            <DatePicker
              selected={checkIn}
              onChange={(date) => {
                setCheckIn(date);
                if (checkOut && date >= checkOut) {
                  setCheckOut(null);
                }
              }}
              minDate={new Date()}
              maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
              selectsStart
              startDate={checkIn}
              endDate={checkOut}
              className="w-full border p-2 rounded-md text-sm"
              placeholderText="Select Check-In Date"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Check-Out Date</label>
            <DatePicker
              selected={checkOut}
              onChange={setCheckOut}
              minDate={checkIn ? new Date(checkIn.getTime() + 24 * 60 * 60 * 1000) : new Date()}
              maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
              selectsEnd
              startDate={checkIn}
              endDate={checkOut}
              className="w-full border p-2 rounded-md text-sm"
              placeholderText="Select Check-Out Date"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-300 text-sm">
            Cancel
          </button>
          <button
            onClick={handleReschedule}
            className="px-4 py-2 rounded bg-blue-600 text-white text-sm"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

const BookingModal = ({ booking, onClose, onRefresh }) => {
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const modalRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!showRescheduleModal && modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, showRescheduleModal]);

  const handleAcceptBooking = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL_OWNER}/change-bookingstatus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: booking.booking_id,
          new_status: "confirmed",
        }),
      });

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

  const handleReschedule = async (newCheckIn, newCheckOut) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL_OWNER}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: booking.booking_id,
          new_check_in: newCheckIn,
          new_check_out: newCheckOut,
        }),
      });

      if (res.ok) {
        alert("Booking rescheduled!");
        await onRefresh();
        onClose();
      } else {
        alert("Failed to reschedule.");
      }
    } catch (err) {
      console.error("Reschedule error:", err);
      alert("Something went wrong.");
    }
  };

  if (!booking) return null;

  const receiptUrl = booking.gcash_receipt
    ? `${process.env.REACT_APP_API_URL}${booking.gcash_receipt}`
    : null;

  return (
    <>
      {!showRescheduleModal && (
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
              {booking.cancelled_date && (
                <div className="flex items-center gap-2">
                  <FaCalendarTimes className="text-red-500" />
                  <p>
                    <strong>Cancelled Date:</strong>{" "}
                    {new Date(booking.cancelled_date).toLocaleDateString()}
                  </p>
                </div>
              )}

              {booking.cancel_reason && (
                <div className="flex items-start gap-2">
                  <FaCommentDots className="text-red-400 mt-1" />
                  <p>
                    <strong>Cancelled/Declined Reason:</strong> {booking.cancel_reason}
                  </p>
                </div>
              )}
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
            <div className="mt-8 flex flex-wrap justify-end gap-3">
              {booking.booking_status === "pending" && (
                <button
                  onClick={handleAcceptBooking}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  Accept Booking
                </button>
              )}

              {["pending", "confirmed"].includes(booking.booking_status) && (
                <>
                  <button
                    onClick={() => setShowRescheduleModal(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                  >
                    <FaEdit /> Reschedule
                  </button>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                  >
                    <FaTimes />
                    {booking.booking_status === "pending" ? "Decline Booking" : "Cancel Booking"}
                  </button>
                </>
              )}

              <button className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                <FaExclamationTriangle /> Report Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {showRescheduleModal && (
        <RescheduleModal
          booking={booking}
          onClose={() => setShowRescheduleModal(false)}
          onSubmit={handleReschedule}
        />
      )}

      {showCancelModal && (
        <CancelBookingModal
          booking={booking}
          onClose={() => setShowCancelModal(false)}
          onRefresh={onRefresh}
        />
      )}
    </>
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

    const now = useMemo(() => new Date(), []);

    const matchesSearch = useCallback(
      (b) => {
        const q = search.toLowerCase();
        return (
          b.full_name?.toLowerCase().includes(q) ||
          b.title?.toLowerCase().includes(q)
        );
      },
      [search]
    );

    const getUpcomingBookings = useCallback(() =>
      bookings.filter(b =>
        new Date(b.check_in_date) > now &&
        b.booking_status !== 'cancelled' &&
        matchesSearch(b)
      ),
      [bookings, now, matchesSearch]
    );
    
    const getOngoingBookings = useCallback(() =>
      bookings.filter(b => {
        const checkIn = new Date(b.check_in_date);
        const checkOut = new Date(b.check_out_date);
        return (
          checkIn <= now &&
          checkOut >= now &&
          b.booking_status !== 'cancelled' &&
          matchesSearch(b)
        );
      }),
      [bookings, now, matchesSearch]
    );
    
    const getCompletedBookings = useCallback(() =>
      bookings.filter(b =>
        new Date(b.check_out_date) < now &&
        b.booking_status === 'completed' &&
        matchesSearch(b)
      ),
      [bookings, now, matchesSearch]
    );
    
    const getCancelledBookings = useCallback(() =>
      bookings.filter(b =>
        b.booking_status === 'cancelled' &&
        matchesSearch(b)
      ),
      [bookings, matchesSearch]
    );

    useEffect(() => {
      const init = async () => {
        let currentUser = user;
    
        if (!user && !loading) {
          const fetchedUser = await fetchUser();
          if (!fetchedUser) return navigate("/login");
    
          currentUser = fetchedUser;
        }
    
        if (currentUser?.user_id) {
          await loadBookings(currentUser.user_id);
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
    }, [bookings, getCancelledBookings,getCompletedBookings, getOngoingBookings, getUpcomingBookings]);

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