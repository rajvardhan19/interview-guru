import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, Upload, Users, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      path: '/upload',
      icon: Upload,
      label: 'Upload Resume'
    },
    {
      path: '/interview',
      icon: Users,
      label: 'Interview Mode'
    },
    {
      path: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard'
    }
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-800">InterviewPrep AI</span>
          </Link>
          
          <div className="flex space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive(item.path)
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-100'
                  }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}