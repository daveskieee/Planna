import React, { useContext, useState, useRef } from 'react';
import { AppContext } from '../context/AppContext';

function BookingWizard() {
  const { createBooking, bookings, formatCurrency, addToast, currency } = useContext(AppContext);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    event_date: '',
    type: 'Wedding',
    client_id: '',
    guests: '',
    price: '',
    status: 'Pending',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const eventDateRef = useRef(null);
  const clientRef = useRef(null);
  const guestsRef = useRef(null);
  const priceRef = useRef(null);

  const checkConflicts = () => {
    if (!formData.event_date) return [];
    const conflicts = bookings.filter((b) => b.event_date === formData.event_date);
    return conflicts;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.event_date) newErrors.event_date = 'Event date is required';
      if (!formData.type) newErrors.type = 'Event type is required';
    } else if (step === 2) {
      if (!formData.client_id) newErrors.client_id = 'Client ID is required';
      if (!formData.guests || formData.guests <= 0) newErrors.guests = 'Number of guests must be > 0';
    } else if (step === 3) {
      if (!formData.price || formData.price <= 0) newErrors.price = 'Price must be > 0';
    }

    setErrors(newErrors);

    // set aria-invalid attributes using refs
    if (newErrors.event_date) eventDateRef.current?.setAttribute('aria-invalid', 'true'); else eventDateRef.current?.removeAttribute('aria-invalid');
    if (newErrors.client_id) clientRef.current?.setAttribute('aria-invalid', 'true'); else clientRef.current?.removeAttribute('aria-invalid');
    if (newErrors.guests) guestsRef.current?.setAttribute('aria-invalid', 'true'); else guestsRef.current?.removeAttribute('aria-invalid');
    if (newErrors.price) priceRef.current?.setAttribute('aria-invalid', 'true'); else priceRef.current?.removeAttribute('aria-invalid');

    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    const ok = validateStep();
    if (ok) setStep(step + 1);
    else {
      // focus first invalid field via refs
      if (newErrors.event_date) eventDateRef.current?.focus();
      else if (newErrors.client_id) clientRef.current?.focus();
      else if (newErrors.guests) guestsRef.current?.focus();
      else if (newErrors.price) priceRef.current?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);
    try {
      await createBooking({
        ...formData,
        guests: parseFloat(formData.guests),
        price: parseFloat(formData.price),
      });
      addToast('success', 'Booking created — AI analysis started');
      setSubmitted(true);
      setTimeout(() => {
        setStep(1);
        setFormData({
          event_date: '',
          type: 'Wedding',
          client_id: '',
          guests: '',
          price: '',
          status: 'Pending',
        });
        setSubmitted(false);
      }, 1200);
    } catch (err) {
      setErrors({ submit: err.message });
      addToast('error', 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const conflicts = checkConflicts();
  const eventTotal = formData.guests && formData.price ? (parseFloat(formData.guests) * parseFloat(formData.price)).toFixed(2) : 0;
  // `formatCurrency`, `addToast`, `currency` are already pulled from AppContext at top

  if (submitted) {
    return (
      <div className="bg-green-50 border-2 border-green-500 p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold text-green-700">✅ Booking Created Successfully!</h2>
        <p className="text-gray-600 mt-2">Event Total: {formatCurrency(eventTotal)}</p>
        <p className="text-gray-500 mt-1">AI analysis is being generated...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Booking Wizard</h2>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`w-1/4 h-2 rounded mx-1 transition ${s <= step ? 'bg-blue-600' : 'bg-gray-300'}`}
            />
          ))}
        </div>
        <p className="text-gray-600">Step {step} of 4</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Date & Type */}
        {step === 1 && (
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h3 className="text-xl font-bold">When & What?</h3>
            <div>
              <label htmlFor="event_date" className="block text-gray-700 font-semibold mb-2">Event Date</label>
              <input
                ref={eventDateRef}
                id="event_date"
                type="date"
                name="event_date"
                value={formData.event_date}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400"
                aria-describedby={errors.event_date ? 'error-event_date' : undefined}
              />
              {errors.event_date && <p id="error-event_date" role="alert" aria-live="assertive" className="text-red-600 text-sm">{errors.event_date}</p>}
              {conflicts.length > 0 && (
                <p className="text-orange-600 text-sm mt-2">
                  ⚠️ {conflicts.length} event(s) already scheduled for this date
                </p>
              )}
            </div>
            <div>
              <label htmlFor="type" className="block text-gray-700 font-semibold mb-2">Event Type</label>
              <select id="type" name="type" value={formData.type} onChange={handleInputChange} className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400">
                <option>Wedding</option>
                <option>Corporate Event</option>
                <option>Birthday</option>
                <option>Conference</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Client & Guests */}
        {step === 2 && (
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h3 className="text-xl font-bold">Who & How Many?</h3>
            <div>
              <label htmlFor="client_id" className="block text-gray-700 font-semibold mb-2">Client ID</label>
              <input
                ref={clientRef}
                id="client_id"
                type="number"
                name="client_id"
                value={formData.client_id}
                onChange={handleInputChange}
                placeholder="e.g., 1"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400"
                aria-describedby={errors.client_id ? 'error-client_id' : undefined}
              />
              {errors.client_id && <p id="error-client_id" role="alert" aria-live="assertive" className="text-red-600 text-sm">{errors.client_id}</p>}
            </div>
            <div>
              <label htmlFor="guests" className="block text-gray-700 font-semibold mb-2">Number of Guests</label>
              <input
                ref={guestsRef}
                id="guests"
                type="number"
                name="guests"
                value={formData.guests}
                onChange={handleInputChange}
                placeholder="e.g., 50"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400"
                aria-describedby={errors.guests ? 'error-guests' : undefined}
              />
              {errors.guests && <p id="error-guests" role="alert" aria-live="assertive" className="text-red-600 text-sm">{errors.guests}</p>}
            </div>
          </div>
        )}

        {/* Step 3: Pricing */}
        {step === 3 && (
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h3 className="text-xl font-bold">Pricing</h3>
            <div>
              <label htmlFor="price" className="block text-gray-700 font-semibold mb-2">Price per Guest ({currency === 'PHP' ? '₱' : '$'})</label>
              <input
                ref={priceRef}
                id="price"
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="e.g., 100"
                step="0.01"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400"
                aria-describedby={errors.price ? 'error-price' : undefined}
              />
              {errors.price && <p id="error-price" role="alert" aria-live="assertive" className="text-red-600 text-sm">{errors.price}</p>}
            </div>
            <div className="bg-blue-50 p-4 rounded">
                <p className="text-gray-700">
                <strong>Event Total:</strong> {formatCurrency(eventTotal)}
              </p>
              <p className="text-gray-600 text-sm">{formData.guests} guests × {formatCurrency(formData.price)} per guest</p>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h3 className="text-xl font-bold">Review Your Booking</h3>
            <div className="space-y-2">
              <p>
                <strong>Date:</strong> {formData.event_date}
              </p>
              <p>
                <strong>Type:</strong> {formData.type}
              </p>
              <p>
                <strong>Client ID:</strong> {formData.client_id}
              </p>
              <p>
                <strong>Guests:</strong> {formData.guests}
              </p>
              <p>
                <strong>Price per Guest:</strong> {formatCurrency(formData.price)}
              </p>
              <p className="text-2xl font-bold text-green-600 mt-4">
                <strong>Total:</strong> {formatCurrency(eventTotal)}
              </p>
            </div>
            {errors.submit && <p className="text-red-600">{errors.submit}</p>}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            className="px-6 py-2 bg-gray-400 text-white rounded disabled:opacity-50 cursor-pointer hover:bg-gray-500"
          >
            Previous
          </button>
          {step < 4 && (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
            >
              Next
            </button>
          )}
          {step === 4 && (
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Creating...' : 'Create Booking'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default BookingWizard;
