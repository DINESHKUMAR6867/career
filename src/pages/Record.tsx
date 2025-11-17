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
  const [state, setState] = useState<"idle" | "armed" | "recording">("idle");
  const [timer, setTimer] = useState("0:00");
  const [startTime, setStartTime] = useState<number>(0);
  const [scrollInterval, setScrollInterval] = useState<NodeJS.Timeout | null>(null);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [teleprompterText, setTeleprompterText] = useState("");

  // 🔹 Load teleprompter text
  useEffect(() => {
    const text =
      localStorage.getItem("teleprompterText") ||
      "Please complete Step 3 to generate your introduction script.";
    setTeleprompterText(text);
  }, []);

  // ------------------------------------------
  // Camera + Recorder Initialization
  // ------------------------------------------
  useEffect(() => {
    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => videoRef.current?.play();
          // Ensure camera is on initially
          stream.getVideoTracks().forEach(track => track.enabled = true);
        }

        await new Promise((r) => setTimeout(r, 1200)); // wait for tracks

        const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
          ? "video/webm;codecs=vp8,opus"
          : "video/webm";

        const recorder = new MediaRecorder(stream, { mimeType });
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunksRef.current.push(event.data);
        };
        recorder.onstop = handleRecordingStop;
        recorder.onerror = (err) => console.error("⚠️ Recorder error:", err);

        setMediaRecorder(recorder);
        console.log("✅ MediaRecorder ready:", mimeType);
      } catch (err) {
        console.error("🚫 Camera/Mic access failed:", err);
        showToast("Please allow camera and microphone access, then reload the page.", "error");
      }
    };

    setupCamera();

    // Cleanup: stop intervals only
    return () => {
      if (scrollInterval) clearInterval(scrollInterval);
      if (timerInterval) clearInterval(timerInterval);
    };
  }, []);

  // 🔹 Timer and Teleprompter
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

  const startTeleprompterScroll = () => {
  let y = 100; // starts below Record button
  const speed = parseFloat(localStorage.getItem("teleprompterSpeed") || "1"); // Get speed from localStorage
  const interval = setInterval(() => {
    y -= 0.18 * speed; // Apply speed multiplier
    if (teleprompterRef.current) {
      teleprompterRef.current.style.transform = `translate(-50%, ${y}%)`;
    }
    if (y < -200) clearInterval(interval);
  }, 40);
  setScrollInterval(interval);
};




  // 🔹 Start/Stop Recording
  const handleRecordClick = async () => {
    if (!mediaRecorder) {
      showToast("Recorder not initialized yet.", "warning");
      return;
    }

    if (state === "idle") {
      setState("armed");
    } else if (state === "armed") {
      try {
        // Turn camera on
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getVideoTracks().forEach(track => track.enabled = true);
        }
      
        chunksRef.current = [];
        setStartTime(Date.now());
        mediaRecorder.start(250); // collect every 250ms
        console.log("🎥 Recording started");
        setState("recording");
        startTeleprompterScroll();
        startTimer();
      } catch (err) {
        console.error("Error starting recording:", err);
      }
    } else if (state === "recording") {
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
    if (teleprompterRef.current) teleprompterRef.current.style.top = "60%";

    // Turn camera off
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach(track => track.enabled = false);
    }

    console.log("📹 Finalizing recording...");
    await new Promise((res) => setTimeout(res, 300));

    const blob = new Blob(chunksRef.current, { type: "video/webm" });
    chunksRef.current = []; // reset for next run
    console.log("🎞️ Blob created:", blob.size, "bytes");

    const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    console.log("⏱ Duration:", durationSeconds, "seconds");

    if (blob.size === 0) {
      showToast("No video data captured. Please check your camera and mic.", "error");
    }

    // ✅ Fade effect for smooth UX
    if (videoRef.current) {
      videoRef.current.classList.add("opacity-80", "transition-opacity", "duration-700");
      setTimeout(() => videoRef.current?.classList.remove("opacity-80"), 1000);
    }

    await uploadVideo(blob, durationSeconds);

    // ✅ Reinitialize Recorder (fix blinking + next recording)
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
        ? "video/webm;codecs=vp8,opus"
        : "video/webm";
      const newRecorder = new MediaRecorder(stream, { mimeType });
      newRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      newRecorder.onstop = handleRecordingStop;
      newRecorder.onerror = (err) => console.error("⚠️ Recorder error:", err);
      setMediaRecorder(newRecorder);
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
        .upload(filePath, blob, { upsert: true, contentType: "video/webm" });

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
      localStorage.setItem("recordedVideoUrl", publicUrl);
      navigate(`/final-result/${jobRequestId}`);
    } catch (err: any) {
      console.error("❌ Upload failed:", err.message);
      showToast("Upload failed. Please try again.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="relative w-full max-w-[480px] h-[640px] bg-black rounded-2xl overflow-hidden shadow-2xl">
        {/* Camera Preview */}
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

        {/* Guide Line */}
        <div className="absolute top-[44%] left-0 right-0 h-0.5 bg-blue-400 bg-opacity-60" />

        {/* Timer */}
        <div className="absolute top-3 right-4 text-white font-semibold text-xl flex items-center">
          <span className="w-2 h-2 bg-red-500 rounded-full mr-2" />
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
    {teleprompterText
      .split(/\n\s*\n/)
      .map((para, i) => (
        <p key={i} className="whitespace-pre-line">{para}</p>
      ))}
  </div>
</div>




        {/* Record Button */}
        <button
          onClick={handleRecordClick}
          disabled={isUploading}
          className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 w-20 h-20 rounded-full border-4 border-white/85 cursor-pointer transition-all duration-200 ${
            state === "armed"
              ? "bg-red-500 shadow-[0_0_0_6px_rgba(255,59,48,0.35),0_0_24px_rgba(255,59,48,0.8)]"
              : state === "recording"
              ? "bg-red-500 grayscale-40"
              : "bg-red-500"
          }`}
        />
      </div>
    </div>
  );
};

export default Record;
