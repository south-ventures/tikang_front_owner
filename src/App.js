import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Dashboard from './pages/dashboard/Dashboard';
import Properties from './pages/dashboard/Properties';
import Bookings from './pages/dashboard/Bookings';
import Guests from '../src/pages/dashboard/Guests';
import Login from '../src/pages/logins/UserLogin';

import AccountInformation from './pages/account/AccountInformation';
import MyAccount from './pages/account/views/MyAccount';
import Messages from './pages/account/views/Messages';
import TikangCash from './pages/account/views/TikangCash';

function App() {
  const location = useLocation(); // ✅ So we can use the key prop trick

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard key={location.pathname} />} />
      <Route path="/dashboard/properties" element={<Properties key={location.pathname} />} />
      <Route path="/dashboard/bookings" element={<Bookings key={location.pathname} />} />
      <Route path="/dashboard/guests" element={<Guests key={location.pathname} />} />

      {/* Account Dashboard with Nested Routes */}
        <Route path="/account" element={<AccountInformation />}>
          {/* Default route for /account */}
          <Route index element={<MyAccount />} />

          {/* Explicit path: /account/information */}
          <Route path="information" element={<MyAccount />} />
          <Route path="messages" element={<Messages />} />
          <Route path="tikangcash" element={<TikangCash />} />
        </Route>
    </Routes>
  );
}

export default App;
