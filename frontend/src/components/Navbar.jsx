import { useState } from 'react';
import { Menu, X, LogOut, Home, User, Settings, History, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  const navItems = {
    student: [
      { name: 'Dashboard', path: '/student', icon: Home },
      { name: 'Mark Attendance', path: '/student/mark-attendance', icon: User },
      { name: 'History', path: '/student/history', icon: History },
      { name: 'Profile', path: '/student/profile', icon: User }
    ],
    lecturer: [
      { name: 'Dashboard', path: '/lecturer', icon: Home },
      { name: 'Generate PIN', path: '/lecturer/generate-pin', icon: User },
      { name: 'Excuse Management', path: '/lecturer/excuse', icon: FileText },
      { name: 'Profile', path: '/lecturer/profile', icon: User }
    ],
    admin: [
      { name: 'Dashboard', path: '/admin', icon: Home },
      { name: 'Courses', path: '/admin/courses', icon: Settings },
      { name: 'Excuses', path: '/admin/excuses', icon: FileText },
      { name: 'Users', path: '/admin/users', icon: User }
    ]
  };

  const items = navItems[user?.role] || [];

  return (
    <nav className="bg-white shadow-md border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              SchoolMark
            </h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {items.map(item => (
              <Link key={item.path} to={item.path} className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition">
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
            <button onClick={handleLogoutClick} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition">
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-2 space-y-2">
            {items.map(item => (
              <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition">
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
            <button onClick={handleLogoutClick} className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition">
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition">
                Cancel
              </button>
              <button onClick={confirmLogout} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition">
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
