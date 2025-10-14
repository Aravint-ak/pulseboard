import { Outlet } from 'react-router-dom';
import Header from '../components/Header';

export default function ProtectedLayout() {
  return (
    <div>
      <Header />
      <main className="container mx-auto">
        <Outlet />
      </main>
    </div>
  );
}