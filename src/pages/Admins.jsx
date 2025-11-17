import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FiShield, FiUserX, FiTrash2, FiUserCheck, FiEye } from 'react-icons/fi';
import Modal from '../components/Modal';
import { toast } from 'sonner';


const formatRole = (role) => {
  const roleMap = {
    'super_admin': 'Super Admin',
    'admin': 'Admin'
  };
  return roleMap[role] || role;
};

export default function Admins() {
   const [admins, setAdmins] = useState([]);
   const [loading, setLoading] = useState(true);
   const [createOpen, setCreateOpen] = useState(false);
   const [roleModal, setRoleModal] = useState(null); // admin
   const [confirm, setConfirm] = useState(null); // { admin }
   const [viewAdmin, setViewAdmin] = useState(null);
   const [currentPage, setCurrentPage] = useState(1);
   const itemsPerPage = 10;
   const [updateLoading, setUpdateLoading] = useState(false);

  // Load dummy admins
  useEffect(() => {
    const loadAdmins = async () => {
      setLoading(true);
      try {
        // Use dummy admin data
        const dummyAdmins = [
          {
            _id: 'ADMIN001',
            id: 'ADMIN001',
            username: 'super_admin',
            firstName: 'Super',
            lastName: 'Admin',
            email: 'super@admin.com',
            role: 'super_admin',
            status: 'Active',
            lastLogin: new Date().toLocaleString(),
            permissions: ['users_view', 'users_edit', 'admin_create', 'admin_delete', 'view_dashboard']
          },
          {
            _id: 'ADMIN002',
            id: 'ADMIN002',
            username: 'admin_user',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            role: 'admin',
            status: 'Active',
            lastLogin: new Date(Date.now() - 86400000).toLocaleString(),
            permissions: ['users_view', 'view_post', 'transactions_view', 'reports_view']
          },
          {
            _id: 'ADMIN003',
            id: 'ADMIN003',
            username: 'support_admin',
            firstName: 'Support',
            lastName: 'Admin',
            email: 'support@admin.com',
            role: 'admin',
            status: 'Inactive',
            lastLogin: new Date(Date.now() - 172800000).toLocaleString(),
            permissions: ['read_support_tickets', 'respond_support_tickets']
          }
        ];
        setAdmins(dummyAdmins);
      } catch (err) {
        console.error('[admins] fetch error', err);
        setAdmins([]);
      } finally {
        setLoading(false);
      }
    };
    loadAdmins();
  }, []);


  const paginatedAdmins = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return admins.slice(startIndex, startIndex + itemsPerPage);
  }, [admins, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(admins.length / itemsPerPage);

  const handleAction = (action, admin) => {
    if (action === 'View Admin') setViewAdmin(admin);
    if (action === 'Update Role') setRoleModal(admin);
    if (action === 'Deactivate') setConfirm({ admin, id: admin._id || admin.id, action: 'deactivate' });
    if (action === 'Activate') setConfirm({ admin, id: admin._id || admin.id, action: 'activate' });
    if (action === 'Delete') setConfirm({ admin, id: admin._id || admin.id, action: 'delete' });
  };

  const applyRoleUpdate = async (id, updates) => {
    try {
      // Simulate update
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Admin updated:', updates);
      // Update local state
      setAdmins((prev) => prev.map((a) => (a._id === id || a.id === id ? { ...a, ...updates } : a)));
    } catch (err) {
      console.error('Failed to update admin:', err);
      throw err;
    }
  };

  const toggleAdminStatus = async (id, action) => {
    try {
      // Simulate toggle
      await new Promise(resolve => setTimeout(resolve, 300));
      if (action === 'deactivate') {
        setAdmins((prev) => prev.map((a) => (a._id === id || a.id === id ? { ...a, status: 'Inactive' } : a)));
        toast.success('Admin deactivated successfully');
      } else if (action === 'activate') {
        setAdmins((prev) => prev.map((a) => (a._id === id || a.id === id ? { ...a, status: 'Active' } : a)));
        toast.success('Admin activated successfully');
      }
      console.log(`${action} response: simulated`);
    } catch (err) {
      console.error(`Failed to ${action} admin:`, err);
      toast.error(`Failed to ${action} admin`);
    }
  };

  const deleteAdminUser = async (id) => {
    try {
      // Simulate delete
      await new Promise(resolve => setTimeout(resolve, 300));
      setAdmins((prev) => prev.filter((a) => (a._id !== id && a.id !== id)));
      toast.success('Admin deleted successfully');
      console.log('Delete response: simulated');
    } catch (err) {
      console.error('Failed to delete admin:', err);
      toast.error('Failed to delete admin');
    }
  };

  const openCreateAdminModal = () => {
    setCreateOpen(true);
  };

  const createNewAdmin = async (adminData) => {
    try {
      // Collect selected permissions
      const permissions = [];
      const permissionCheckboxes = document.querySelectorAll('input[name="permissions"]:checked');
      permissionCheckboxes.forEach(checkbox => {
        permissions.push(checkbox.value);
      });

      const adminDataWithPermissions = {
        ...adminData,
        permissions: permissions
      };

      // Simulate create
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Admin created:', adminDataWithPermissions);

      // Create a new admin object
      const newAdmin = {
        _id: `ADMIN${Date.now()}`,
        id: `ADMIN${Date.now()}`,
        username: adminData.username,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        email: adminData.email,
        role: adminData.role,
        status: 'Active',
        lastLogin: 'Never',
        permissions: permissions
      };

      // Add the new admin to the list
      setAdmins((prev) => [newAdmin, ...prev]);
      return { data: newAdmin };
    } catch (err) {
      console.error('Failed to create admin:', err);
      throw err;
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-gray-800 to-purple-300 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">Admin Management</h2>
        <button
          onClick={openCreateAdminModal}
          className="bg-[var(--color-primary-purple)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-80 transition-colors"
        >
          Create New Admin
        </button>
      </div>
      <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                Admin ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-[var(--color-text-secondary)]">
                  Loading admins...
                </td>
              </tr>
            ) : admins.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-[var(--color-text-secondary)]">
                  No admins found
                </td>
              </tr>
            ) : (
              paginatedAdmins.map((admin) => (
                <tr key={admin._id || admin.id || `admin-${Math.random()}`} className="hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-primary)]" title={admin._id}>{admin._id ? `${admin._id.substring(0, 8)}...` : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--color-text-primary)]">{admin.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-secondary)]">{admin.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-primary)]">{formatRole(admin.role)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-secondary)]">{admin.lastLogin}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${admin.status === 'Active' ? 'bg-[var(--color-accent-green)] text-white' : 'bg-[var(--color-accent-red)] text-white'
                      }`}
                    >
                      {admin.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAction('View Admin', admin)}
                        className="text-blue-500 hover:text-blue-600 p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        title="View Admin"
                      >
                        <FiEye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleAction('Update Role', admin)}
                        className="text-amber-500 hover:text-amber-600 p-1.5 rounded-full hover:bg-amber-50 dark:hover:bg-amber-900/30"
                        title="Update Role"
                      >
                        <FiShield className="w-5 h-5" />
                      </button>
                      {!admin.status || admin.status === 'Active' ? (
                        <button
                          onClick={() => handleAction('Deactivate', admin)}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"
                          title="Deactivate Admin"
                        >
                          <FiUserX className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction('Activate', admin)}
                          className="text-green-500 hover:text-green-700 p-1.5 rounded-full hover:bg-green-50 dark:hover:bg-green-900/30"
                          title="Activate Admin"
                        >
                          <FiUserCheck className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleAction('Delete', admin)}
                        className="text-red-600 hover:text-red-800 p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"
                        title="Delete Admin"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 bg-[var(--color-bg-secondary)] border-t border-[var(--color-bg-tertiary)] flex items-center justify-between">
          <div className="text-sm text-[var(--color-text-secondary)]">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, admins.length)} of {admins.length} admins
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-bg-primary)]"
            >
              Previous
            </button>
            <span className="text-sm text-[var(--color-text-primary)]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-bg-primary)]"
            >
              Next
            </button>
          </div>
        </div>
      )}
      {/* Create Admin Modal */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create New Admin"
        size="md"
        footer={
          <>
            <button onClick={() => setCreateOpen(false)} className="px-4 py-2 rounded-lg bg-[var(--color-bg-tertiary)] hover:opacity-90">Cancel</button>
            <button
              onClick={async () => {
                const form = document.getElementById('create-admin-form');
                const fd = new FormData(form);
                const adminData = {
                  firstName: fd.get('firstName'),
                  lastName: fd.get('lastName'),
                  username: fd.get('username'),
                  email: fd.get('email'),
                  password: fd.get('password'),
                  role: fd.get('role'),
                };

                try {
                  await createNewAdmin(adminData);
                  setCreateOpen(false);
                } catch (err) {
                  // Error is already logged in createNewAdmin
                  // Could show toast here if needed
                }
              }}
              className="px-4 py-2 rounded-lg bg-[var(--color-primary-cyan)] text-white hover:opacity-90"
            >
              Create
            </button>
          </>
        }
      >
        <form id="create-admin-form" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--color-text-secondary)] mb-1">First Name *</label>
              <input name="firstName" required className="w-full px-3 py-2 rounded-lg border border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Last Name *</label>
              <input name="lastName" required className="w-full px-3 py-2 rounded-lg border border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Username *</label>
            <input name="username" required className="w-full px-3 py-2 rounded-lg border border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Email *</label>
            <input type="email" name="email" required className="w-full px-3 py-2 rounded-lg border border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Password *</label>
            <input type="password" name="password" required className="w-full px-3 py-2 rounded-lg border border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Role</label>
            <select name="role" defaultValue="admin" className="w-full px-3 py-2 rounded-lg border border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-[var(--color-text-secondary)] mb-3">Permissions</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="permissions" value="users_view" className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                <span className="text-sm text-[var(--color-text-primary)]">Users View</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="permissions" value="view_post" className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                <span className="text-sm text-[var(--color-text-primary)]">View Post</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="permissions" value="delete_post" className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                <span className="text-sm text-[var(--color-text-primary)]">Delete Post</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="permissions" value="users_edit" className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                <span className="text-sm text-[var(--color-text-primary)]">Users Edit</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="permissions" value="users_delete" className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                <span className="text-sm text-[var(--color-text-primary)]">Users Delete</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="permissions" value="view_dashboard" className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                <span className="text-sm text-[var(--color-text-primary)]">View Dashboard</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="permissions" value="transactions_view" className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                <span className="text-sm text-[var(--color-text-primary)]">Transactions View</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="permissions" value="transactions_refund" className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                <span className="text-sm text-[var(--color-text-primary)]">Transactions Refund</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="permissions" value="reports_view" className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                <span className="text-sm text-[var(--color-text-primary)]">Reports View</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="permissions" value="settings_edit" className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                <span className="text-sm text-[var(--color-text-primary)]">Settings Edit</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="permissions" value="admin_create" className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                <span className="text-sm text-[var(--color-text-primary)]">Admin Create</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="permissions" value="admin_delete" className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                <span className="text-sm text-[var(--color-text-primary)]">Admin Delete</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="permissions" value="games_manage" className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                <span className="text-sm text-[var(--color-text-primary)]">Games Manage</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="permissions" value="bonuses_manage" className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                <span className="text-sm text-[var(--color-text-primary)]">Bonuses Manage</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="permissions" value="withdrawals_approve" className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                <span className="text-sm text-[var(--color-text-primary)]">Withdrawals Approve</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="permissions" value="verify_users" className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                <span className="text-sm text-[var(--color-text-primary)]">Verify Users</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="permissions" value="disable_users" className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                <span className="text-sm text-[var(--color-text-primary)]">Disable Users</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="permissions" value="enable_users" className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                <span className="text-sm text-[var(--color-text-primary)]">Enable Users</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="permissions" value="read_support_tickets" className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                <span className="text-sm text-[var(--color-text-primary)]">Read Support Tickets</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="permissions" value="respond_support_tickets" className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                <span className="text-sm text-[var(--color-text-primary)]">Respond Support Tickets</span>
              </label>
            </div>
          </div>
        </form>
      </Modal>
      {/* Update Role Modal */}
      <Modal
        isOpen={!!roleModal}
        onClose={() => setRoleModal(null)}
        title={roleModal ? `Update Admin • ${roleModal.username || roleModal.name}` : ''}
        size="lg"
        footer={
          <>
            <button onClick={() => setRoleModal(null)} className="px-4 py-2 rounded-lg bg-[var(--color-bg-tertiary)] hover:opacity-90">Cancel</button>
            <button
              disabled={updateLoading}
              onClick={async () => {
                console.log('🟡 Confirm button clicked');
                console.log('🔍 Current roleModal:', roleModal);

                try {
                  setUpdateLoading(true);

                  const form = document.getElementById('update-admin-form');
                  const fd = new FormData(form);

                  // Collect form data
                  const firstName = fd.get('firstName');
                  const lastName = fd.get('lastName');
                  const username = fd.get('username');
                  const email = fd.get('email');
                  const password = fd.get('password');
                  const role = fd.get('role');

                  // Collect permissions
                  const permissions = [];
                  const permissionCheckboxes = document.querySelectorAll('#update-admin-form input[name="permissions"]:checked');
                  permissionCheckboxes.forEach(checkbox => {
                    permissions.push(checkbox.value);
                  });

                  const updates = {
                    firstName,
                    lastName,
                    username,
                    email,
                    role,
                    permissions // Make sure this is included
                  };

                  // Only include password if provided
                  if (password && password.trim()) {
                    updates.password = password;
                  }

                  // Get the admin ID - try different possible fields
                  const adminId = roleModal._id || roleModal.id;
                  console.log('🎯 Using Admin ID:', adminId);
                  console.log('📤 Sending updates:', updates);

                  await applyRoleUpdate(adminId, updates);

                  // Success handling
                  console.log('✅ Update successful!');
                  setRoleModal(null);

                  // Refresh the admin list
                  if (fetchAdmins) {
                    await fetchAdmins();
                  }

                } catch (err) {
                  console.error('💥 Confirm button error:', err);
                  // Error is already logged in applyRoleUpdate
                  // Could show toast here if needed
                } finally {
                  setUpdateLoading(false);
                }
              }}
              className="px-4 py-2 rounded-lg bg-[var(--color-primary-cyan)] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        }
      >
        {roleModal && (
          <form id="update-admin-form" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-[var(--color-text-secondary)] mb-1">First Name</label>
                      <input name="firstName" defaultValue={roleModal.firstName} className="w-full px-3 py-2 rounded-lg border border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Last Name</label>
                      <input name="lastName" defaultValue={roleModal.lastName} className="w-full px-3 py-2 rounded-lg border border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Username</label>
                    <input name="username" defaultValue={roleModal.username} className="w-full px-3 py-2 rounded-lg border border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Email</label>
                    <input type="email" name="email" defaultValue={roleModal.email} className="w-full px-3 py-2 rounded-lg border border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Password (leave empty to keep current)</label>
                    <input type="password" name="password" placeholder="New password (optional)" className="w-full px-3 py-2 rounded-lg border border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Role</label>
                    <select name="role" defaultValue={roleModal.role} className="w-full px-3 py-2 rounded-lg border border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                  <div className="text-sm text-[var(--color-text-secondary)]">
                    <p><strong>Status:</strong> {roleModal.status || 'Active'}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Permissions</h3>
                <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="permissions" value="users_view" defaultChecked={roleModal.permissions?.includes('users_view')} className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                    <span className="text-sm text-[var(--color-text-primary)]">Users View</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="permissions" value="view_post" defaultChecked={roleModal.permissions?.includes('view_post')} className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                    <span className="text-sm text-[var(--color-text-primary)]">View Post</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="permissions" value="delete_post" defaultChecked={roleModal.permissions?.includes('delete_post')} className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                    <span className="text-sm text-[var(--color-text-primary)]">Delete Post</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="permissions" value="users_edit" defaultChecked={roleModal.permissions?.includes('users_edit')} className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                    <span className="text-sm text-[var(--color-text-primary)]">Users Edit</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="permissions" value="users_delete" defaultChecked={roleModal.permissions?.includes('users_delete')} className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                    <span className="text-sm text-[var(--color-text-primary)]">Users Delete</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="permissions" value="view_dashboard" defaultChecked={roleModal.permissions?.includes('view_dashboard')} className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                    <span className="text-sm text-[var(--color-text-primary)]">View Dashboard</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="permissions" value="transactions_view" defaultChecked={roleModal.permissions?.includes('transactions_view')} className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                    <span className="text-sm text-[var(--color-text-primary)]">Transactions View</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="permissions" value="transactions_refund" defaultChecked={roleModal.permissions?.includes('transactions_refund')} className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                    <span className="text-sm text-[var(--color-text-primary)]">Transactions Refund</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="permissions" value="reports_view" defaultChecked={roleModal.permissions?.includes('reports_view')} className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                    <span className="text-sm text-[var(--color-text-primary)]">Reports View</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="permissions" value="settings_edit" defaultChecked={roleModal.permissions?.includes('settings_edit')} className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                    <span className="text-sm text-[var(--color-text-primary)]">Settings Edit</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="permissions" value="admin_create" defaultChecked={roleModal.permissions?.includes('admin_create')} className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                    <span className="text-sm text-[var(--color-text-primary)]">Admin Create</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="permissions" value="admin_delete" defaultChecked={roleModal.permissions?.includes('admin_delete')} className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                    <span className="text-sm text-[var(--color-text-primary)]">Admin Delete</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="permissions" value="games_manage" defaultChecked={roleModal.permissions?.includes('games_manage')} className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                    <span className="text-sm text-[var(--color-text-primary)]">Games Manage</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="permissions" value="bonuses_manage" defaultChecked={roleModal.permissions?.includes('bonuses_manage')} className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                    <span className="text-sm text-[var(--color-text-primary)]">Bonuses Manage</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="permissions" value="withdrawals_approve" defaultChecked={roleModal.permissions?.includes('withdrawals_approve')} className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                    <span className="text-sm text-[var(--color-text-primary)]">Withdrawals Approve</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="permissions" value="verify_users" defaultChecked={roleModal.permissions?.includes('verify_users')} className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                    <span className="text-sm text-[var(--color-text-primary)]">Verify Users</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="permissions" value="disable_users" defaultChecked={roleModal.permissions?.includes('disable_users')} className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                    <span className="text-sm text-[var(--color-text-primary)]">Disable Users</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="permissions" value="enable_users" defaultChecked={roleModal.permissions?.includes('enable_users')} className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                    <span className="text-sm text-[var(--color-text-primary)]">Enable Users</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="permissions" value="read_support_tickets" defaultChecked={roleModal.permissions?.includes('read_support_tickets')} className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                    <span className="text-sm text-[var(--color-text-primary)]">Read Support Tickets</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="permissions" value="respond_support_tickets" defaultChecked={roleModal.permissions?.includes('respond_support_tickets')} className="rounded border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-blue-500 focus:ring-blue-500" />
                    <span className="text-sm text-[var(--color-text-primary)]">Respond Support Tickets</span>
                  </label>
                </div>
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* View Admin Modal */}
      <Modal
        isOpen={!!viewAdmin}
        onClose={() => setViewAdmin(null)}
        title={viewAdmin ? `Admin Details • ${viewAdmin.username || viewAdmin.name}` : 'Admin Details'}
        size="md"
      >
        {viewAdmin && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">Basic Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-[var(--color-text-secondary)]">Admin ID:</span>
                    <p className="text-sm text-[var(--color-text-primary)] font-mono">{viewAdmin._id || viewAdmin.id || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-[var(--color-text-secondary)]">Username:</span>
                    <p className="text-sm text-[var(--color-text-primary)]">{viewAdmin.username || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-[var(--color-text-secondary)]">Email:</span>
                    <p className="text-sm text-[var(--color-text-primary)]">{viewAdmin.email || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-[var(--color-text-secondary)]">Role:</span>
                    <p className="text-sm text-[var(--color-text-primary)]">{formatRole(viewAdmin.role)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-[var(--color-text-secondary)]">Status:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      viewAdmin.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {viewAdmin.status || 'Active'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-[var(--color-text-secondary)]">Last Login:</span>
                    <p className="text-sm text-[var(--color-text-primary)]">{viewAdmin.lastLogin || 'Never'}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">Permissions</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {viewAdmin.permissions && viewAdmin.permissions.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {viewAdmin.permissions.map((permission, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-[var(--color-text-primary)] capitalize">
                            {permission.replace(/_/g, ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--color-text-secondary)]">No specific permissions assigned</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Action Confirm Modal */}
      <Modal
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        title={
          confirm?.action === 'delete' ? 'Delete Admin' :
          confirm?.action === 'activate' ? 'Activate Admin' :
          'Deactivate Admin'
        }
        size="sm"
        footer={
          <>
            <button onClick={() => setConfirm(null)} className="px-4 py-2 rounded-lg bg-[var(--color-bg-tertiary)] hover:opacity-90">Cancel</button>
            <button
              onClick={async () => {
                if (!confirm) return;
                const id = confirm.id || confirm.admin._id || confirm.admin.id;

                if (confirm.action === 'delete') {
                  await deleteAdminUser(id);
                } else {
                  await toggleAdminStatus(id, confirm.action);
                }
                setConfirm(null);
              }}
              className={`px-4 py-2 rounded-lg text-white hover:opacity-90 ${
                confirm?.action === 'delete' ? 'bg-red-600 hover:bg-red-700' :
                confirm?.action === 'activate' ? 'bg-green-600 hover:bg-green-700' :
                'bg-red-600 hover:bg-red-700'
              }`}
            >
              {confirm?.action === 'delete' ? 'Delete' :
               confirm?.action === 'activate' ? 'Activate' :
               'Deactivate'}
            </button>
          </>
        }
      >
        <p className="text-[var(--color-text-secondary)]">
          {confirm?.action === 'delete'
            ? 'Are you sure you want to permanently delete this admin? This action cannot be undone.'
            : confirm?.action === 'activate'
            ? 'Are you sure you want to activate this admin?'
            : 'Are you sure you want to deactivate this admin?'
          }
        </p>
      </Modal>
    </div>
  );
}