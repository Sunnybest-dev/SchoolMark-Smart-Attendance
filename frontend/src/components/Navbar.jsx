import { useState } from 'react';
import { Menu, X, LogOut, Home, User, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = {
    student: [
      { name: 'Dashboard', path: '/student', icon: Home },
      { name: 'Mark Attendance', path: '/student/mark-attendance', icon: User },
      { name: 'Profile', path: '/student/profile', icon: User }
    ],
    lecturer: [
      { name: 'Dashboard', path: '/lecturer', icon: Home },
      { name: 'Generate PIN', path: '/lecturer/generate-pin', icon: User },
      { name: 'Profile', path: '/lecturer/profile', icon: User }
    ],
    admin: [
      { name: 'Dashboard', path: '/admin', icon: Home },
      { name: 'Courses', path: '/admin/courses', icon: Settings },
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
            <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition">
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
            <button onClick={onLogout} className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition">
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
