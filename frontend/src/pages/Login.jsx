import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import postRequest from '../../services/postRequest';
import notify from '../utils/toast';
import { ToastContainer } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('stationary');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const { status, data } = await postRequest('/api/users/login', { 
        username: userName, 
        password: password 
      });

      if (status !== 200) {
        notify(status, data.message || "Invalid Credentials");
        setLoading(false);
        return;
      }

      localStorage.setItem('stationary', data.accessToken);
      notify(200, "Login Successful!");
      setTimeout(() => navigate('/'), 1000);

    } catch (error) {
      notify(500, "Server Error: Backend might be offline.");
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 px-4">
      <ToastContainer />
      
      <div className="bg-gray-800 p-10 rounded-3xl shadow-2xl w-full max-w-md border border-gray-700">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Inventory Pro
          </h2>
          <p className="text-gray-400 mt-2">Sign in to manage your stock</p>
        </div>

        <form className="space-y-5" onSubmit={handleLogin}>
          {/* ... inputs stay the same ... */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Username</label>
            <input
              type="text"
              className="w-full p-4 mt-1 rounded-xl text-white border border-gray-600 bg-gray-700 focus:border-blue-500 outline-none"
              required
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
            <input
              type="password"
              className="w-full p-4 mt-1 rounded-xl text-white border border-gray-600 bg-gray-700 focus:border-blue-500 outline-none"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all"
          >
            {loading ? 'Authenticating...' : 'Login to System'}
          </button>

          {/* NEW NAVIGATION LINK */}
          <div className="pt-6 border-t border-gray-700 text-center">
            <p className="text-gray-400 text-sm">
              New installation?{' '}
              <Link to="/register" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
                Create Admin Account
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;