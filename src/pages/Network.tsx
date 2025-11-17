import React, { useState } from 'react';
import { Users, ExternalLink, Menu } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const NetworkPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [targetJob, setTargetJob] = useState<string>('');
  const [targetCompany, setTargetCompany] = useState<string>('');
  const [targetRole, setTargetRole] = useState<string>('');
  const [currentJob, setCurrentJob] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [jobTitle, setJobTitle] = useState<string>('');
  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [searchUrl, setSearchUrl] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleLogout = () => {
    navigate('/');
  };

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setSearchUrl('');
    setSearchQuery('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      let linkedinSearchUrl = '';
      let query = '';

      switch (selectedGoal) {
        case 'I want an interview':
          if (!targetJob || !targetCompany) {
            setError('Please fill in both Target Job Function and Target Company');
            setLoading(false);
            return;
          }
          query = `${targetJob} ${targetCompany}`;
          linkedinSearchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(targetJob)}%20${encodeURIComponent(targetCompany)}&origin=GLOBAL_SEARCH_HEADER`;
          break;

        case 'I want industry connections':
          if (!targetRole || !targetCompany || !currentJob) {
            setError('Please fill in all required fields: Target Role, Target Company, and Current Job');
            setLoading(false);
            return;
          }
          query = `${targetRole} ${targetCompany}`;
          linkedinSearchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(targetRole)}%20${encodeURIComponent(targetCompany)}`;
          break;

        case "I'm just expanding my network":
          if (!currentJob) {
            setError('Please fill in Current Job');
            setLoading(false);
            return;
          }
          query = `${currentJob}`;
          linkedinSearchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(currentJob)}`;
          break;

        case 'I want to send a follow up message':
          if (!targetRole || !targetCompany || !firstName || !jobTitle) {
            setError('Please fill in all required fields: Target Role, Target Company, First Name, and Job Title');
            setLoading(false);
            return;
          }
          query = `${targetRole} ${targetCompany} ${firstName}`;
          linkedinSearchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(targetRole)}%20${encodeURIComponent(targetCompany)}%20${encodeURIComponent(firstName)}`;
          break;

        default:
          setError('Please select a networking goal');
          setLoading(false);
          return;
      }

      setSearchUrl(linkedinSearchUrl);
      setSearchQuery(query);

    } catch (err) {
      setError('Failed to generate search. Please try again.');
    }
    setLoading(false);
  };

  const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGoal(event.target.value);
    setSearchUrl('');
    setSearchQuery('');
    setError('');
  };

  const handleResumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setResume(event.target.files[0]);
    }
  };

  const handleLinkedInRedirect = () => {
    if (searchUrl) {
      window.open(searchUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const getFormDescription = () => {
    switch (selectedGoal) {
      case 'I want an interview':
        return 'Connect with hiring managers and recruiters at your dream company to increase your chances of landing an interview!';
      case 'I want industry connections':
        return 'Expand your professional network by connecting with industry professionals in your target role and company!';
      case "I'm just expanding my network":
        return 'Grow your network by connecting with professionals in your field!';
      case 'I want to send a follow up message':
        return 'Follow up with your new connections at your dream company to increase your chances of landing an interview!';
      default:
        return '';
    }
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
          <div className="font-bold text-xl text-[#0B4F6C]">Careercast</div>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </div>

        <div className="flex-1">
          {/* Top Navigation */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  <button className="px-4 py-2 sm:px-8 sm:py-3 bg-[#0B4F6C] text-white font-medium rounded-lg text-sm sm:text-base">
                    LINKEDIN NETWORKING
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="px-3 py-1.5 sm:px-5 sm:py-2.5 bg-white text-[#0B4F6C] font-medium rounded-lg border-2 border-[#0B4F6C] hover:bg-[#0B4F6C] hover:text-white transition-colors text-xs sm:text-sm">
                    Favorites ❤️
                  </button>
                  <button className="px-3 py-1.5 sm:px-5 sm:py-2.5 bg-white text-[#0B4F6C] font-medium rounded-lg border-2 border-[#0B4F6C] hover:bg-[#0B4F6C] hover:text-white transition-colors text-xs sm:text-sm">
                    How it works 💡
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Left Column - Form */}
              <div className="space-y-4 sm:space-y-6">
                {/* Dropdown with icon */}
                <div className="relative">
                  <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#0B4F6C]" />
                  </div>
                  <select
                    className="w-full pl-10 sm:pl-12 pr-8 sm:pr-10 py-2.5 sm:py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B4F6C] text-[#0B4F6C] font-medium appearance-none bg-white text-sm sm:text-base"
                    value={selectedGoal}
                    onChange={handleDropdownChange}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%230B4F6C'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '1.25em 1.25em',
                    }}
                  >
                    <option value="">--options--</option>
                    <option value="I want an interview">I want an interview</option>
                    <option value="I want industry connections">I want industry connections</option>
                    <option value="I'm just expanding my network">I'm just expanding my network</option>
                    <option value="I want to send a follow up message">I want to send a follow up message</option>
                  </select>
                </div>

                {/* Form Section */}
                {selectedGoal ? (
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-[#0B4F6C] mb-1 sm:mb-2">Fill in your information</h2>
                      <p className="text-[#0B4F6C] text-xs sm:text-sm leading-relaxed">
                        {getFormDescription()}
                      </p>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      {/* I want an interview */}
                      {selectedGoal === 'I want an interview' && (
                        <>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-[#0B4F6C] mb-1 sm:mb-2">
                              Target Job Function <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Marketing, Sales, Product"
                              value={targetJob}
                              onChange={(e) => setTargetJob(e.target.value)}
                              className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B4F6C] text-gray-700 placeholder-gray-400 text-sm sm:text-base"
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-[#0B4F6C] mb-1 sm:mb-2">
                              Target Company <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Google, Microsoft, Tesla"
                              value={targetCompany}
                              onChange={(e) => setTargetCompany(e.target.value)}
                              className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B4F6C] text-gray-700 placeholder-gray-400 text-sm sm:text-base"
                            />
                          </div>
                        </>
                      )}

                      {/* I want industry connections */}
                      {selectedGoal === 'I want industry connections' && (
                        <>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-[#0B4F6C] mb-1 sm:mb-2">
                              Target Role <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Project Manager, Software Engineer"
                              value={targetRole}
                              onChange={(e) => setTargetRole(e.target.value)}
                              className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B4F6C] text-gray-700 placeholder-gray-400 text-sm sm:text-base"
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-[#0B4F6C] mb-1 sm:mb-2">
                              My Target Company <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Google, Microsoft, Tesla"
                              value={targetCompany}
                              onChange={(e) => setTargetCompany(e.target.value)}
                              className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B4F6C] text-gray-700 placeholder-gray-400 text-sm sm:text-base"
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-[#0B4F6C] mb-1 sm:mb-2">
                              Current Job <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Sales Associate"
                              value={currentJob}
                              onChange={(e) => setCurrentJob(e.target.value)}
                              className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B4F6C] text-gray-700 placeholder-gray-400 text-sm sm:text-base"
                            />
                          </div>
                        </>
                      )}

                      {/* I'm just expanding my network */}
                      {selectedGoal === "I'm just expanding my network" && (
                        <>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-[#0B4F6C] mb-1 sm:mb-2">
                              Current Job <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Sales Associate"
                              value={currentJob}
                              onChange={(e) => setCurrentJob(e.target.value)}
                              className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B4F6C] text-gray-700 placeholder-gray-400 text-sm sm:text-base"
                            />
                          </div>
                        </>
                      )}

                      {/* I want to send a follow up message */}
                      {selectedGoal === 'I want to send a follow up message' && (
                        <>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-[#0B4F6C] mb-1 sm:mb-2">
                              Target Role <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Project Manager, Software Engineer, Sales Intern"
                              value={targetRole}
                              onChange={(e) => setTargetRole(e.target.value)}
                              className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B4F6C] text-gray-700 placeholder-gray-400 text-sm sm:text-base"
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-[#0B4F6C] mb-1 sm:mb-2">
                              My Target Company <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Google, Microsoft, Tesla"
                              value={targetCompany}
                              onChange={(e) => setTargetCompany(e.target.value)}
                              className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B4F6C] text-gray-700 placeholder-gray-400 text-sm sm:text-base"
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-[#0B4F6C] mb-1 sm:mb-2">
                              First Name of Connection <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Peter"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B4F6C] text-gray-700 placeholder-gray-400 text-sm sm:text-base"
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-[#0B4F6C] mb-1 sm:mb-2">
                              Job Title of Connection <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Hiring Manager"
                              value={jobTitle}
                              onChange={(e) => setJobTitle(e.target.value)}
                              className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B4F6C] text-gray-700 placeholder-gray-400 text-sm sm:text-base"
                            />
                          </div>
                        </>
                      )}

                      <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="w-full bg-[#01796F] text-white py-2.5 sm:py-3.5 rounded-lg hover:bg-[#016761] focus:outline-none focus:ring-2 focus:ring-[#01796F] font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? 'Generating...' : 'Generate'}
                      </button>
                    </div>

                    {error && <p className="text-red-600 text-xs sm:text-sm">{error}</p>}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg p-6 sm:p-12 text-center">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#0B4F6C] mb-3 sm:mb-4">Select your networking goal</h2>
                    <p className="text-[#0B4F6C] text-xs sm:text-sm mb-6 sm:mb-8">
                      Click on the selection panel above to select your purpose or goal of your networking.
                    </p>
                    <div className="flex justify-center">
                      <img
                        src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=400"
                        alt="Networking illustration"
                        className="w-40 sm:w-80 h-auto opacity-80"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Results */}
              <div className="bg-gradient-to-br from-[#1A5F7A] to-[#159A9C] rounded-lg sm:rounded-xl p-4 sm:p-8 min-h-[400px] sm:min-h-[600px]">
                {searchUrl ? (
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h3 className="text-lg sm:text-2xl font-bold text-white mb-2 sm:mb-3">Send your connection request message</h3>
                      <p className="text-white text-xs sm:text-sm leading-relaxed">
                        Find a message you like, copy it, go to LinkedIn, click "connect", click "add a note", and paste your message into the box. Click refresh below to generate new messages!
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
                      <div className="space-y-3 sm:space-y-4">
                        <h4 className="text-[#01796F] font-semibold text-sm sm:text-base">To hiring manager at {targetCompany || 'google'}</h4>
                        <p className="text-[#0B4F6C] text-xs sm:text-sm leading-relaxed">
                          Hi [X], I admire {targetCompany || 'Google'}'s innovative work in tech and am eager to contribute as a {targetJob || 'Python developer'}. Would love to discuss how I can add value—thanks!
                        </p>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2 border-t border-gray-200 gap-2">
                          <div className="flex gap-2 sm:gap-3">
                            <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded transition-colors" title="Edit">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded transition-colors" title="Copy">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                            <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded transition-colors" title="Favorite">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                            </button>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <span className="text-xs text-gray-500">149 characters</span>
                            <button
                              onClick={handleLinkedInRedirect}
                              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#01796F] text-white rounded-lg hover:bg-[#016761] transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium"
                            >
                              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                              Go to LinkedIn
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 sm:space-y-4">
                        <h4 className="text-[#01796F] font-semibold text-sm sm:text-base">To hiring manager at {targetCompany || 'google'}</h4>
                        <p className="text-[#0B4F6C] text-xs sm:text-sm leading-relaxed">
                          Hi [X], I'm excited about the {targetJob || 'Python developer'} role at {targetCompany || 'Google'}. I'd love to connect and learn more about your team's work. Looking forward to chatting!
                        </p>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2 border-t border-gray-200 gap-2">
                          <div className="flex gap-2 sm:gap-3">
                            <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded transition-colors" title="Edit">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded transition-colors" title="Copy">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                            <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded transition-colors" title="Favorite">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                            </button>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <span className="text-xs text-gray-500">156 characters</span>
                            <button
                              onClick={handleLinkedInRedirect}
                              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#01796F] text-white rounded-lg hover:bg-[#016761] transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium"
                            >
                              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                              Go to LinkedIn
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <h3 className="text-lg sm:text-2xl font-bold text-white mb-2 sm:mb-3">No results yet</h3>
                    <p className="text-white text-xs sm:text-sm mb-4 sm:mb-8">
                      To see results, fill in the required fields and hit 'Generate.'
                    </p>
                    <div className="mt-4 sm:mt-8 bg-white rounded-lg p-4 sm:p-8 w-full max-w-xs sm:max-w-md">
                      <div className="space-y-2 sm:space-y-3">
                        <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-2 sm:h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-2 sm:h-3 bg-gray-200 rounded w-full"></div>
                        <div className="flex gap-1 sm:gap-2 mt-3 sm:mt-4">
                          <div className="h-6 sm:h-8 bg-gray-200 rounded w-6 sm:w-8"></div>
                          <div className="h-6 sm:h-8 bg-gray-200 rounded w-6 sm:w-8"></div>
                          <div className="flex-1"></div>
                          <div className="h-6 sm:h-8 bg-gray-200 rounded w-20 sm:w-32"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkPage;