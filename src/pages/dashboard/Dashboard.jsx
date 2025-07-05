import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashboardNavBar from "../../components/Navbar";
import DashboardTabs from "../dashboard/DashboardTabs";
import LoadingSpinner from "../../components/LoadingSpinner";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const { user, setUser, validateToken, storeToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [initializing, setInitializing] = useState(true);
  const [time, setTime] = useState(new Date());
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const queryToken = searchParams.get("token");

        if (queryToken) {
          const res = await fetch(`${process.env.REACT_APP_API_URL_OWNER}/validate-token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: queryToken }),
          });

          if (!res.ok) throw new Error("Token validation failed");

          const data = await res.json();
          storeToken(queryToken);
          setUser(data.user);
          navigate("/dashboard", { replace: true });
          return;
        }

        const validatedUser = await validateToken();
        if (!validatedUser) return navigate("/login");
      } catch (err) {
        console.error("Auth failed:", err);
        localStorage.removeItem("tikangToken");
        setUser(null);
        navigate("/login");
      } finally {
        setInitializing(false);
      }
    };

    init();
  }, [location.search, navigate, setUser, storeToken, validateToken]);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL_OWNER}/dashboard/${user?.user_id}`);
        const data = await res.json();
        setDashboardData(data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

    if (user?.user_id) fetchDashboardData();
  }, [user?.user_id]);

  const getBookingChartData = () => {
    if (!dashboardData?.allBookings) return [];

    const daily = {};
    for (let i = 6; i >= 0; i--) {
      const date = format(new Date(Date.now() - i * 86400000), "yyyy-MM-dd");
      daily[date] = 0;
    }

    dashboardData.allBookings.forEach((b) => {
      const date = format(new Date(b.created_at), "yyyy-MM-dd");
      if (daily[date] !== undefined) {
        daily[date]++;
      }
    });

    return Object.entries(daily).map(([date, count]) => ({ date, count }));
  };

  if (initializing || !user || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <DashboardNavBar />
      <DashboardTabs />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="pt-36 pb-16 px-6 md:px-12 bg-gray-100 min-h-screen"
      >
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-1">
              Welcome, {user?.full_name?.split(" ")[0] || "Homeowner"} 👋
            </h2>
            <p className="text-sm text-gray-500">
              {format(time, "EEEE, MMMM d, yyyy")} — {format(time, "hh:mm:ss a")}
            </p>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white shadow-lg rounded-xl p-5 border border-gray-100">
            <h4 className="text-gray-500 text-sm mb-1">Tikang Cash</h4>
            <p className="text-2xl font-bold text-green-600">₱{Number(user.tikang_cash || 0).toFixed(2)}</p>
          </div>
          <div className="bg-white shadow-lg rounded-xl p-5 border border-gray-100">
            <h4 className="text-gray-500 text-sm mb-1">Total Bookings</h4>
            <p className="text-2xl font-bold text-gray-700">{dashboardData.allBookings.length}</p>
          </div>
          <div className="bg-white shadow-lg rounded-xl p-5 border border-gray-100">
            <h4 className="text-gray-500 text-sm mb-1">New Bookings (7d)</h4>
            <p className="text-2xl font-bold text-blue-600">{dashboardData.newBookings.length}</p>
          </div>
          <div className="bg-white shadow-lg rounded-xl p-5 border border-gray-100">
            <h4 className="text-gray-500 text-sm mb-1">Total Revenue</h4>
            <p className="text-2xl font-bold text-indigo-600">
              ₱{Number(dashboardData.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Booking Graph */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-12">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Daily Bookings (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={getBookingChartData()}>
              <defs>
                <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#6366f1" fillOpacity={1} fill="url(#colorBookings)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Bookings Table */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-12">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Bookings</h3>
          <div className="overflow-auto rounded-lg">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-2">Guest</th>
                  <th className="px-4 py-2">Property</th>
                  <th className="px-4 py-2">Check-in</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.allBookings.slice(0, 5).map((booking) => (
                  <tr key={booking.booking_id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{booking.guest_name}</td>
                    <td className="px-4 py-2">{booking.property_title}</td>
                    <td className="px-4 py-2">{format(new Date(booking.check_in_date), "MMM d, yyyy")}</td>
                    <td className="px-4 py-2 capitalize">{booking.booking_status}</td>
                    <td className="px-4 py-2 text-right font-semibold text-green-700">
                      ₱{Number(booking.total_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Guests Table */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Upcoming Guests</h3>
          <div className="overflow-auto rounded-lg">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Phone</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.upcomingGuests.map((guest) => (
                  <tr key={guest.user_id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{guest.full_name}</td>
                    <td className="px-4 py-2">{guest.email}</td>
                    <td className="px-4 py-2">{guest.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </>
  );
}
