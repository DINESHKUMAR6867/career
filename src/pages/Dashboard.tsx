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

  const [careerCasts, setCareerCasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [showPricingPopup, setShowPricingPopup] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // New: Premium plan tracking
  const [isPremiumActive, setIsPremiumActive] = useState(false);
  const [planRenewsAt, setPlanRenewsAt] = useState<string | null>(null);

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
          const plan = payload.new.plan_tier;
          const renewAt = payload.new.plan_renews_at;
          const active =
            plan === 'premium' &&
            payload.new.plan_status === 'active' &&
            renewAt &&
            new Date(renewAt) > new Date();
          setIsPremiumActive(active);
          setPlanRenewsAt(renewAt);
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
        .select('plan_tier, plan_status, plan_renews_at')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const active =
        data.plan_tier === 'premium' &&
        data.plan_status === 'active' &&
        data.plan_renews_at &&
        new Date(data.plan_renews_at) > new Date();

      setIsPremiumActive(active);
      setPlanRenewsAt(data.plan_renews_at);
    } catch (err) {
      console.error('Error fetching plan:', err);
      setIsPremiumActive(false);
    }
  };

  // 🟢 Fetch user’s CareerCasts
  useEffect(() => {
    if (!user) return;
    fetchCareerCasts();
  }, [user]);

  const fetchCareerCasts = async () => {
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
      setCareerCasts(data || []);
    } catch (error) {
      console.error('Error fetching career casts:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Handle new CareerCast click
  const handleNewCast = () => {
    const completedRecordings = careerCasts.filter(
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
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
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
          <div className="font-bold text-xl text-[#0B4F6C]">Careercast</div>
          <div className="w-10"></div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-gray-50">
          <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-200 bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] px-4 sm:px-8 py-4 sm:py-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Your CareerCasts</h2>
                <p className="text-white/80 text-xs sm:text-sm">
                  Track progress and manage your recordings
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {isPremiumActive && planRenewsAt ? (
<span className="text-white text-xs bg-red-500 px-2 py-1 rounded-md">
                    Premium active until {new Date(planRenewsAt).toLocaleDateString()}
                  </span>
                ) : (
                  <span className="text-white text-xs bg-red-500/30 px-2 py-1 rounded-md">
                    Free Plan (3 recordings)
                  </span>
                )}
                <button
                  onClick={handleNewCast}
                  className="bg-white text-[#0B4F6C] px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold hover:bg-white/90 transition-all shadow-md flex items-center gap-2 text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4" />
                  New CareerCast
                </button>
              </div>
            </div>

            {/* Body */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="animate-spin text-[#01796F] h-10 w-10 mb-4" />
                <p className="text-gray-600">Loading your CareerCasts...</p>
              </div>
            ) : careerCasts.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-[#01796F]/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <Video className="h-12 w-12 text-[#01796F]" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">No CareerCasts Yet</h3>
                <p className="text-gray-600 mb-6">
                  Create your first professional video resume and make your profile shine.
                </p>
                <button
                  onClick={handleNewCast}
                  className="bg-[#01796F] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#016761]"
                >
                  <Plus className="w-4 h-4 inline mr-2" /> Create CareerCast
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-[#0B4F6C] uppercase tracking-wide font-semibold">
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
                    {careerCasts.map((cast) => {
                      const video = cast.recordings?.[0]?.storage_path || null;
                      const both = cast.resume_path && video;
                      return (
                        <tr key={cast.id} className="border-b hover:bg-gray-50">
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
                                className={`${
                                  both
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
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
              <div className="bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] p-5 flex justify-between items-center">
                <h3 className="text-white font-bold text-lg">Upgrade to Premium</h3>
                <button
                  onClick={handleClosePricingPopup}
                  className="text-white hover:text-gray-200 text-2xl font-bold"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <div className="text-center mb-4">
                  <Video className="mx-auto w-10 h-10 text-[#01796F]" />
                  <h4 className="font-bold text-lg mt-2">Unlock Unlimited CareerCasts</h4>
                  <p className="text-gray-600 text-sm">
                    You’ve reached your 3 free recordings. Upgrade now for 30 days of unlimited access.
                  </p>
                </div>
                <div className="bg-[#01796F]/5 rounded-lg p-4 mb-6">
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>✔ Unlimited CareerCasts</li>
                    <li>✔ HD Video Recording</li>
                    <li>✔ Advanced Analytics</li>
                    <li>✔ Priority Support</li>
                  </ul>
                </div>
                <button
                  onClick={() => {
                    handleClosePricingPopup();
                    navigate('/billing');
                  }}
                  className="w-full bg-[#01796F] text-white py-3 rounded-lg font-semibold hover:bg-[#016761]"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
