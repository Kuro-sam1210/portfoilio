import { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';

const useUsersData = () => {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [confirm, setConfirm] = useState(null); // { type: 'suspend'|'delete'|'enable'|'verify', user }
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [sortBy, setSortBy] = useState('newest');
  const [planFilter, setPlanFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const menuRef = useRef(null);

  // Debounced search
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Helpers to normalize backend user objects into the UI shape
  const toShape = (u) => {
    if (!u) return null;
    const id = u.userId || u._id || u.id || '';
    const username = u.username || (u.email ? u.email.split('@')[0] : '');
    const first = u.firstName || u.first || '';
    const last = u.lastName || u.lastName || u.last || '';
    const fullName = `${first} ${last}`.trim() || username;
    // normalize subscriptionPlan to a string (backend may return an object)
    let plan = u.subscriptionPlan ?? 'Free';
    if (plan && typeof plan === 'object') {
      plan = plan.planName || plan.name || String(plan) || 'Free';
    }
    if (!plan) plan = 'Free';

    // normalize verification flags from multiple backend shapes
    const verifiedFlag = u.verified ?? u.isVerified ?? u.profileVerification ?? false;

    return {
      id,
      username,
      profilePic: u.picture || u.profilePic || '',
      fullName,
      email: u.email || '',
      subscriptionPlan: plan,
      balance: typeof u.balance !== 'undefined' ? u.balance : (u.rawBalance || 0),
      isDisabled: u.isDisabled || false,
      verified: !!verifiedFlag,
      dateJoined: u.dateJoined ? new Date(u.dateJoined).toLocaleDateString() : (u.dateJoinedString || ''),
      rawDateJoined: u.dateJoined ? new Date(u.dateJoined) : null,
      raw: u,
    };
  };

  const truncateMiddle = (s, head = 6, tail = 4) => {
    if (!s) return '';
    if (s.length <= head + tail + 3) return s;
    return `${s.slice(0, head)}...${s.slice(-tail)}`;
  };

  const truncateRight = (s, len = 12) => {
    if (!s) return '';
    return s.length > len ? s.slice(0, len) + '...' : s;
  };

  const copyId = async (id) => {
    if (!id) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(id);
      } else {
        const ta = document.createElement('textarea');
        ta.value = id;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      toast.success('ID copied to clipboard');
    } catch (e) {
      console.error('copy failed', e);
      toast.error('Failed to copy ID');
    }
  };

  const formatBalance = (u) => {
    const raw = u?.raw || u;
    const val = Number(raw?.balance ?? u?.balance ?? 0) || 0;
    const isNigeria = raw?.country === 'Nigeria';
    const symbol = '$';
    return `${symbol}${new Intl.NumberFormat(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(val)}`;
  };

  const applyUpdate = (payload) => {
    setUsers((prev) => prev.map((u) => (u.id === payload.id ? { ...u, ...payload } : u)));
  };

  // Load dummy users
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Dummy users data
        const dummyUsers = [
          {
            userId: '1',
            username: 'john_doe',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            subscriptionPlan: 'Premium',
            balance: 150,
            verified: true,
            dateJoined: new Date(Date.now() - 2592000000).toISOString(), // 30 days ago
            isDisabled: false
          },
          {
            userId: '2',
            username: 'jane_smith',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
            subscriptionPlan: 'Basic',
            balance: 50,
            verified: false,
            dateJoined: new Date(Date.now() - 5184000000).toISOString(), // 60 days ago
            isDisabled: false
          },
          {
            userId: '3',
            username: 'bob_wilson',
            firstName: 'Bob',
            lastName: 'Wilson',
            email: 'bob@example.com',
            subscriptionPlan: 'Free',
            balance: 0,
            verified: true,
            dateJoined: new Date(Date.now() - 7776000000).toISOString(), // 90 days ago
            isDisabled: true
          }
        ];

        setUsers(dummyUsers.map(toShape));

      } catch (err) {
        console.error('[users] fetch error', err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const onUpdated = (e) => {
      const updated = e?.detail;
      if (!updated) return;
      try {
        const shaped = toShape(updated);
        applyUpdate(shaped);
      } catch (err) {
        console.error('failed to apply user-updated event', err);
      }
    };
    window.addEventListener('admin:user-updated', onUpdated);
    return () => window.removeEventListener('admin:user-updated', onUpdated);
  }, []);

  const suspendUser = async (user) => {
    setActionLoading(true);
    try {
      // Simulate suspend
      applyUpdate({ id: user.id, isDisabled: true, subscriptionPlan: 'Suspended' });
      toast.success('User suspended');
    } catch (err) {
      console.error('[users] suspend error', err);
      toast.error('Failed to suspend user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleView = async (user) => {
    // open modal by pushing ?user=<id> so it survives refresh/navigation
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('user', user.id);
      console.debug('[Users] open modal url ->', url.toString(), 'userId ->', user.id);
      // pushState doesn't fire popstate; fire one so UserModal's popstate listener updates immediately
      window.history.pushState({}, '', url.toString());
      try {
        window.dispatchEvent(new PopStateEvent('popstate'));
      } catch (e) {
        // older browsers: fallback to a custom event
        window.dispatchEvent(new Event('popstate'));
      }
      console.debug('[Users] pushState + popstate dispatched');
    } catch (e) {
      console.error('failed to open user modal via url', e);
    }
  };

  const deleteUser = async (user) => {
    setActionLoading(true);
    try {
      // Simulate delete
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      toast.success('User deleted');
    } catch (err) {
      console.error('[users] delete error', err);
      toast.error('Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const enableUser = async (user) => {
    setActionLoading(true);
    try {
      // Simulate enable
      applyUpdate({ id: user.id, isDisabled: false, subscriptionPlan: user.subscriptionPlan || 'Free' });
      toast.success('User enabled');
    } catch (err) {
      console.error('[users] enable error', err);
      toast.error('Failed to enable user');
    } finally {
      setActionLoading(false);
    }
  };

  const verifyUser = async (user) => {
    setActionLoading(true);
    try {
      // Simulate verify
      applyUpdate({ id: user.id, verified: true });
      toast.success('User verified');
    } catch (err) {
      console.error('[users] verify error', err);
      toast.error('Failed to verify user');
    } finally {
      setActionLoading(false);
    }
  };

  const unverifyUserHandler = async (user) => {
    setActionLoading(true);
    try {
      // Simulate unverify
      applyUpdate({ id: user.id, verified: false });
      toast.success('User unverified');
    } catch (err) {
      console.error('[users] unverify error', err);
      toast.error('Failed to unverify user');
    } finally {
      setActionLoading(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [openMenuId]);

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users;
    const q = query.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((u) => {
        return (
          (u.id || '').toLowerCase().includes(q) ||
          (u.username || '').toLowerCase().includes(q) ||
          (u.fullName || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q) ||
          (u.subscriptionPlan || '').toLowerCase().includes(q)
        );
      });
    }
    if (planFilter !== 'all') {
      filtered = filtered.filter((u) => u.subscriptionPlan === planFilter);
    }
    if (verifiedFilter === 'verified') {
      filtered = filtered.filter((u) => u.verified);
    } else if (verifiedFilter === 'unverified') {
      filtered = filtered.filter((u) => !u.verified);
    }
    if (sortBy === 'newest') {
      filtered = [...filtered].sort((a, b) => (b.rawDateJoined || 0) - (a.rawDateJoined || 0));
    } else if (sortBy === 'oldest') {
      filtered = [...filtered].sort((a, b) => (a.rawDateJoined || 0) - (b.rawDateJoined || 0));
    }
    return filtered;
  }, [users, query, planFilter, verifiedFilter, sortBy]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedUsers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);

  // Ensure currentPage remains valid when filters/search change.
  // If the available totalPages drops below the current page, clamp it.
  useEffect(() => {
    if (totalPages <= 0) {
      if (currentPage !== 1) setCurrentPage(1);
      return;
    }
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  return {
    users,
    query,
    setQuery,
    confirm,
    setConfirm,
    loading,
    actionLoading,
    openMenuId,
    setOpenMenuId,
    currentPage,
    setCurrentPage,
    sortBy,
    setSortBy,
    planFilter,
    setPlanFilter,
    verifiedFilter,
    setVerifiedFilter,
    menuRef,
    debouncedQuery,
    truncateMiddle,
    truncateRight,
    copyId,
    formatBalance,
    applyUpdate,
    suspendUser,
    handleView,
    deleteUser,
    enableUser,
    verifyUser,
    unverifyUserHandler,
    filteredAndSortedUsers,
    paginatedUsers,
    totalPages
  };
};

export default useUsersData;