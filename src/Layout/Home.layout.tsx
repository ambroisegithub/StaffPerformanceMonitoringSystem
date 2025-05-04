import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer/Footer';
import * as React from 'react';

const getRedirectPath = (role: string) => {
  switch (role.toLowerCase()) {
    case 'overall':
      return '/overall';
    case 'client':
      return '/admin';
    case 'supervisor':
      return '/super-visor';
    case 'employee':
      return '/employeeDashboard';
    case 'system_leader':
      return '/system-leader';
    default:
      return '/';
  }
};

function HomeLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user && user.role) {
      const redirectPath = getRedirectPath(user.role);
      if (redirectPath !== '/') {
        navigate(redirectPath);
      }
    }
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white  shadow-sm">
        <Navbar />
      </header>

      <main className="flex-grow pt-16 overflow-y-auto">
        <Outlet />
      </main>

      <footer className="bg-gray-100 mt-auto">
        <Footer />
      </footer>
    </div>
  );
}

export default HomeLayout;