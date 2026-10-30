import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardHome } from './components/dashboard/DashboardHome';
import { ClientList } from './components/clients/ClientList';
import { TaskList } from './components/tasks/TaskList';
import { DeadlinesCalendar } from './components/calendar/DeadlinesCalendar';
import { DocumentRequests } from './components/documents/DocumentRequests';
import { ClientPortal } from './components/portal/ClientPortal';
import { MessagesInbox } from './components/messages/MessagesInbox';
import { InvoiceList } from './components/invoices/InvoiceList';
import { TimeTracking } from './components/time/TimeTracking';
import { TeamManagement } from './components/team/TeamManagement';
import { ReportsDashboard } from './components/reports/ReportsDashboard';
import { NotificationsCenter } from './components/notifications/NotificationsCenter';
import { SettingsView } from './components/settings/SettingsView';
import { QuickCreateModal } from './components/modals/QuickCreateModal';
import { LoginView } from './components/auth/LoginView';

const AppContent: React.FC = () => {
  const { currentView, isAuthenticated, login } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={login} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-text-main">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-gray-900/40 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop static & Mobile overlay */}
      <div
        className={`fixed inset-y-0 left-0 z-50 lg:static lg:z-auto h-full flex-shrink-0 transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <Sidebar />
      </div>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-canvas">
        <Header onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 bg-canvas">
          {currentView === 'dashboard' && <DashboardHome />}
          {currentView === 'clients' && <ClientList />}
          {currentView === 'tasks' && <TaskList />}
          {currentView === 'calendar' && <DeadlinesCalendar />}
          {currentView === 'documents' && <DocumentRequests />}
          {currentView === 'portal' && <ClientPortal />}
          {currentView === 'messages' && <MessagesInbox />}
          {currentView === 'invoices' && <InvoiceList />}
          {currentView === 'time' && <TimeTracking />}
          {currentView === 'team' && <TeamManagement />}
          {currentView === 'reports' && <ReportsDashboard />}
          {currentView === 'notifications' && <NotificationsCenter />}
          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Quick Action Modal */}
      <QuickCreateModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
