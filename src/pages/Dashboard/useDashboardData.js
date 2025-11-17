import { useState, useEffect } from 'react';

const useDashboardData = () => {
  const [summary, setSummary] = useState({
    data: {
      totalUsers: 1250,
      postsToday: 45,
      totalRevenue: 15750,
      newSignups: 23
    }
  });
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  const [userGrowthApiData, setUserGrowthApiData] = useState([
    { date: '2024-11-01', users: 1000 },
    { date: '2024-11-02', users: 1020 },
    { date: '2024-11-03', users: 1050 },
    { date: '2024-11-04', users: 1080 },
    { date: '2024-11-05', users: 1100 },
    { date: '2024-11-06', users: 1125 },
    { date: '2024-11-07', users: 1150 },
    { date: '2024-11-08', users: 1175 },
    { date: '2024-11-09', users: 1200 },
    { date: '2024-11-10', users: 1225 },
    { date: '2024-11-11', users: 1250 }
  ]);
  const [subscriptionRevenueApiData, setSubscriptionRevenueApiData] = useState([
    { plan: 'Basic', revenue: 5000 },
    { plan: 'Premium', revenue: 7500 },
    { plan: 'VIP', revenue: 3250 }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate loading
    setSummaryLoading(true);
    setTimeout(() => {
      setSummaryLoading(false);
    }, 500);
  }, []);

  return {
    summary,
    summaryLoading,
    summaryError,
    userGrowthApiData,
    subscriptionRevenueApiData,
    loading,
    error
  };
};

export default useDashboardData;