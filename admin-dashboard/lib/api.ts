import { supabase } from './supabase';

export const api = {
  auth: {
    register: async (data: { email: string; password: string; name: string }) => {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { name: data.name }
        }
      });
      
      if (error) throw error;
      return { data: authData };
    },

    login: async (data: { email: string; password: string }) => {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });
      
      if (error) throw error;

      // Check if user is admin using maybeSingle() instead of single()
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', authData.user?.id)
        .maybeSingle();

      return {
        data: {
          user: {
            ...authData.user,
            isAdmin: !!adminData
          }
        }
      };
    },

    verifyEmail: async (token: string) => {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'signup'
      });
      
      if (error) throw error;
      return { data };
    }
  }
};