import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NavBar from '../../components/Navbar';

export default function AccountInformation() {
  const { logout } = useAuth();

  const navLinks = [
    { to: 'information', label: 'My Account' },
    { to: 'messages', label: 'Messages' },
    { to: 'tikangcash', label: 'TikangCash' },
  ];

  return (
    <div className="h-screen overflow-hidden">
      <NavBar />

      {/* Wrapper under navbar */}
      <div className="pt-16 h-full flex flex-col sm:flex-row bg-gray-100">

        {/* Mobile Top Tabs */}
        <div className="sm:hidden bg-white shadow border-b px-4 py-2 flex overflow-x-auto gap-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `whitespace-nowrap px-4 py-2 rounded-full text-sm transition border ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 border-blue-500 font-semibold'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden sm:block w-72 p-6">
          <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100 sticky top-20">
            <h2 className="text-xl font-bold text-blue-700 mb-6">Account</h2>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end
                  className={({ isActive }) =>
                    `group px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <button
                onClick={logout}
                className="mt-4 px-4 py-3 text-sm text-red-600 hover:underline hover:bg-red-50 rounded-lg transition-all duration-150 text-left"
              >
                Logout
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
