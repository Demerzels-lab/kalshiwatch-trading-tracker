import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';
import { Home, TrendingUp, Bell, Star, LogOut, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'markets', name: 'Markets', icon: TrendingUp },
    { id: 'watchlist', name: 'Watchlist', icon: Star },
    { id: 'alerts', name: 'Alerts', icon: Bell },
  ];

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-1 flex-col border-r border-gray-800 bg-gray-900">
          <div className="flex h-16 items-center border-b border-gray-800 px-6">
            <h1 className="text-xl font-bold text-blue-400">Kalsehi Tracker</h1>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex w-full items-center rounded-md px-3 py-2 text-sm font-medium ${
                    activeTab === item.id
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </button>
              );
            })}
          </nav>

          <div className="border-t border-gray-800 p-4">
            {user ? (
              <div>
                <p className="text-sm text-gray-400">{user.email}</p>
                <button
                  onClick={() => signOut()}
                  className="mt-2 flex items-center text-sm text-red-400 hover:text-red-300"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700"
              >
                Masuk / Daftar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden">
        <div className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b border-gray-800 bg-gray-900 px-4">
          <h1 className="text-lg font-bold text-blue-400">Kalsehi Tracker</h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-30 bg-gray-900 pt-16">
            <nav className="space-y-1 px-3 py-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex w-full items-center rounded-md px-3 py-2 text-sm font-medium ${
                      activeTab === item.id
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </button>
                );
              })}
            </nav>
            
            <div className="border-t border-gray-800 p-4">
              {user ? (
                <div>
                  <p className="text-sm text-gray-400">{user.email}</p>
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="mt-2 flex items-center text-sm text-red-400 hover:text-red-300"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Keluar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShowAuthModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700"
                >
                  Masuk / Daftar
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
          {children}
        </main>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
