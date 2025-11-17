import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('buildwithsam@gmail.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const res = await login({ email, password });
    if (res.ok) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Login failed.');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-800 to-purple-300 text-[var(--color-text-primary)]">
      <div className="w-full max-w-md p-8 space-y-6 bg-[var(--color-bg-secondary)] rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center">Admin Login</h2>
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-[var(--color-bg-tertiary)] border border-transparent rounded-md text-[var(--color-text-primary)] focus:outline-none focus:ring focus:ring-[var(--color-primary-cyan)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-[var(--color-bg-tertiary)] border border-transparent rounded-md text-[var(--color-text-primary)] focus:outline-none focus:ring focus:ring-[var(--color-primary-cyan)]"
            />
          </div>
          {error && <p className="text-sm text-[var(--color-accent-red)]">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary-purple)] rounded-md hover:bg-opacity-80 transition-all focus:outline-none focus:ring focus:ring-[var(--color-primary-purple)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </div>
            ) : (
              'Log In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
