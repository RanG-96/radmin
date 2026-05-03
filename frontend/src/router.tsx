import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';
import { Files } from './pages/Files';
import { DictTypes } from './pages/DictTypes';
import { DictItems } from './pages/DictItems';
import { OperationLogs } from './pages/OperationLogs';
import { Notifications } from './pages/Notifications';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'users', element: <Users /> },
      { path: 'settings', element: <Settings /> },
      { path: 'files', element: <Files /> },
      { path: 'dict-types', element: <DictTypes /> },
      { path: 'dict-items/:typeId', element: <DictItems /> },
      { path: 'operation-logs', element: <OperationLogs /> },
      { path: 'notifications', element: <Notifications /> },
    ],
  },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '*', element: <Navigate to="/" replace /> },
]);
