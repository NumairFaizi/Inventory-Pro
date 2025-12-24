import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import postRequest from '../../services/postRequest';
import notify from '../utils/toast';
import { ToastContainer } from 'react-toastify';

const Register = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return notify(400, "Passwords do not match!");
    }

    setLoading(true);
    try {
      const { status, data } = await postRequest('/api/users/register', { 
        username: userName, 
        password: password 
      });

      if (status === 201 || status === 200) {
        notify(201, "Admin account created! Redirecting to login...");
        setTimeout(() => navigate('/login'), 2000);
      } else {
        notify(status, data.message || "Registration failed");
      }
    } catch (error) {
      notify(500, "Server connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 px-4">
      <ToastContainer />
      <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-700">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">Create Admin</h2>
          <p className="text-gray-400 mt-2">Set up your primary store credentials</p>
        </div>

        <form className="space-y-5" onSubmit={handleRegister}>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Username</label>
            <input
              type="text"
              placeholder="Enter admin name"
              className="w-full p-4 mt-1 rounded-xl text-white border border-gray-600 bg-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
              required
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full p-4 mt-1 rounded-xl text-white border border-gray-600 bg-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full p-4 mt-1 rounded-xl text-white border border-gray-600 bg-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
              required
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 mt-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500 transition-all shadow-lg shadow-green-900/20 ${loading ? 'opacity-50' : ''}`}
          >
            {loading ? 'Creating Account...' : 'Register Admin'}
          </button>

          <p className="text-center text-gray-400 text-sm mt-4">
            Already have an account? <Link to="/login" className="text-green-500 hover:underline">Login here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;