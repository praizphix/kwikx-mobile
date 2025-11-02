import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ShieldCheck, AlertTriangle } from 'lucide-react';
import { supabase, supabaseConfig } from '../lib/supabase';
import toast from 'react-hot-toast';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supabaseConfig.isConfigured) {
      toast.error('Admin authentication is not available. Please configure Supabase environment variables.');
      return;
    }

    setLoading(true);

    try {
      // Sign in
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) throw signInError;
      if (!user) throw new Error('No user returned from authentication');

      console.log('User signed in successfully:', user.email);

      // Simple admin check - use hardcoded admin email as fallback
      const adminEmail = 'info@getkwikx.com';
      const isHardcodedAdmin = user.email?.toLowerCase().trim() === adminEmail.toLowerCase();

      // Try to check admin_users table, but fallback to hardcoded check if it fails
      let isAdmin = isHardcodedAdmin;
      
      try {
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (!adminError && adminData) {
          isAdmin = true;
          console.log('Admin verified via database:', user.email, 'Role:', adminData.role);
        } else if (adminError) {
          console.warn('Database admin check failed, using hardcoded fallback:', adminError);
          // Use hardcoded admin check as fallback
        }
      } catch (dbError) {
        console.warn('Database connection failed, using hardcoded admin check:', dbError);
        // Use hardcoded admin check as fallback
      }

      if (!isAdmin) {
        console.log('User is not an admin:', user.email);
        await supabase.auth.signOut();
        throw new Error('Access denied. This portal is restricted to administrators only.');
      }

      console.log('Admin access granted for:', user.email);
      toast.success('Welcome to the admin portal!');
      navigate('/admin');

    } catch (error: any) {
      console.error('Login error:', error);

      let errorMessage = 'Login failed. Please try again.';
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error.message?.includes('Access denied')) {
        errorMessage = 'Access denied. This portal is restricted to administrators only.';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Please verify your email address before signing in.';
      } else if (error.message?.includes('Failed to fetch') || error.message?.includes('network')) {
        errorMessage = 'Network connection failed. Please check your internet connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);

      // Sign out if failed
      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        console.error('Failed to sign out user:', signOutError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    if (!supabaseConfig.isConfigured) {
      toast.success('Demo mode: Accessing admin dashboard');
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#00454a] to-[#003238] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-white p-3 rounded-full">
            <img src="/kwikx_logo_color.png" alt="KwikX" className="h-12" />
          </div>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <ShieldCheck className="h-6 w-6 text-[#eeb83b]" />
          <h2 className="text-2xl font-bold text-white">
            Administrator Portal
          </h2>
        </div>
        <p className="mt-2 text-center text-sm text-gray-300">
          Secure access for authorized personnel only
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-lg sm:px-10">
          {!supabaseConfig.isConfigured && (
            <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Development Mode:</strong> Supabase is not configured.
                  </p>
                  <div className="mt-2">
                    <button
                      onClick={handleDemoAccess}
                      className="text-sm font-medium text-yellow-800 underline hover:text-yellow-900"
                    >
                      Access demo admin dashboard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Admin Access:</strong> Use your administrator credentials to access the admin portal.
                  If you're experiencing connection issues, the system will use fallback authentication.
                </p>
              </div>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Administrator Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={!supabaseConfig.isConfigured}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#00454a] focus:border-[#00454a] sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter your admin email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Administrator Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  disabled={!supabaseConfig.isConfigured}
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#00454a] focus:border-[#00454a] sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={!supabaseConfig.isConfigured}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !supabaseConfig.isConfigured}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00454a] hover:bg-[#003238] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00454a] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authenticating...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 mr-2" />
                    Access Portal
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;