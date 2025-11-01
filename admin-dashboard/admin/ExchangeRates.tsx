import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, RefreshCw, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface ExchangeRate {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  spread: number;
  last_updated: string;
}

const ExchangeRates: React.FC = () => {
  const navigate = useNavigate();
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRate, setEditingRate] = useState<ExchangeRate | null>(null);

  const fetchRates = async () => {
    try {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .order('from_currency', { ascending: true });

      if (error) throw error;
      setRates(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleEdit = (rate: ExchangeRate) => {
    setEditingRate(rate);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rate?')) return;

    try {
      const { error } = await supabase
        .from('exchange_rates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Rate deleted successfully');
      fetchRates();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRate) return;

    try {
      const { error } = await supabase
        .from('exchange_rates')
        .upsert({
          ...editingRate,
          last_updated: new Date().toISOString()
        });

      if (error) throw error;
      toast.success('Rate updated successfully');
      setIsEditing(false);
      setEditingRate(null);
      fetchRates();
    } catch (error: any) {
      toast.error(error.message);
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
            <h1 className="text-2xl font-bold text-gray-900">Exchange Rates</h1>
            <p className="text-gray-600">Manage currency exchange rates</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setEditingRate({
                id: '',
                from_currency: '',
                to_currency: '',
                rate: 0,
                spread: 0.01,
                last_updated: new Date().toISOString()
              });
              setIsEditing(true);
            }}
            className="flex items-center px-4 py-2 bg-[#00454a] text-white rounded-lg hover:bg-[#003238]"
          >
            <Plus size={20} className="mr-2" />
            Add Rate
          </button>
          <button
            onClick={fetchRates}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw size={20} className="mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {isEditing && editingRate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingRate.id ? 'Edit Rate' : 'Add New Rate'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">From Currency</label>
                <input
                  type="text"
                  value={editingRate.from_currency}
                  onChange={(e) => setEditingRate({ ...editingRate, from_currency: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00454a] focus:ring-[#00454a] sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">To Currency</label>
                <input
                  type="text"
                  value={editingRate.to_currency}
                  onChange={(e) => setEditingRate({ ...editingRate, to_currency: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00454a] focus:ring-[#00454a] sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Rate</label>
                <input
                  type="number"
                  step="0.000001"
                  value={editingRate.rate}
                  onChange={(e) => setEditingRate({ ...editingRate, rate: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00454a] focus:ring-[#00454a] sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Spread (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingRate.spread * 100}
                  onChange={(e) => setEditingRate({ ...editingRate, spread: parseFloat(e.target.value) / 100 })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00454a] focus:ring-[#00454a] sm:text-sm"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingRate(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00454a] text-white rounded-md hover:bg-[#003238]"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spread
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : rates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No exchange rates found
                  </td>
                </tr>
              ) : (
                rates.map((rate) => (
                  <tr key={rate.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {rate.from_currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {rate.to_currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {rate.rate.toFixed(6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(rate.spread * 100).toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(rate.last_updated).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(rate)}
                        className="text-[#00454a] hover:text-[#003238] mr-3"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(rate.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExchangeRates;