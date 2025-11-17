import { useMemo, useState, useEffect } from 'react';
import { toast } from 'sonner';

const useTransactionsData = () => {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('all');
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const loadTransactions = async (page = 1) => {
    try {
      // Dummy transactions data
      const dummyTransactions = [
        {
          _id: '1',
          user: 'user1@example.com',
          transactionAmount: 50,
          type: 'deposit',
          status: 'completed',
          createdAt: new Date().toISOString(),
          details: 'Deposit via PayPal'
        },
        {
          _id: '2',
          user: 'user2@example.com',
          transactionAmount: 25,
          type: 'withdrawal',
          status: 'pending',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          details: 'Withdrawal to bank'
        },
        {
          _id: '3',
          user: 'user3@example.com',
          transactionAmount: 100,
          type: 'subscription',
          status: 'completed',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          details: 'Monthly subscription'
        }
      ];

      const mapped = dummyTransactions.map((t) => ({
        id: t._id || t.id || t.transactionId || '',
        user: t.user || t.username || t.email || '',
        amount: Number(t.transactionAmount ?? t.balance ?? t.amount ?? 0),
        type: t.type || '',
        status: t.status || '',
        date: t.date || t.createdAt || '',
        details: t.name || t.details || '',
      }));

      setTransactions(mapped);
      setTotalPages(Math.ceil(dummyTransactions.length / itemsPerPage) || 1);
    } catch (e) {
      console.error('Failed to fetch transactions:', e);
      toast.error('Failed to fetch transactions');
      setTransactions([]);
      setTotalPages(1);
    }
  };

  useEffect(() => {
    loadTransactions(currentPage);
  }, [currentPage]);

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  const formatDate = (s) => new Date(s).toLocaleString();

  const filtered = useMemo(() => {
    let data = transactions;
    if (typeFilter !== 'all') data = data.filter((t) => t.type === typeFilter);
    const q = search.toLowerCase();
    if (q) {
      data = data.filter((t) =>
        [t.id, t.user, t.type, t.status].some((v) =>
          String(v).toLowerCase().includes(q)
        )
      );
    }
    return data;
  }, [transactions, search, typeFilter]);

  return {
    transactions,
    search,
    setSearch,
    selected,
    setSelected,
    currentPage,
    setCurrentPage,
    typeFilter,
    setTypeFilter,
    totalPages,
    filtered,
    formatCurrency,
    formatDate,
    loadTransactions
  };
};

export default useTransactionsData;