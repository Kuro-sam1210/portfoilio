import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FiMessageSquare, FiSend, FiTrash2 } from 'react-icons/fi';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const formatDate = (s) => new Date(s).toLocaleString();

const StatusBadge = ({ status }) => {
  const color =
    status === 'open'
      ? 'text-green-400'
      : status === 'closed'
      ? 'text-gray-400'
      : 'text-yellow-400';
  return <span className={`${color} font-medium capitalize`}>{status}</span>;
};

const SupportTickets = () => {
  const { hasPermission, admin } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const { ticketId } = useParams();
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [joinedTickets, setJoinedTickets] = useState(new Set());

  const chatEndRef = useRef(null);

  const normalizeTicket = (ticket) => ({
    ...ticket,
    id: ticket.ticketId || ticket.id,
    user: typeof ticket.user === 'object' ? ticket.user.userName || ticket.user.email || 'Unknown' : ticket.user,
    thread: ticket.messages || ticket.thread || [],
    status: ticket.status || 'open',
    subject: ticket.description || ticket.subject || ticket.issueLabel || 'Support Request',
    category: ticket.issueLabel || ticket.category,
    issueType: ticket.issueType
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selected, tickets]);

  useEffect(() => {
    if (ticketId) setSelected(ticketId);
  }, [ticketId]);

  // **FIX: Join ticket as admin when selecting**
  useEffect(() => {
    if (selected && admin && !joinedTickets.has(selected)) {
      console.log('🔄 Admin joining ticket:', selected);

      // Simulate joining ticket
      setTimeout(() => {
        console.log('✅ Admin successfully joined ticket:', selected);
      }, 500);

      // Mark this ticket as joined
      setJoinedTickets(prev => new Set(prev).add(selected));
    }
  }, [selected, admin, joinedTickets]);

  useEffect(() => {
    console.log('📡 Loading dummy support tickets...');
    setLoading(true);

    // Load dummy tickets after a short delay
    setTimeout(() => {
      const dummyTickets = [
        {
          ticketId: 'TICKET001',
          id: 'TICKET001',
          user: 'john_doe',
          subject: 'Deposit issue - payment not reflecting',
          description: 'Deposit issue - payment not reflecting',
          category: 'deposit',
          issueLabel: 'deposit',
          status: 'open',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [
            {
              id: 'msg1',
              from: 'user',
              message: 'Hi, I made a deposit but it\'s not showing in my account balance.',
              sender: 'john_doe',
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              role: 'user'
            },
            {
              id: 'msg2',
              from: 'admin',
              message: 'Hello! I\'m checking your deposit transaction. Can you please provide the transaction ID?',
              sender: 'Admin',
              timestamp: new Date(Date.now() - 1800000).toISOString(),
              role: 'admin'
            }
          ],
          priority: 'medium',
          issueType: 'deposit'
        },
        {
          ticketId: 'TICKET002',
          id: 'TICKET002',
          user: 'jane_smith',
          subject: 'Account verification taking too long',
          description: 'Account verification taking too long',
          category: 'kyc',
          issueLabel: 'kyc',
          status: 'in-progress',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 43200000).toISOString(),
          messages: [
            {
              id: 'msg3',
              from: 'user',
              message: 'My account verification has been pending for 3 days now.',
              sender: 'jane_smith',
              timestamp: new Date(Date.now() - 86400000).toISOString(),
              role: 'user'
            }
          ],
          priority: 'high',
          issueType: 'kyc'
        },
        {
          ticketId: 'TICKET003',
          id: 'TICKET003',
          user: 'bob_wilson',
          subject: 'Unable to reset password',
          description: 'Unable to reset password',
          category: 'password',
          issueLabel: 'password',
          status: 'closed',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          messages: [
            {
              id: 'msg4',
              from: 'user',
              message: 'I\'m having trouble resetting my password. The reset link isn\'t working.',
              sender: 'bob_wilson',
              timestamp: new Date(Date.now() - 172800000).toISOString(),
              role: 'user'
            },
            {
              id: 'msg5',
              from: 'admin',
              message: 'I\'ve reset your password. Please check your email for the new temporary password.',
              sender: 'Admin',
              timestamp: new Date(Date.now() - 86400000).toISOString(),
              role: 'admin'
            }
          ],
          priority: 'low',
          issueType: 'password'
        }
      ];

      setTickets(dummyTickets.map(normalizeTicket));
      setLoading(false);
    }, 1000);

    return () => {
      // Cleanup
    };
  }, []);

  const current = tickets.find((t) => t.id === selected);

  const sendReply = () => {
    if (!reply.trim() || !current) return;

    console.log('📤 Admin sending reply to ticket:', current.id);

    // Simulate sending message
    const newMessage = {
      id: `msg_${Date.now()}`,
      from: 'admin',
      message: reply.trim(),
      sender: 'Admin',
      timestamp: new Date().toISOString(),
      role: 'admin'
    };

    // Add message to current ticket
    setTickets(prev => prev.map(ticket =>
      ticket.id === current.id
        ? { ...ticket, thread: [...(ticket.thread || []), newMessage], updatedAt: new Date().toISOString() }
        : ticket
    ));

    setReply('');
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to permanently delete this ticket? This action cannot be undone.')) {
      return;
    }
    try {
      // Simulate delete
      setTickets((prev) => prev.filter((t) => t.id !== ticketId));
      if (selected === ticketId) {
        setSelected(null);
      }
    } catch (error) {
      console.error('Failed to delete ticket:', error);
      alert('Failed to delete ticket. Please try again.');
    }
  };

  const handleCloseTicket = (ticketId, reason) => {
    // Simulate closing ticket
    setTickets(prev => prev.map(ticket =>
      ticket.id === ticketId
        ? { ...ticket, status: 'closed', closeReason: reason || 'Issue resolved', updatedAt: new Date().toISOString() }
        : ticket
    ));
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      if (categoryFilter !== 'All' && ticket.category !== categoryFilter)
        return false;
      if (statusFilter !== 'All' && ticket.status !== statusFilter)
        return false;
      return true;
    });
  }, [tickets, categoryFilter, statusFilter]);

  const getCategoryLabel = (issueType) => {
    const categoryMap = {
      'deposit': 'Deposit',
      'withdrawal': 'Withdrawal',
      'subscription': 'Subscription',
      'kyc': 'KYC',
      'password': 'Password',
      'account': 'Account',
      'payment': 'Payment',
      'technical': 'Technical',
      'billing': 'Billing',
      'other': 'Issue'
    };
    return categoryMap[issueType] || issueType || 'Issue';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-purple-300 text-white p-8">
      <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Support Tickets</h2>

          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading support tickets...</p>
              </div>
            </div>
          )}

          {!loading && (
            <div className="mb-4 space-y-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCategoryFilter('All')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    categoryFilter === 'All'
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-[#2a2b2f]'
                  }`}
                >
                  All
                </button>
                <div className="flex gap-1 p-1 bg-gray-800 rounded-full">
                  {[
                    { label: 'Withdrawal Issues', value: 'withdrawal' },
                    { label: 'Deposit Issues', value: 'deposit' },
                    { label: 'Other', value: 'other' }
                  ].map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setCategoryFilter(cat.label)}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-full transition-colors ${
                        categoryFilter === cat.label
                          ? 'bg-gray-700 text-white'
                          : 'text-gray-300 hover:text-white hover:bg-[#3a3b3f]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-gray-800 border border-[#2a2b2f] text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-700"
                >
                  <option value="All">All</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          )}

          {!loading &&
            filteredTickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelected(t.id)}
                className={`rounded-xl p-5 bg-[#1a1b1e] border ${
                  selected === t.id
                    ? 'border-[#3b82f6]'
                    : 'border-transparent'
                } hover:border-[#3b82f6]/50 transition cursor-pointer`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[15px] text-green-400 font-medium">
                    {t.category || getCategoryLabel(t.issueType)}
                  </span>
                  <div className="flex items-center gap-2">
                    {t.priority && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        t.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        t.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {t.priority}
                      </span>
                    )}
                    <StatusBadge status={t.status} />
                  </div>
                </div>
                <div className="text-lg font-semibold text-white">
                  {t.subject}
                </div>
                <div className="text-sm text-gray-400 mt-1 flex items-center justify-between">
                  <span>{t.user}</span>
                  <span>{formatDate(t.updatedAt || t.createdAt)}</span>
                </div>
                <div className="text-gray-500 text-xs mt-1">
                  ID: {t.id}
                </div>
              </div>
            ))}

          {!loading && filteredTickets.length === 0 && (
            <div className="text-white-500 text-center py-10">
              No tickets found matching the selected filters.
            </div>
          )}
        </div>

        <div className="bg-gray-700 rounded-xl flex flex-col h-[80vh]">
          {!current ? (
            <div className="flex flex-col justify-center items-center flex-1 text-gray-400">
              <FiMessageSquare className="text-5xl mb-3" />
              <p>Select a ticket to view conversation</p>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-[#2a2b2f]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-lg">{current.subject}</div>
                    <div className="text-sm text-gray-400">
                      {current.user} • {current.id} •{' '}
                      <StatusBadge status={current.status} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {current.status !== 'closed' && hasPermission('respond_support_tickets') && (
                      <button
                        onClick={() => handleCloseTicket(current.id, 'Resolved by admin')}
                        className="p-2 text-green-400 hover:text-green-300 hover:bg-green-900/20 rounded-lg transition-colors text-sm"
                        title="Close ticket"
                      >
                        Close
                      </button>
                    )}
                    {hasPermission('delete_support_tickets') && (
                      <button
                        onClick={() => handleDeleteTicket(current.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete ticket"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {current.thread && current.thread.length > 0 ? (
                  current.thread.map((m, i) => (
                    <div
                      key={m.id || i}
                      className={`flex ${
                        m.from === 'admin' || m.role === 'admin' ? 'justify-end' : 
                        m.from === 'system' || m.role === 'system' ? 'justify-center' : 
                        'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-lg ${
                          m.from === 'admin' || m.role === 'admin'
                            ? 'bg-[#2563eb] text-white'
                            : m.from === 'system' || m.role === 'system'
                            ? 'bg-[#1a1b1e] text-gray-400 text-sm italic'
                            : 'bg-[#2a2b2f] text-gray-200'
                        }`}
                      >
                        <div className="text-xs opacity-75 mb-1">
                          {m.sender || m.from} • {m.time || formatDate(m.timestamp || m.at)}
                        </div>
                        <div>{m.message || m.text || 'Empty message'}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    No messages yet. Admin will see messages once you join the ticket.
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t border-[#2a2b2f] flex items-center gap-2">
                <input
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendReply()}
                  placeholder="Type your reply..."
                  disabled={current.status === 'closed'}
                  className="flex-1 px-3 py-2 bg-[#2a2b2f] border border-[#3a3b3e] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {hasPermission('respond_support_tickets') && (
                  <button
                    onClick={sendReply}
                    disabled={current.status === 'closed' || !reply.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiSend className="w-4 h-4" /> Send
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportTickets;