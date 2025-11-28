import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from '../components/Sidebar';
import { Menu } from 'lucide-react';
import { showToast } from "../components/ui/toast";

const Step1: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const handleLogout = () => {
    navigate('/');
  };

  useEffect(() => {
    // Load from localStorage
    const savedTitle = localStorage.getItem('careercast_jobTitle');
    const savedDescription = localStorage.getItem('careercast_jobDescription');

    if (savedTitle) setJobTitle(savedTitle);
    if (savedDescription) setJobDescription(savedDescription);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobTitle.trim() || !jobDescription.trim()) {
      showToast('Please fill in all required fields.', 'warning');
      return;
    }

    if (!user) {
      showToast('Please sign in again.', 'warning');
      return;
    }

    setSubmitting(true);

    try {
      // ✅ First, ensure the user's profile exists
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('id', user.id)
        .maybeSingle();

      // If profile doesn't exist, create it
      if (!profileData) {
        console.log('Creating profile for user:', user.email);
        await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              email: user.email,
              plan_tier: 'free',
              plan_status: 'active',
              credits_remaining: 0,
            },
          ]);
      }

      // ✅ Insert new job request
      const jobRequestData: any = {
        user_id: user.id,
        job_title: jobTitle,
        job_description: jobDescription,
        status: 'draft',
      };

      // Add email only if it exists
      if (user.email) {
        jobRequestData.email = user.email;
      }

      const { data, error } = await supabase
        .from('job_requests')
        .insert([jobRequestData])
        .select('id')
        .single();

      if (error) {
        console.error('❌ Error creating job request:', error.message, error);
        showToast('Failed to save job details. Please try again.', 'error');
        return;
      }

      // ✅ Store job info + id locally for next steps
      localStorage.setItem('careercast_jobTitle', jobTitle);
      localStorage.setItem('careercast_jobDescription', jobDescription);
      localStorage.setItem('current_job_request_id', data.id);

      showToast('Job details saved!', 'success');
      navigate('/step2');
    } catch (err: any) {
      console.error('❌ Unexpected error:', err);
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setSubmitting(false);
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
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
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
          <div className="w-10"></div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-gray-50">
          <div className="max-w-2xl mx-auto">
            <Card className="w-full">
              <CardHeader>
                {/* Step Indicator */}
                <div className="flex justify-between items-center mb-6 relative px-4 sm:px-8">
                  <div className="absolute top-4 left-12 sm:left-16 right-12 sm:right-16 h-0.5 bg-gray-300 -z-10"></div>

                  {/* Step 1 - Active */}
                  <div className="flex flex-col items-center relative z-10">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                      1
                    </div>
                    <span className="text-xs mt-1 text-blue-600 font-medium hidden sm:block">Job Details</span>
                    <span className="text-xs mt-1 text-blue-600 font-medium sm:hidden">Step 1</span>
                  </div>

                  {/* Step 2 - Inactive */}
                  <div className="flex flex-col items-center relative z-10">
                    <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-semibold">
                      2
                    </div>
                    <span className="text-xs mt-1 text-gray-500 hidden sm:block">Upload Resume</span>
                    <span className="text-xs mt-1 text-gray-500 sm:hidden">Step 2</span>
                  </div>

                  {/* Step 3 - Inactive */}
                  <div className="flex flex-col items-center relative z-10">
                    <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-semibold">
                      3
                    </div>
                    <span className="text-xs mt-1 text-gray-500 hidden sm:block">Record Video</span>
                    <span className="text-xs mt-1 text-gray-500 sm:hidden">Step 3</span>
                  </div>
                </div>

                <CardTitle className="text-xl sm:text-2xl font-bold text-center">Job Details</CardTitle>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="job-title" className="text-sm font-medium text-gray-700">
                      Job Title *
                    </label>
                    <Input
                      id="job-title"
                      type="text"
                      placeholder="e.g., Senior Software Engineer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      required
                      className="w-full"
                    />
                    <p className="text-xs sm:text-sm text-gray-500">Enter the official title for this position</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="job-description" className="text-sm font-medium text-gray-700">
                      Job Description *
                    </label>
                    <Textarea
                      id="job-description"
                      placeholder="Describe the responsibilities, required skills, and qualifications for this position..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      required
                      className="min-h-[100px] sm:min-h-[120px]"
                    />
                    <p className="text-xs sm:text-sm text-gray-500">
                      Be specific about what makes this role unique and what you're looking for in candidates
                    </p>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/dashboard')}
                      className="text-sm sm:text-base"
                    >
                      Back
                    </Button>
                    <Button type="submit" disabled={submitting} className="text-sm sm:text-base">
                      {submitting ? "Saving..." : "Next Step →"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Step1;