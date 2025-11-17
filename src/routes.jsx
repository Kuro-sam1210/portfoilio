import { lazy } from 'react';
import { Navigate } from 'react-router';

// Lazy load all components for better performance
const NotFound = lazy(() => import('./pages/Notfound'));
const HomePage = lazy(() => import('./pages/home/Index'));
const UserID = lazy(() => import('./pages/UserID'));
const Users = lazy(() => import('./pages/Users'));

export const routes = [
  {
    path: '/',
    element: <Navigate to="/user" replace />,
    name: 'Home',
    showInNav: true,
    protected: false,
  },
  {
    path: '/user',
    element: <Users />,
    name: 'Users',
    showInNav: false,
    protected: false,
  },
  {
    path: '/user/:studentId', 
    element: <UserID />,
    name: 'User Details',
    showInNav: false, 
    protected: false,
  },
  {
    path: '/user:studentId', 
    element: <UserID isEditing={true} />,
    name: 'Edit Student',
    showInNav: false, 
    protected: false,
  },
 
  {
    path: '*',
    element: <NotFound />,
    name: 'Not Found',
    showInNav: false,
    protected: false,
  },
];
