import { useState } from 'react';
import { User, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import library from '../../assets/library.jpg';
import { LoginUseCase } from '../../application/useCases/auth/LoginUseCase';
import { SignUpUseCase } from '../../application/useCases/auth/SignupUseCase';
import { AuthRepository } from '../../infrastructure/repositories/AuthRepository';

const authRepository = new AuthRepository();
const loginUseCase = new LoginUseCase(authRepository);
const signupUseCase = new SignUpUseCase(authRepository);

export default function Auth() {
  const navigate = useNavigate();

  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user, token } = await loginUseCase.execute(username, password);
      login(user, token);
      navigate('/home');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      console.error('Login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setError('');

    if (!fullName || !signupPassword || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (signupPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const { user, token } = await signupUseCase.execute(fullName, signupPassword);
      login(user, token);
      setShowSuccessMessage(true);
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    } catch (err) {
      setError('Sign up failed. Please try again.');
      console.error('Sign up failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setUsername('');
    setPassword('');
    setFullName('');
    setSignupPassword('');
    setConfirmPassword('');
    setRememberMe(false);
  };

  const handleForgotPassword = () => {
    console.log('Navigate to forgot password');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Library Image */}
      <div className="hidden md:block md:w-1/2 relative">
        <img 
          src={library} 
          alt="Library" 
          className="absolute inset-0 w-full h-full object-cover" 
        />
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Header */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <h1 className="text-2xl font-semibold text-gray-800">
                {isLogin ? 'Login' : 'Sign Up'}
              </h1>
              <User className="w-6 h-6 text-gray-600" />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Success Message */}
            {showSuccessMessage && (
              <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                Successfully signed up!
              </div>
            )}

            <div>
              {isLogin ? (
                // Login Form
                <>
                  {/* Username Field */}
                  <div className="mb-6">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <span>Username</span>
                      <User className="w-4 h-4" />
                    </label>
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      disabled={loading}
                    />
                  </div>

                  {/* Password Field */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <span>Password</span>
                        <Lock className="w-4 h-4" />
                      </label>
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
                      >
                        forgot password?
                      </button>
                    </div>
                    <input
                      type="password"
                      placeholder="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      disabled={loading}
                    />
                  </div>

                  {/* Remember Me */}
                  <div className="mb-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                      />
                      <span className="text-sm text-gray-600">Remember me</span>
                    </label>
                  </div>

                  {/* Login Button */}
                  <button
                    onClick={handleLogin}
                    disabled={loading || !username || !password}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-full transition mb-4 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </button>

                  {/* Sign Up Button */}
                  <button
                    type="button"
                    onClick={toggleMode}
                    disabled={loading}
                    className="w-full bg-teal-700 hover:bg-teal-800 text-white font-medium py-3 rounded-full transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                // Sign Up Form
                <>
                  {/* Full Name Field */}
                  <div className="mb-6">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <span>Full Name</span>
                      <User className="w-4 h-4" />
                    </label>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      disabled={loading}
                    />
                  </div>

                  {/* Password Field */}
                  <div className="mb-6">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <span>Password</span>
                      <Lock className="w-4 h-4" />
                    </label>
                    <input
                      type="password"
                      placeholder="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      disabled={loading}
                    />
                  </div>

                  {/* Confirm Password Field */}
                  <div className="mb-6">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <span>Confirm Password</span>
                      <Lock className="w-4 h-4" />
                    </label>
                    <input
                      type="password"
                      placeholder="confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      disabled={loading}
                    />
                  </div>

                  {/* Sign Up Button */}
                  <button
                    onClick={handleSignUp}
                    disabled={loading || !fullName || !signupPassword || !confirmPassword}
                    className="w-full bg-teal-700 hover:bg-teal-800 text-white font-medium py-3 rounded-full transition mb-4 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Signing up...' : 'Sign Up'}
                  </button>

                  {/* Login Button */}
                  <button
                    type="button"
                    onClick={toggleMode}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-full transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Login
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}