// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { supabase } from "../integrations/supabase/client";
// import { useAuth } from "../contexts/AuthContext";

// const Record: React.FC = () => {
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   const videoRef = useRef<HTMLVideoElement>(null);
//   const timerRef = useRef<HTMLSpanElement>(null);
//   const teleprompterRef = useRef<HTMLDivElement>(null);

//   const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
//   const [chunks, setChunks] = useState<Blob[]>([]);
//   const [state, setState] = useState<'idle' | 'armed' | 'recording'>('idle');
//   const [timer, setTimer] = useState<string>('0:00');
//   const [isTimerVisible, setIsTimerVisible] = useState(false);
//   const [teleprompterText, setTeleprompterText] = useState('');
//   const [scrollInterval, setScrollInterval] = useState<NodeJS.Timeout | null>(null);
//   const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
//   const [startTime, setStartTime] = useState<number>(0);
//   const [isUploading, setIsUploading] = useState(false);

//   // Load teleprompter text from localStorage
//   useEffect(() => {
//     const savedText = localStorage.getItem('teleprompterText');
//     if (savedText) {
//       setTeleprompterText(savedText);
//     } else {
//       setTeleprompterText('Please complete Step 3 to generate your introduction script.');
//     }
//   }, []);

//   // Initialize camera and media recorder
//   useEffect(() => {
//     const initializeCamera = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ 
//           video: { 
//             width: 1280, 
//             height: 720 
//           }, 
//           audio: true 
//         });

//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;
//         }

//         // Initialize MediaRecorder
//         const options = { mimeType: 'video/webm;codecs=vp8,opus' };
//         const recorder = new MediaRecorder(stream, options);

//         recorder.ondataavailable = (event) => {
//           if (event.data.size > 0) {
//             setChunks(prev => [...prev, event.data]);
//           }
//         };

//         recorder.onstop = handleRecordingStop;
//         setMediaRecorder(recorder);

//       } catch (error) {
//         console.error('Error accessing camera/microphone:', error);
//         alert('Cannot access camera/microphone. Please check permissions and try again.');
//       }
//     };

//     initializeCamera();

//     // Cleanup function
//     return () => {
//       if (scrollInterval) clearInterval(scrollInterval);
//       if (timerInterval) clearInterval(timerInterval);
//       if (mediaRecorder && state === 'recording') {
//         mediaRecorder.stop();
//       }
//     };
//   }, []);

// const handleRecordingStop = async () => {
//   // Stop all intervals
//   if (scrollInterval) clearInterval(scrollInterval);
//   if (timerInterval) clearInterval(timerInterval);

//   setIsTimerVisible(false);
//   if (teleprompterRef.current) teleprompterRef.current.style.top = '64%';

//   // Build a single Blob from all chunks
//   const blob = new Blob(chunks, { type: 'video/webm' });
//   setChunks([]);

//   const durationSeconds = Math.round((Date.now() - startTime) / 1000);
//   console.log("🎥 Recorded video duration:", durationSeconds, "seconds");

//   // Upload to Supabase
//   await uploadVideo(blob, durationSeconds);
// };


// const uploadVideo = async (blob: Blob, durationSeconds: number) => {
//   setIsUploading(true);
//   try {
//     if (!user) throw new Error("User not signed in");

//     const jobRequestId = localStorage.getItem("current_job_request_id");
//     if (!jobRequestId) throw new Error("Missing job request ID");

//     const fileName = `${Date.now()}.webm`;
//     const filePath = `${user.id}/${fileName}`;

//     console.log("Uploading video to Supabase:", filePath);

//     // 1️⃣ Upload to 'recordings' bucket
//     const { error: uploadError } = await supabase.storage
//       .from("recordings")
//       .upload(filePath, blob, { upsert: true, contentType: "video/webm" });

//     if (uploadError) throw uploadError;

//     // 2️⃣ Get public URL
//     const { data: publicData } = supabase.storage
//       .from("recordings")
//       .getPublicUrl(filePath);

//     const publicUrl = publicData?.publicUrl || "";

//     // 3️⃣ Insert into recordings table
//     const { error: insertError } = await supabase.from("recordings").insert({
//       job_request_id: jobRequestId,
//       storage_path: publicUrl,
//       duration_seconds: durationSeconds,
//       size_bytes: blob.size,
//     });

//     if (insertError) throw insertError;

//     // 4️⃣ Update job_requests status
//     const { error: updateError } = await supabase
//       .from("job_requests")
//       .update({ status: "recorded", updated_at: new Date().toISOString() })
//       .eq("id", jobRequestId);

//     if (updateError) throw updateError;

//     console.log("✅ Video uploaded successfully:", publicUrl);
//     alert("Recording uploaded successfully!");
//     navigate("/final-result/" + jobRequestId);
//   } catch (err: any) {
//     console.error("❌ Video upload failed:", err.message);
//     alert("Video upload failed. Please try again.");
//   } finally {
//     setIsUploading(false);
//   }
// };


//   const startTeleprompterScroll = () => {
//     let y = 100; // starts below Record button
//     const speed = parseFloat(localStorage.getItem("teleprompterSpeed") || "1"); // Get speed from localStorage
//     const interval = setInterval(() => {
//       y -= 0.18 * speed; // Apply speed multiplier
//       if (teleprompterRef.current) {
//         teleprompterRef.current.style.transform = `translate(-50%, ${y}%)`;
//       }
//       if (y < -200) clearInterval(interval);
//     }, 40);
//     setScrollInterval(interval);
//   };

//   const startTimer = () => {
//     setIsTimerVisible(true);
//     const start = Date.now();
//     setStartTime(start);

//     const interval = setInterval(() => {
//       const seconds = Math.floor((Date.now() - start) / 1000);
//       const minutes = Math.floor(seconds / 60);
//       const remainingSeconds = String(seconds % 60).padStart(2, '0');
//       setTimer(`${minutes}:${remainingSeconds}`);
//     }, 1000);

//     setTimerInterval(interval);
//   };
// const handleRecordClick = () => {
//   if (!mediaRecorder) return;

//   if (state === 'idle') {
//     // Prepare to record
//     setState('armed');
//   } else if (state === 'armed') {
//     try {
//       mediaRecorder.start(500); // collect chunks every 500ms
//       const start = Date.now();
//       setStartTime(start);
//       startTeleprompterScroll();
//       startTimer();
//       setState('recording');
//     } catch (error) {
//       console.error('Error starting recording:', error);
//       alert('Error starting recording. Please try again.');
//     }
//   } else if (state === 'recording') {
//     try {
//       mediaRecorder.requestData(); // flush the last chunk
//       mediaRecorder.stop();
//       setState('idle');
//     } catch (error) {
//       console.error('Error stopping recording:', error);
//       alert('Error stopping recording. Please try again.');
//     }
//   }
// };


//   // Handle page refresh warning
//   useEffect(() => {
//     const handleBeforeUnload = (e: BeforeUnloadEvent) => {
//       if (state === 'recording') {
//         e.preventDefault();
//         e.returnValue = 'You are currently recording. Are you sure you want to leave?';
//         return e.returnValue;
//       }
//     };

//     window.addEventListener('beforeunload', handleBeforeUnload);
//     return () => window.removeEventListener('beforeunload', handleBeforeUnload);
//   }, [state]);

//   return (
//     <div className="min-h-screen bg-black flex items-center justify-center p-4">
//       <div className="relative w-full max-w-[480px] h-[640px] bg-black rounded-2xl overflow-hidden shadow-2xl">
//         {/* Video Preview */}
//         <video
//           ref={videoRef}
//           autoPlay
//           playsInline
//           muted
//           className="w-full h-full object-cover"
//         />

//         {/* Guide Line */}
//         <div className="absolute top-[44%] left-0 right-0 h-0.5 bg-blue-400 bg-opacity-60" />

//         {/* Timer */}
//         <div 
//           className={`absolute top-3 right-4 text-white font-semibold text-xl flex items-center ${
//             isTimerVisible ? 'block' : 'hidden'
//           }`}
//         >
//           <span className="w-2 h-2 bg-red-500 rounded-full mr-2" />
//           <span ref={timerRef}>
//             {isUploading ? 'Uploading...' : timer}
//           </span>
//         </div>

//         {/* Teleprompter */}
//         <div
//           ref={teleprompterRef}
//           className="absolute left-1/2 transform -translate-x-1/2 w-[92%] text-white font-sans text-xl leading-relaxed font-normal text-center bg-gradient-to-b from-black/70 to-black/30 px-5 py-4 rounded-lg pointer-events-none top-[60%] whitespace-pre-wrap"
//         >
//           {teleprompterText}
//         </div>

//         {/* Record Button */}
//         <button
//           onClick={handleRecordClick}
//           disabled={isUploading}
//           className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 w-20 h-20 rounded-full border-4 border-white/85 cursor-pointer transition-all duration-200 ${
//             state === 'armed' 
//               ? 'bg-red-500 shadow-[0_0_0_6px_rgba(255,59,48,0.35),0_0_24px_rgba(255,59,48,0.8)]' 
//               : state === 'recording'
//               ? 'bg-red-500 grayscale-40'
//               : isUploading
//               ? 'bg-gray-500 cursor-not-allowed'
//               : 'bg-red-500'
//           }`}
//           aria-label={state === 'recording' ? 'Stop recording' : 'Start recording'}
//         />
//       </div>
//     </div>
//   );
// };

// export default Record;



// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../integrations/supabase/client";
// import { useAuth } from "../contexts/AuthContext";
// import { showToast } from "../components/ui/toast";

// const Record: React.FC = () => {
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   const videoRef = useRef<HTMLVideoElement>(null);
//   const teleprompterRef = useRef<HTMLDivElement>(null);
//   const timerRef = useRef<HTMLSpanElement>(null);
//   const chunksRef = useRef<Blob[]>([]);

//   const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
//   const [state, setState] = useState<"idle" | "armed" | "recording">("idle");
//   const [timer, setTimer] = useState("0:00");
//   const [startTime, setStartTime] = useState<number>(0);
//   const [scrollInterval, setScrollInterval] = useState<NodeJS.Timeout | null>(null);
//   const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const [teleprompterText, setTeleprompterText] = useState("");

//   // 🔹 Load teleprompter text
//   useEffect(() => {
//     const text =
//       localStorage.getItem("teleprompterText") ||
//       "Please complete Step 3 to generate your introduction script.";
//     setTeleprompterText(text);
//   }, []);

//   // ------------------------------------------
//   // Camera + Recorder Initialization
//   // ------------------------------------------
//   useEffect(() => {
//     const setupCamera = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: { width: 1280, height: 720 },
//           audio: true,
//         });

//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;
//           videoRef.current.onloadedmetadata = () => videoRef.current?.play();
//           // Ensure camera is on initially
//           stream.getVideoTracks().forEach(track => track.enabled = true);
//         }

//         await new Promise((r) => setTimeout(r, 1200)); // wait for tracks

//         const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
//           ? "video/webm;codecs=vp8,opus"
//           : "video/webm";

//         const recorder = new MediaRecorder(stream, { mimeType });
//         recorder.ondataavailable = (event) => {
//           if (event.data.size > 0) chunksRef.current.push(event.data);
//         };
//         recorder.onstop = handleRecordingStop;
//         recorder.onerror = (err) => console.error("⚠️ Recorder error:", err);

//         setMediaRecorder(recorder);
//         console.log("✅ MediaRecorder ready:", mimeType);
//       } catch (err) {
//         console.error("🚫 Camera/Mic access failed:", err);
//         showToast("Please allow camera and microphone access, then reload the page.", "error");
//       }
//     };

//     setupCamera();

//     // Cleanup: stop intervals only
//     return () => {
//       if (scrollInterval) clearInterval(scrollInterval);
//       if (timerInterval) clearInterval(timerInterval);
//     };
//   }, []);

//   // 🔹 Timer and Teleprompter
//   const startTimer = () => {
//     const start = Date.now();
//     setStartTime(start);
//     const interval = setInterval(() => {
//       const seconds = Math.floor((Date.now() - start) / 1000);
//       const minutes = Math.floor(seconds / 60);
//       setTimer(`${minutes}:${String(seconds % 60).padStart(2, "0")}`);
//     }, 1000);
//     setTimerInterval(interval);
//   };

//   const startTeleprompterScroll = () => {
//   let y = 100; // starts below Record button
//   const speed = parseFloat(localStorage.getItem("teleprompterSpeed") || "1"); // Get speed from localStorage
//   const interval = setInterval(() => {
//     y -= 0.18 * speed; // Apply speed multiplier
//     if (teleprompterRef.current) {
//       teleprompterRef.current.style.transform = `translate(-50%, ${y}%)`;
//     }
//     if (y < -200) clearInterval(interval);
//   }, 40);
//   setScrollInterval(interval);
// };




//   // 🔹 Start/Stop Recording
//   const handleRecordClick = async () => {
//     if (!mediaRecorder) {
//       showToast("Recorder not initialized yet.", "warning");
//       return;
//     }

//     if (state === "idle") {
//       setState("armed");
//     } else if (state === "armed") {
//       try {
//         // Turn camera on
//         if (videoRef.current && videoRef.current.srcObject) {
//           const stream = videoRef.current.srcObject as MediaStream;
//           stream.getVideoTracks().forEach(track => track.enabled = true);
//         }

//         chunksRef.current = [];
//         setStartTime(Date.now());
//         mediaRecorder.start(250); // collect every 250ms
//         console.log("🎥 Recording started");
//         setState("recording");
//         startTeleprompterScroll();
//         startTimer();
//       } catch (err) {
//         console.error("Error starting recording:", err);
//       }
//     } else if (state === "recording") {
//       try {
//         mediaRecorder.requestData();
//         mediaRecorder.stop();
//         console.log("🛑 Recording stopped:", Date.now());
//         setState("idle");
//       } catch (err) {
//         console.error("Error stopping recording:", err);
//       }
//     }
//   };

//   // 🔹 When Recording Stops
//   const handleRecordingStop = async () => {
//     if (scrollInterval) clearInterval(scrollInterval);
//     if (timerInterval) clearInterval(timerInterval);
//     if (teleprompterRef.current) teleprompterRef.current.style.top = "60%";

//     // Turn camera off
//     if (videoRef.current && videoRef.current.srcObject) {
//       const stream = videoRef.current.srcObject as MediaStream;
//       stream.getVideoTracks().forEach(track => track.enabled = false);
//     }

//     console.log("📹 Finalizing recording...");
//     await new Promise((res) => setTimeout(res, 300));

//     const blob = new Blob(chunksRef.current, { type: "video/webm" });
//     chunksRef.current = []; // reset for next run
//     console.log("🎞️ Blob created:", blob.size, "bytes");

//     const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
//     console.log("⏱ Duration:", durationSeconds, "seconds");

//     if (blob.size === 0) {
//       showToast("No video data captured. Please check your camera and mic.", "error");
//     }

//     // ✅ Fade effect for smooth UX
//     if (videoRef.current) {
//       videoRef.current.classList.add("opacity-80", "transition-opacity", "duration-700");
//       setTimeout(() => videoRef.current?.classList.remove("opacity-80"), 1000);
//     }

//     await uploadVideo(blob, durationSeconds);

//     // ✅ Reinitialize Recorder (fix blinking + next recording)
//     if (videoRef.current && videoRef.current.srcObject) {
//       const stream = videoRef.current.srcObject as MediaStream;
//       const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
//         ? "video/webm;codecs=vp8,opus"
//         : "video/webm";
//       const newRecorder = new MediaRecorder(stream, { mimeType });
//       newRecorder.ondataavailable = (event) => {
//         if (event.data.size > 0) chunksRef.current.push(event.data);
//       };
//       newRecorder.onstop = handleRecordingStop;
//       newRecorder.onerror = (err) => console.error("⚠️ Recorder error:", err);
//       setMediaRecorder(newRecorder);
//       console.log("🔁 MediaRecorder reinitialized");
//     }
//   };

//   // 🔹 Upload to Supabase
//   const uploadVideo = async (blob: Blob, durationSeconds: number) => {
//     setIsUploading(true);
//     try {
//       if (!user) throw new Error("User not signed in");

//       const jobRequestId = localStorage.getItem("current_job_request_id");
//       if (!jobRequestId) throw new Error("Missing job request ID");

//       const fileName = `${Date.now()}.webm`;
//       const filePath = `${user.id}/${fileName}`;

//       const { error: uploadError } = await supabase.storage
//         .from("recordings")
//         .upload(filePath, blob, { upsert: true, contentType: "video/webm" });

//       if (uploadError) throw uploadError;

//       const { data: publicData } = supabase.storage
//         .from("recordings")
//         .getPublicUrl(filePath);
//       const publicUrl = publicData?.publicUrl;

//       const { error: insertError } = await supabase.from("recordings").insert({
//         job_request_id: jobRequestId,
//         storage_path: publicUrl,
//         duration_seconds: durationSeconds,
//         size_bytes: blob.size,
//       });

//       if (insertError) throw insertError;

//       const { error: updateError } = await supabase
//         .from("job_requests")
//         .update({ status: "recorded", updated_at: new Date().toISOString() })
//         .eq("id", jobRequestId);

//       if (updateError) throw updateError;

//       console.log("✅ Uploaded:", publicUrl);
//       showToast("Recording uploaded successfully!", "success");
//       localStorage.setItem("recordedVideoUrl", publicUrl);
//       navigate(`/final-result/${jobRequestId}`);
//     } catch (err: any) {
//       console.error("❌ Upload failed:", err.message);
//       showToast("Upload failed. Please try again.", "error");
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-black flex items-center justify-center p-4">
//       <div className="relative w-full max-w-[480px] h-[640px] bg-black rounded-2xl overflow-hidden shadow-2xl">
//         {/* Camera Preview */}
//         <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

//         {/* Guide Line */}
//         <div className="absolute top-[44%] left-0 right-0 h-0.5 bg-blue-400 bg-opacity-60" />

//         {/* Timer */}
//         <div className="absolute top-3 right-4 text-white font-semibold text-xl flex items-center">
//           <span className="w-2 h-2 bg-red-500 rounded-full mr-2" />
//           <span ref={timerRef}>{isUploading ? "Uploading..." : timer}</span>
//         </div>

//         {/* Teleprompter */}
//         <div
//   ref={teleprompterRef}
//   className="absolute bottom-[8rem] left-1/2 transform -translate-x-1/2 
//              w-[100%] text-white font-sans text-xl md:text-2xl leading-relaxed 
//              font-medium text-center bg-gradient-to-b from-black/80 to-black/40 
//              px-6 py-8 rounded-lg pointer-events-none overflow-hidden"
// >
//   <div className="flex flex-col gap-6 pb-10">
//     {teleprompterText
//       .split(/\n\s*\n/)
//       .map((para, i) => (
//         <p key={i} className="whitespace-pre-line">{para}</p>
//       ))}
//   </div>
// </div>




//         {/* Record Button */}
//         <button
//           onClick={handleRecordClick}
//           disabled={isUploading}
//           className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 w-20 h-20 rounded-full border-4 border-white/85 cursor-pointer transition-all duration-200 ${
//             state === "armed"
//               ? "bg-red-500 shadow-[0_0_0_6px_rgba(255,59,48,0.35),0_0_24px_rgba(255,59,48,0.8)]"
//               : state === "recording"
//               ? "bg-red-500 grayscale-40"
//               : "bg-red-500"
//           }`}
//         />
//       </div>
//     </div>
//   );
// };

// export default Record;





import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "../contexts/AuthContext";
import { showToast } from "../components/ui/toast";

const Record: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const videoRef = useRef<HTMLVideoElement>(null);
  const teleprompterRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<HTMLSpanElement>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recorderReady, setRecorderReady] = useState(false);
  const [state, setState] = useState<"idle" | "recording">("idle");
  const [timer, setTimer] = useState("0:00");
  const [startTime, setStartTime] = useState<number>(0);
  const [scrollInterval, setScrollInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [teleprompterText, setTeleprompterText] = useState("");
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const [checkingCredits, setCheckingCredits] = useState(false);

  // 🔹 Load teleprompter text
  useEffect(() => {
    const text =
      localStorage.getItem("teleprompterText") ||
      "Please complete Step 3 to generate your introduction script.";
    setTeleprompterText(text);
  }, []);

  // 🔹 Check user credits on mount
  useEffect(() => {
    const checkCredits = async () => {
      if (!user) return;

      setCheckingCredits(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('credits_remaining')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching credits:', error);
          return;
        }

        setCreditsRemaining(data?.credits_remaining ?? 0);
        console.log('📊 User credits:', data?.credits_remaining);
      } catch (err) {
        console.error('Error checking credits:', err);
      } finally {
        setCheckingCredits(false);
      }
    };

    checkCredits();
  }, [user]);

  // ------------------------------------------
  // Camera + Recorder Initialization
  // ------------------------------------------
  useEffect(() => {
    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            aspectRatio: 16 / 9,
            frameRate: { ideal: 30, max: 60 },
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => videoRef.current?.play();
          // Ensure camera is on initially
          stream.getVideoTracks().forEach((track) => (track.enabled = true));
        }

        await new Promise((r) => setTimeout(r, 800)); // small wait for tracks

        const mimeType = MediaRecorder.isTypeSupported(
          "video/webm;codecs=vp8,opus"
        )
          ? "video/webm;codecs=vp8,opus"
          : "video/webm";

        let recorder: MediaRecorder;

        // Try higher bitrate for better clarity
        try {
          recorder = new MediaRecorder(stream, {
            mimeType,
            videoBitsPerSecond: 5_000_000, // ~5 Mbps
            audioBitsPerSecond: 128_000,
          });
        } catch {
          // Fallback if browser doesn't like bitrate options
          recorder = new MediaRecorder(stream, { mimeType });
        }

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunksRef.current.push(event.data);
        };
        recorder.onstop = handleRecordingStop;
        recorder.onerror = (err) => console.error("⚠️ Recorder error:", err);

        setMediaRecorder(recorder);
        setRecorderReady(true); // ✅ recorder ready, button can be used
        console.log("✅ MediaRecorder ready:", mimeType);
      } catch (err) {
        console.error("🚫 Camera/Mic access failed:", err);
        showToast(
          "Please allow camera and microphone access, then reload the page.",
          "error"
        );
        setRecorderReady(false);
      }
    };

    setupCamera();

    // Cleanup
    return () => {
      if (scrollInterval) clearInterval(scrollInterval);
      if (timerInterval) clearInterval(timerInterval);

      // stop camera tracks on unmount
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔹 Timer
  const startTimer = () => {
    const start = Date.now();
    setStartTime(start);
    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - start) / 1000);
      const minutes = Math.floor(seconds / 60);
      setTimer(`${minutes}:${String(seconds % 60).padStart(2, "0")}`);
    }, 1000);
    setTimerInterval(interval);
  };

  const resetTimer = () => {
    if (timerInterval) clearInterval(timerInterval);
    setTimer("0:00");
  };

  // 🔹 Teleprompter scroll
  const startTeleprompterScroll = () => {
    let y = 100; // starts below Record button
    const speed = parseFloat(localStorage.getItem("teleprompterSpeed") || "1");
    const interval = setInterval(() => {
      y -= 0.18 * speed;
      if (teleprompterRef.current) {
        teleprompterRef.current.style.transform = `translate(-50%, ${y}%)`;
      }
      if (y < -200) clearInterval(interval);
    }, 40);
    setScrollInterval(interval);
  };

  const resetTeleprompterPosition = () => {
    if (teleprompterRef.current) {
      teleprompterRef.current.style.transform = "translate(-50%, 0%)";
    }
  };

  // 🔹 Start/Stop Recording (single-click toggle)
  const handleRecordClick = async () => {
    if (!mediaRecorder) {
      // Just ignore click if not ready – no more "Recorder not initialized yet."
      return;
    }

    // START recording
    if (state === "idle") {
      // Check credits before starting recording
      if (creditsRemaining !== null && creditsRemaining <= 0) {
        showToast(
          "You have no recording credits. Please purchase more credits to continue.",
          "error"
        );
        // Redirect to billing after 2 seconds
        setTimeout(() => {
          navigate('/billing');
        }, 2000);
        return;
      }
      try {
        // Turn camera on
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getVideoTracks().forEach((track) => (track.enabled = true));
        }

        chunksRef.current = [];
        setStartTime(Date.now());
        mediaRecorder.start(250); // gather data every 250ms
        console.log("🎥 Recording started");
        setState("recording");
        startTeleprompterScroll();
        startTimer();
      } catch (err) {
        console.error("Error starting recording:", err);
      }
      return;
    }

    // STOP recording
    if (state === "recording") {
      try {
        mediaRecorder.requestData();
        mediaRecorder.stop();
        console.log("🛑 Recording stopped:", Date.now());
        setState("idle");
      } catch (err) {
        console.error("Error stopping recording:", err);
      }
    }
  };

  // 🔹 When Recording Stops
  const handleRecordingStop = async () => {
    if (scrollInterval) clearInterval(scrollInterval);
    if (timerInterval) clearInterval(timerInterval);
    resetTimer();
    resetTeleprompterPosition();

    // Turn camera off (preview freezes but not black)
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach((track) => (track.enabled = false));
    }

    console.log("📹 Finalizing recording...");
    await new Promise((res) => setTimeout(res, 300));

    const blob = new Blob(chunksRef.current, { type: "video/webm" });
    chunksRef.current = []; // reset for next run
    console.log("🎞️ Blob created:", blob.size, "bytes");

    const durationSeconds = Math.max(
      1,
      Math.round((Date.now() - startTime) / 1000)
    );
    console.log("⏱ Duration:", durationSeconds, "seconds");

    if (blob.size === 0) {
      showToast(
        "No video data captured. Please check your camera and mic.",
        "error"
      );
      return;
    }

    // ✅ Fade effect for smooth UX
    if (videoRef.current) {
      videoRef.current.classList.add(
        "opacity-80",
        "transition-opacity",
        "duration-700"
      );
      setTimeout(
        () => videoRef.current?.classList.remove("opacity-80"),
        1000
      );
    }

    await uploadVideo(blob, durationSeconds);

    // ✅ Reinitialize Recorder for next recording
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const mimeType = MediaRecorder.isTypeSupported(
        "video/webm;codecs=vp8,opus"
      )
        ? "video/webm;codecs=vp8,opus"
        : "video/webm";
      let newRecorder: MediaRecorder;
      try {
        newRecorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: 5_000_000,
          audioBitsPerSecond: 128_000,
        });
      } catch {
        newRecorder = new MediaRecorder(stream, { mimeType });
      }
      newRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      newRecorder.onstop = handleRecordingStop;
      newRecorder.onerror = (err) => console.error("⚠️ Recorder error:", err);
      setMediaRecorder(newRecorder);
      setRecorderReady(true);
      console.log("🔁 MediaRecorder reinitialized");
    }
  };

  // 🔹 Upload to Supabase
  const uploadVideo = async (blob: Blob, durationSeconds: number) => {
    setIsUploading(true);
    try {
      if (!user) throw new Error("User not signed in");

      const jobRequestId = localStorage.getItem("current_job_request_id");
      if (!jobRequestId) throw new Error("Missing job request ID");

      const fileName = `${Date.now()}.webm`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("recordings")
        .upload(filePath, blob, {
          upsert: true,
          contentType: "video/webm",
        });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("recordings")
        .getPublicUrl(filePath);
      const publicUrl = publicData?.publicUrl;

      const { error: insertError } = await supabase.from("recordings").insert({
        job_request_id: jobRequestId,
        storage_path: publicUrl,
        duration_seconds: durationSeconds,
        size_bytes: blob.size,
      });

      if (insertError) throw insertError;

      const { error: updateError } = await supabase
        .from("job_requests")
        .update({ status: "recorded", updated_at: new Date().toISOString() })
        .eq("id", jobRequestId);

      if (updateError) throw updateError;

      console.log("✅ Uploaded:", publicUrl);
      showToast("Recording uploaded successfully!", "success");
      localStorage.setItem("recordedVideoUrl", publicUrl || "");

      // Refresh credits count
      if (creditsRemaining !== null) {
        setCreditsRemaining(creditsRemaining - 1);
      }

      navigate(`/final-result/${jobRequestId}`);
    } catch (err: any) {
      console.error("❌ Upload failed:", err.message);

      // Check if error is related to insufficient credits
      if (err.message && err.message.toLowerCase().includes('insufficient credits')) {
        showToast(
          "Insufficient credits. Please purchase more credits to create recordings.",
          "error"
        );
        // Redirect to billing
        setTimeout(() => {
          navigate('/billing');
        }, 2000);
      } else {
        showToast(
          err.message || "Upload failed. Please try again.",
          "error"
        );
      }
    } finally {
      setIsUploading(false);
    }
  };

  const recordingDisabled = !recorderReady || isUploading;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="relative w-full max-w-[480px] h-[640px] bg-black rounded-2xl overflow-hidden shadow-2xl">
        {/* Camera Preview */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Guide Line */}
        <div className="absolute top-[44%] left-0 right-0 h-0.5 bg-blue-400 bg-opacity-60" />

        {/* Credits Indicator */}
        {creditsRemaining !== null && (
          <div className="absolute top-3 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2">
            <span className="text-white text-sm font-medium">
              {creditsRemaining > 0 ? (
                <>
                  <span className="text-green-400">●</span> {creditsRemaining} {creditsRemaining === 1 ? 'credit' : 'credits'}
                </>
              ) : (
                <>
                  <span className="text-red-400">●</span> No credits
                </>
              )}
            </span>
          </div>
        )}

        {/* Timer */}
        <div className="absolute top-3 right-4 text-white font-semibold text-xl flex items-center">
          <span
            className={`w-2 h-2 rounded-full mr-2 ${state === "recording" ? "bg-red-500" : "bg-gray-400"
              }`}
          />
          <span ref={timerRef}>{isUploading ? "Uploading..." : timer}</span>
        </div>

        {/* Teleprompter */}
        <div
          ref={teleprompterRef}
          className="absolute bottom-[8rem] left-1/2 transform -translate-x-1/2 
             w-[100%] text-white font-sans text-xl md:text-2xl leading-relaxed 
             font-medium text-center bg-gradient-to-b from-black/80 to-black/40 
             px-6 py-8 rounded-lg pointer-events-none overflow-hidden"
        >
          <div className="flex flex-col gap-6 pb-10">
            {teleprompterText.split(/\n\s*\n/).map((para, i) => (
              <p key={i} className="whitespace-pre-line">
                {para}
              </p>
            ))}
          </div>
        </div>

        {/* Record Button – single-click toggle */}
        <button
          onClick={handleRecordClick}
          disabled={recordingDisabled}
          className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 w-20 h-20 rounded-full 
            border-4 border-white/85 cursor-pointer transition-all duration-200 
            flex items-center justify-center
            ${recordingDisabled
              ? "opacity-40 cursor-not-allowed"
              : state === "recording"
                ? "bg-red-500 shadow-[0_0_0_6px_rgba(255,59,48,0.35),0_0_24px_rgba(255,59,48,0.8)]"
                : "bg-red-500"
            }`}
        >
          {/* inner dot for nicer UI */}
          <div
            className={`w-8 h-8 rounded-full ${state === "recording" ? "bg-red-700" : "bg-red-400"
              }`}
          />
        </button>
      </div>
    </div>
  );
};

export default Record;
