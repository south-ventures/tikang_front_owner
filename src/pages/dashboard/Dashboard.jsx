import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaComments
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
} from "recharts";
import { motion } from "framer-motion";
import { format, subDays, subWeeks, startOfWeek, endOfWeek, subMonths } from "date-fns";
import DashboardNavBar from "../../components/Navbar";
import DashboardTabs from "../dashboard/DashboardTabs";
import LoadingSpinner from "../../components/LoadingSpinner";

// 🧠 Utilities to generate real date labels
const getDailyLabels = () =>
  [...Array(7)].map((_, i) => format(subDays(new Date(), 6 - i), "MMM d"));

const getWeeklyLabels = () =>
  [...Array(4)].map((_, i) => {
    const start = startOfWeek(subWeeks(new Date(), 3 - i), { weekStartsOn: 1 });
    const end = endOfWeek(start, { weekStartsOn: 1 });
    return `${format(start, "MMM d")}-${format(end, "MMM d")}`;
  });

const getMonthlyLabels = () =>
  [...Array(4)].map((_, i) => format(subMonths(new Date(), 3 - i), "MMM yyyy"));

// 🎯 Dynamic Graph Data based on real dates
const generateGraphData = () => {
  const dailyLabels = getDailyLabels();
  const weeklyLabels = getWeeklyLabels();
  const monthlyLabels = getMonthlyLabels();

  return {
    daily: {
      sales: dailyLabels.map(label => ({ label, sales: rand(400, 800) })),
      occupancy: [
        { name: "Booked", value: 18 },
        { name: "Available", value: 15 }
      ],
      revenueTrend: dailyLabels.map(label => ({ label, revenue: rand(900, 1500) })),
      expenses: dailyLabels.map(label => ({
        label,
        revenue: rand(900, 1500),
        expenses: rand(400, 900)
      })),
      topProperties: [
        { name: "Palm Grove", revenue: 900 },
        { name: "Ocean Breeze", revenue: 850 },
      ]
    },
    weekly: {
      sales: weeklyLabels.map(label => ({ label, sales: rand(2500, 4000) })),
      occupancy: [
        { name: "Booked", value: 21 },
        { name: "Available", value: 12 }
      ],
      revenueTrend: weeklyLabels.map(label => ({ label, revenue: rand(4000, 6000) })),
      expenses: weeklyLabels.map(label => ({
        label,
        revenue: rand(4000, 6000),
        expenses: rand(2500, 4000)
      })),
      topProperties: [
        { name: "Sunset Villa", revenue: 3100 },
        { name: "Palm Grove", revenue: 2900 },
      ]
    },
    monthly: {
      sales: monthlyLabels.map(label => ({ label, sales: rand(4000, 6000) })),
      occupancy: [
        { name: "Booked", value: 90 },
        { name: "Available", value: 40 }
      ],
      revenueTrend: monthlyLabels.map(label => ({ label, revenue: rand(6000, 8500) })),
      expenses: monthlyLabels.map(label => ({
        label,
        revenue: rand(6000, 8500),
        expenses: rand(3500, 5000)
      })),
      topProperties: [
        { name: "Green Lodge", revenue: 3900 },
        { name: "Ocean Breeze", revenue: 3400 },
      ]
    }
  };
};

// 🔢 Random helper
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export default function Dashboard() {
  const { user, loading, fetchUser } = useAuth();
  const navigate = useNavigate();
  const [initializing, setInitializing] = useState(true);
  const [time, setTime] = useState(new Date());
  const [graphView, setGraphView] = useState("daily");
  const [graphData, setGraphData] = useState(generateGraphData());

  useEffect(() => {
    const init = async () => {
      if (!user && !loading) {
        const fetched = await fetchUser();
        if (!fetched) navigate("/login");
      }
      setInitializing(false);
    };
    init();
  }, [user, loading, fetchUser, navigate]);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading || initializing || !user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const data = graphData[graphView];

  return (
    <>
      <DashboardNavBar />
      <DashboardTabs />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="pt-36 pb-16 px-8 bg-gray-100 min-h-screen"
      >
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between pl-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Welcome, {user?.full_name?.split(" ")[0] || "Homeowner"} 👋
            </h2>
            <p className="text-sm text-gray-500">
              {format(time, "EEEE, MMMM d, yyyy")} — {format(time, "hh:mm:ss a")}
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            {["daily", "weekly", "monthly"].map((view) => (
              <button
                key={view}
                onClick={() => setGraphView(view)}
                className={`px-4 py-1 rounded-full text-sm font-medium border transition shadow ${
                  graphView === view
                    ? "bg-green-500 text-white"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Graph Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div layout className="lg:col-span-2">
            <GraphCard title={`Sales (${graphView})`} bg="bg-blue-50">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.sales}>
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </GraphCard>
          </motion.div>

          <motion.div layout className="lg:col-span-1">
            <GraphCard title="Room Occupancy Rate" bg="bg-green-50">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data.occupancy}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label
                    fill="#10B981"
                  />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </GraphCard>
          </motion.div>

          <motion.div layout className="lg:col-span-2">
            <GraphCard title="Monthly Revenue Trend" bg="bg-indigo-50">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.revenueTrend}>
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </GraphCard>
          </motion.div>

          <motion.div layout className="lg:col-span-1">
            <GraphCard title="Revenue vs Expenses" bg="bg-red-50">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.expenses}>
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#3B82F6" />
                  <Bar dataKey="expenses" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </GraphCard>
          </motion.div>

          <motion.div layout className="lg:col-span-3">
            <GraphCard title="Top Performing Properties" bg="bg-yellow-50">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.topProperties} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </GraphCard>
          </motion.div>
        </div>

        {/* Floating Chat Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl z-50"
        >
          <FaComments size={24} />
        </motion.button>
      </motion.div>
    </>
  );
}

// 📦 GraphCard Component
const GraphCard = ({ title, bg = "bg-white", children }) => (
  <motion.div
    whileHover={{ scale: 1.01 }}
    className={`${bg} p-6 rounded-3xl shadow-2xl transition-all duration-300`}
  >
    <h3 className="text-lg font-semibold mb-4 text-gray-700">{title}</h3>
    {children}
  </motion.div>
);
