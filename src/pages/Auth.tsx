// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Button } from '../components/ui/button';
// import { Input } from '../components/ui/input';
// import { Card, CardContent } from '../components/ui/card';
// import { 
//   Eye, 
//   EyeOff, 
//   ArrowRight, 
//   Rocket, 
//   ArrowLeft, 
//   Video,
//   Shield
// } from 'lucide-react';
// import { useAuthContext } from '../contexts/AuthContext';

// export default function Auth() {
//   const navigate = useNavigate();
//   const { 
//     login, 
//     signup, 
//     sendOTP, 
//     verifyOTP, 
//     isOTPVerified, 
//     loading, 
//     error 
//   } = useAuthContext();

//   const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [otpSent, setOtpSent] = useState(false);
//   const [otpVerified, setOtpVerified] = useState(false);
//   const [otp, setOtp] = useState('');
//   const [countdown, setCountdown] = useState(0);
  
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     first_name: '',
//     last_name: '',
//     password1: '',
//     password2: ''
//   });

//   useEffect(() => {
//     let timer: NodeJS.Timeout;
//     if (countdown > 0) {
//       timer = setTimeout(() => setCountdown(countdown - 1), 1000);
//     }
//     return () => clearTimeout(timer);
//   }, [countdown]);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSendOTP = async () => {
//     if (!formData.email) {
//       alert('Please enter your email address');
//       return;
//     }

//     try {
//       await sendOTP(formData.email);
//       setOtpSent(true);
//       setCountdown(60);
//     } catch (err) {
//       // Error is handled by context
//     }
//   };

//   const handleVerifyOTP = async () => {
//   console.log("d", otp);
//   const verified = await verifyOTP(formData.email, otp);
//   if (verified) {
//     console.log("v1", formData.email);
//     console.log("v2", otp);
//     setOtpVerified(true);
//   } else {
//     alert('Invalid OTP. Please try again.');
//   }
// };


//   const handleResendOTP = async () => {
//     if (countdown > 0) return;
    
//     try {
//       await sendOTP(formData.email);
//       setCountdown(60);
//     } catch (err) {
//       // Error is handled by context
//     }
//   };

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await login(formData.email, formData.password);
//       navigate('/dashboard');
//     } catch (err) {
//       // Error is handled by context
//     }
//   };

//   const handleSignup = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (formData.password1 !== formData.password2) {
//       alert('Passwords do not match');
//       return;
//     }

//     if (!otpVerified) {
//       alert('Please verify your email with OTP first');
//       return;
//     }

//     try {
//       await signup({
//         email: formData.email,
//         password: formData.password1,
//         firstName: formData.first_name,
//         lastName: formData.last_name
//       });
//       navigate('/dashboard');
//     } catch (err) {
//       // Error is handled by context
//     }
//   };

//   const resetOTPState = () => {
//     setOtpSent(false);
//     setOtpVerified(false);
//     setOtp('');
//     setCountdown(0);
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 py-8">
//       <div className="container mx-auto px-4">
//         <div className="flex justify-center">
//           <div className="w-full max-w-md">
//             <Card className="p-8 step-card border border-slate-200 rounded-2xl shadow-sm bg-white">
//               <div className="text-center mb-8">
//                 <div className="flex items-center justify-center gap-2 mb-4">
//                   <div >
//           <img 
//             src="/images/networknote_final_logo_1 (2).jpg" 
//             alt="Network Note Logo" 
//             className="h-8 w-8 rounded-lg"
//           />
//         </div>
//         <span className="text-xl font-bold text-[#000000] font-noto
// ">
//           NetworkNote
//         </span>
//                 </div>
//                 <p className="text-slate-600 text-lg">
//                   Join thousands of professionals getting their dream jobs
//                 </p>
//               </div>

//               {error && (
//                 <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
//                   {error}
//                 </div>
//               )}

//               <div className="flex border border-slate-200 rounded-xl p-1 mb-6 bg-slate-50">
//                 <button
//                   className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
//                     activeTab === 'login'
//                       ? 'bg-blue-600 text-white shadow-sm'
//                       : 'text-slate-600 bg-transparent hover:bg-white'
//                   }`}
//                   onClick={() => {
//                     setActiveTab('login');
//                     resetOTPState();
//                   }}
//                 >
//                   <span>Login</span>
//                 </button>
//                 </div>
//                 {/* <button
//                   className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
//                     activeTab === 'signup'
//                       ? 'bg-blue-600 text-white shadow-sm'
//                       : 'text-slate-600 bg-transparent hover:bg-white'
//                   }`}
//                   onClick={() => setActiveTab('signup')}
//                 >
//                   <span>Sign Up</span>
//                 </button> */}
              

//               <div className="tab-content">
//                 <div className={`space-y-4 ${activeTab === 'login' ? 'block' : 'hidden'}`}>
//                   <form onSubmit={handleLogin}>
//                     <div className="mb-4">
//                       <label className="block text-slate-900 font-semibold mb-2 text-sm">
//                         Email Address
//                       </label>
//                       <Input
//                         type="email"
//                         name="email"
//                         value={formData.email}
//                         onChange={handleInputChange}
//                         className="w-full h-12 px-4 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
//                         placeholder="Enter your email"
//                         required
//                       />
//                     </div>

//                     <div className="mb-6">
//                       <label className="block text-slate-900 font-semibold mb-2 text-sm">
//                         Password
//                       </label>
//                       <div className="relative">
//                         <Input
//                           type={showPassword ? 'text' : 'password'}
//                           name="password"
//                           value={formData.password}
//                           onChange={handleInputChange}
//                           className="w-full h-12 px-4 pr-12 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
//                           placeholder="Enter your password"
//                           required
//                         />
//                         <button
//                           type="button"
//                           className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
//                           onClick={() => setShowPassword(!showPassword)}
//                         >
//                           {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
//                         </button>
//                       </div>
//                     </div>

//                     <Button
//                       type="submit"
//                       disabled={loading}
//                       className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       {loading ? 'Signing In...' : 'Sign In'} 
//                       <ArrowRight className="ml-2 h-4 w-4" />
//                     </Button>
//                   </form>
//                 </div>

//                 <div className={`space-y-4 ${activeTab === 'signup' ? 'block' : 'hidden'}`}>
//                   <form onSubmit={handleSignup}>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                       <div>
//                         <label className="block text-slate-900 font-semibold mb-2 text-sm">
//                           First Name
//                         </label>
//                         <Input
//                           type="text"
//                           name="first_name"
//                           value={formData.first_name}
//                           onChange={handleInputChange}
//                           className="w-full h-12 px-4 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
//                           placeholder="First Name"
//                           required
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-slate-900 font-semibold mb-2 text-sm">
//                           Last Name
//                         </label>
//                         <Input
//                           type="text"
//                           name="last_name"
//                           value={formData.last_name}
//                           onChange={handleInputChange}
//                           className="w-full h-12 px-4 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
//                           placeholder="Last Name"
//                           required
//                         />
//                       </div>
//                     </div>

//                     <div className="mb-4">
//                       <label className="block text-slate-900 font-semibold mb-2 text-sm">
//                         Email Address
//                       </label>
//                       <div className="flex gap-2">
//                         <Input
//                           type="email"
//                           name="email"
//                           value={formData.email}
//                           onChange={handleInputChange}
//                           className="flex-1 h-12 px-4 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
//                           placeholder="Email Address"
//                           required
//                           disabled={otpSent}
//                         />
//                         <Button
//                           type="button"
//                           onClick={handleSendOTP}
//                           disabled={otpSent || !formData.email || countdown > 0}
//                           className="h-12 px-4 bg-green-600 hover:bg-green-700 text-white disabled:bg-slate-400 disabled:cursor-not-allowed"
//                         >
//                           {countdown > 0 ? `${countdown}s` : 'Send OTP'}
//                         </Button>
//                       </div>
//                     </div>

//                     {otpSent && (
//                       <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//                         <div className="flex items-center gap-2 mb-3">
//                           <Shield className="h-5 w-5 text-blue-600" />
//                           <span className="font-semibold text-blue-900">Verify Your Email</span>
//                         </div>
//                         <div className="flex gap-2 mb-3">
//                           <Input
//                             type="text"
//                             value={otp}
//                             onChange={(e) => setOtp(e.target.value)}
//                             placeholder="Enter 6-digit OTP"
//                             className="flex-1 h-12"
//                             maxLength={6}
//                             disabled={otpVerified}
//                           />
//                           <Button
//                             type="button"
//                             onClick={handleVerifyOTP}
//                             disabled={otpVerified || otp.length !== 6}
//                             className="h-12 px-4 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-400"
//                           >
//                             Verify
//                           </Button>
//                         </div>
//                         {!otpVerified && (
//                           <div className="flex justify-between items-center text-sm">
//                             <span className="text-slate-600">
//                               Enter the OTP sent to your email
//                             </span>
//                             <button
//                               type="button"
//                               onClick={handleResendOTP}
//                               disabled={countdown > 0}
//                               className="text-blue-600 hover:text-blue-800 disabled:text-slate-400"
//                             >
//                               Resend OTP {countdown > 0 && `(${countdown}s)`}
//                             </button>
//                           </div>
//                         )}
//                         {otpVerified && (
//                           <div className="text-green-600 font-semibold flex items-center gap-2">
//                             ✓ Email verified successfully!
//                           </div>
//                         )}
//                       </div>
//                     )}

//                     <div className="mb-4">
//                       <label className="block text-slate-900 font-semibold mb-2 text-sm">
//                         Password
//                       </label>
//                       <div className="relative">
//                         <Input
//                           type={showPassword ? 'text' : 'password'}
//                           name="password1"
//                           value={formData.password1}
//                           onChange={handleInputChange}
//                           className="w-full h-12 px-4 pr-12 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
//                           placeholder="Password"
//                           required
//                         />
//                         <button
//                           type="button"
//                           className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
//                           onClick={() => setShowPassword(!showPassword)}
//                         >
//                           {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
//                         </button>
//                       </div>
//                       <p className="text-slate-500 text-xs mt-2">
//                         Use at least 8 characters with a mix of letters, numbers & symbols.
//                       </p>
//                     </div>

//                     <div className="mb-6">
//                       <label className="block text-slate-900 font-semibold mb-2 text-sm">
//                         Confirm Password
//                       </label>
//                       <div className="relative">
//                         <Input
//                           type={showConfirmPassword ? 'text' : 'password'}
//                           name="password2"
//                           value={formData.password2}
//                           onChange={handleInputChange}
//                           className="w-full h-12 px-4 pr-12 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
//                           placeholder="Confirm Password"
//                           required
//                         />
//                         <button
//                           type="button"
//                           className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
//                           onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                         >
//                           {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
//                         </button>
//                       </div>
//                     </div>

//                     <Button
//                       type="submit"
//                       disabled={loading || !otpVerified}
//                       className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       {loading ? 'Creating Account...' : 'Create Account'} 
//                       <Rocket className="ml-2 h-4 w-4" />
//                     </Button>
//                   </form>
//                 </div>
//               </div>

//               <div className="text-center mt-6">
//                 <button
//                   onClick={() => navigate('/')}
//                   className="text-slate-600 hover:text-slate-800 transition-colors flex items-center justify-center gap-2"
//                 >
//                   <ArrowLeft className="h-4 w-4" />
//                   Back to Home
//                 </button>
//               </div>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

// }









// src/pages/Auth.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Rocket,
  ArrowLeft,
  Shield,
} from "lucide-react";
import { useAuthContext } from "../contexts/AuthContext";

export default function Auth() {
  const navigate = useNavigate();
  const {
    login,
    signup,
    sendOTP,
    verifyOTP,
    isOTPVerified,
    loading,
    error,
  } = useAuthContext();

  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    password1: "",
    password2: "",
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendOTP = async () => {
    if (!formData.email) {
      alert("Please enter your email address");
      return;
    }

    try {
      await sendOTP(formData.email);
      setOtpSent(true);
      setCountdown(60);
    } catch (err) {
      // handled in context
    }
  };

  const handleVerifyOTP = async () => {
    const verified = await verifyOTP(formData.email, otp);
    if (verified) {
      setOtpVerified(true);
    } else {
      alert("Invalid OTP. Please try again.");
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    try {
      await sendOTP(formData.email);
      setCountdown(60);
    } catch (err) {
      // handled in context
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      navigate("/dashboard");
    } catch (err) {
      // handled in context
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password1 !== formData.password2) {
      alert("Passwords do not match");
      return;
    }

    if (!otpVerified) {
      alert("Please verify your email with OTP first");
      return;
    }

    try {
      await signup({
        email: formData.email,
        password: formData.password1,
        firstName: formData.first_name,
        lastName: formData.last_name,
      });
      navigate("/dashboard");
    } catch (err) {
      // handled in context
    }
  };

  const resetOTPState = () => {
    setOtpSent(false);
    setOtpVerified(false);
    setOtp("");
    setCountdown(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      {/* page padding changed to match landing (less empty side area) */}
      <div className="w-full px-8 lg:px-16">
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <Card className="p-8 border border-slate-200 rounded-2xl shadow-sm bg-white">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                    <img
                      src="/images/networknote_final_logo_1 (2).jpg"
                      alt="Network Note Logo"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div>
                    <span className="text-xl font-bold text-slate-900 font-noto">
                      NetworkNote
                    </span>
                    <div className="text-xs text-slate-400">Email Intelligence</div>
                  </div>
                </div>

                <p className="text-slate-600 text-sm">
                  Join thousands of professionals getting their dream jobs
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="flex border border-slate-200 rounded-xl p-1 mb-6 bg-slate-50">
                <button
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                    activeTab === "login"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 bg-transparent hover:bg-white"
                  }`}
                  onClick={() => {
                    setActiveTab("login");
                    resetOTPState();
                  }}
                >
                  <span>Login</span>
                </button>

                {/* <button
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                    activeTab === "signup"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 bg-transparent hover:bg-white"
                  }`}
                  onClick={() => {
                    setActiveTab("signup");
                    resetOTPState();
                  }}
                >
                  <span>Sign Up</span>
                </button> */}
              </div>

              <div className="tab-content">
                {/* LOGIN */}
                <div className={`space-y-4 ${activeTab === "login" ? "block" : "hidden"}`}>
                  <form onSubmit={handleLogin}>
                    <div className="mb-4">
                      <label className="block text-slate-900 font-semibold mb-2 text-sm">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full h-12 px-4 border border-slate-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all"
                        placeholder="Enter your email"
                        required
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-slate-900 font-semibold mb-2 text-sm">
                        Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full h-12 px-4 pr-12 border border-slate-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all"
                          placeholder="Enter your password"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-slate-900 text-white font-semibold rounded-lg transition-all duration-300 hover:bg-slate-800 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Signing In..." : "Sign In"} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </div>

                {/* SIGNUP */}
                <div className={`space-y-4 ${activeTab === "signup" ? "block" : "hidden"}`}>
                  <form onSubmit={handleSignup}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-slate-900 font-semibold mb-2 text-sm">
                          First Name
                        </label>
                        <Input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          className="w-full h-12 px-4 border border-slate-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all"
                          placeholder="First Name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-slate-900 font-semibold mb-2 text-sm">
                          Last Name
                        </label>
                        <Input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          className="w-full h-12 px-4 border border-slate-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all"
                          placeholder="Last Name"
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-slate-900 font-semibold mb-2 text-sm">
                        Email Address
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="flex-1 h-12 px-4 border border-slate-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all"
                          placeholder="Email Address"
                          required
                          disabled={otpSent}
                        />
                        <Button
                          type="button"
                          onClick={handleSendOTP}
                          disabled={otpSent || !formData.email || countdown > 0}
                          className="h-12 px-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                          {countdown > 0 ? `${countdown}s` : "Send OTP"}
                        </Button>
                      </div>
                    </div>

                    {otpSent && (
                      <div className="mb-4 p-4 bg-cyan-50 border border-cyan-100 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Shield className="h-5 w-5 text-cyan-600" />
                          <span className="font-semibold text-cyan-900">Verify Your Email</span>
                        </div>

                        <div className="flex gap-2 mb-3">
                          <Input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter 6-digit OTP"
                            className="flex-1 h-12"
                            maxLength={6}
                            disabled={otpVerified}
                          />
                          <Button
                            type="button"
                            onClick={handleVerifyOTP}
                            disabled={otpVerified || otp.length !== 6}
                            className="h-12 px-4 bg-slate-900 hover:bg-slate-800 text-white disabled:bg-slate-400"
                          >
                            Verify
                          </Button>
                        </div>

                        {!otpVerified && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600">Enter the OTP sent to your email</span>
                            <button
                              type="button"
                              onClick={handleResendOTP}
                              disabled={countdown > 0}
                              className="text-cyan-600 hover:text-cyan-800 disabled:text-slate-400 text-sm"
                            >
                              Resend OTP {countdown > 0 && `(${countdown}s)`}
                            </button>
                          </div>
                        )}

                        {otpVerified && (
                          <div className="text-emerald-600 font-semibold flex items-center gap-2 mt-2">
                            ✓ Email verified successfully!
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="block text-slate-900 font-semibold mb-2 text-sm">Password</label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          name="password1"
                          value={formData.password1}
                          onChange={handleInputChange}
                          className="w-full h-12 px-4 pr-12 border border-slate-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all"
                          placeholder="Password"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      <p className="text-slate-500 text-xs mt-2">
                        Use at least 8 characters with a mix of letters, numbers & symbols.
                      </p>
                    </div>

                    <div className="mb-6">
                      <label className="block text-slate-900 font-semibold mb-2 text-sm">Confirm Password</label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          name="password2"
                          value={formData.password2}
                          onChange={handleInputChange}
                          className="w-full h-12 px-4 pr-12 border border-slate-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all"
                          placeholder="Confirm Password"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading || !otpVerified}
                      className="w-full h-12 bg-slate-900 text-white font-semibold rounded-lg transition-all duration-300 hover:bg-slate-800 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Creating Account..." : "Create Account"} <Rocket className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </div>

              <div className="text-center mt-6">
                <button onClick={() => navigate("/")} className="text-slate-600 hover:text-slate-800 transition-colors flex items-center justify-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
