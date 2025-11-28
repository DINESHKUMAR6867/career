import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Check, Menu } from "lucide-react";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "../contexts/AuthContext";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";
import Sidebar from '../components/Sidebar';
import { showToast } from "../components/ui/toast";

// Use unpkg CDN which is more reliable
const pdfjsVersion = pdfjsLib.version || '5.4.296';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;

const Step2: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    navigate('/');
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (file: File) => {
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (!validTypes.includes(file.type) && !["pdf", "doc", "docx"].includes(fileExtension || "")) {
      showToast("Please upload a PDF or DOCX file.", "warning");
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast("File size exceeds 10MB limit.", "warning");
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast("Please select a resume file.", "warning");
      return;
    }
    if (!user) {
      showToast("Please sign in again before uploading.", "warning");
      return;
    }

    setIsUploading(true);
    try {
      const jobRequestId = localStorage.getItem("current_job_request_id");
      if (!jobRequestId) throw new Error("Missing job request ID (Step 1 not saved).");

      const fileExt = selectedFile.name.split(".").pop()?.toLowerCase();

      const firstName =
        localStorage.getItem("first_name") ||
        (user && (user as any)?.user_metadata?.full_name?.split(" ")[0]) ||
        "user";

      const cleanFirstName = firstName.trim().replace(/\s+/g, "_").toLowerCase();
      // ✅ Append timestamp to ensure unique filename for every upload
      const timestamp = Date.now();
      const fileName = `${cleanFirstName}_careercast_resume_${timestamp}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // 🔹 Upload to Supabase
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(filePath, selectedFile, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage.from("resumes").getPublicUrl(filePath);
      const publicUrl = publicData?.publicUrl ?? null;

      // 🔹 Extract text
      let extractedText = "";
      const buffer = await selectedFile.arrayBuffer();

      if (fileExt === "pdf") {
        try {
          const loadingTask = pdfjsLib.getDocument({ data: buffer });
          const pdf = await loadingTask.promise;
          let text = "";

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map((item: any) => item.str).join(" ");
            text += pageText + " ";
          }
          extractedText = text;
        } catch (pdfError: any) {
          console.error("❌ PDF processing failed:", pdfError.message);
          // Fallback: try to extract text with a simpler approach
          extractedText = "Text extraction failed. Please try uploading a different PDF file.";
        }
      } else if (["docx", "doc"].includes(fileExt || "")) {
        const { value } = await mammoth.extractRawText({ arrayBuffer: buffer });
        extractedText = value;
      }

      extractedText = extractedText.replace(/\s+/g, " ").trim().slice(0, 10000);

      // 🔹 Save to localStorage
      localStorage.setItem("uploadedResumeUrl", publicUrl || "");
      localStorage.setItem("resumeFileName", fileName);
      localStorage.setItem("resumeFullText", extractedText);
      // Clear previous teleprompter text to force regeneration with new resume
      localStorage.removeItem("teleprompterText");

      // 🔹 Update Supabase
      const { error: updateError } = await supabase
        .from("job_requests")
        .update({
          resume_path: publicUrl,
          resume_original_name: fileName,
          status: "ready",
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobRequestId);

      if (updateError) throw updateError;

      showToast("Resume uploaded and text extracted successfully!", "success");
      navigate("/step3");
    } catch (err: any) {
      console.error("❌ Upload failed:", err.message);
      showToast("Upload failed. Please try again.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
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
          <div className="w-10"></div> {/* Spacer for alignment */}
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-gray-50">
          <div className="max-w-2xl mx-auto">
            <Card className="w-full">
              <CardHeader>
                <div className="flex justify-between items-center mb-6 relative px-4 sm:px-8">
                  <div className="absolute top-4 left-12 sm:left-16 right-12 sm:right-16 h-0.5 bg-gray-300 -z-10">
                    <div className="h-full bg-green-500 w-1/2"></div>
                  </div>

                  <div className="flex flex-col items-center relative z-10">
                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-semibold">
                      <Check className="h-4 w-4" />
                    </div>
                    <span className="text-xs mt-1 text-green-600 font-medium hidden sm:block">Job Details</span>
                    <span className="text-xs mt-1 text-green-600 font-medium sm:hidden">Step 1</span>
                  </div>

                  <div className="flex flex-col items-center relative z-10">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                      2
                    </div>
                    <span className="text-xs mt-1 text-blue-600 font-medium hidden sm:block">Upload Resume</span>
                    <span className="text-xs mt-1 text-blue-600 font-medium sm:hidden">Step 2</span>
                  </div>

                  <div className="flex flex-col items-center relative z-10">
                    <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-semibold">
                      3
                    </div>
                    <span className="text-xs mt-1 text-gray-500 hidden sm:block">Record Video</span>
                    <span className="text-xs mt-1 text-gray-500 sm:hidden">Step 3</span>
                  </div>
                </div>

                <CardTitle className="text-xl font-bold text-center">Upload Your Resume</CardTitle>
                <p className="text-gray-600 text-center mt-2 text-sm">
                  Upload your resume in PDF or DOCX format
                </p>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"
                      } ${!selectedFile ? "min-h-[150px] flex items-center justify-center" : "min-h-[80px] flex items-center justify-center bg-green-50 border-green-200"}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    {!selectedFile ? (
                      <div>
                        <div className="text-3xl mb-3">📄</div>
                        <p className="text-base font-medium text-gray-700 mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PDF or DOCX (max 10MB)</p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2 text-green-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">Resume Uploaded Successfully</span>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileInputChange}
                    />
                  </div>

                  {selectedFile && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-green-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{selectedFile.name}</div>
                          <div className="text-xs text-gray-500">
                            {formatFileSize(selectedFile.size)}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={removeFile}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}

                  <div className="flex justify-between pt-4 sm:pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/step1")}
                      disabled={isUploading}
                      className="text-sm sm:text-base"
                    >
                      Back
                    </Button>
                    <Button type="submit" disabled={!selectedFile || isUploading} className="min-w-[100px] sm:min-w-[120px] text-sm sm:text-base">
                      {isUploading ? "Uploading..." : "Next Step →"}
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

export default Step2;