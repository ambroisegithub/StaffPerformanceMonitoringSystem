import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer/Footer';
import * as React from 'react';

function HomeLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-10">
        <Navbar />
      </header>

      <main className="flex-grow mt-16 overflow-y-auto">
        <Outlet />
      </main>

      <footer className="bg-gray-100 mt-auto">
        <Footer />
      </footer>
    </div>
  );
}

export default HomeLayout;
