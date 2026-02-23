import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function LoginModal({ visible, onClose }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AppContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Login failed');
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label="Login dialog">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h3 className="text-xl font-bold mb-4">Sign in (stub)</h3>
        <form onSubmit={handleSubmit}>
          <label htmlFor="login-username" className="block text-sm">Username</label>
          <input id="login-username" className="w-full mb-2 px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400" value={username} onChange={(e) => setUsername(e.target.value)} />
          <label htmlFor="login-password" className="block text-sm">Password</label>
          <input id="login-password" type="password" className="w-full mb-4 px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400" value={password} onChange={(e) => setPassword(e.target.value)} />
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-3 py-2 rounded bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400">Cancel</button>
            <button type="submit" className="px-3 py-2 rounded bg-blue-600 text-white focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400">Sign in</button>
          </div>
        </form>
      </div>
    </div>
  );
}
