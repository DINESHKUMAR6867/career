import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Settings,
  HelpCircle,
  User,
  CreditCard,
  KeyRound,
  Mail,
  LogOut,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Globe
} from 'lucide-react';

interface SidebarProps {
  userEmail?: string;
  onLogout: () => void;
}

export default function Sidebar({ userEmail, onLogout }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-72 bg-gradient-to-b from-[#0B4F6C] to-[#159A9C] text-white shadow-xl h-screen sticky top-0 p-6 flex flex-col">
      <div className="mb-8">
        <div className="font-bold text-3xl text-white mb-2">Careercast</div>
        <div className="h-1 w-16 bg-white/30 rounded"></div>
      </div>

      <div className="bg-white/10 rounded-lg p-4 mb-6 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {userEmail?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-sm truncate">{userEmail}</p>
            <p className="text-white/70 text-xs">Professional Account</p>
          </div>
        </div>
      </div>

      <nav className="space-y-1 flex-1">
        <button
          onClick={() => navigate('/dashboard')}
          className={`w-full text-left py-3 px-4 rounded-lg transition-all font-medium flex items-center gap-3 ${
            isActive('/dashboard')
              ? 'bg-white/20 text-white shadow-md'
              : 'text-white/90 hover:bg-white/10'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </button>
        <button
          onClick={() => navigate('/network')}
          className={`w-full text-left py-3 px-4 rounded-lg transition-all font-medium flex items-center gap-3 ${
            isActive('/network')
              ? 'bg-white/20 text-white shadow-md'
              : 'text-white/90 hover:bg-white/10'
          }`}
        >
          <Globe className="w-5 h-5" />
          Network
        </button>

        <button
          onClick={() => navigate('/resources')}
          className={`w-full text-left py-3 px-4 rounded-lg transition-all font-medium flex items-center gap-3 ${
            isActive('/resources')
              ? 'bg-white/20 text-white shadow-md'
              : 'text-white/90 hover:bg-white/10'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          Resources
        </button>

        <div>
          <button
            onClick={() => setAccountSettingsOpen(!accountSettingsOpen)}
            className={`w-full text-left py-3 px-4 rounded-lg transition-all font-medium flex items-center gap-3 ${
              ['/profile', '/billing', '/password'].includes(location.pathname)
                ? 'bg-white/20 text-white shadow-md'
                : 'text-white/90 hover:bg-white/10'
            }`}
          >
            <Settings className="w-5 h-5" />
            Account Settings
            {accountSettingsOpen ? (
              <ChevronDown className="w-4 h-4 ml-auto" />
            ) : (
              <ChevronRight className="w-4 h-4 ml-auto" />
            )}
          </button>

          {accountSettingsOpen && (
            <div className="ml-4 mt-1 space-y-1">
              <button
                onClick={() => navigate('/profile')}
                className={`w-full text-left py-2.5 px-4 rounded-lg transition-all text-sm font-medium flex items-center gap-3 ${
                  isActive('/profile')
                    ? 'bg-white/15 text-white'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <User className="w-4 h-4" />
                Profile
              </button>

              <button
                onClick={() => navigate('/billing')}
                className={`w-full text-left py-2.5 px-4 rounded-lg transition-all text-sm font-medium flex items-center gap-3 ${
                  isActive('/billing')
                    ? 'bg-white/15 text-white'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Billing & Payment
              </button>

              <button
                onClick={() => navigate('/password')}
                className={`w-full text-left py-2.5 px-4 rounded-lg transition-all text-sm font-medium flex items-center gap-3 ${
                  isActive('/password')
                    ? 'bg-white/15 text-white'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                Password
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => navigate('/hr-email')}
          className={`w-full text-left py-3 px-4 rounded-lg transition-all font-medium flex items-center gap-3 ${
            isActive('/hr-email')
              ? 'bg-white/20 text-white shadow-md'
              : 'text-white/90 hover:bg-white/10'
          }`}
        >
          <Briefcase className="w-5 h-5" />
          HR Emails
        </button>

        <div>
          <button
            onClick={() => setSupportOpen(!supportOpen)}
            className={`w-full text-left py-3 px-4 rounded-lg transition-all font-medium flex items-center gap-3 ${
              isActive('/contact')
                ? 'bg-white/20 text-white shadow-md'
                : 'text-white/90 hover:bg-white/10'
            }`}
          >
            <HelpCircle className="w-5 h-5" />
            Support
            {supportOpen ? (
              <ChevronDown className="w-4 h-4 ml-auto" />
            ) : (
              <ChevronRight className="w-4 h-4 ml-auto" />
            )}
          </button>

          {supportOpen && (
            <div className="ml-4 mt-1 space-y-1">
              <button
                onClick={() => navigate('/contact')}
                className={`w-full text-left py-2.5 px-4 rounded-lg transition-all text-sm font-medium flex items-center gap-3 ${
                  isActive('/contact')
                    ? 'bg-white/15 text-white'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <Mail className="w-4 h-4" />
                Contact Us
              </button>
            </div>
          )}
        </div>
      </nav>

      <button
        onClick={onLogout}
        className="w-full text-left text-white py-3 px-4 rounded-lg hover:bg-white/10 transition-all font-medium flex items-center gap-3 mt-auto"
      >
        <LogOut className="w-5 h-5" />
        Logout
      </button>
    </div>
  );
}
