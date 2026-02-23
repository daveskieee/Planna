import React, { useContext, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AppContext } from '../context/AppContext';

function Dashboard() {
  const { analytics, bookings, fetchBookings, addToast } = useContext(AppContext);
  const [query, setQuery] = React.useState('');

  const totalIncome = bookings.reduce((sum, b) => sum + (b.event_total || 0), 0);
  const totalBookings = bookings.length;
  const avgEventValue = totalBookings > 0 ? (totalIncome / totalBookings).toFixed(2) : 0;
  const { formatCurrency } = useContext(AppContext);

  // Fetch bookings from server when query changes (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      fetchBookings(query);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const filteredBookings = bookings;

  // Chart data: combine bookings by month
  const monthlyData = {};
  filteredBookings.forEach((b) => {
    const month = b.event_date.substring(0, 7); // YYYY-MM
    monthlyData[month] = (monthlyData[month] || 0) + (b.event_total || 0);
  });
  const chartData = Object.entries(monthlyData).map(([month, income]) => ({
    month,
    actual: income,
    predicted: analytics.length > 0 ? analytics[0].predicted_income : 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <input id="dashboard-search" aria-label="Search bookings" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search bookings (client id, type, date)" className="px-3 py-2 border rounded w-1/3 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400" />
        <div className="space-x-2">
          <button onClick={async () => {
            try {
              const res = await axios.get('/api/export', { params: query ? { q: query } : {}, responseType: 'blob' });
              const blob = new Blob([res.data], { type: res.headers['content-type'] });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'planna_bookings.csv';
              document.body.appendChild(a);
              a.click();
              a.remove();
              addToast('success', 'Export started');
            } catch (e) { addToast('error', 'Export failed'); }
          }} className="px-3 py-2 bg-blue-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400">Export CSV</button>
        </div>
      </div>
      <h2 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600">Total Income</h3>
          <p className="text-4xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600">Total Bookings</h3>
          <p className="text-4xl font-bold text-blue-600">{totalBookings}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600">Avg Event Value</h3>
          <p className="text-4xl font-bold text-purple-600">{formatCurrency(avgEventValue)}</p>
        </div>
      </div>

      {/* Predicted vs Actual Chart */}
      {chartData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Monthly Income: Predicted vs Actual</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="actual" stroke="#8884d8" name="Actual Income" />
              <Line type="monotone" dataKey="predicted" stroke="#82ca9d" name="AI Predicted Income" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Analytics Details */}
      {analytics.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Latest AI Prediction</h3>
          <div className="space-y-2">
            <p>
              <strong>Predicted Income:</strong> {formatCurrency(analytics[0].predicted_income) || 'N/A'}
            </p>
            <p>
              <strong>Confidence Score:</strong>{' '}
              <span className={`px-2 py-1 rounded ${analytics[0].confidence_score > 0.8 ? 'bg-green-100' : 'bg-yellow-100'}`}>
                {(analytics[0].confidence_score * 100).toFixed(1)}%
              </span>
            </p>
            <p>
              <strong>Updated:</strong> {analytics[0].updated_at}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
