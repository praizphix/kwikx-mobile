import React, { useState } from 'react';
import { ArrowLeft, Shield, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const CreateAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'admin'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create the user in Auth
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (signUpError) throw signUpError;
      if (!user) throw new Error('Failed to create user');

      // Create the admin record
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert([
          {
            id: user.id,
            role: formData.role,
          }
        ]);

      if (adminError) throw adminError;

      toast.success('Admin user created successfully');
      navigate('/admin/users');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/admin')}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Admin User</h1>
            <p className="text-gray-600">Add a new administrator to the system</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Creating an admin user grants significant system privileges. Ensure you follow security best practices and only grant access to trusted individuals.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00454a] focus:ring-[#00454a] sm:text-sm"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00454a] focus:ring-[#00454a] sm:text-sm"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <p className="mt-1 text-sm text-gray-500">
                Must be at least 8 characters long
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Admin Role
              </label>
              <select
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00454a] focus:ring-[#00454a] sm:text-sm"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00454a] hover:bg-[#003238] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00454a] disabled:opacity-50"
              >
                <Shield className="mr-2 h-5 w-5" />
                {loading ? 'Creating...' : 'Create Admin User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAdmin;