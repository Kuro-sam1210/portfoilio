import React from 'react';
import Modal from '../../components/Modal';
import UserModal from '../../components/UserModal';
import { useAuth } from '../../context/AuthContext';
import UsersFilters from './UsersFilters';
import UsersTable from './UsersTable';
import UsersPagination from './UsersPagination';
import useUsersData from './useUsersData';

export default function Users() {
  const { hasPermission } = useAuth();
  const {
    query,
    setQuery,
    confirm,
    setConfirm,
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
    truncateMiddle,
    truncateRight,
    copyId,
    suspendUser,
    handleView,
    deleteUser,
    enableUser,
    verifyUser,
    unverifyUserHandler,
    paginatedUsers,
    totalPages
  } = useUsersData();

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-[var(--color-text-primary)]">User Management</h2>
      <UsersFilters
        query={query}
        setQuery={setQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        planFilter={planFilter}
        setPlanFilter={setPlanFilter}
        verifiedFilter={verifiedFilter}
        setVerifiedFilter={setVerifiedFilter}
      />
      <div className="bg-[var(--color-bg-secondary)] rounded-lg shadow-md overflow-visible mt-6">
        <UsersTable
          paginatedUsers={paginatedUsers}
          openMenuId={openMenuId}
          setOpenMenuId={setOpenMenuId}
          handleView={handleView}
          setConfirm={setConfirm}
          verifyUser={verifyUser}
          unverifyUserHandler={unverifyUserHandler}
          enableUser={enableUser}
          actionLoading={actionLoading}
          hasPermission={hasPermission}
          truncateMiddle={truncateMiddle}
          truncateRight={truncateRight}
          copyId={copyId}
        />
        <UsersPagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
        />
      </div>
      {/* User modal is now a separate component which reads ?user=<id> from the URL */}
      <UserModal />

      {/* Confirm Modal */}
      <Modal
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm ? (confirm.type === 'delete' ? 'Delete User' : 'Suspend User') : ''}
        size="sm"
        footer={
          <>
            <button onClick={() => setConfirm(null)} className="px-4 py-2 rounded-lg bg-[var(--color-bg-tertiary)] hover:opacity-90">Cancel</button>
            <button
              onClick={() => {
                if (!confirm) return;
                if (confirm.type === 'delete') deleteUser(confirm.user);
                else suspendUser(confirm.user);
                setConfirm(null);
              }}
              className={`px-4 py-2 rounded-lg text-white ${confirm?.type === 'delete' ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'}`}
              disabled={actionLoading}
            >
              {actionLoading ? 'Processing...' : 'Confirm'}
            </button>
          </>
        }
      >
        {confirm && (
          <p className="text-[var(--color-text-secondary)]">
            {confirm.type === 'delete' ? 'This action will permanently delete the user.' : 'This action will suspend the user account.'}
          </p>
        )}
      </Modal>
    </div>
  );
}