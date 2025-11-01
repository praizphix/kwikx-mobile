import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, CheckCircle, XCircle, Eye, Download, Shield, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface KYCApplication {
  id: string;
  user_id: string;
  user_email: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  birth_date: string;
  birth_city: string;
  nationality: string;
  gender: string;
  address_line1: string;
  address_city: string;
  address_country: string;
  id_document_url: string;
  proof_address_url: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string;
  created_at: string;
  approved_by: string;
  approved_at: string;
  wallet_type?: string;
  documents?: any;
  verification_data?: any;
  // New fields for wallet status
  wallet_current_status?: 'active' | 'inactive' | 'activation_pending' | 'unknown' | 'error';
  wallet_activation_pending?: boolean;
}

const KYCApproval: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<KYCApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('pending');
  const [selectedApplication, setSelectedApplication] = useState<KYCApplication | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      console.log('🔍 Fetching KYC applications...');
      
      // Use service role for admin operations to bypass RLS issues
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No admin session');
      }

      console.log('📞 Calling admin KYC fetch function...');

      // Call server-side function to fetch KYC data with admin privileges
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-kyc-fetch`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'fetch_all' }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Admin KYC fetch failed:', errorData);
        throw new Error(errorData.error || 'Failed to fetch KYC applications');
      }

      const data = await response.json();
      console.log('✅ Fetched KYC data:', data.data?.length || 0, 'records');
      console.log('RESPONSE DATA:', JSON.stringify(data, null, 2));

      if (data.data) {
        // Normalize data from either kyc_requests or kyc_applications
        const normalizedData = data.data.map((item: any) => {
          // If this is from kyc_applications, extract data from verification_data
          if (item.verification_data && item.wallet_type) {
            const vData = item.verification_data;
            return {
              ...item,
              // Extract these fields from verification_data if they exist there
              firstname: vData.firstname || vData.full_name?.split(' ')[0] || item.firstname || '',
              lastname: vData.lastname || vData.full_name?.split(' ').slice(1).join(' ') || item.lastname || '',
              email: vData.email || item.email || '',
              phone: vData.phone || item.phone || '',
              birth_date: vData.date_of_birth || vData.birth_date || item.birth_date || '',
              birth_city: vData.birth_city || item.birth_city || '',
              nationality: vData.nationality || item.nationality || 'BJ',
              gender: vData.gender || item.gender || '',
              address_line1: vData.address || vData.address_line1 || item.address_line1 || '',
              address_city: vData.city || vData.address_city || item.address_city || 'Cotonou',
              address_country: vData.country || vData.address_country || item.address_country || 'BJ',
              // Extract document URLs from documents object if they exist there
              id_document_url: item.documents?.id_document || item.id_document_url || '',
              proof_address_url: item.documents?.proof_of_address || item.proof_address_url || '',
              // Map verified_by to approved_by if needed
              approved_by: item.approved_by || item.verified_by || '',
              approved_at: item.approved_at || item.verified_at || '',
              // Use submitted_at as created_at if needed
              created_at: item.created_at || item.submitted_at || '',
            };
          }
          return item;
        });
        
        setApplications(normalizedData);
      } else {
        setApplications([]);
      }

    } catch (error: any) {
      console.error('❌ Error fetching applications:', error);
      toast.error(`Failed to load KYC applications: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async (id: string) => {
    if (!confirm('Are you sure you want to approve this KYC application? This will create a FedaPay customer and activate the CFA wallet.')) {
      return;
    }

    setProcessingId(id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      // Log VITE_SUPABASE_URL
      console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
      // Log fetch initiation
      console.log('FETCHING...', `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kyc-approve`);
      // Log the exact URL and access token (first 10 chars)
      console.log("➡️ Calling:", `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kyc-approve`);
      console.log("🔐 Access token:", session?.access_token?.slice(0, 10), '...');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kyc-approve`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            kyc_request_id: id,
            action: 'approve',
            admin_notes: 'Approved by admin - FedaPay customer created and CFA wallet activated'
          }),
        }
      );

      // Log raw fetch response
      console.log('RAW RESPONSE:', response);

      const data = await response.json();
      console.log('RESPONSE DATA:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        console.error('❌ KYC approval failed:', data);
        throw new Error(data.error || 'KYC approval failed');
      }

      console.log('✅ KYC approval successful:', data);

      // Get customer name and wallet type from the response
      const firstName = data.data?.firstname || '';
      const lastName = data.data?.lastname || '';
      const walletType = data.data?.wallet_type || 'cfa';
      const fullName = `${firstName} ${lastName}`.trim();
      
      // Format wallet type for display
      const walletTypeDisplay = walletType === 'cfa' ? 'CFA' : 
                               walletType === 'naira' ? 'Naira' : 
                               walletType.toUpperCase();

      if (walletType === 'cfa' && data.data?.fedapay_customer_id) {
        toast.success(`KYC approved! FedaPay customer created (${data.data.fedapay_customer_id}) and ${walletTypeDisplay} wallet activated for ${fullName}.`);
        fetchApplications();
      } else if (walletType === 'naira' && data.data?.payonus_account_number) {
        toast.success(`KYC approved! PayOnUs account created (${data.data.payonus_account_number}) and ${walletTypeDisplay} wallet activated for ${fullName}.`);
        fetchApplications();
      } else {
        toast.error(`${walletTypeDisplay} wallet provider integration failed. Approval failed for ${fullName}.`);
        return;
      }
    } catch (error: any) {
      console.error('❌ Error approving KYC:', error);
      toast.error(error.message || 'Failed to approve KYC application');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    setProcessingId(id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kyc-approve`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            kyc_request_id: id,
            action: 'reject',
            admin_notes: reason
          }),
        }
      );

      const data = await response.json();
      console.log('REJECTION RESPONSE DATA:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        throw new Error(data.error || 'KYC rejection failed');
      }

      // Get customer name and wallet type from the response
      const firstName = data.data?.firstname || '';
      const lastName = data.data?.lastname || '';
      const walletType = data.data?.wallet_type || '';
      const fullName = `${firstName} ${lastName}`.trim();
      
      // Format wallet type for display
      const walletTypeDisplay = walletType === 'cfa' ? 'CFA' : 
                               walletType === 'naira' ? 'Naira' : 
                               walletType ? walletType.toUpperCase() : '';
      
      // Include customer name and wallet type in success message if available
      const successMessage = fullName && walletTypeDisplay 
        ? `KYC application for ${fullName} (${walletTypeDisplay} wallet) rejected`
        : 'KYC application rejected';
        
      toast.success(successMessage);
      fetchApplications();
    } catch (error: any) {
      console.error('❌ Error rejecting KYC:', error);
      toast.error(error.message || 'Failed to reject KYC application');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredApplications = applications.filter(application => {
    const matchesSearch = 
      (application.user_email || application.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (application.firstname || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (application.lastname || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || filter === application.status;
    return matchesSearch && matchesFilter;
  });

  // Helper function to get wallet status display
  const getWalletStatusDisplay = (application: KYCApplication) => {
    // If KYC is not approved, show KYC status
    if (application.status !== 'approved') {
      return {
        text: application.status === 'pending' ? 'KYC Pending' : 'KYC Rejected',
        color: application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800',
        icon: application.status === 'pending' ? Clock : XCircle
      };
    }

    // If KYC is approved, show wallet status
    if (application.wallet_current_status === 'active') {
      return {
        text: 'Wallet Active',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle
      };
    } else if (application.wallet_activation_pending || application.wallet_current_status === 'activation_pending') {
      return {
        text: 'Activation Pending',
        color: 'bg-blue-100 text-blue-800',
        icon: Clock
      };
    } else if (application.wallet_current_status === 'inactive') {
      return {
        text: 'Wallet Inactive',
        color: 'bg-gray-100 text-gray-800',
        icon: AlertTriangle
      };
    } else {
      return {
        text: 'Status Unknown',
        color: 'bg-gray-100 text-gray-800',
        icon: AlertTriangle
      };
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
            <h1 className="text-2xl font-bold text-gray-900">KYC Approval & Wallet Activation</h1>
            <p className="text-gray-600">Review KYC applications and activate wallets for customers</p>
          </div>
        </div>
        <button
          onClick={fetchApplications}
          className="flex items-center px-4 py-2 bg-[#00454a] text-white rounded-lg hover:bg-[#003238]"
        >
          <RefreshCw size={18} className="mr-2" />
          Refresh
        </button>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-blue-400" />
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Multi-Country Integration:</strong> Approving KYC applications will automatically create payment provider accounts 
              and activate wallets based on the country. CFA wallets use FedaPay for Benin Republic, while Naira wallets use PayOnUs for Nigeria.
            </p>
          </div>
        </div>
      </div>

      {applications.length === 0 && !loading && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>No KYC Applications Found:</strong> There are currently no KYC applications in the system. 
                Users need to submit KYC applications through the wallet verification process first.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by email or name..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-[#00454a] focus:border-[#00454a]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-[#00454a] focus:border-[#00454a] appearance-none bg-white"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  KYC Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wallet Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documents
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Loading KYC applications...
                  </td>
                </tr>
              ) : filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    {applications.length === 0 ? 'No KYC applications found. Users need to submit applications first.' : 'No applications match your search criteria.'}
                  </td>
                </tr>
              ) : (
                filteredApplications.map((application) => {
                  const walletStatus = getWalletStatusDisplay(application);
                  const walletType = application.wallet_type || 'cfa';
                  const isBeninCustomer = application.nationality === 'BJ' || application.address_country === 'BJ';
                  const isNigerianCustomer = application.nationality === 'NG' || application.address_country === 'NG';
                  const countryFlag = isBeninCustomer ? '🇧🇯' : isNigerianCustomer ? '🇳🇬' : '🌍';
                  
                  return (
                    <tr key={application.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {application.firstname} {application.lastname}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.user_email || application.email}
                        </div>
                        <div className="text-sm text-gray-500 font-mono">
                          📞 {application.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {countryFlag} {application.address_city || (isBeninCustomer ? 'Cotonou' : isNigerianCustomer ? 'Lagos' : '')}, {application.address_country || (isBeninCustomer ? 'Benin' : isNigerianCustomer ? 'Nigeria' : '')}
                        </div>
                        <div className="text-sm text-gray-500">
                          Born: {application.birth_city || (isBeninCustomer ? 'Cotonou' : isNigerianCustomer ? 'Lagos' : '')}
                        </div>
                        <div className="text-xs text-gray-500">
                          Wallet: <span className="font-medium">{walletType.toUpperCase()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(application.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          application.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : application.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {application.status}
                        </span>
                        {application.admin_notes && (
                          <div className="text-xs text-gray-500 mt-1">
                            {application.admin_notes}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${walletStatus.color}`}>
                          <walletStatus.icon size={14} className="mr-1" />
                          {walletStatus.text}
                        </span>
                        {application.wallet_current_status && (
                          <div className="text-xs text-gray-500 mt-1">
                            Status: {application.wallet_current_status}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          {application.id_document_url && (
                            <button
                              onClick={() => window.open(application.id_document_url)}
                              className="text-[#00454a] hover:text-[#003238]"
                              title="View ID Document"
                            >
                              <Eye size={18} />
                            </button>
                          )}
                          {application.proof_address_url && (
                            <button
                              onClick={() => window.open(application.proof_address_url)}
                              className="text-[#00454a] hover:text-[#003238]"
                              title="View Proof of Address"
                            >
                              <Download size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {application.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(application.id)}
                                disabled={processingId === application.id}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                title="Approve KYC & Activate Wallet"
                              >
                                {processingId === application.id ? (
                                  <RefreshCw size={18} className="animate-spin" />
                                ) : (
                                  <CheckCircle size={18} />
                                )}
                              </button>
                              <button
                                onClick={() => handleReject(application.id)}
                                disabled={processingId === application.id}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                title="Reject KYC"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setSelectedApplication(application)}
                            className="text-[#00454a] hover:text-[#003238]"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              KYC Application Details
              {selectedApplication.nationality === 'BJ' && ' - Benin Republic'}
              {selectedApplication.nationality === 'NG' && ' - Nigeria'}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Name:</strong> {selectedApplication.firstname} {selectedApplication.lastname}
                </div>
                <div>
                  <strong>Email:</strong> {selectedApplication.email}
                </div>
                <div>
                  <strong>Phone:</strong> 
                  <code className="ml-2 bg-gray-100 px-2 py-1 rounded">{selectedApplication.phone}</code>
                </div>
                <div>
                  <strong>Gender:</strong> {selectedApplication.gender || 'Not specified'}
                </div>
                <div>
                  <strong>Birth Date:</strong> {selectedApplication.birth_date || 'Not provided'}
                </div>
                <div>
                  <strong>Birth City:</strong> {selectedApplication.birth_city || (selectedApplication.nationality === 'BJ' ? 'Cotonou' : 'Lagos')}
                </div>
                <div>
                  <strong>Nationality:</strong> {selectedApplication.nationality === 'BJ' ? '🇧🇯 Benin (BJ)' : selectedApplication.nationality === 'NG' ? '🇳🇬 Nigeria (NG)' : selectedApplication.nationality}
                </div>
                <div>
                  <strong>Wallet Type:</strong> <span className="font-medium">{selectedApplication.wallet_type?.toUpperCase() || 'CFA'}</span>
                </div>
                <div>
                  <strong>KYC Status:</strong> 
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    selectedApplication.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : selectedApplication.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedApplication.status}
                  </span>
                </div>
                <div>
                  <strong>Wallet Status:</strong> 
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    selectedApplication.wallet_current_status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : selectedApplication.wallet_current_status === 'activation_pending'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedApplication.wallet_current_status || 'unknown'}
                  </span>
                </div>
              </div>
              
              {/* Nigeria-specific fields */}
              {selectedApplication.nationality === 'NG' && (
                <div className="grid grid-cols-2 gap-4 mt-2 pt-2 border-t border-gray-200">
                  <div>
                    <strong>BVN:</strong> {selectedApplication.bvn || 'Not provided'}
                  </div>
                  <div>
                    <strong>NIN:</strong> {selectedApplication.nin || 'Not provided'}
                  </div>
                </div>
              )}
              
              <div>
                <strong>Address:</strong>
                <p className="mt-1">{selectedApplication.address_line1}</p>
                <p>{selectedApplication.address_city || (selectedApplication.nationality === 'BJ' ? 'Cotonou' : 'Lagos')}, {selectedApplication.address_country || (selectedApplication.nationality === 'BJ' ? 'Benin' : 'Nigeria')}</p>
              </div>

              {selectedApplication.admin_notes && (
                <div>
                  <strong>Admin Notes:</strong>
                  <p className="mt-1 text-gray-600">{selectedApplication.admin_notes}</p>
                </div>
              )}

              <div>
                <strong>Submitted:</strong> {new Date(selectedApplication.created_at).toLocaleString()}
              </div>

              {selectedApplication.approved_at && (
                <div>
                  <strong>Processed:</strong> {new Date(selectedApplication.approved_at).toLocaleString()}
                </div>
              )}
              
              {/* Wallet activation status */}
              <div className={`p-4 rounded-lg ${
                selectedApplication.wallet_current_status === 'active'
                  ? 'bg-green-50 border-l-4 border-green-400'
                  : selectedApplication.wallet_current_status === 'activation_pending'
                  ? 'bg-blue-50 border-l-4 border-blue-400'
                  : selectedApplication.status === 'approved'
                  ? 'bg-yellow-50 border-l-4 border-yellow-400'
                  : 'bg-gray-50 border-l-4 border-gray-300'
              }`}>
                <div className="flex">
                  {selectedApplication.wallet_current_status === 'active' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : selectedApplication.wallet_current_status === 'activation_pending' ? (
                    <Clock className="h-5 w-5 text-blue-500" />
                  ) : selectedApplication.status === 'approved' ? (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-gray-500" />
                  )}
                  <div className="ml-3">
                    <p className="text-sm font-medium">
                      {selectedApplication.wallet_current_status === 'active'
                        ? `${selectedApplication.wallet_type?.toUpperCase() || 'CFA'} wallet is active and ready to use`
                        : selectedApplication.wallet_current_status === 'activation_pending'
                        ? `${selectedApplication.wallet_type?.toUpperCase() || 'CFA'} wallet activation is pending`
                        : selectedApplication.status === 'approved'
                        ? `KYC is approved but wallet is not yet active`
                        : `Wallet cannot be activated until KYC is approved`
                      }
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {selectedApplication.wallet_current_status === 'active'
                        ? 'User can now deposit and withdraw funds'
                        : selectedApplication.wallet_current_status === 'activation_pending'
                        ? 'Wallet is in the process of being activated'
                        : selectedApplication.status === 'approved'
                        ? 'Please check payment provider integration status'
                        : 'Approve the KYC application to activate the wallet'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedApplication(null)}
              className="mt-6 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYCApproval;