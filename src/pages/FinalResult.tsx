// import React, { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
// import { Button } from '../components/ui/button';
// import { Download, Play, ArrowLeft, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
// import { useAuthContext } from '../contexts/AuthContext';

// interface CareerCast {
//   id: string;
//   jobTitle: string;
//   resumeFileName?: string;
//   videoUrl?: string;
//   createdAt: string;
//   resumeContent?: string;
// }

// const FinalResult: React.FC = () => {
//   const navigate = useNavigate();
//   const { castId } = useParams<{ castId: string }>();
//   const { user, logout } = useAuthContext();
//   const [careerCast, setCareerCast] = useState<CareerCast | null>(null);
//   const [showVideoPlayer, setShowVideoPlayer] = useState(false);
//   const [resumeContent, setResumeContent] = useState<string>('');```
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Download, Play, ArrowLeft, LogOut } from "lucide-react";
import { useAuthContext } from "../contexts/AuthContext";
import { PDFDocument, PDFName, PDFNumber, PDFArray, PDFString, rgb } from "pdf-lib";
import { supabase } from "../integrations/supabase/client";
import { showToast } from "../components/ui/toast";

const FinalResult: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  const { castId } = useParams<{ castId: string }>();

  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string>("Resume.pdf");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [jobTitle, setJobTitle] = useState<string>("");
  const [isExternalVisitor, setIsExternalVisitor] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Load data from localStorage or Supabase
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        console.log("Loading data with:", { user, castId });
        // Check if this is an external visitor (no user but has castId)
        const isExternal = !user && castId;
        setIsExternalVisitor(!!isExternal);
        
        if (isExternal) {
          // Load data from Supabase for external visitors
          await loadExternalData(castId!);
        } else {
          // Load data from localStorage for authenticated users
          await loadLocalData();
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user, castId]);

  const loadLocalData = async () => {
    // First try to get data from localStorage
    const uploadedResumeUrl = localStorage.getItem("uploadedResumeUrl");
    const fileName = localStorage.getItem("resumeFileName");
    const recordedVideoUrl = localStorage.getItem("recordedVideoUrl");
    const jobTitle = localStorage.getItem("careerCast_jobTitle");
    const currentJobRequestId = localStorage.getItem("current_job_request_id");

    console.log("Loading local data with:", { uploadedResumeUrl, recordedVideoUrl, currentJobRequestId });

    // If we have a job request ID, fetch the latest data from Supabase
    if (currentJobRequestId) {
      try {
        const { data, error } = await supabase
          .from('job_requests')
          .select(`
            job_title,
            resume_path,
            recordings (
              storage_path
            )
          `)
          .eq('id', currentJobRequestId)
          .single();

        console.log("Supabase data:", { data, error });

        if (!error && data) {
          setJobTitle(data.job_title || jobTitle || "");
          setResumeUrl(data.resume_path || uploadedResumeUrl);
          setResumeFileName(fileName || data.resume_path ? 
            data.resume_path.split('/').pop() || "Resume.pdf" : 
            "Resume.pdf");
          
          // Get video URL from recordings
          let finalVideoUrl = null;
          if (data.recordings && data.recordings.length > 0) {
            const path = data.recordings[0].storage_path;
            // ✅ Convert relative storage path to public URL if needed
            if (path) {
              finalVideoUrl = path.startsWith('http')
                ? path
                : supabase.storage.from('recordings').getPublicUrl(path).data.publicUrl;
            } else {
              finalVideoUrl = recordedVideoUrl || null;
            }
          } else {
            finalVideoUrl = recordedVideoUrl || null;
          }

          
          // Ensure the video URL is properly formatted
          if (finalVideoUrl && !finalVideoUrl.startsWith('http')) {
            // If it's a relative path, construct the full URL
            try {
              finalVideoUrl = supabase.storage.from('recordings').getPublicUrl(finalVideoUrl).data.publicUrl;
            } catch (urlError) {
              console.error("Error constructing video URL:", urlError);
              // Fallback to the original URL
            }
          }
          
          setVideoUrl(finalVideoUrl);
          
          console.log("Set state values:", {
            jobTitle: data.job_title || jobTitle || "",
            resumeUrl: data.resume_path || uploadedResumeUrl,
            resumeFileName: fileName || data.resume_path ? 
              data.resume_path.split('/').pop() || "Resume.pdf" : 
              "Resume.pdf",
            videoUrl: finalVideoUrl
          });
          
          return;
        } else {
          console.error("Supabase error or no data:", error);
        }
      } catch (error) {
        console.error("Error fetching from Supabase:", error);
      }
    }

    // Fallback to localStorage data
    if (uploadedResumeUrl) setResumeUrl(uploadedResumeUrl);
    if (fileName) setResumeFileName(fileName);
    else setResumeFileName("Resume.pdf");
    if (recordedVideoUrl) {
      let finalVideoUrl = recordedVideoUrl;
      // Ensure the video URL is properly formatted
      if (finalVideoUrl && !finalVideoUrl.startsWith('http')) {
        // If it's a relative path, construct the full URL
        try {
          finalVideoUrl = supabase.storage.from('recordings').getPublicUrl(finalVideoUrl).data.publicUrl;
        } catch (urlError) {
          console.error("Error constructing video URL:", urlError);
          // Fallback to the original URL
        }
      }
      setVideoUrl(finalVideoUrl);
    }
    if (jobTitle) setJobTitle(jobTitle);

    console.log("🎬 Loaded local data:", {
      uploadedResumeUrl,
      recordedVideoUrl,
      fileName,
      jobTitle
    });
  };

  const loadExternalData = async (id: string) => {
    try {
      // Fetch job request data from Supabase
      const { data, error } = await supabase
        .from('job_requests')
        .select(`
          job_title,
          resume_path,
          recordings (
            storage_path
          )
        `)
        .eq('id', id)
        .single();

      console.log("External data load:", { data, error });

      if (error) throw error;

      if (data) {
        setJobTitle(data.job_title || "");
        setResumeUrl(data.resume_path || null);
        setResumeFileName(data.resume_path ? 
          data.resume_path.split('/').pop() || "Resume.pdf" : 
          "Resume.pdf");
        
        // Get video URL from recordings
        let finalVideoUrl = null;
        if (data.recordings && data.recordings.length > 0) {
          const path = data.recordings[0].storage_path;
          // ✅ Convert relative storage path to full Supabase URL if needed
          if (path) {
            finalVideoUrl = path.startsWith('http')
              ? path
              : supabase.storage.from('recordings').getPublicUrl(path).data.publicUrl;
          } else {
            finalVideoUrl = null;
          }
        }

        
        setVideoUrl(finalVideoUrl);
        
        console.log("Set external state values:", {
          jobTitle: data.job_title || "",
          resumeUrl: data.resume_path || null,
          resumeFileName: data.resume_path ? 
            data.resume_path.split('/').pop() || "Resume.pdf" : 
            "Resume.pdf",
          videoUrl: finalVideoUrl
        });
      }
    } catch (error) {
      console.error("❌ Error loading external data:", error);
    }
  };

  // ✅ Play video modal
  const handlePlayVideo = () => {
    console.log("Play video clicked, videoUrl:", videoUrl);
    if (!videoUrl) {
      showToast("No recorded video found for this profile.", "warning");
      return;
    }
    
    // Test if the video URL is accessible
    fetch(videoUrl, { method: 'HEAD' })
      .then(response => {
        if (!response.ok) {
          console.error("Video URL not accessible:", response.status, response.statusText);
          showToast("Video file not accessible. Please try again later.", "error");
        } else {
          console.log("Video URL is accessible");
          setShowVideoPlayer(true);
        }
      })
      .catch(error => {
        console.error("Error checking video URL:", error);
        // Still try to show the player even if the check fails
        setShowVideoPlayer(true);
      });
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // ✅ Enhance PDF with embedded clickable "Play Video" button
  const enhancePDF = async (resumeUrl: string, castId: string) => {
    try {
      // Absolute URL of the current page for redirect
      const baseUrl = window.location.origin || "https://careercast-omega.vercel.app";
      const finalResultUrl = `${baseUrl}/final-result/${castId || "profile"}`;

      console.log("🎯 Embedding link to:", finalResultUrl);

      // Use a proxy approach to avoid CORS issues
      // First, fetch the PDF as a blob
      let response;
      try {
        response = await fetch(resumeUrl);
      } catch (fetchError) {
        // If direct fetch fails, try with credentials
        response = await fetch(resumeUrl, { credentials: 'include' });
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const firstPage = pdfDoc.getPages()[0];
      const { width, height } = firstPage.getSize();

      // Embed the play button image
      const buttonImageUrl = `${baseUrl}/images/play_video_button.png`;
      console.log("🖼️ Loading play button image from:", buttonImageUrl);
      
      let buttonImageResponse;
      try {
        buttonImageResponse = await fetch(buttonImageUrl);
      } catch (imageError) {
        // Try with credentials if direct fetch fails
        buttonImageResponse = await fetch(buttonImageUrl, { credentials: 'include' });
      }
      
      if (!buttonImageResponse.ok) {
        throw new Error(`Button image not found at ${buttonImageUrl}, received status: ${buttonImageResponse.status}`);
      }
      
      const imageBytes = await buttonImageResponse.arrayBuffer();
      let buttonImage;
      
      // Check if it's a PNG or JPG
      if (buttonImageUrl.endsWith('.png')) {
        buttonImage = await pdfDoc.embedPng(imageBytes);
      } else {
        buttonImage = await pdfDoc.embedJpg(imageBytes);
      }

      // Position at Top-Right corner
      const buttonWidth = 120;
      const buttonHeight = 40;
      const margin = 10;
      const x = width - buttonWidth - margin;
      const y = height - buttonHeight - margin;

      // Draw the play button image
      firstPage.drawImage(buttonImage, {
        x,
        y,
        width: buttonWidth,
        height: buttonHeight,
      });

      // ✅ Create clickable annotation linking to the current FinalResult page
      const context = pdfDoc.context;
      const annotationDict = context.obj({
        Type: PDFName.of("Annot"),
        Subtype: PDFName.of("Link"),
        Rect: context.obj([
          PDFNumber.of(x),
          PDFNumber.of(y),
          PDFNumber.of(x + buttonWidth),
          PDFNumber.of(y + buttonHeight),
        ]),
        Border: context.obj([PDFNumber.of(0), PDFNumber.of(0), PDFNumber.of(0)]),
        A: context.obj({
          S: PDFName.of("URI"),
          URI: PDFString.of(finalResultUrl),
        }),
      });

      // Attach annotation
      let annots = firstPage.node.lookup(PDFName.of("Annots"));
      if (annots instanceof PDFArray) {
        annots.push(annotationDict);
      } else {
        const annotsArray = context.obj([annotationDict]);
        firstPage.node.set(PDFName.of("Annots"), annotsArray);
      }

      // Save the modified PDF
      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(modifiedPdfBytes)], { type: "application/pdf" });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("❌ Error enhancing PDF:", error);
      throw error;
    }
  };

  // ✅ Download Enhanced Resume
  const handleDownloadEnhanced = async () => {
    try {
      console.log("Download enhanced resume clicked, resumeUrl:", resumeUrl);
      if (!resumeUrl) {
        showToast("No resume found to enhance.", "warning");
        return;
      }

      console.log("Enhancing PDF...");
      const currentCastId = castId || localStorage.getItem("current_job_request_id") || "profile";
      const enhancedUrl = await enhancePDF(resumeUrl, currentCastId);

      // ✅ Generate filename based on first name
      const firstName =
  localStorage.getItem("first_name") ||
  ((user as any)?.user_metadata?.full_name?.split(" ")[0]) ||
  "user";


      const cleanFirstName = firstName.trim().replace(/\s+/g, "_").toLowerCase();
      const finalFileName = `${cleanFirstName}_careercast_resume.pdf`;

      console.log("Downloading file:", { enhancedUrl, finalFileName });
      
      const a = document.createElement("a");
      a.href = enhancedUrl;
      a.download = finalFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up the URL object
      setTimeout(() => URL.revokeObjectURL(enhancedUrl), 1000);
    } catch (err: any) {
      console.error("Error enhancing file:", err);
      showToast(`Failed to enhance PDF: ${err.message || 'Unknown error occurred. Please try again.'}`, "error");
    }
  };

  // ✅ Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading your CareerCast...</p>
      </div>
    );
  }

  // ✅ Fallback message
  if (!resumeUrl && !videoUrl) {
    console.log("No data found, resumeUrl:", resumeUrl, "videoUrl:", videoUrl);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">No resume or video data found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Debug info */}
      <div className="fixed top-0 left-0 bg-black text-white text-xs p-2 z-50">
        resumeUrl: {resumeUrl ? 'YES' : 'NO'}, videoUrl: {videoUrl ? 'YES' : 'NO'}, 
        isExternalVisitor: {isExternalVisitor ? 'YES' : 'NO'}, user: {user ? 'YES' : 'NO'}
      </div>
      
      {/* ===== Header Section ===== */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b shadow-sm z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center px-4 py-3 gap-3">
          {user ? (
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          ) : (
            <div></div> // Empty div for spacing
          )}

          {user && (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                onClick={handleDownloadEnhanced}
                className="flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                disabled={!resumeUrl}
              >
                <Download className="h-4 w-4" />
                Download Enhanced Resume
              </Button>
              
              {/* Copy CareerCast Link Button */}
              <Button
                variant="outline"
                onClick={() => {
                  // Generate the actual shareable link for this CareerCast
                  const baseUrl = window.location.origin;
                  // Use castId if available (for shared links), otherwise use the current job request ID
                  const currentCastId = castId || localStorage.getItem("current_job_request_id");
                  
                  if (!currentCastId) {
                    showToast('Unable to generate shareable link. No CareerCast ID found.', 'error');
                    return;
                  }
                  
                  const shareableLink = `${baseUrl}/final-result/${currentCastId}`;
                  
                  navigator.clipboard.writeText(shareableLink).then(() => {
                    showToast('CareerCast link copied to clipboard!', 'success');
                  }).catch(err => {
                    console.error('Failed to copy link: ', err);
                    showToast('Failed to copy link. Please try again.', 'error');
                  });
                }}
                className="flex items-center gap-2 border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
              >
                Copy CareerCast Link
              </Button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={handlePlayVideo}
              className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:scale-105 transition-transform"
              disabled={!videoUrl}
            >
              <Play className="h-4 w-4 mr-1" fill="white" />
              Play Video
            </Button>
            {user && (
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ===== Resume Display Section ===== */}
      <div className="pt-20 pb-0 px-2">
        <div 
          className="max-w-5xl mx-auto border-none shadow-none overflow-hidden flex flex-col" 
          style={{ height: "calc(100vh - 140px)" }}
        >
          {/* {isExternalVisitor && (
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4 mb-4 text-center shadow-md">
              <div className="flex items-center justify-center gap-2">
                <div className="bg-white/20 rounded-full p-2">
                  <Play className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg">Shared CareerCast Profile</h3>
              </div>
              <p className="mt-2 text-blue-100">
                {user 
                  ? "You're viewing a shared profile. You can play the video introduction above." 
                  : "You're viewing a shared CareerCast profile. Log in to access the full video introduction."}
              </p>
            </div>
          )} */}
          
          {resumeUrl ? (
            <iframe
              src={`${resumeUrl}#zoom=100&view=FitH`}
              title="Resume Preview"
              className="w-full h-full border-0 rounded-lg"
              style={{ 
                height: "calc(100vh - 140px)",
                transform: 'scale(1)',
                transformOrigin: '0 0'
              }}
              allowFullScreen
            ></iframe>
          ) : (
            <p className="text-gray-500 text-center py-10">No resume available.</p>
          )}
        </div>
      </div>

      {/* ===== Video Player Modal ===== */}
      {showVideoPlayer && videoUrl && (
        <div className="fixed top-20 right-6 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50">
          <div className="p-3 border-b border-gray-200 flex justify-between items-center">
            <h4 className="text-sm font-semibold text-gray-900">Video Preview</h4>
            <Button
              variant="ghost"
              onClick={() => setShowVideoPlayer(false)}
              className="h-6 w-6 p-0"
            >
              ✕
            </Button>
          </div>
          <div className="p-2">
            <video controls autoPlay className="w-full rounded" src={videoUrl}>
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="mt-2 text-xs text-gray-500 break-all">
              Video URL: {videoUrl}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalResult;
