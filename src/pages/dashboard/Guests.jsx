import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserCheck,
  FaUserClock,
  FaUsers,
  FaChevronRight,
  FaTimes,
  FaSearch
} from "react-icons/fa";
import DashboardNavBar from "../../components/Navbar";
import DashboardTabs from "./DashboardTabs";
import { useAuth } from "../../context/AuthContext";
import { format } from "date-fns";

const MetricCard = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-2xl p-5 shadow-md flex items-center space-x-4 border-l-4 border-blue-500">
    <div className={`text-${color}-600 text-3xl`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <h4 className="text-xl font-semibold">{value}</h4>
    </div>
  </div>
);

const GuestTable = ({ title, guests, onViewMore }) => (
  <div className="bg-white rounded-xl shadow-lg mb-10">
    <h3 className="text-lg font-semibold text-gray-700 px-6 pt-4">{title}</h3>
    <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
      <table className="min-w-full divide-y divide-gray-200 mt-2">
        <thead className="bg-gray-100 sticky top-0 z-10">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-In</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-Out</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {guests.map((guest, idx) => (
            <tr key={idx}>
              <td className="px-6 py-3 text-sm font-medium text-gray-900">{guest.customer_name}</td>
              <td className="px-6 py-3 text-sm text-gray-600">{guest.customer_email}</td>
              <td className="px-6 py-3 text-sm text-gray-600">{format(new Date(guest.check_in_date), "yyyy-MM-dd")}</td>
              <td className="px-6 py-3 text-sm text-gray-600">{format(new Date(guest.check_out_date), "yyyy-MM-dd")}</td>
              <td className="px-6 py-3 text-right">
                <button
                  onClick={() => onViewMore(guest)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded text-xs font-medium"
                >
                  <FaChevronRight className="text-xs" /> View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const GuestDetailsModal = ({ guest, onClose, allBookings }) => {
  if (!guest) return null;
  const bookings = allBookings[guest.customer_user_id] || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
      <div className="bg-white p-6 rounded-xl max-w-3xl w-full relative shadow-xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-600 hover:text-red-500">
          <FaTimes size={20} />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Guest Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mb-6">
          <p><strong>Name:</strong> {guest.customer_name}</p>
          <p><strong>Email:</strong> {guest.customer_email}</p>
          <p><strong>Phone:</strong> {guest.customer_phone}</p>
          <p><strong>Address:</strong> {guest.customer_address}</p>
          <p><strong>Age:</strong> {guest.customer_age}</p>
        </div>

        <h3 className="text-lg font-semibold mb-2">Booking History</h3>
        <div className="space-y-4 text-sm text-gray-700">
          {bookings.map((b, i) => (
            <div key={i} className="border-b pb-3">
              <p><strong>Property:</strong> {b.property_title}</p>
              <p><strong>Location:</strong> {b.property_city}, {b.property_province}, {b.property_country}</p>
              <p><strong>Stay Type:</strong> {b.stay_type}</p>
              <p><strong>Check-In:</strong> {format(new Date(b.check_in_date), "yyyy-MM-dd")}</p>
              <p><strong>Check-Out:</strong> {format(new Date(b.check_out_date), "yyyy-MM-dd")}</p>
              <p><strong>Total Price:</strong> ₱{b.total_price}</p>
              <p><strong>Status:</strong> {b.booking_status}</p>
              <p><strong>Payment:</strong> {b.payment_status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function Guests() {
  const { user, fetchUser, loading } = useAuth();
  const [initializing, setInitializing] = useState(true);
  const [guests, setGuests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGuest, setSelectedGuest] = useState(null);
  const navigate = useNavigate();

  const loadUserInformation = async (lessorId) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL_OWNER}/full-booking-info/${lessorId}`);
      const json = await res.json();
      if (json?.data) setGuests(json.data);
    } catch (err) {
      console.error("Failed to load guest data:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!user && !loading) {
        const fetched = await fetchUser();
        if (!fetched) return navigate("/login");
        await loadUserInformation(fetched.userId);
      } else if (user?.userId) {
        await loadUserInformation(user.userId);
      }
      setInitializing(false);
    };
    init();
  }, [user, loading, fetchUser, navigate]);

  const today = new Date();

  const currentGuestsRaw = guests.filter(g =>
    new Date(g.check_in_date) <= today &&
    new Date(g.check_out_date) >= today &&
    g.booking_status === "confirmed"
  );

  const completedGuestsRaw = guests.filter(g =>
    new Date(g.check_out_date) < today && g.booking_status === "confirmed"
  );

  const cancelledGuestsRaw = guests.filter(g =>
    new Date(g.check_out_date) < today && g.booking_status === "cancelled"
  );

  const groupLatestByUser = (data) => {
    const grouped = {};
    data.forEach((booking) => {
      const key = booking.customer_user_id;
      const existing = grouped[key];
      if (!existing || new Date(booking.check_in_date) > new Date(existing.check_in_date)) {
        grouped[key] = booking;
      }
    });
    return Object.values(grouped);
  };

  const bookingsByUser = guests.reduce((acc, booking) => {
    const key = booking.customer_user_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(booking);
    return acc;
  }, {});

  // ⬇️ Search filtering
  const filterBySearch = (list) => {
    const query = searchQuery.toLowerCase();
    return list.filter(g =>
      g.customer_name.toLowerCase().includes(query) ||
      g.customer_email.toLowerCase().includes(query)
    );
  };

  const currentGuests = filterBySearch(groupLatestByUser(currentGuestsRaw));
  const completedGuests = filterBySearch(groupLatestByUser(completedGuestsRaw));
  const cancelledGuests = filterBySearch(groupLatestByUser(cancelledGuestsRaw));

  if (initializing || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <DashboardNavBar />
      <DashboardTabs />
      <div className="pt-36 px-6 pb-16 bg-gray-100 min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-700">Guest Overview</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <MetricCard icon={<FaUsers />} label="Total Guests" value={guests.length} color="blue" />
          <MetricCard icon={<FaUserCheck />} label="Current Guests" value={currentGuests.length} color="green" />
          <MetricCard icon={<FaUserClock />} label="Completed Guests" value={completedGuests.length} color="gray" />
          <MetricCard icon={<FaTimes />} label="Cancelled Guests" value={cancelledGuests.length} color="red" />
        </div>

        <GuestTable title="Current Guests" guests={currentGuests} onViewMore={setSelectedGuest} />
        <GuestTable title="Completed Guests" guests={completedGuests} onViewMore={setSelectedGuest} />
        <GuestTable title="Cancelled Guests" guests={cancelledGuests} onViewMore={setSelectedGuest} />

        {selectedGuest && (
          <GuestDetailsModal
            guest={selectedGuest}
            onClose={() => setSelectedGuest(null)}
            allBookings={bookingsByUser}
          />
        )}
      </div>
    </>
  );
}
