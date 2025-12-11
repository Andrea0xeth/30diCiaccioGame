import React from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export const Layout: React.FC = () => {
  return (
    <div className="h-screen bg-dark flex flex-col overflow-hidden">
      {/* Main content - scrollable, content passes under navbar */}
      <main className="flex-1 overflow-y-auto scrollbar-hide pb-20">
        <Outlet />
      </main>
      
      {/* Bottom Navigation - Floating liquid glass */}
      <BottomNav />
    </div>
  );
};
