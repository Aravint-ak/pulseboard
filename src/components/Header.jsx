import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">
          <Link to="/tickets" aria-label="PulseBoard Home">PulseBoard</Link>
        </h1>
        <nav className="flex items-center space-x-4">
          <Link to="/tickets" className="hover:underline" aria-label="View Tickets">Tickets</Link>
          {role === 'admin' && (
            <Link to="/settings" className="hover:underline" aria-label="Settings">Settings</Link>
          )}
          {user && (
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              aria-label="Log out"
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}