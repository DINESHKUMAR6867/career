import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Lock, Eye, EyeOff, Shield, Check, Mail, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';

export default function Password() {
  const navigate = useNavigate();
  const { user, sendOTP, verifyOTP } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleLogout = () => {
    navigate('/');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSendOTP = async () => {
    if (!forgotPasswordEmail) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await sendOTP(forgotPasswordEmail);
      setOtpSent(true);
      setSuccess('OTP sent to your email address');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!forgotPasswordEmail || !otp) {
      setError('Please enter both email and OTP');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const verified = await verifyOTP(forgotPasswordEmail, otp);
      if (verified) {
        setOtpVerified(true);
        setSuccess('OTP verified successfully');
      } else {
        setError('Invalid OTP');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (showForgotPassword) {
      // Handle forgot password flow
      if (!otpVerified) {
        setError('Please verify OTP first');
        return;
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }
      
      if (formData.newPassword.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      
      try {
        setLoading(true);
        setError('');
        
        // Update password in Supabase
        const { error } = await supabase.auth.updateUser({
          password: formData.newPassword
        });
        
        if (error) throw error;

        alert("🎉Password updated successfully...")
        setSuccess('Password updated successfully');
        // Reset form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowForgotPassword(false);
        setOtpSent(false);
        setOtpVerified(false);
        setOtp('');
      } catch (err: any) {
        setError(err.message || 'Failed to update password');
      } finally {
        setLoading(false);
      }
    } else {
      // Handle regular password change flow
      if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
        setError('Please fill in all password fields');
        return;
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }
      
      try {
        setLoading(true);
        setError('');
        
        // Update password in Supabase
        const { data, error } = await supabase.auth.updateUser({
          password: formData.newPassword
        });
        
        if (error) throw error;
        
        setSuccess('Password updated successfully');
        // Reset form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } catch (err: any) {
        setError(err.message || 'Failed to update password');
      } finally {
        setLoading(false);
      }
    }
  };

  const passwordRequirements = [
    { text: 'At least 8 characters', met: formData.newPassword.length >= 8 },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(formData.newPassword) },
    { text: 'Contains lowercase letter', met: /[a-z]/.test(formData.newPassword) },
    { text: 'Contains number', met: /[0-9]/.test(formData.newPassword) },
    { text: 'Contains special character', met: /[!@#$%^&*]/.test(formData.newPassword) }
  ];

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
          <div className="font-bold text-xl text-[#0B4F6C]">Careercast</div>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-gray-50">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Password Settings</h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Update your password to keep your account secure
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm sm:text-base">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm sm:text-base">
                {success}
              </div>
            )}

            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] px-4 sm:px-8 py-4 sm:py-6 flex items-center gap-2 sm:gap-3">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {showForgotPassword ? 'Reset Password' : 'Change Password'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-8">
                {showForgotPassword ? (
                  <>
                    <div className="mb-4 sm:mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={forgotPasswordEmail}
                          onChange={(e) => setForgotPasswordEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4F6C] focus:border-transparent outline-none transition-all text-sm sm:text-base"
                          placeholder="Enter your email address"
                          disabled={otpSent}
                        />
                      </div>
                    </div>
                    
                    {!otpSent ? (
                      <div className="mb-4 sm:mb-6">
                        <button
                          type="button"
                          onClick={handleSendOTP}
                          disabled={loading}
                          className="w-full bg-[#01796F] text-white px-4 py-2 sm:px-8 sm:py-3 rounded-lg font-semibold hover:bg-[#016761] shadow-md hover:shadow-lg transition-all disabled:opacity-50 text-sm sm:text-base"
                        >
                          {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                      </div>
                    ) : !otpVerified ? (
                      <>
                        <div className="mb-4 sm:mb-6">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Enter OTP
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              className="flex-1 px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4F6C] focus:border-transparent outline-none transition-all text-sm sm:text-base"
                              placeholder="Enter 6-digit OTP"
                              maxLength={6}
                            />
                            <button
                              type="button"
                              onClick={handleVerifyOTP}
                              disabled={loading || otp.length !== 6}
                              className="px-3 py-2 sm:px-4 sm:py-3 bg-[#01796F] text-white rounded-lg font-semibold hover:bg-[#016761] shadow-md hover:shadow-lg transition-all disabled:opacity-50 text-sm sm:text-base"
                            >
                              {loading ? 'Verifying...' : 'Verify'}
                            </button>
                          </div>
                        </div>
                        
                        <div className="mb-4 sm:mb-6 text-sm text-gray-600">
                          Didn't receive the OTP? Check your spam folder or{' '}
                          <button
                            type="button"
                            onClick={handleSendOTP}
                            disabled={loading}
                            className="text-[#01796F] font-semibold hover:text-[#016761]"
                          >
                            resend OTP
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="mb-4 sm:mb-6">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            New Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              name="newPassword"
                              value={formData.newPassword}
                              onChange={handleChange}
                              className="w-full pl-10 pr-12 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4F6C] focus:border-transparent outline-none transition-all text-sm sm:text-base"
                              placeholder="Enter new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        <div className="mb-4 sm:mb-6">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              className="w-full pl-10 pr-12 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4F6C] focus:border-transparent outline-none transition-all text-sm sm:text-base"
                              placeholder="Confirm new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        <div className="mb-6">
                          <h3 className="text-sm font-semibold text-gray-700 mb-3">Password Requirements:</h3>
                          <ul className="space-y-2">
                            {passwordRequirements.map((req, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <Check 
                                  className={`w-4 h-4 ${req.met ? 'text-green-500' : 'text-gray-300'}`} 
                                />
                                <span className={`text-sm ${req.met ? 'text-green-600' : 'text-gray-500'}`}>
                                  {req.text}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div className="mb-4 sm:mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          className="w-full pl-10 pr-12 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4F6C] focus:border-transparent outline-none transition-all text-sm sm:text-base"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="mb-4 sm:mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          className="w-full pl-10 pr-12 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4F6C] focus:border-transparent outline-none transition-all text-sm sm:text-base"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="mb-4 sm:mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full pl-10 pr-12 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4F6C] focus:border-transparent outline-none transition-all text-sm sm:text-base"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Password Requirements:</h3>
                      <ul className="space-y-2">
                        {passwordRequirements.map((req, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Check 
                              className={`w-4 h-4 ${req.met ? 'text-green-500' : 'text-gray-300'}`} 
                            />
                            <span className={`text-sm ${req.met ? 'text-green-600' : 'text-gray-500'}`}>
                              {req.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#01796F] text-white px-4 py-2 sm:px-8 sm:py-3 rounded-lg font-semibold hover:bg-[#016761] shadow-md hover:shadow-lg transition-all disabled:opacity-50 text-sm sm:text-base"
                  >
                    {loading ? 'Saving...' : showForgotPassword && otpVerified ? 'Update Password' : showForgotPassword ? 'Continue' : 'Save Changes'}
                  </button>
                  
                  {!showForgotPassword && (
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="flex-1 bg-white text-[#01796F] border border-[#01796F] px-4 py-2 sm:px-8 sm:py-3 rounded-lg font-semibold hover:bg-[#01796F]/5 transition-all text-sm sm:text-base"
                    >
                      Forgot Password?
                    </button>
                  )}
                  
                  {showForgotPassword && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setOtpSent(false);
                        setOtpVerified(false);
                        setOtp('');
                        setForgotPasswordEmail(user?.email || '');
                        setError('');
                        setSuccess('');
                      }}
                      className="flex-1 bg-white text-[#01796F] border border-[#01796F] px-4 py-2 sm:px-8 sm:py-3 rounded-lg font-semibold hover:bg-[#01796F]/5 transition-all text-sm sm:text-base"
                    >
                      Back to reset password
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}