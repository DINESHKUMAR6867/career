import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Check, Menu, RefreshCw, Video, Save } from "lucide-react";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from '../components/Sidebar';
import { showToast } from "../components/ui/toast";

const Step3: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [teleprompterText, setTeleprompterText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teleprompterSpeed, setTeleprompterSpeed] = useState(1);

  const handleLogout = () => {
    navigate('/');
  };

  // 🔹 Build Prompt
  const buildPrompt = (jobTitle: string, jobDesc: string, resumeText: string) => {
    return `
      You are a professional career coach.
      Create a 30-60 second video introduction script for a candidate applying for the position of "${jobTitle}".
      
      Job Description:
      ${jobDesc.slice(0, 1500)}

      Candidate's Resume:
      ${resumeText.slice(0, 2000)}

      The script should be:
      - Professional, confident, and engaging.
      - Highlight key skills matching the job description.
      - Written in the first person ("I am...").
      - Easy to read aloud (teleprompter friendly).
      - No placeholders like [Your Name], use the candidate's actual details if available, or generic but natural phrasing.
    `;
  };

  // 🔹 Call OpenAI
  const callOpenAI = async (prompt: string) => {
    const { data, error } = await supabase.functions.invoke("generate-intro", {
      body: { prompt },
    });

    if (error) throw new Error(error.message);
    return data.introduction || "Could not generate introduction.";
  };

  // 🔹 Generate Introduction
  const generateIntroduction = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const jobTitle = localStorage.getItem("careercast_jobTitle");
      const jobDescription = localStorage.getItem("careercast_jobDescription");
      const resumeText = localStorage.getItem("resumeFullText");

      if (!jobTitle || !jobDescription || !resumeText) {
        throw new Error("Missing job title, description, or resume. Please complete Step 1 and 2 first.");
      }

      const prompt = buildPrompt(jobTitle, jobDescription, resumeText);
      const result = await callOpenAI(prompt);

      setTeleprompterText(result);
      localStorage.setItem("teleprompterText", result);
    } catch (err: any) {
      console.error("❌ Error generating introduction:", err);
      setError(err.message || "Something went wrong while generating.");
      showToast("Failed to generate script. Please try again.", "error");
    } finally {
      setIsGenerating(false);
      setIsRewriting(false);
    }
  };

  // 🔹 Initialize on Mount
  useEffect(() => {
    const saved = localStorage.getItem("teleprompterText");
    const jobTitle = localStorage.getItem("careercast_jobTitle");

    if (saved && saved.length > 10) {
      setTeleprompterText(saved);
    } else if (jobTitle) {
      generateIntroduction();
    } else {
      setError("Please complete Step 1 (Job Details) first.");
      setTeleprompterText("Please go back to Step 1 and provide job details to generate your personalized introduction.");
    }
  }, []);

  // 🔹 Start Recording
  const handleStartRecording = () => {
    if (!teleprompterText || teleprompterText.includes("Please go back")) {
      showToast("Wait for AI to generate your script first.", "warning");
      return;
    }
    localStorage.setItem("teleprompterText", teleprompterText);
    localStorage.setItem("teleprompterSpeed", teleprompterSpeed.toString());
    navigate("/record");
  };

  // 🔹 Handle Text Change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTeleprompterText(e.target.value);
    localStorage.setItem("teleprompterText", e.target.value);
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
          <div className="max-w-4xl mx-auto">
            <Card className="w-full">
              <CardHeader>
                {/* Progress bar */}
                <div className="flex justify-between items-center mb-6 relative px-4 sm:px-8">
                  <div className="absolute top-4 left-12 sm:left-16 right-12 sm:right-16 h-0.5 bg-gray-300 -z-10">
                    <div className="h-full bg-green-500 w-full" />
                  </div>

                  <div className="flex flex-col items-center relative z-10">
                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-semibold">
                      <Check className="h-4 w-4" />
                    </div>
                    <span className="text-xs mt-1 text-green-600 font-medium hidden sm:block">Job Details</span>
                    <span className="text-xs mt-1 text-green-600 font-medium sm:hidden">Step 1</span>
                  </div>

                  <div className="flex flex-col items-center relative z-10">
                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-semibold">
                      <Check className="h-4 w-4" />
                    </div>
                    <span className="text-xs mt-1 text-green-600 font-medium hidden sm:block">Upload Resume</span>
                    <span className="text-xs mt-1 text-green-600 font-medium sm:hidden">Step 2</span>
                  </div>

                  <div className="flex flex-col items-center relative z-10">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                      3
                    </div>
                    <span className="text-xs mt-1 text-blue-600 font-medium hidden sm:block">Record Video</span>
                    <span className="text-xs mt-1 text-blue-600 font-medium sm:hidden">Step 3</span>
                  </div>
                </div>

                <CardTitle className="text-xl font-bold text-center">Your Teleprompter Script</CardTitle>
                <p className="text-gray-600 text-center mt-2 text-sm">
                  Review and edit your AI-generated script before recording.
                </p>
              </CardHeader>

              <CardContent>
                <div className="space-y-6">
                  {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  <div className="relative">
                    <Textarea
                      value={teleprompterText}
                      onChange={handleTextChange}
                      className="min-h-[300px] text-lg leading-relaxed p-6 font-medium resize-y"
                      placeholder={isGenerating ? "Generating your script..." : "Your script will appear here..."}
                      disabled={isGenerating}
                    />
                    {isGenerating && (
                      <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={generateIntroduction}
                        disabled={isGenerating}
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                        Regenerate
                      </Button>
                      <div className="flex items-center gap-2 px-4 border rounded-md bg-gray-50">
                        <span className="text-sm text-gray-600 whitespace-nowrap">Speed:</span>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={teleprompterSpeed}
                          onChange={(e) => setTeleprompterSpeed(parseFloat(e.target.value))}
                          className="w-24"
                        />
                        <span className="text-sm font-medium w-8">{teleprompterSpeed}x</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleStartRecording}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                      disabled={isGenerating || !teleprompterText}
                    >
                      <Video className="h-4 w-4" />
                      Start Recording
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Step3;