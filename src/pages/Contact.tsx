import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Mail, Phone, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Contact() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <Sidebar userEmail={user?.email || ''} onLogout={handleLogout} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar for mobile */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="font-bold text-xl text-[#0B4F6C]">careercast</div>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
            </div>

            <div className="flex flex-col items-center justify-center space-y-8 py-12">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Reach Out to Us</h2>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  {/* Email */}
                  <a 
                    href="https://mail.google.com/mail/?view=cm&to=support@careercast.com" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border border-gray-200"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-[#0B4F6C] to-[#159A9C] rounded-lg flex items-center justify-center">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Email Us</p>
                      <p className="text-[#01796F] font-semibold">support@careercast.com</p>
                    </div>
                  </a>

                  {/* Phone/WhatsApp */}
                  <a 
                    href="https://wa.me/15551234567" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border border-gray-200"
                  >
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">WhatsApp</p>
                      <p className="text-green-600 font-semibold">+1 (555) 123-4567</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

