import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import Tickets from './components/Tickets';
import TicketDetails from './components/TicketDetails';
import Settings from './components/Settings'; // Optional for labels admin
import ProtectedLayout from './layouts/ProtectedLayout';

export default function App() {
  const { user, loading } = useAuth();
  console.log('user: ', user);

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/tickets" /> : <Login />} />
      <Route element={<ProtectedLayout />}>
      <Route path="/tickets" element={user ? <Tickets /> : <Navigate to="/login" />} />
      <Route path="/tickets/:id" element={user ? <TicketDetails /> : <Navigate to="/login" />} />
      <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/tickets" />} />
      </Route>
    </Routes>
  );
}