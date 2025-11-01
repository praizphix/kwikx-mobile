import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { supabase } from '../../lib/supabase';
import LoadingScreen from '../common/LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly }) => {
  const { user, loading } = useUser();
  const navigate = useNavigate();
  const [adminStatus, setAdminStatus] = useState<{
    loading: boolean;
    isAdmin: boolean;
    checked: boolean;
  }>({ loading: false, isAdmin: false, checked: false });

  useEffect(() => {
    // Only check admin status if we need to and haven't checked yet
    if (!adminOnly || adminStatus.checked || !user) {
      return;
    }

    const checkAdminStatus = async () => {
      setAdminStatus({ loading: true, isAdmin: false, checked: false });

      try {
        console.log('Checking admin status for user:', user.email);
        
        // Hardcoded admin check as primary method during network issues
        const adminEmail = 'info@getkwikx.com';
        const isHardcodedAdmin = user.email?.toLowerCase().trim() === adminEmail.toLowerCase();
        
        let isAdmin = isHardcodedAdmin;
        
        // Only try database check if we're not already confirmed as hardcoded admin
        if (!isHardcodedAdmin) {
          try {
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Database timeout')), 3000)
            );
            
            const dbPromise = supabase
              .from('admin_users')
              .select('role')
              .eq('id', user.id)
              .maybeSingle();
            
            const { data: adminData, error } = await Promise.race([dbPromise, timeoutPromise]) as any;
            
            if (!error && adminData) {
              isAdmin = true;
              console.log('Admin verified via database:', user.email, 'Role:', adminData.role);
            }
          } catch (dbError) {
            console.warn('Database admin check failed, using hardcoded fallback:', dbError);
          }
        }

        console.log('Final admin check result:', { isAdmin, email: user.email });
        setAdminStatus({ loading: false, isAdmin, checked: true });

      } catch (error) {
        console.error('Admin check error:', error);
        setAdminStatus({ loading: false, isAdmin: false, checked: true });
      }
    };

    checkAdminStatus();
  }, [user, adminOnly, adminStatus.checked]);

  // Show loading while checking user authentication
  if (loading) {
    return <LoadingScreen />;
  }

  // Redirect to login if no user
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // For non-admin routes, render immediately
  if (!adminOnly) {
    return <>{children}</>;
  }

  // Show loading while checking admin status
  if (adminStatus.loading) {
    return <LoadingScreen />;
  }

  // If admin check is complete but user is not admin
  if (adminStatus.checked && !adminStatus.isAdmin) {
    console.log('User is not admin, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // If admin check is complete and user is admin, or if we haven't checked yet
  if (adminStatus.checked && adminStatus.isAdmin) {
    return <>{children}</>;
  }

  // Default loading state
  return <LoadingScreen />;
};

export default ProtectedRoute;