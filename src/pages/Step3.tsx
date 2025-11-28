import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Check, Loader2, AlertCircle, Menu } from "lucide-react";
import Sidebar from '../components/Sidebar';
import { useAuth } from "../contexts/AuthContext";
import { showToast } from "../components/ui/toast";

// ✅ real GPT endpoint
// Handle both Vercel and local environment variables
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

const Step3: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [teleprompterText, setTeleprompterText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teleprompterSpeed, setTeleprompterSpeed] = useState<number>(1);

  const handleLogout = () => {
    navigate('/');
  };

  // ----------- GPT PROMPT FUNCTION -------------
  const callOpenAI = async (prompt: string): Promise<string> => {
    // For Vercel deployment, use the backend API endpoint instead of calling OpenAI directly from frontend
    if (process.env.NODE_ENV === 'production') {
      console.log('📤 Sending request to /api/generate-introduction');
      console.log('📤 Prompt length:', prompt.length);
      console.log('📤 Prompt preview:', prompt.substring(0, 100) + '...');

      // Prepare the request body
      const requestBody = { prompt };
      console.log('📤 Request body type:', typeof requestBody);
      console.log('📤 Request body keys:', Object.keys(requestBody));

      // In production, call our own backend endpoint
      const response = await fetch("/api/generate-introduction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('📥 Response text:', errorText);

        try {
          const errorData = JSON.parse(errorText);
          console.error('API Error Response:', errorData);
          throw new Error(`Failed to generate introduction: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
        } catch (e) {
          throw new Error(`Failed to generate introduction: ${response.status} ${response.statusText} - ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('📥 Response data:', data);
      return data.introduction;
    } else {
      // In development, call OpenAI directly
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // or "gpt-4-turbo"
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 350,
        }),
      });

      if (!response.ok) throw new Error("Failed to reach OpenAI API");
      const data = await response.json();
      return data.choices[0].message.content.trim();
    }
  };

  // ------------- PROMPT BUILDER ----------------
  const buildPrompt = (jobTitle: string, jobDescription: string, resumeText: string) => `
You are an expert HR assistant. Write a *polite, professional, legally appropriate*
self-introduction video script for a candidate applying for the position of **${jobTitle}**.

Use the information below:

📋 Job Description:
${jobDescription}

📄 Candidate Resume Text:
${resumeText}

✍️ Instructions:
- Duration ≈ 100–130 seconds (≈ 250–300 words)
- Begin with a warm, professional greeting (e.g., “Hello, my name is …”)
- Mention the ${jobTitle} role naturally.
- Highlight the candidate’s strongest, most relevant experience.
- Keep it confident, humble, and human (not robotic).
- Avoid disclosing personal information beyond [Your Name].
- End with enthusiasm about the opportunity and gratitude.

Format as plain text (no Markdown). 
`;

  // ----------- GENERATE INTRO ------------------
  const generateIntroduction = async (rewrite = false) => {
    try {
      rewrite ? setIsRewriting(true) : setIsGenerating(true);
      setError(null);

      const jobTitle = localStorage.getItem("careercast_jobTitle") || "";
      const jobDescription = localStorage.getItem("careercast_jobDescription") || "";
      const resumeText = localStorage.getItem("resumeFullText") || "Resume text not found.";

      if (!jobTitle || !jobDescription) {
        throw new Error("Missing job title or description. Please complete Step 1 and 2 first.");
      }

      const prompt = buildPrompt(jobTitle, jobDescription, resumeText);
      const result = await callOpenAI(prompt);

      setTeleprompterText(result);
      localStorage.setItem("teleprompterText", result);
    } catch (err) {
      console.error("❌ Error generating introduction:", err);
      setError(err instanceof Error ? err.message : "Something went wrong while generating.");
    } finally {
      setIsGenerating(false);
      setIsRewriting(false);
    }
  };

  // -------- INITIALIZE ON MOUNT ---------------
  useEffect(() => {
    const saved = localStorage.getItem("teleprompterText");
    const jobTitle = localStorage.getItem("careercast_jobTitle");
    if (saved && jobTitle) setTeleprompterText(saved);
    else if (jobTitle) generateIntroduction();
    else {
      setError("Please complete Step 1 (Job Details) first.");
      setTeleprompterText(
        "Please go back to Step 1 and provide job details to generate your personalized introduction."
      );
    }
  }, []);

  // -------------- RECORD & FINISH --------------
  const handleStartRecording = () => {
    if (!teleprompterText || teleprompterText.includes("Please go back")) {
      showToast("Wait for AI to generate your script first.", "warning");
      return;
    }
    localStorage.setItem("teleprompterText", teleprompterText);
    localStorage.setItem("teleprompterSpeed", teleprompterSpeed.toString()); // Save speed
    const castId = `career_cast_${Date.now()}`;
    localStorage.setItem("current_cast_id", castId);
    navigate("/record");
  };

  const handleFinish = () => {
    if (!teleprompterText) {
      showToast("Generate a valid introduction before finishing.", "warning");
      return;
    }
    showToast("Network Note completed! Redirecting to dashboard.", "success");
    navigate("/dashboard");
  };

  // -------------- UI ---------------------------
  const jobTitle = localStorage.getItem("careercast_jobTitle") || "Your Position";
  const resumeFileName = localStorage.getItem("resumeFileName") || "No resume uploaded";

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
          <div className="font-bold text-xl text-[#0B4F6C]">Network Note</div>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <Card className="w-full">
              <CardHeader>
                {/* Progress bar */}
                <div className="flex justify-between items-center mb-6 relative px-4 sm:px-8">
                  <div className="absolute top-4 left-12 sm:left-16 right-12 sm:right-16 h-0.5 bg-gray-300 -z-10">
                    <div className="h-full bg-green-500 w-2/3" />
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                      <Check className="h-4 w-4" />
                    </div>
                    <span className="text-xs mt-1 text-green-600 font-medium hidden sm:block">Job Details</span>
                    <span className="text-xs mt-1 text-green-600 font-medium sm:hidden">Step 1</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                      <Check className="h-4 w-4" />
                    </div>
                    <span className="text-xs mt-1 text-green-600 font-medium hidden sm:block">Upload Resume</span>
                    <span className="text-xs mt-1 text-green-600 font-medium sm:hidden">Step 2</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      3
                    </div>
                    <span className="text-xs mt-1 text-blue-600 font-medium hidden sm:block">Record Video</span>
                    <span className="text-xs mt-1 text-blue-600 font-medium sm:hidden">Step 3</span>
                  </div>
                </div>

                <CardTitle className="text-xl sm:text-2xl font-bold text-center">
                  Record Your Network Note Video
                </CardTitle>
                <div className="text-center text-gray-600 mt-2 text-sm sm:text-base">
                  Job Title: <span className="font-semibold">{jobTitle}</span>
                </div>
              </CardHeader>

              <CardContent>
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                    <div className="text-red-700 text-sm">{error}</div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
                  {/* Left – Video */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
                      <span className="mr-2">🎥</span> Video Recording
                    </h3>

                    <div className="bg-gray-100 rounded-lg p-4 sm:p-6 text-center mb-4 border border-gray-200">
                      <div className="bg-gray-300 rounded-lg h-32 sm:h-48 flex items-center justify-center mb-4">
                        <div>
                          <div className="text-3xl sm:text-4xl mb-2">📷</div>
                          <p className="text-gray-600 text-sm sm:text-base">Camera preview appears here</p>
                        </div>
                      </div>

                      <Button
                        onClick={handleStartRecording}
                        className="w-full text-sm sm:text-base"
                        disabled={isGenerating || !teleprompterText}
                      >
                        <span className="mr-2">⏺️</span>
                        {isGenerating ? "Generating Script..." : "Start Recording"}
                      </Button>

                      <p className="text-xs sm:text-sm text-gray-600 mt-3">
                        Opens the recording studio with teleprompter
                      </p>
                    </div>
                  </div>

                  {/* Right – Teleprompter */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
                      <span className="mr-2">📜</span> Teleprompter
                      {(isGenerating || isRewriting) && (
                        <Loader2 className="h-4 w-4 ml-2 animate-spin text-blue-600" />
                      )}
                    </h3>

                    <div className="bg-gray-900 text-white rounded-lg p-3 sm:p-4 h-48 sm:h-64 overflow-y-auto mb-4 font-mono text-xs sm:text-sm">
                      {isGenerating || isRewriting ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <Loader2 className="h-6 sm:h-8 w-6 sm:w-8 animate-spin text-white mx-auto mb-2" />
                            <p className="text-gray-300 text-xs sm:text-sm">
                              {isRewriting
                                ? "Rewriting your introduction..."
                                : "Generating your personalized introduction..."}
                            </p>
                            <p className="text-gray-400 text-xs">
                              Analyzing job and resume data
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap leading-relaxed text-gray-100">
                          {teleprompterText}
                        </div>
                      )}
                    </div>

                    {/* Speed Control Slider */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teleprompter Speed: {teleprompterSpeed.toFixed(1)}x
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={teleprompterSpeed}
                        onChange={(e) => setTeleprompterSpeed(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Slower</span>
                        <span>Faster</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => generateIntroduction(true)}
                      className="w-full text-sm sm:text-base"
                      disabled={isRewriting || isGenerating}
                    >
                      {isRewriting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Rewriting...
                        </>
                      ) : (
                        <>
                          <span className="mr-2">🔄</span> Regenerate / Rewrite
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/step2")}
                    disabled={isGenerating}
                    className="text-sm sm:text-base"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleFinish}
                    disabled={isGenerating || !teleprompterText}
                    className="text-sm sm:text-base"
                  >
                    Finish & Save Network Note
                  </Button>
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
