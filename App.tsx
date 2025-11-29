import { useState, useEffect } from 'react';
import { CourtBookingSystem } from './components/CourtBookingSystem';
import { AuthPage } from './components/AuthPage';
import { ProfilePage } from './components/ProfilePage';
import { AdminPanel } from './components/AdminPanel';
import { ConnectedAccount } from './components/ConnectedAccountsSection';
import { Button } from './components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { Calendar, User, Menu, X, Bell, ShieldCheck, Wallet } from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import { NotificationBell } from './components/NotificationBell';
import { Badge } from './components/ui/badge';

interface User {
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  location?: string;
  bio?: string;
  memberSince?: string;
  isAdmin?: boolean;
  balance?: number;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'book' | 'bookings' | 'profile' | 'admin'>('bookings');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('tennisBookingUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    
    const savedAccounts = localStorage.getItem('tennisBookingAccounts');
    if (savedAccounts) {
      setConnectedAccounts(JSON.parse(savedAccounts));
    }
  }, []);

  const handleAuth = (user: User) => {
    const newUser = {
      ...user,
      memberSince: user.memberSince || 'November 2024',
    };
    setCurrentUser(newUser);
    localStorage.setItem('tennisBookingUser', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('bookings');
    localStorage.removeItem('tennisBookingUser');
  };

  const handleUpdateProfile = (updates: Partial<User>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      setCurrentUser(updatedUser);
      localStorage.setItem('tennisBookingUser', JSON.stringify(updatedUser));
    }
  };

  const handleAddAccount = (account: Omit<ConnectedAccount, 'id' | 'addedDate' | 'status'>) => {
    const newAccount: ConnectedAccount = {
      ...account,
      id: `account-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      addedDate: new Date().toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      }),
      status: 'active',
    };
    const updatedAccounts = [...connectedAccounts, newAccount];
    setConnectedAccounts(updatedAccounts);
    localStorage.setItem('tennisBookingAccounts', JSON.stringify(updatedAccounts));
  };

  const handleEditAccount = (id: string, updates: Partial<ConnectedAccount>) => {
    const updatedAccounts = connectedAccounts.map(account =>
      account.id === id ? { ...account, ...updates } : account
    );
    setConnectedAccounts(updatedAccounts);
    localStorage.setItem('tennisBookingAccounts', JSON.stringify(updatedAccounts));
  };

  const handleDeleteAccount = (id: string) => {
    const updatedAccounts = connectedAccounts.filter(account => account.id !== id);
    setConnectedAccounts(updatedAccounts);
    localStorage.setItem('tennisBookingAccounts', JSON.stringify(updatedAccounts));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!currentUser) {
    return <AuthPage onAuth={handleAuth} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={() => setCurrentPage('book')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="size-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <Calendar className="size-6 text-white" />
              </div>
              <h1 className="text-slate-900 hidden sm:block">Tennis Court Booking</h1>
            </button>

            {/* User Avatar */}
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <NotificationBell />
              
              {/* Account Balance */}
              <button
                onClick={() => setCurrentPage('profile')}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-200 rounded-lg transition-colors"
                title="View balance and transactions"
              >
                <Wallet className="size-4 text-green-700" />
                <span className="text-green-900">
                  £{(currentUser.balance ?? 45.50).toFixed(2)}
                </span>
              </button>
              
              {/* Admin Panel Toggle (for demo purposes) */}
              {currentUser.isAdmin && (
                <Button
                  variant={currentPage === 'admin' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage('admin')}
                  className="hidden md:flex gap-2"
                >
                  <ShieldCheck className="size-4" />
                  Admin
                </Button>
              )}
              
              <button
                onClick={() => setCurrentPage('profile')}
                className="flex items-center gap-3 hover:bg-slate-50 rounded-lg p-2 transition-colors"
              >
                <div className="hidden sm:block text-right">
                  <p className="text-slate-900">{currentUser.name}</p>
                  <p className="text-slate-600">{currentUser.email}</p>
                </div>
                <Avatar>
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-900">
                    {getInitials(currentUser.name)}
                  </AvatarFallback>
                </Avatar>
              </button>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200">
              {/* Account Balance - Mobile */}
              <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="size-4 text-green-700" />
                    <span className="text-green-900">Account Balance</span>
                  </div>
                  <span className="text-green-900">
                    £{(currentUser.balance ?? 45.50).toFixed(2)}
                  </span>
                </div>
              </div>
              
              <nav className="flex flex-col gap-2">
                <Button
                  variant={currentPage === 'book' ? 'default' : 'ghost'}
                  onClick={() => {
                    setCurrentPage('book');
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start gap-2"
                >
                  <Calendar className="size-4" />
                  Book Court
                </Button>
                <Button
                  variant={currentPage === 'bookings' ? 'default' : 'ghost'}
                  onClick={() => {
                    setCurrentPage('bookings');
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start gap-2"
                >
                  <Calendar className="size-4" />
                  My Bookings
                </Button>
                <Button
                  variant={currentPage === 'profile' ? 'default' : 'ghost'}
                  onClick={() => {
                    setCurrentPage('profile');
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start gap-2"
                >
                  <User className="size-4" />
                  Profile
                </Button>
                {currentUser.isAdmin && (
                  <Button
                    variant={currentPage === 'admin' ? 'default' : 'ghost'}
                    onClick={() => {
                      setCurrentPage('admin');
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start gap-2"
                  >
                    <ShieldCheck className="size-4" />
                    Admin Panel
                  </Button>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'book' && <CourtBookingSystem connectedAccounts={connectedAccounts} />}
        {currentPage === 'bookings' && <CourtBookingSystem connectedAccounts={connectedAccounts} />}
        {currentPage === 'profile' && (
          <ProfilePage
            user={currentUser}
            onLogout={handleLogout}
            onUpdateProfile={handleUpdateProfile}
            onAddAccount={handleAddAccount}
            onEditAccount={handleEditAccount}
            onDeleteAccount={handleDeleteAccount}
            connectedAccounts={connectedAccounts}
          />
        )}
        {currentPage === 'admin' && <AdminPanel />}
      </main>
      <Toaster />
    </div>
  );
}