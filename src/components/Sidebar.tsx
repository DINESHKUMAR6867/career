// import React, { useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import {
//   LayoutDashboard,
//   BookOpen,
//   Settings,
//   HelpCircle,
//   User,
//   CreditCard,
//   KeyRound,
//   Mail,
//   LogOut,
//   ChevronDown,
//   ChevronRight,
//   Briefcase,
//   Globe
// } from 'lucide-react';

// interface SidebarProps {
//   userEmail?: string;
//   onLogout: () => void;
// }

// export default function Sidebar({ userEmail, onLogout }: SidebarProps) {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);
//   const [supportOpen, setSupportOpen] = useState(false);

//   const isActive = (path: string) => location.pathname === path;

//   return (
//     <div className="w-72 bg-gradient-to-b from-[#0B4F6C] to-[#159A9C] text-white shadow-xl h-screen sticky top-0 p-6 flex flex-col">
//       <div className="mb-8">
//         {/* <div >
//           <img 
//             src="/images/networknote_final_logo_1 (2).jpg" 
//             alt="Network Note Logo" 
//             className="h-8 w-8 rounded-lg"
//           />
//         </div> */}
//         <span className="text-xl font-bold text-[white] font-noto pl-10
// ">
//           NetworkNote
//         </span>
//         {/* <div className="h-1 w-16 bg-white/30 rounded"></div> */}
//       </div>

//       <div className="bg-white/10 rounded-lg p-4 mb-6 backdrop-blur-sm">
//         <div className="flex items-center gap-3">
//           <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg">
//             {userEmail?.charAt(0).toUpperCase() || 'U'}
//           </div>
//           <div className="flex-1 min-w-0">
//             <p className="font-semibold text-white text-sm truncate">{userEmail}</p>
//             <p className="text-white/70 text-xs">Professional Account</p>
//           </div>
//         </div>
//       </div>

//       <nav className="space-y-1 flex-1">
//         <button
//           onClick={() => navigate('/dashboard')}
//           className={`w-full text-left py-3 px-4 rounded-lg transition-all font-medium flex items-center gap-3 ${
//             isActive('/dashboard')
//               ? 'bg-white/20 text-white shadow-md'
//               : 'text-white/90 hover:bg-white/10'
//           }`}
//         >
//           <LayoutDashboard className="w-5 h-5" />
//           Dashboard
//         </button>
//         <button
//                 onClick={() => navigate('/billing')}
//                 className={`w-full text-left py-3 px-4 rounded-lg transition-all font-medium flex items-center gap-3 ${
//                   isActive('/billing')
//                     ? 'bg-white/15 text-white'
//                     : 'text-white/80 hover:bg-white/10'
//                 }`}
//               >
//                 <CreditCard className="w-4 h-4" />
//                 Billing & Payment
//               </button>
        
//         <button
//           onClick={() => navigate('/network')}
//           className={`w-full text-left py-3 px-4 rounded-lg transition-all font-medium flex items-center gap-3 ${
//             isActive('/network')
//               ? 'bg-white/20 text-white shadow-md'
//               : 'text-white/90 hover:bg-white/10'
//           }`}
//         >
//           <Globe className="w-5 h-5" />
//           Network
//         </button>

//         <button
//           onClick={() => navigate('/resources')}
//           className={`w-full text-left py-3 px-4 rounded-lg transition-all font-medium flex items-center gap-3 ${
//             isActive('/resources')
//               ? 'bg-white/20 text-white shadow-md'
//               : 'text-white/90 hover:bg-white/10'
//           }`}
//         >
//           <BookOpen className="w-5 h-5" />
//           Resources
//         </button>

//         <div>
//           <button
//             onClick={() => setAccountSettingsOpen(!accountSettingsOpen)}
//             className={`w-full text-left py-3 px-4 rounded-lg transition-all font-medium flex items-center gap-3 ${
//               ['/profile', '/password'].includes(location.pathname)
//                 ? 'bg-white/20 text-white shadow-md'
//                 : 'text-white/90 hover:bg-white/10'
//             }`}
//           >
//             <Settings className="w-5 h-5" />
//             Account Settings
//             {accountSettingsOpen ? (
//               <ChevronDown className="w-4 h-4 ml-auto" />
//             ) : (
//               <ChevronRight className="w-4 h-4 ml-auto" />
//             )}
//           </button>

//           {accountSettingsOpen && (
//             <div className="ml-4 mt-1 space-y-1">
//               <button
//                 onClick={() => navigate('/profile')}
//                 className={`w-full text-left py-2.5 px-4 rounded-lg transition-all text-sm font-medium flex items-center gap-3 ${
//                   isActive('/profile')
//                     ? 'bg-white/15 text-white'
//                     : 'text-white/80 hover:bg-white/10'
//                 }`}
//               >
//                 <User className="w-4 h-4" />
//                 Profile
//               </button>

//               {/* <button
//                 onClick={() => navigate('/billing')}
//                 className={`w-full text-left py-2.5 px-4 rounded-lg transition-all text-sm font-medium flex items-center gap-3 ${
//                   isActive('/billing')
//                     ? 'bg-white/15 text-white'
//                     : 'text-white/80 hover:bg-white/10'
//                 }`}
//               >
//                 <CreditCard className="w-4 h-4" />
//                 Billing & Payment
//               </button> */}

//               <button
//                 onClick={() => navigate('/password')}
//                 className={`w-full text-left py-2.5 px-4 rounded-lg transition-all text-sm font-medium flex items-center gap-3 ${
//                   isActive('/password')
//                     ? 'bg-white/15 text-white'
//                     : 'text-white/80 hover:bg-white/10'
//                 }`}
//               >
//                 <KeyRound className="w-4 h-4" />
//                 Password
//               </button>
//             </div>
//           )}
//         </div>

//         <button
//           onClick={() => navigate('/hr-email')}
//           className={`w-full text-left py-3 px-4 rounded-lg transition-all font-medium flex items-center gap-3 ${
//             isActive('/hr-email')
//               ? 'bg-white/20 text-white shadow-md'
//               : 'text-white/90 hover:bg-white/10'
//           }`}
//         >
//           <Briefcase className="w-5 h-5" />
//           HR Emails
//         </button>

//         <div>
//           <button
//             onClick={() => setSupportOpen(!supportOpen)}
//             className={`w-full text-left py-3 px-4 rounded-lg transition-all font-medium flex items-center gap-3 ${
//               isActive('/contact')
//                 ? 'bg-white/20 text-white shadow-md'
//                 : 'text-white/90 hover:bg-white/10'
//             }`}
//           >
//             <HelpCircle className="w-5 h-5" />
//             Support
//             {supportOpen ? (
//               <ChevronDown className="w-4 h-4 ml-auto" />
//             ) : (
//               <ChevronRight className="w-4 h-4 ml-auto" />
//             )}
//           </button>

//           {supportOpen && (
//             <div className="ml-4 mt-1 space-y-1">
//               <button
//                 onClick={() => navigate('/contact')}
//                 className={`w-full text-left py-2.5 px-4 rounded-lg transition-all text-sm font-medium flex items-center gap-3 ${
//                   isActive('/contact')
//                     ? 'bg-white/15 text-white'
//                     : 'text-white/80 hover:bg-white/10'
//                 }`}
//               >
//                 <Mail className="w-4 h-4" />
//                 Contact Us
//               </button>
//             </div>
//           )}
//         </div>
//       </nav>

//       <button
//         onClick={onLogout}
//         className="w-full text-left text-white py-3 px-4 rounded-lg hover:bg-white/10 transition-all font-medium flex items-center gap-3 mt-auto"
//       >
//         <LogOut className="w-5 h-5" />
//         Logout
//       </button>
//     </div>
//   );
// }









import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Settings,
  HelpCircle,
  User,
  CreditCard,
  KeyRound,
  Mail,
  LogOut,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Globe,
  Search,
  ChevronLeft
} from "lucide-react";

interface SidebarProps {
  userEmail?: string;
  onLogout: () => void;
}

export default function Sidebar({ userEmail, onLogout }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // collapsed = icon-only rail (like 2nd screenshot)
  const [collapsed, setCollapsed] = useState(false);
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleAccountClick = () => {
    if (collapsed) {
      // when collapsed just go to profile
      navigate("/profile");
    } else {
      setAccountSettingsOpen((prev) => !prev);
    }
  };

  const handleSupportClick = () => {
    if (collapsed) {
      navigate("/contact");
    } else {
      setSupportOpen((prev) => !prev);
    }
  };

  const baseItemClasses =
    "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors";

  const renderLabel = (label: string) =>
    !collapsed && <span className="truncate">{label}</span>;

  return (
    <aside
      className={`h-screen sticky top-0 bg-white border-r shadow-sm flex flex-col transition-[width] duration-300 ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Brand + collapse button */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                  <img
                    src="/images/networknote_final_logo_1 (2).jpg"
                    alt="NetworkNote logo"
                    className="h-full w-full object-cover"
                  />
                </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900">
                NetworkNote
              </span>
              {/* <span className="text-[11px] text-slate-400">
                Email Intelligence
              </span> */}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="h-8 w-8 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          )}
        </button>
      </div>

      {/* Search box (hidden when collapsed) */}
      {/* {!collapsed && (
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/5"
            />
          </div>
        </div>
      )} */}

      {/* User chip (bottom of sidebar in your screenshot – but keeping topish here) */}
      {!collapsed && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
            <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700">
              {userEmail?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-900 truncate">
                {userEmail || "User"}
              </p>
              {/* <p className="text-[11px] text-slate-500">Professional account</p> */}
            </div>
          </div>
        </div>
      )}

      {/* MAIN NAV */}
      <nav className="flex-1 overflow-y-auto px-2 pt-2 pb-4 space-y-1">
        {/* Dashboard */}
        <button
          onClick={() => navigate("/dashboard")}
          className={`${baseItemClasses} ${
            isActive("/dashboard")
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          } ${collapsed ? "justify-center" : ""}`}
        >
          <LayoutDashboard className="w-4 h-4" />
          {renderLabel("Dashboard")}
        </button>

        {/* Billing */}
        <button
          onClick={() => navigate("/billing")}
          className={`${baseItemClasses} ${
            isActive("/billing")
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          } ${collapsed ? "justify-center" : ""}`}
        >
          <CreditCard className="w-4 h-4" />
          {renderLabel("Billing & Payment")}
        </button>

        {/* Network */}
        <button
          onClick={() => navigate("/network")}
          className={`${baseItemClasses} ${
            isActive("/network")
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          } ${collapsed ? "justify-center" : ""}`}
        >
          <Globe className="w-4 h-4" />
          {renderLabel("Network")}
        </button>

        {/* Resources */}
        <button
          onClick={() => navigate("/resources")}
          className={`${baseItemClasses} ${
            isActive("/resources")
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          } ${collapsed ? "justify-center" : ""}`}
        >
          <BookOpen className="w-4 h-4" />
          {renderLabel("Resources")}
        </button>

        {/* HR Emails */}
        <button
          onClick={() => navigate("/hr-email")}
          className={`${baseItemClasses} ${
            isActive("/hr-email")
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          } ${collapsed ? "justify-center" : ""}`}
        >
          <Briefcase className="w-4 h-4" />
          {renderLabel("HR Emails")}
        </button>

        {/* Account settings with dropdown (only when expanded) */}
        <div className="pt-1">
          <button
            onClick={handleAccountClick}
            className={`${baseItemClasses} ${
              ["/profile", "/password", "/"].includes(location.pathname)
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            } ${collapsed ? "justify-center" : ""}`}
          >
            <Settings className="w-4 h-4" />
            {renderLabel("Account Settings")}
            {!collapsed &&
              (accountSettingsOpen ? (
                <ChevronDown className="w-4 h-4 ml-auto" />
              ) : (
                <ChevronRight className="w-4 h-4 ml-auto" />
              ))}
          </button>

          {!collapsed && accountSettingsOpen && (
            <div className="pl-8 pt-1 space-y-1">
              <button
                onClick={() => navigate("/profile")}
                className={`${baseItemClasses} ${
                  isActive("/profile")
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <User className="w-4 h-4" />
                <span className="truncate">Profile</span>
              </button>

              <button
                onClick={() => navigate("/password")}
                className={`${baseItemClasses} ${
                  isActive("/password")
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span className="truncate">Password</span>
              </button>
            </div>
          )}
        </div>

        {/* Support / Contact */}
        <div className="pt-1">
          <button
            onClick={handleSupportClick}
            className={`${baseItemClasses} ${
              isActive("/contact")
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            } ${collapsed ? "justify-center" : ""}`}
          >
            <HelpCircle className="w-4 h-4" />
            {renderLabel("Support")}
            {!collapsed &&
              (supportOpen ? (
                <ChevronDown className="w-4 h-4 ml-auto" />
              ) : (
                <ChevronRight className="w-4 h-4 ml-auto" />
              ))}
          </button>

          {!collapsed && supportOpen && (
            <div className="pl-8 pt-1 space-y-1">
              <button
                onClick={() => navigate("/contact")}
                className={`${baseItemClasses} ${
                  isActive("/contact")
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Mail className="w-4 h-4" />
                <span className="truncate">Contact us</span>
              </button>
            </div>
          )}
        </div>

        {/* Integrations section label like in screenshot */}
        {/* {!collapsed && (
          <p className="px-3 pt-4 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
            Integrations
          </p>
        )} */}

        {/* Example integration icons – replace with your actual links later */}
        {/* <div className="flex flex-col gap-1 pt-1">
          <button
            className={`${baseItemClasses} ${
              collapsed ? "justify-center" : ""
            } text-slate-600 hover:bg-slate-100`}
            type="button"
          >
            <Mail className="w-4 h-4" />
            {renderLabel("Gmail")}
          </button>
          <button
            className={`${baseItemClasses} ${
              collapsed ? "justify-center" : ""
            } text-slate-600 hover:bg-slate-100`}
            type="button"
          >
            <Mail className="w-4 h-4" />
            {renderLabel("Outlook / Microsoft")}
          </button>
        </div> */}
      </nav>

      {/* Logout */}
      <div className="px-2 pb-4 border-t border-slate-100 pt-3">
        <button
          onClick={onLogout}
          className={`${baseItemClasses} ${
            collapsed ? "justify-center" : ""
          } text-slate-500 hover:bg-slate-100`}
        >
          <LogOut className="w-4 h-4" />
          {renderLabel("Logout")}
        </button>
      </div>
    </aside>
  );
}
