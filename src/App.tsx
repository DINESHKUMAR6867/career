import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import Landing from "./pages/landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Step1 from "./pages/Step1";
import Step2 from "./pages/Step2";
import Step3 from "./pages/Step3";
import Record from "./pages/Record";
import FinalResult from "./pages/FinalResult";
import Network from "./pages/Network";
import Resources from "./pages/Resources";
import Profile from "./pages/Profile";
import Billing from "./pages/Billing";
import Password from "./pages/Password";
import Contact from "./pages/Contact";
import HrEmail from "./pages/hr_email";
import HrEmailDetails from "./pages/HrEmailDetails";
import SignupPage from "./pages/SignupPage";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/step1" element={<Step1 />} />
        <Route path="/step2" element={<Step2 />} />
        <Route path="/step3" element={<Step3 />} />
        <Route path="/record" element={<Record />} />
        <Route path="/record/:id" element={<Record />} />
        <Route path="/network" element={<Network />} />
        <Route path="/final-result/:castId?" element={<FinalResult />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/password" element={<Password />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/hr-email" element={<HrEmail />} />
        <Route path="/hr-email-details" element={<HrEmailDetails />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;




// import React from "react";
// import { Routes, Route, Navigate, useLocation } from "react-router-dom";
// import { AuthProvider, useAuth } from "./contexts/AuthContext";

// import Landing from "./pages/landing";
// import Auth from "./pages/Auth";
// import Dashboard from "./pages/Dashboard";
// import Step1 from "./pages/Step1";
// import Step2 from "./pages/Step2";
// import Step3 from "./pages/Step3";
// import Record from "./pages/Record";
// import FinalResult from "./pages/FinalResult";
// import Network from "./pages/Network";
// import Resources from "./pages/Resources";
// import Profile from "./pages/Profile";
// import Billing from "./pages/Billing";
// import Password from "./pages/Password";
// import Contact from "./pages/Contact";
// import HrEmail from "./pages/hr_email";
// import HrEmailDetails from "./pages/HrEmailDetails";
// import SignupPage from "./pages/SignupPage";

// // ───────────────── ProtectedRoute ─────────────────
// function ProtectedRoute({ children }: { children: JSX.Element }) {
//   const { user, loading } = useAuth();
//   const location = useLocation();

//   // while checking auth state
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-slate-50">
//         <div className="flex flex-col items-center gap-3">
//           <div className="h-8 w-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
//           <p className="text-sm text-slate-600">Checking your session…</p>
//         </div>
//       </div>
//     );
//   }

//   // not logged in → redirect to /auth
//   if (!user) {
//     return (
//       <Navigate
//         to="/auth"
//         replace
//         state={{ from: location }} // so you can redirect back after login if you want
//       />
//     );
//   }

//   // logged in → allow access
//   return children;
// }

// function App() {
//   return (
//     <AuthProvider>
//       <Routes>
//         {/* Public routes */}
//         <Route path="/" element={<Landing />} />
//         <Route path="/auth" element={<Auth />} />
//         <Route path="/signup" element={<SignupPage />} />

//         {/* Protected routes */}
//         <Route
//           path="/dashboard"
//           element={
//             <ProtectedRoute>
//               <Dashboard />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/step1"
//           element={
//             <ProtectedRoute>
//               <Step1 />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/step2"
//           element={
//             <ProtectedRoute>
//               <Step2 />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/step3"
//           element={
//             <ProtectedRoute>
//               <Step3 />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/record"
//           element={
//             <ProtectedRoute>
//               <Record />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/record/:id"
//           element={
//             <ProtectedRoute>
//               <Record />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/network"
//           element={
//             <ProtectedRoute>
//               <Network />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/final-result/:castId?"
//           element={
//             <ProtectedRoute>
//               <FinalResult />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/resources"
//           element={
//             <ProtectedRoute>
//               <Resources />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/profile"
//           element={
//             <ProtectedRoute>
//               <Profile />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/billing"
//           element={
//             <ProtectedRoute>
//               <Billing />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/password"
//           element={
//             <ProtectedRoute>
//               <Password />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/contact"
//           element={
//             <ProtectedRoute>
//               <Contact />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/hr-email"
//           element={
//             <ProtectedRoute>
//               <HrEmail />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/hr-email-details"
//           element={
//             <ProtectedRoute>
//               <HrEmailDetails />
//             </ProtectedRoute>
//           }
//         />

//         {/* Fallback – unknown paths go to landing (or /auth if you prefer) */}
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </AuthProvider>
//   );
// }

// export default App;
