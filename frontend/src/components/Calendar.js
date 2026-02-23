import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

function Calendar() {
  const { bookings } = useContext(AppContext);

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const days = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) days.push(null);
  // Add days of month
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const getBookingsForDate = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookings.filter((b) => b.event_date === dateStr);
  };

  const getBusyScore = (day) => {
    const dayBookings = getBookingsForDate(day);
    return dayBookings.reduce((sum, b) => sum + (b.event_total || 0), 0);
  };
  const { formatCurrency } = useContext(AppContext);

  const getColorIntensity = (score) => {
    if (score === 0) return 'bg-gray-50';
    if (score < 5000) return 'bg-yellow-100';
    if (score < 15000) return 'bg-orange-200';
    return 'bg-red-300';
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Smart Calendar</h2>
      <p className="text-gray-600">Colors indicate "busy-ness" based on event income (Yellow = Low, Red = High)</p>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-2xl font-bold mb-4">{monthNames[currentMonth]} {currentYear}</h3>
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center font-bold text-gray-700 p-2">
              {day}
            </div>
          ))}
          {days.map((day, idx) => {
            const busyScore = day ? getBusyScore(day) : 0;
            const color = day ? getColorIntensity(busyScore) : 'bg-white';
            const dayBookings = day ? getBookingsForDate(day) : [];

            return (
              <div key={idx}>
                <button
                  type="button"
                  aria-label={day ? `${monthNames[currentMonth]} ${day}, ${currentYear}. ${dayBookings.length} events` : 'Empty'}
                  className={`${color} p-3 rounded min-h-24 border cursor-pointer hover:shadow-lg transition w-full text-left focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400`}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.click(); }}
                >
                  {day && (
                    <>
                      <p className="font-bold text-lg">{day}</p>
                      {busyScore > 0 && <p className="text-xs text-gray-700 mt-1">💰 {formatCurrency(busyScore)}</p>}
                      {dayBookings.length > 0 && (
                        <div className="text-xs mt-2 space-y-1">
                          {dayBookings.slice(0, 2).map((b, i) => (
                            <p key={i} className="truncate text-gray-700">
                              {b.type || 'Event'} ({b.guests}👥) — {formatCurrency(b.event_total)}
                            </p>
                          ))}
                          {dayBookings.length > 2 && <p className="text-gray-500">+{dayBookings.length - 2} more</p>}
                        </div>
                      )}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">Upcoming Events (Next 7 Days)</h3>
        <div className="space-y-2">
          {bookings
            .filter((b) => {
              const bookingDate = new Date(b.event_date);
              return bookingDate >= today && bookingDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
            })
            .slice(0, 5)
            .map((b) => (
                  <div key={b.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <p className="font-bold">{b.type || 'Event'}</p>
                    <p className="text-sm text-gray-600">Date: {b.event_date} | Guests: {b.guests} | Total: {formatCurrency(b.event_total)}</p>
                  </div>
                ))}
        </div>
      </div>
    </div>
  );
}

export default Calendar;
