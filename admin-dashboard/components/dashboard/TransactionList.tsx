import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Transaction } from '../../types';

const TransactionList: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;

      // Ensure amount is always a valid number to prevent toLocaleString errors
      const validatedTransactions = (data || []).map(transaction => ({
        ...transaction,
        amount: typeof transaction.amount === 'number' ? transaction.amount : 
                typeof transaction.amount === 'string' ? parseFloat(transaction.amount) || 0 : 0
      }));

      setTransactions(validatedTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send':
        return <ArrowUpRight size={24} className="text-white" />;
      case 'receive':
        return <ArrowDownLeft size={24} className="text-white" />;
      case 'exchange':
        return <RefreshCw size={24} className="text-white" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTransactionDescription = (transaction: Transaction) => {
    return transaction.description || `${transaction.type} transaction`;
  };

  if (loading) {
    return (
      <div className="bg-[#00454a] rounded-xl text-white">
        <div className="p-4 border-b border-[#005c63]">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Recent Transactions</h3>
          </div>
        </div>
        <div className="p-8 text-center text-gray-300">
          Loading transactions...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#00454a] rounded-xl text-white">
      <div className="p-4 border-b border-[#005c63]">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Recent Transactions</h3>
          <a href="/transactions" className="text-sm text-[#eeb83b]">See all</a>
        </div>
      </div>
      
      <div className="divide-y divide-[#005c63]">
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-300">
            No transactions yet
          </div>
        ) : (
          transactions.map((transaction) => (
            <div key={transaction.id} className="p-4 hover:bg-[#005c63] transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center bg-[#005c63]">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">
                      {getTransactionDescription(transaction)}
                    </p>
                    <p className="text-sm opacity-75">
                      {formatDate(transaction.created_at)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {transaction.type === 'receive' ? '+' : 
                     transaction.type === 'send' ? '-' : ''}
                    {typeof transaction.amount === 'number' ? transaction.amount.toLocaleString() : '0'}
                    <span className="ml-1 opacity-75 text-sm">
                      {transaction.currency}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionList;