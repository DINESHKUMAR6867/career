import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import {
  Video,
  Eye,
  CheckCircle,
  Plus,
  FileText,
  Play,
  Redo,
  Clock,
  Loader2,
  X,
  Menu,
} from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [careercasts, setcareercasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [showPricingPopup, setShowPricingPopup] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userCountry, setUserCountry] = useState<"US" | "GB" | "OTHER">("OTHER");

  // New: Premium plan tracking
  const [isPremiumActive, setIsPremiumActive] = useState(false);
  const [credits, setCredits] = useState<number>(0);

  const handleLogout = () => navigate('/');

  // 🟢 Check plan on mount + realtime updates
  useEffect(() => {
    if (!user) return;
    fetchPlan();

    // Live updates (listen for plan changes)
    const channel = supabase
      .channel('plan-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        (payload) => {
          const credits = payload.new.credits_remaining || 0;
          const active = credits > 0;
          setIsPremiumActive(active);
          setCredits(credits);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // 🟢 Fetch plan info from profiles
  const fetchPlan = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('plan_tier, plan_status, credits_remaining')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const credits = data.credits_remaining || 0;
      const active = credits > 0;

      setIsPremiumActive(active);
      setCredits(credits);
    } catch (err) {
      console.error('Error fetching plan:', err);
      setIsPremiumActive(false);
    }
  };

  // 🟢 Fetch user’s careercasts
  useEffect(() => {
    if (!user) return;
    fetchcareercasts();
  }, [user]);

  const fetchcareercasts = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('job_requests')
        .select(`
          id,
          job_title,
          resume_path,
          status,
          created_at,
          recordings (storage_path)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setcareercasts(data || []);
    } catch (error) {
      console.error('Error fetching Network Notes:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Handle new careercast click
  const handleNewCast = () => {
    const completedRecordings = careercasts.filter(
      (cast) => cast.status === 'recorded'
    ).length;

    if (isPremiumActive) {
      // ✅ Premium user → unlimited recordings
      navigate('/step1');
    } else if (completedRecordings >= 3) {
      // ⛔ Free user with 3+ recordings → show upgrade popup
      setShowPricingPopup(true);
    } else {
      // 🟡 Free user under limit
      navigate('/step1');
    }
  };

  const handleReRecord = (id: string) => navigate(`/record/${id}`);
  const handleViewDetails = (id: string) => navigate(`/final-result/${id}`);
  const handleCloseVideo = () => setSelectedVideo(null);
  const handleClosePricingPopup = () => setShowPricingPopup(false);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const getBadge = (status: string) => {
    switch (status) {
      case 'recorded':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-md text-xs font-medium">
            <CheckCircle className="w-3.5 h-3.5" /> Recorded
          </span>
        );
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md text-xs font-medium">
            <Clock className="w-3.5 h-3.5" /> Resume Uploaded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1.5 rounded-md text-xs font-medium">
            <Clock className="w-3.5 h-3.5" /> Draft
          </span>
        );
    }
  };

  // Add this useEffect hook to detect user country
  useEffect(() => {
    const detectCountry = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        if (data.country_code === "US") {
          setUserCountry("US");
        } else if (data.country_code === "GB") {
          setUserCountry("GB");
        } else {
          setUserCountry("OTHER");
        }
      } catch (error) {
        console.log("Could not detect country, defaulting to OTHER");
        setUserCountry("OTHER");
      }
    };

    detectCountry();
  }, []);

  return (
    <div className="min-h-screen bg-white flex">
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <Sidebar userEmail={user?.email || ''} onLogout={handleLogout} />
      </div>

      {/* Main Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="font-bold text-xl text-[#0B4F6C]">Network Note</div>
          <div className="w-10"></div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-200 bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] px-4 py-4 sm:px-8 sm:py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Your Network Notes</h2>
                <p className="text-white/80 text-xs sm:text-sm mt-1">
                  Track progress and manage your recordings
                </p>
              </div>
              <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                {isPremiumActive ? (
                  <span className="text-white text-xs bg-emerald-500 px-2 py-1 rounded-md self-start sm:self-auto">
                    Credits: {credits}
                  </span>
                ) : (
                  <span className="text-white text-xs bg-red-500/30 px-2 py-1 rounded-md self-start sm:self-auto">
                    No Credits (Top up needed)
                  </span>
                )}
                <button
                  onClick={handleNewCast}
                  className="bg-white text-[#0B4F6C] px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold hover:bg-white/90 transition-all shadow-md flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  New Network Note
                </button>
              </div>
            </div>

            {/* Body */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <Loader2 className="animate-spin text-[#01796F] h-8 w-8 mb-4" />
                <p className="text-gray-600 text-center">Loading your Network Notes...</p>
              </div>
            ) : careercasts.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="bg-[#01796F]/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <Video className="h-10 w-10 text-[#01796F]" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">No Network Notes Yet</h3>
                <p className="text-gray-600 mb-6 text-sm max-w-md mx-auto">
                  Create your first professional video resume and make your profile shine.
                </p>
                <button
                  onClick={handleNewCast}
                  className="bg-[#01796F] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#016761] transition-colors shadow-md flex items-center justify-center mx-auto gap-2"
                >
                  <Plus className="w-5 h-5" /> Create Network Note
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-[#0B4F6C] uppercase tracking-wide font-semibold hidden md:table-header-group">
                    <tr>
                      <th className="py-3 px-4">Job Title</th>
                      <th className="py-3 px-4">Resume</th>
                      <th className="py-3 px-4">Video</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Created</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {careercasts.map((cast) => {
                      const video = cast.recordings?.[0]?.storage_path || null;
                      const both = cast.resume_path && video;
                      return (
                        <>
                          {/* Desktop view */}
                          <tr key={cast.id} className="border-b hover:bg-gray-50 hidden md:table-row">
                            <td className="py-3 px-4 font-medium">{cast.job_title || 'Untitled'}</td>
                            <td className="py-3 px-4">
                              {cast.resume_path ? (
                                <a
                                  href={cast.resume_path}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[#01796F] hover:underline flex items-center gap-1"
                                >
                                  <FileText className="w-4 h-4" /> View
                                </a>
                              ) : (
                                <span className="text-gray-400 text-xs italic">No resume</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {video ? (
                                <button
                                  onClick={() => setSelectedVideo(video)}
                                  className="text-[#01796F] hover:underline flex items-center gap-1"
                                >
                                  <Play className="w-4 h-4" /> Play
                                </button>
                              ) : (
                                <span className="text-gray-400 text-xs italic">No video</span>
                              )}
                            </td>
                            <td className="py-3 px-4">{getBadge(cast.status)}</td>
                            <td className="py-3 px-4">{formatDate(cast.created_at)}</td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => both && handleViewDetails(cast.id)}
                                  disabled={!both}
                                  className={`${both
                                    ? 'bg-[#01796F] hover:bg-[#016761] text-white'
                                    : 'bg-gray-200 text-gray-400'
                                    } px-3 py-1.5 rounded-md font-semibold text-xs`}
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => handleReRecord(cast.id)}
                                  className="border-2 border-[#0B4F6C] text-[#0B4F6C] px-3 py-1.5 rounded-md font-semibold text-xs hover:bg-[#0B4F6C] hover:text-white"
                                >
                                  Re-record
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Mobile view */}
                          <tr key={`mobile-${cast.id}`} className="border-b border-gray-100 hover:bg-gray-50 md:hidden">
                            <td className="py-4 px-4" colSpan={6}>
                              <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 text-base truncate">{cast.job_title || 'Untitled'}</h3>
                                    <p className="text-xs text-gray-500 mt-1">{formatDate(cast.created_at)}</p>
                                  </div>
                                  <div className="flex-shrink-0 ml-2">
                                    {getBadge(cast.status)}
                                  </div>
                                </div>

                                <div className="flex gap-3 mt-1">
                                  {cast.resume_path ? (
                                    <a
                                      href={cast.resume_path}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[#01796F] hover:text-[#016761] flex items-center gap-1 text-xs font-medium"
                                    >
                                      <FileText className="w-4 h-4" />
                                      <span>Resume</span>
                                    </a>
                                  ) : (
                                    <span className="text-gray-400 text-xs flex items-center gap-1">
                                      <FileText className="w-4 h-4" />
                                      <span>No resume</span>
                                    </span>
                                  )}

                                  {video ? (
                                    <button
                                      onClick={() => setSelectedVideo(video)}
                                      className="text-[#01796F] hover:text-[#016761] flex items-center gap-1 text-xs font-medium"
                                    >
                                      <Play className="w-4 h-4" />
                                      <span>Video</span>
                                    </button>
                                  ) : (
                                    <span className="text-gray-400 text-xs flex items-center gap-1">
                                      <Play className="w-4 h-4" />
                                      <span>No video</span>
                                    </span>
                                  )}
                                </div>

                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() => both && handleViewDetails(cast.id)}
                                    disabled={!both}
                                    className={`flex-1 ${both
                                      ? 'bg-[#01796F] hover:bg-[#016761] text-white'
                                      : 'bg-gray-100 text-gray-400'
                                      } px-3 py-2 rounded-lg font-medium text-sm transition-colors`}
                                  >
                                    View Details
                                  </button>
                                  <button
                                    onClick={() => handleReRecord(cast.id)}
                                    className="flex-1 border border-[#0B4F6C] text-[#0B4F6C] px-3 py-2 rounded-lg font-medium text-sm hover:bg-[#0B4F6C] hover:text-white transition-colors"
                                  >
                                    Re-record
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>

        {/* Upgrade popup */}
        {!isPremiumActive && showPricingPopup && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden mx-4">
              <div className="bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] p-4 sm:p-5 flex justify-between items-center">
                <h3 className="text-white font-bold text-lg">Upgrade to Premium</h3>
                <button
                  onClick={handleClosePricingPopup}
                  className="text-white hover:text-gray-200 text-2xl font-bold p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 sm:p-6">
                <div className="text-center mb-4">
                  <Video className="mx-auto w-10 h-10 text-[#01796F]" />
                  <h4 className="font-bold text-lg mt-2">Get More Network Notes</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    You've reached your 3 recordings. Top up now to continue recording.
                  </p>
                </div>
                <div className="bg-[#01796F]/5 rounded-lg p-4 mb-5">
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#01796F]" />
                      <span>Additional Network Notes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#01796F]" />
                      <span>HD Video Recording</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#01796F]" />
                      <span>Advanced Analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#01796F]" />
                      <span>Priority Support</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => {
                    handleClosePricingPopup();
                    navigate('/billing');
                  }}
                  className="w-full bg-[#01796F] text-white py-3 rounded-lg font-semibold hover:bg-[#016761] transition-colors"
                >
                  {userCountry === "GB" ? "Top Up Now - £9.99" : "Top Up Now - $9.99"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
