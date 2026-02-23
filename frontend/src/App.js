import React, { useState, useContext } from 'react';
import { AppProvider, AppContext } from './context/AppContext';
import Calendar from './components/Calendar';
import BookingWizard from './components/BookingWizard';
import Dashboard from './components/Dashboard';
import Toaster from './components/Toaster';
import LoginModal from './components/LoginModal';

function App() {
  return (
    <AppProvider>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-white focus:text-black px-2 py-1 rounded">Skip to content</a>
      <InnerApp />
    </AppProvider>
  );
}

function InnerApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { currency, setCurrency, toasts, user, logout } = useContext(AppContext);
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white p-4 shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Planna Event Manager</h1>
          <p className="text-blue-100">AI-powered event scheduling & analytics</p>
        </div>
        <div className="flex items-center space-x-4">
          <label className="text-sm">Currency</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="text-black px-2 py-1 rounded">
            <option value="PHP">PHP (₱)</option>
            <option value="USD">USD ($)</option>
          </select>
          {user ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm">Hi, {user}</span>
              <button onClick={logout} className="px-2 py-1 bg-gray-200 rounded">Logout</button>
            </div>
          ) : (
            <button onClick={() => setShowLogin(true)} className="px-2 py-1 bg-gray-200 rounded">Login</button>
          )}
        </div>
      </nav>

        <div className="flex">
        {/* Sidebar */}
          <aside className="w-48 bg-gray-800 text-white p-4 min-h-screen" aria-label="Main navigation">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveTab('dashboard')}
                aria-pressed={activeTab === 'dashboard'}
                className={`w-full text-left px-4 py-2 rounded transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 ${
                  activeTab === 'dashboard' ? 'bg-blue-600' : 'hover:bg-gray-700'
                }`}
              >
                📊 Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('calendar')}
                aria-pressed={activeTab === 'calendar'}
                className={`w-full text-left px-4 py-2 rounded transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 ${
                  activeTab === 'calendar' ? 'bg-blue-600' : 'hover:bg-gray-700'
                }`}
                type="button"
              >
                📅 Calendar
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('booking')}
                aria-pressed={activeTab === 'booking'}
                className={`w-full text-left px-4 py-2 rounded transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 ${
                  activeTab === 'booking' ? 'bg-blue-600' : 'hover:bg-gray-700'
                }`}
                type="button"
              >
                ✏️ New Booking
              </button>
            </li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'calendar' && <Calendar />}
          {activeTab === 'booking' && <BookingWizard />}
        </main>
      </div>

      <Toaster toasts={toasts} removeToast={removeToast} />
      <LoginModal visible={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}

export default App;
