import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { setCookie as setCookieUtil, getCookie as getCookieUtil, removeCookie as removeCookieUtil } from '../api/cookies';

// ---------- Auth Context ----------
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    try {
      const raw = getCookieUtil('Admin') || 'null';
      try { console.debug('[auth] cookie Admin raw:', raw); } catch {};
      const parsed = JSON.parse(raw);
      try { console.debug('[auth] cookie Admin parsed:', parsed); } catch {};
      return parsed;
    } catch (e) {
      return null;
    }
  });

  const [notifications, setNotifications] = useState(0);
  const [notificationsList, setNotificationsList] = useState([]);

  // Persist Admin in cookies
  useEffect(() => {
    try {
      if (admin) {
        setCookieUtil('Admin', JSON.stringify(admin));
      } else {
        removeCookieUtil('Admin');
      }
    } catch {}
  }, [admin]);

  // (hydration handled synchronously in useState initialiser)

  // Fetch notifications once on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // If admin is not set yet, try to read from cookie
        const currentAdmin = admin || JSON.parse(getCookieUtil('Admin') || 'null');
        const adminId = currentAdmin?.userId || currentAdmin?._id || currentAdmin?.id || null;

        if (!adminId) {
          // keep mocks if we can't identify admin yet
          setNotifications(0);
          setNotificationsList([]);
          return;
        }

        // Use dummy notification data
        setNotifications(3);
        setNotificationsList([
          { label: 'New User Registrations', count: 5, to: '/users' },
          { label: 'Pending Reports', count: 2, to: '/reports' },
          { label: 'System Alerts', count: 1, to: '/settings' }
        ]);
      } catch (e) {
        console.error('[auth] fetch notifications error', e);
        setNotifications(0);
        setNotificationsList([]);
      }
    };
    fetchData();
  }, []);

  // -------------------- Auth Actions --------------------

  const login = async ({ email, password }) => {
    try {
      // Simulate login with dummy data
      if (email === 'buildwithsam@gmail.com' && password === 'password') {
        const adminObj = {
          email: 'buildwithsam@gmail.com',
          role: 'super_admin',
          permissions: ['all'],
          userId: 'admin123'
        };
        setCookieUtil('token', 'dummy-token');
        setAdmin(adminObj);
        return { ok: true };
      } else {
        return { ok: false, error: 'Invalid credentials' };
      }
    } catch (err) {
      console.error('[auth] login error', err);
      return { ok: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    // explicit logout: remove token and Admin cookie and clear state
    removeCookieUtil('token');
    removeCookieUtil('Admin');
    setAdmin(null);
  };

  // -------------------- Notification Mocks --------------------

  // keep the exported functions (used elsewhere) but route them to the real admin API when possible
  const fetchNotificationCount = async () => {
    try {
      // Return dummy notification count
      return 3;
    } catch (e) {
      console.error('[auth] fetchNotificationCount error', e);
      return 0;
    }
  };

  const fetchNotificationsList = async () => {
    try {
      // Return dummy notification list
      return [
        { label: 'New User Registrations', count: 5, to: '/users' },
        { label: 'Pending Reports', count: 2, to: '/reports' },
        { label: 'System Alerts', count: 1, to: '/settings' }
      ];
    } catch (e) {
      console.error('[auth] fetchNotificationsList error', e);
      return [];
    }
  };

  // Permission checking utility
  const hasPermission = (permission) => {
    if (!admin) return false;
    // Super admin has all permissions
    if (admin.role === 'super_admin') return true;
    // Check if admin has the specific permission
    return admin.permissions && admin.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions) => {
    if (!admin) return false;
    // Super admin has all permissions
    if (admin.role === 'super_admin') return true;
    // Check if admin has any of the permissions
    return permissions.some(permission => admin.permissions && admin.permissions.includes(permission));
  };

  const value = useMemo(
    () => ({
      admin,
      userEmail: admin?.email ?? '',
      notifications,
      notificationsList,
      login,
      logout,
      fetchNotificationCount,
      hasPermission,
      hasAnyPermission,
    }),
    [admin, notifications, notificationsList]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
