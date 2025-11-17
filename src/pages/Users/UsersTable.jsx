import React from 'react';
import { FiEye, FiSlash, FiTrash2, FiLock, FiCheck, FiMoreVertical, FiUser, FiCopy } from 'react-icons/fi';

const UsersTable = ({
  paginatedUsers,
  openMenuId,
  setOpenMenuId,
  handleView,
  setConfirm,
  verifyUser,
  unverifyUserHandler,
  enableUser,
  actionLoading,
  hasPermission,
  truncateMiddle,
  truncateRight,
  copyId
}) => {
  React.useEffect(() => {
    // Inject pop-in keyframes if not already present
    if (!document.getElementById('users-table-popin')) {
      const s = document.createElement('style');
      s.id = 'users-table-popin';
      s.textContent = `@keyframes pop-in { 0% { opacity: 0; transform: scale(0.96) translateY(10px); } 50% { transform: scale(1.02) translateY(-6px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }`;
      document.head.appendChild(s);
    }
  }, []);

  return (
    <div className="relative">
      <div className="relative bg-[var(--color-bg-secondary)] dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-transparent hover:border-white/10">
        <table className="min-w-full divide-y divide-[var(--color-bg-tertiary)]">
          <thead className="bg-transparent">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
            User ID
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
            User
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
            Email
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
            Plan
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
            Status
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
            Date Joined
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
            Actions
          </th>
        </tr>
          </thead>
          <tbody className="bg-transparent divide-y divide-[var(--color-bg-tertiary)]">
        {paginatedUsers.map((user, idx) => (
          <tr
            key={user.id}
            className="hover:bg-[var(--color-bg-tertiary)]/60 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            onClick={() => handleView(user)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleView(user); } }}
            style={{ animation: `pop-in 420ms cubic-bezier(0.68, -0.55, 0.265, 1.55) both`, animationDelay: `${idx * 60}ms` }}
          >
            <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-primary)]">
              <div className="flex items-center gap-2">
                <div className="font-mono">{truncateMiddle(user.id)}</div>
                <button onClick={() => copyId(user.id)} title="Copy ID" className="p-1 rounded hover:bg-[var(--color-bg-tertiary)]">
                  <FiCopy className="w-4 h-4 text-[var(--color-text-secondary)]" />
                </button>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                {user.profilePic ? (
                  <img className="h-10 w-10 rounded-full object-cover" src={user.profilePic} alt="" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center text-[var(--color-text-secondary)]">
                    <div className="p-1 rounded-full bg-gradient-to-br from-red-400 to-red-400 text-white">
                      <FiUser className="w-4 h-4" />
                    </div>
                  </div>
                )}
                <div className="ml-4 text-sm font-medium text-[var(--color-text-primary)] flex items-center gap-2">
                  <span>{truncateRight(user.username || user.fullName)}</span>
                  {user.verified && (
                    <span title="Verified" className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-600 text-white">
                      <FiCheck className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-secondary)]">
              {user.email ? `${user.email.split('@')[0].substring(0, 3)}...@${user.email.split('@')[1]}` : ''}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${
                user.subscriptionPlan === 'Free' ? 'bg-red-400 text-white' :
                'bg-gradient-to-r from-emerald-500 to-teal-400 text-white'
              }`}>
                {user.subscriptionPlan}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {user.isDisabled ? (
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-600 text-white shadow-sm">
                  Suspended
                </span>
              ) : (
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-600 text-white shadow-sm">
                  Active
                </span>
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-secondary)]">{user.dateJoined}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === user.id ? null : user.id); }}
                  className="p-1 rounded-full hover:bg-[var(--color-bg-tertiary)] transition-all duration-200 transform hover:scale-110"
                >
                  <FiMoreVertical className="w-5 h-5 text-[var(--color-text-secondary)]" />
                </button>
                {openMenuId === user.id && (
                  <div className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-gray-800/95 backdrop-blur rounded-lg shadow-2xl z-50 flex flex-col divide-y divide-[var(--color-border)] overflow-hidden animate-fadeIn border border-transparent">
                    <button
                          onClick={() => { handleView(user); setOpenMenuId(null); }}
                          className="block w-full text-left px-4 py-3 text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] flex items-center gap-2 transition-colors"
                          disabled={actionLoading}
                        >
                          <FiEye className="w-4 h-4" /> View Profile
                        </button>
                        {!user.isDisabled ? (
                          <>
                            {hasPermission('users_edit') && (
                              <button
                                onClick={() => { setConfirm({ type: 'suspend', user }); setOpenMenuId(null); }}
                                className="block w-full text-left px-4 py-3 text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] flex items-center gap-2 transition-colors"
                                disabled={actionLoading}
                              >
                                <FiSlash className="w-4 h-4 text-amber-500" /> Suspend User
                              </button>
                            )}
                            {hasPermission('verify_users') && (
                              <button
                                onClick={() => { verifyUser(user); setOpenMenuId(null); }}
                                className="block w-full text-left px-4 py-3 text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] flex items-center gap-2 transition-colors"
                                disabled={actionLoading}
                              >
                                <FiCheck className="w-4 h-4 text-green-500" /> Verify User
                              </button>
                            )}
                            {hasPermission('disable_users') && (
                              <button
                                onClick={() => { unverifyUserHandler(user); setOpenMenuId(null); }}
                                className="block w-full text-left px-4 py-3 text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] flex items-center gap-2 transition-colors"
                                disabled={actionLoading}
                              >
                                <FiLock className="w-4 h-4 text-yellow-500" /> Unverify User
                              </button>
                            )}
                          </>
                        ) : (
                          hasPermission('enable_users') && (
                            <button
                              onClick={() => { enableUser(user); setOpenMenuId(null); }}
                              className="block w-full text-left px-4 py-3 text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] flex items-center gap-2 transition-colors"
                              disabled={actionLoading}
                            >
                              <FiLock className="w-4 h-4 text-green-500" /> Enable User
                            </button>
                          )
                        )}
                        {hasPermission('users_delete') && (
                          <button
                            onClick={() => { setConfirm({ type: 'delete', user }); setOpenMenuId(null); }}
                            className="block w-full text-left px-4 py-3 text-red-500 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                            disabled={actionLoading}
                          >
                            <FiTrash2 className="w-4 h-4" /> Delete User
                          </button>
                        )}
                  </div>
                )}
              </div>
            </td>
          </tr>
        ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTable;