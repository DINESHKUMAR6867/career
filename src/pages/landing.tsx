// import { motion, useScroll, useTransform } from "framer-motion";
// import gsap from "gsap";
// import { ScrollToPlugin } from "gsap/ScrollToPlugin";
// import { useEffect, useRef, useState } from "react";
// import { 
//   ArrowRight, 
//   CheckCircle2, 
//   Video, 
//   Upload, 
//   Share2, 
//   BarChart3, 
//   Sparkles,
//   ChevronDown,
//   Play,
//   Star,
//   Linkedin,
//   Youtube,
//   Twitter,
//   Instagram,
//   Plus,
//   Minus,
//   X
// } from "lucide-react";
// import { Button } from "../components/ui/button";
// import { Card, CardContent } from "../components/ui/card";
// import { Input } from "../components/ui/input";
// import { useNavigate } from "react-router-dom";
// import { useAuthContext } from "../contexts/AuthContext";
// import { TypeAnimation } from "react-type-animation";

// export default function Landing() {
//   const navigate = useNavigate();
//   const { isAuthenticated } = useAuthContext();
//   const [openFaq, setOpenFaq] = useState<number | null>(null);
//   const [showPricing, setShowPricing] = useState(false);
//   const [userCountry, setUserCountry] = useState<'US' | 'GB' | 'OTHER'>('OTHER');
//   const [showTerms, setShowTerms] = useState(false);
//   const { scrollY } = useScroll();
//   const headerBlur = useTransform(scrollY, [0, 100], [10, 25]);
//   const mainRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     // Smooth scroll behavior
//     if (mainRef.current) {
//       mainRef.current.style.scrollBehavior = 'smooth';
//     }
//   }, []);

//   useEffect(() => {
//     // GSAP smooth scrolling for in-page anchors
//     gsap.registerPlugin(ScrollToPlugin);
//     const links = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');

//     const onClick = (e: Event) => {
//       const anchor = e.currentTarget as HTMLAnchorElement;
//       const href = anchor.getAttribute("href") || "";
//       if (!href.startsWith("#")) return;

//       const id = href.slice(1);
//       const target = id ? document.getElementById(id) : null;

//       e.preventDefault();
//       gsap.to(window, {
//         duration: 0.8,
//         ease: "power2.out",
//         scrollTo: target ?? 0,
//       });
//     };

//     links.forEach((a) => a.addEventListener("click", onClick));
//     return () => links.forEach((a) => a.removeEventListener("click", onClick));
//   }, []);

//   // Detect user country
//   useEffect(() => {
//     const detectCountry = async () => {
//       try {
//         // Using a free IP geolocation service
//         const response = await fetch('https://ipapi.co/json/');
//         const data = await response.json();
//         if (data.country_code === 'US') {
//           setUserCountry('US');
//         } else if (data.country_code === 'GB') {
//           setUserCountry('GB');
//         } else {
//           setUserCountry('OTHER');
//         }
//       } catch (error) {
//         console.log('Could not detect country, defaulting to OTHER');
//         setUserCountry('OTHER');
//       }
//     };

//     detectCountry();
//   }, []);

//   const companies = [
//     "Amazon", "Meta", "EY", "Revolut", "Accenture", 
//     "HubSpot", "Adobe", "Tesla", "Coca-Cola"
//   ];

//   const testimonials = [
//     {
//       name: "Sarah Chen",
//       role: "Software Engineer",
//       company: "Meta",
//       avatar: "👩‍💻",
//       quote: "Network Note helped me stand out from 200+ applicants. I got 3 interview requests within a week!",
//       rating: 5
//     },
//     {
//       name: "Marcus Johnson",
//       role: "Product Manager",
//       company: "Amazon",
//       avatar: "👨‍💼",
//       quote: "The video resume format let me showcase my personality. Recruiters loved it and I landed my dream job.",
//       rating: 5
//     },
//     {
//       name: "Priya Patel",
//       role: "UX Designer",
//       company: "Adobe",
//       avatar: "👩‍🎨",
//       quote: "I was skeptical at first, but Network Note completely transformed my job search. Highly recommend!",
//       rating: 5
//     }
//   ];

//   const faqs = [
//     {
//       q: "How do I create my first Network Note?",
//       a: "Simply sign up for free, upload your resume, record a 60-90 second video pitch, and share it with recruiters. Our platform guides you through each step."
//     },
//     {
//       q: "Can I re-record my video?",
//       a: "Absolutely! You can record as many takes as you need until you're happy with your video pitch."
//     },
//     {
//       q: "What file formats are supported?",
//       a: "We support PDF and DOCX for resumes, and MP4, MOV, and WEBM for video files."
//     },
//     {
//       q: "How secure is my data?",
//       a: "Your data is encrypted and stored securely. We never share your information without your explicit permission."
//     },
//     {
//       q: "Is Network Note really free?",
//       a: "Yes! Our basic plan is completely free. Premium features are available for advanced users."
//     },
//     {
//       q: "How long should my video be?",
//       a: "We recommend 60-90 seconds. This is enough time to make an impact without losing the recruiter's attention."
//     }
//   ];

//   return (
//     <div ref={mainRef} className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-foreground overflow-x-hidden">
//       {/* Sticky Glass Header */}
//       <motion.header
//   className="sticky top-0 z-50 border-b border-border/50 bg-white/80 shadow-sm"
//   style={{
//     backdropFilter: useTransform(headerBlur, (v) => `blur(${v}px)`),
//   }}
// >
//   <div className="max-w-[1440px] mx-auto px-8 lg:px-20 py-4">
//     <div className="flex items-center justify-between">
//       {/* Logo + Branding */}
//       <div
//         className="flex items-center gap-2 cursor-pointer"
//         onClick={() => navigate("/")}
//       >
//         {/* Cyan gradient from STEP #1 */}
//         <div >
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
//       </div>

//       {/* Navigation */}
//       <nav className="hidden md:flex items-center gap-8">
//         {["Solutions", "Resources", "Company", "Pricing"].map((item) => (
//           <a
//             key={item}
//             href={`#${item.toLowerCase()}`}
//             className="text-muted-foreground hover:text-foreground transition-colors relative group font-medium"
//             onClick={(e) => {
//               if (item === "Pricing") {
//                 e.preventDefault();
//                 setShowPricing(true);
//               }
//             }}
//           >
//             {item}
//             {/* Underline gradient */}
//             <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] group-hover:w-full transition-all duration-300" />
//           </a>
//         ))}
//       </nav>

//       {/* Right Action Buttons */}
//       <div className="flex items-center gap-3">
//         <Button
//           variant="outline"
//           className="border-border text-gray-700 hover:border-cyan-400 hover:text-cyan-600 hover:bg-cyan-50 transition-all"
//           onClick={() => navigate("/auth")}
//         >
//           Login
//         </Button>

//         {/* Primary Button with gradient */}
//         <Button
//           className="bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] text-white font-semibold hover:shadow-lg hover:scale-105 transition-all px-5 py-2"
//           onClick={() =>
//             // navigate(isAuthenticated ? "/dashboard" : "/auth")
//             navigate("/auth")
//           }
//         >
//           {isAuthenticated ? "Dashboard" : "Get Started"}
//         </Button>
//       </div>
//     </div>
//   </div>
// </motion.header>


//       {/* Hero Section */}
//       <section className="relative py-20 lg:py-32">
//   <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
//     <div className="grid lg:grid-cols-2 gap-12 items-center">
//       <motion.div
//         initial={{ opacity: 0, x: -50 }}
//         animate={{ opacity: 1, x: 0 }}
//         transition={{ duration: 0.8 }}
//       >
//         {/* Gradient line using STEP #1 colors */}
//         {/* <div className="w-1 h-24 bg-gradient-to-b from-[#0B4F6C] to-[#159A9C] mb-6 rounded-full" /> */}

       

// <h1 className="text-5xl lg:text-7xl font-black tracking-tight mb-6 leading-tight text-gray-900">
//   <TypeAnimation
//     sequence={[
//       "YOUR NETWORK NOTE.", // text to type
//       1000,                 // pause at end (1s)
//     ]}
//     speed={0.2 as any}            // ⏳ slower typing speed (higher = slower)
//     repeat={0}              // 🔁 0 = no repeat, only types once
//     cursor={true}           // blinking cursor stays visible
//     className="text-gray-900"
//   />
// </h1>



//         <p className="text-lg text-muted-foreground mb-6 leading-relaxed max-w-xl">
//           Network Note helps you stand out and land interviews by creating personalized video resumes that build instant connections with recruiters.
//         </p>

//         {/* <div className="flex items-center gap-2 mb-8">
//           {[...Array(5)].map((_, i) => (
//             <Star key={i} className="h-5 w-5 fill-cyan-400 text-cyan-400" />
//           ))}
//           <span className="text-muted-foreground ml-2">5,000+ happy users</span>
//         </div> */}

//         {/* Updated Button gradient */}
//         <Button
//           size="lg"
//           className="bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] text-white hover:shadow-xl hover:scale-105 transition-all text-lg px-8"
//           onClick={() => navigate('/auth')}
//         >
//           Sign up for free
//           <ArrowRight className="ml-2 h-5 w-5" />
//         </Button>
//       </motion.div>

//       <motion.div
//         initial={{ opacity: 0, x: 50 }}
//         animate={{ opacity: 1, x: 0 }}
//         transition={{ duration: 0.8, delay: 0.2 }}
//         className="relative"
//       >
//         <div className="relative rounded-2xl overflow-hidden backdrop-blur-xl bg-white/80 border border-border shadow-2xl p-8">
//           {/* Video placeholder card gradient updated */}
//           <div className="aspect-video bg-gradient-to-br from-slate-100 to-cyan-50 rounded-xl flex items-center justify-center relative overflow-hidden border border-border shadow-lg">
//   {/* Soft overlay gradient */}
//   <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-cyan-400/10 z-10 pointer-events-none" />

//   {/* 🎥 Video Element */}
//   <video
//   src="/videos/demo.mp4"
//   autoPlay
//   muted
//   loop
//   playsInline
//   className="absolute inset-0 w-full h-full object-cover rounded-xl"
// >

//     Your browser does not support the video tag.
//   </video>

//   {/* Bottom overlay info bar */}
//   {/* <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20">
//     <span className="text-foreground text-sm font-medium bg-white/80 px-3 py-1 rounded-md shadow-sm">
//       Professional Video Resume
//     </span>
//     <div className="flex items-center gap-2 bg-red-50/90 px-2 py-1 rounded-full border border-red-200 shadow-sm">
//       <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
//       <span className="text-red-600 text-xs font-semibold">REC</span>
//     </div>
//   </div> */}
// </div>

//         </div>

//         {/* Glow circle updated to cyan */}
//         <div className="absolute -bottom-4 -right-4 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl -z-10" />
//       </motion.div>
//     </div>
//   </div>
// </section>

//       {/* Dashboard Preview */}
//       <section className="py-20">
//         <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
//           <motion.div
//             initial={{ opacity: 0, y: 50 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.8 }}
//             className="relative rounded-3xl overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10 p-8 lg:p-12"
//           >
//             <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
//               <div className="flex-1">
//                 <h2 className="text-3xl font-bold mb-4">Your Dashboard</h2>
//                 <p className="text-slate-600">Manage all your Network Notes in one place</p>
//               </div>
//               <Button 
//                 size="lg"
//                 className="bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] text-black hover:shadow-[0_0_30px_rgba(132,204,22,0.5)] transition-all font-semibold"
//                 onClick={() => navigate('/auth')}
//               >
//                 <Plus className="mr-2 h-5 w-5" />
//                 New Network Note
//               </Button>
//             </div>
//             <div
//               className="mt-8 aspect-video rounded-xl border border-white/10 bg-cover bg-center bg-no-repeat shadow-lg"
//               style={{
//                 backgroundImage: "url('/images/image.png')",
//                 backgroundSize: "100%",
//               }}
//             />
//           </motion.div>
//         </div>
//       </section>

//       {/* Featured In */}
//       <section className="py-16 backdrop-blur-xl bg-white/5 border-y border-white/10">
//         <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
//           <motion.div
//             initial={{ opacity: 0 }}
//             whileInView={{ opacity: 1 }}
//             viewport={{ once: true }}
//             className="text-center mb-12"
//           >
//             <h3 className="text-2xl font-bold mb-2">
//               Over 200 candidates have landed interviews globally through Network Note
//             </h3>
//           </motion.div>
//           <div className="relative overflow-hidden">
//             <motion.div
//               className="flex gap-12 items-center"
//               animate={{ x: [0, -1000] }}
//               transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
//             >
//               {[...companies, ...companies].map((company, i) => (
//                 <div key={i} className="text-2xl font-bold text-slate-400 whitespace-nowrap">
//                   {company}
//                 </div>
//               ))}
//             </motion.div>
//           </div>
//         </div>
//       </section>

//       {/* Value Proposition */}
//       <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
//         <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
//           <div className="grid lg:grid-cols-2 gap-12 items-center">
//             <motion.div
//               initial={{ opacity: 0, x: -50 }}
//               whileInView={{ opacity: 1, x: 0 }}
//               viewport={{ once: true }}
//             >
//               <h2 className="text-4xl lg:text-5xl font-black mb-6 leading-tight text-white">
//                 GET HIRED FASTER WITH A PERSONALIZED VIDEO RESUME
//               </h2>
//               <p className="text-slate-300 text-lg">
//                 Recruiters skim hundreds of resumes daily — Network Note helps put your story front and center.
//               </p>
//             </motion.div>

//             <div className="grid gap-6">
//               {[
//                 { title: "Highlight your key skills", desc: "Showcase what makes you unique" },
//                 { title: "Stand out from other applicants", desc: "Be memorable in a sea of resumes" },
//                 { title: "Build instant connections", desc: "Let your personality shine through" }
//               ].map((item, i) => (
//                 <motion.div
//                   key={i}
//                   initial={{ opacity: 0, y: 20 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   viewport={{ once: true }}
//                   transition={{ delay: i * 0.1 }}
//                   whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(132,204,22,0.3)" }}
//                   className="p-6 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 cursor-pointer transition-all"
//                 >
//                   <h3 className="text-xl font-bold mb-2 text-white">
//                     {item.title.split(" ").map((word, j) => 
//                       j === item.title.split(" ").length - 2 ? (
//                         <span key={j} className="text-lime-400">{word} </span>
//                       ) : word + " "
//                     )}
//                   </h3>
//                   <p className="text-slate-300">{item.desc}</p>
//                 </motion.div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* How It Works - Step 1 */}
//       <section className="py-20 bg-white">
//         <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
//           <motion.div
//             initial={{ opacity: 0 }}
//             whileInView={{ opacity: 1 }}
//             viewport={{ once: true }}
//             className="grid lg:grid-cols-2 gap-12 items-center"
//           >
//             <Card className="backdrop-blur-xl bg-slate-50 border-slate-200">
//               <CardContent className="p-8">
//                 <div className="space-y-4">
//                   <Input placeholder="First Name" className="bg-white border-slate-300 text-slate-900" />
//                   <Input placeholder="Last Name" className="bg-white border-slate-300 text-slate-900" />
//                   <Input placeholder="Email" type="email" className="bg-white border-slate-300 text-slate-900" />
//                   <Input placeholder="Password" type="password" className="bg-white border-slate-300 text-slate-900" />
//                   <Input placeholder="Confirm Password" type="password" className="bg-white border-slate-300 text-slate-900" />
//                 </div>
//               </CardContent>
//             </Card>

//             <div>
//               <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] text-white font-bold mb-4">
//                 STEP #1
//               </div>
//               <h2 className="text-4xl font-black mb-6 text-slate-900">Create your Network Note account for free</h2>
//               <div className="space-y-3">
//                 <div className="flex items-start gap-3">
//                   <CheckCircle2 className="h-6 w-6 text-lime-500 flex-shrink-0 mt-1" />
//                   <p className="text-slate-700">Create your free account in seconds</p>
//                 </div>
//                 <div className="flex items-start gap-3">
//                   <CheckCircle2 className="h-6 w-6 text-lime-500 flex-shrink-0 mt-1" />
//                   <p className="text-slate-700">Start personalizing your video resume</p>
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {/* Step 2 */}
//       <section className="py-20 bg-slate-50">
//         <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
//           <motion.div
//             initial={{ opacity: 0 }}
//             whileInView={{ opacity: 1 }}
//             viewport={{ once: true }}
//             className="grid lg:grid-cols-2 gap-12 items-center"
//           >
//             <div>
//               <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] text-white font-bold mb-4">
//                 STEP #2
//               </div>
//               <h2 className="text-4xl font-black mb-6 text-slate-900">Upload your resume to the platform</h2>
//               <div className="space-y-3">
//                 <div className="flex items-start gap-3">
//                   <CheckCircle2 className="h-6 w-6 text-lime-500 flex-shrink-0 mt-1" />
//                   <p className="text-slate-700">Upload your traditional resume</p>
//                 </div>
//                 <div className="flex items-start gap-3">
//                   <CheckCircle2 className="h-6 w-6 text-lime-500 flex-shrink-0 mt-1" />
//                   <p className="text-slate-700">Build the foundation for your Network Note</p>
//                 </div>
//               </div>
//             </div>

//             <Card className="backdrop-blur-xl bg-white border-slate-200">
//               <CardContent className="p-12 text-center">
//                 <Upload className="h-16 w-16 from-[#0B4F6C] to-[#159A9C] mx-auto mb-4" />
//                 <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 mb-4">
//                   <p className="text-slate-600">Drag & drop your resume here</p>
//                   <p className="text-slate-400 text-sm mt-2">PDF or DOCX</p>
//                 </div>
//                 <Button className="bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] text-white w-full hover:shadow-lg">
//                   Next Step
//                 </Button>
//               </CardContent>
//             </Card>
//           </motion.div>
//         </div>
//       </section>

//       {/* Step 3 */}
//       <section className="py-20 bg-white">
//         <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
//           <motion.div
//             initial={{ opacity: 0 }}
//             whileInView={{ opacity: 1 }}
//             viewport={{ once: true }}
//             className="grid lg:grid-cols-2 gap-12 items-center"
//           >
//             <Card className="backdrop-blur-xl bg-slate-50 border-slate-200">
//               <CardContent className="p-8">
//                 <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center relative">
//                   <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/20 px-3 py-1 rounded-full border border-red-400">
//                     <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
//                     <span className="text-red-400 text-xs font-bold">REC</span>
//                   </div>
//                   <Video className="h-16 w-16 text-slate-400" />
//                 </div>
//               </CardContent>
//             </Card>

//             <div>
//               <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] text-white font-bold mb-4">
//                 STEP #3
//               </div>
//               <h2 className="text-4xl font-black mb-6 text-slate-900">Record or attach a video pitch</h2>
//               <div className="space-y-3">
//                 <div className="flex items-start gap-3">
//                   <CheckCircle2 className="h-6 w-6 text-lime-500 flex-shrink-0 mt-1" />
//                   <p className="text-slate-700">Record a 60–90 second video</p>
//                 </div>
//                 <div className="flex items-start gap-3">
//                   <CheckCircle2 className="h-6 w-6 text-lime-500 flex-shrink-0 mt-1" />
//                   <p className="text-slate-700">Use our tools to perfect your pitch</p>
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {/* Step 4 */}
//       <section className="py-20 bg-slate-50">
//         <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
//           <motion.div
//             initial={{ opacity: 0 }}
//             whileInView={{ opacity: 1 }}
//             viewport={{ once: true }}
//             className="grid lg:grid-cols-2 gap-12 items-center"
//           >
//             <div>
//               <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] text-white font-bold mb-4">
//                 STEP #4
//               </div>
//               <h2 className="text-4xl font-black mb-6 text-slate-900">Share your Network Note with recruiters</h2>
//               <div className="space-y-3">
//                 <div className="flex items-start gap-3">
//                   <CheckCircle2 className="h-6 w-6 text-lime-500 flex-shrink-0 mt-1" />
//                   <p className="text-slate-700">Make sure your Network Note looks great</p>
//                 </div>
//                 <div className="flex items-start gap-3">
//                   <CheckCircle2 className="h-6 w-6 text-lime-500 flex-shrink-0 mt-1" />
//                   <p className="text-slate-700">Send your Network Note to recruiters</p>
//                 </div>
//               </div>
//             </div>

//             <Card className="backdrop-blur-xl bg-white border-slate-200">
//               <CardContent className="p-8">
//                 <div className="space-y-4">
//                   <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
//                     <p className="text-sm text-slate-500 mb-2">To: recruiter@company.com</p>
//                     <p className="text-slate-700 mb-3">Hi, I'd love to share my Network Note with you...</p>
//                     <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-50 to-cyan-100 border border-cyan-300">
//                       <p className="text-cyan-700 text-sm font-semibold">🎥 View My Network Note</p>
//                     </div>
//                   </div>
//                   <Button className="bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] text-white w-full hover:shadow-lg">
//                     <Share2 className="mr-2 h-4 w-4" />
//                     Send Network Note
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           </motion.div>
//         </div>
//       </section>

//       {/* Pricing */}
//       <section id="pricing" className="py-20 bg-gradient-to-br from-slate-50 to-white">
//         <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             className="text-center mb-16"
//           >
//             <h2 className="text-4xl lg:text-5xl font-black mb-4 text-slate-900">
//               Simple, Transparent Pricing
//             </h2>
//             <p className="text-slate-600 text-lg max-w-2xl mx-auto">
//               Choose the plan that works best for you. All plans include our core features.
//             </p>
//           </motion.div>

//           <div className="relative flex justify-center items-center h-96">
//             {/* UK Card (slightly behind when US is primary) */}
//             <div className={`absolute transition-all duration-500 ease-in-out ${userCountry === 'US' ? 'transform translate-x-6 translate-y-6 scale-90 opacity-70 z-0' : 'z-10'}`}>
//               <Card className="w-80 border-2 border-slate-200 shadow-lg">
//                 <CardContent className="p-6">
//                   <div className="flex items-center justify-between mb-4">
//                     <h3 className="text-xl font-bold">UK Plan</h3>
//                     <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
//                       GBP
//                     </div>
//                   </div>
//                   <div className="mb-6">
//                     <span className="text-3xl font-bold">£12.99</span>
//                     <span className="text-gray-600">/month</span>
//                   </div>
//                   <ul className="space-y-2 mb-6">
//                     <li className="flex items-center">
//                       <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
//                       <span className="text-sm">Unlimited Network Notes</span>
//                     </li>
//                     <li className="flex items-center">
//                       <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
//                       <span className="text-sm">HD Video Recording</span>
//                     </li>
//                     <li className="flex items-center">
//                       <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
//                       <span className="text-sm">Advanced Analytics</span>
//                     </li>
//                     <li className="flex items-center">
//                       <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
//                       <span className="text-sm">Priority Support</span>
//                     </li>
//                   </ul>
//                   <Button
//                     className="w-full bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] text-white hover:shadow-lg"
//                     onClick={() => navigate('/auth')}
//                   >
//                     Get Started
//                   </Button>
//                 </CardContent>
//               </Card>
//             </div>

//             {/* US Card (slightly behind when UK is primary) */}
//             <div className={`absolute transition-all duration-500 ease-in-out ${userCountry === 'GB' ? 'transform -translate-x-6 translate-y-6 scale-90 opacity-70 z-0' : 'z-10'}`}>
//               <Card className="w-80 border-2 border-slate-200 shadow-lg">
//                 <CardContent className="p-6">
//                   <div className="flex items-center justify-between mb-4">
//                     <h3 className="text-xl font-bold">US Plan</h3>
//                     <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
//                       USD
//                     </div>
//                   </div>
//                   <div className="mb-6">
//                     <span className="text-3xl font-bold">$12.99</span>
//                     <span className="text-gray-600">/month</span>
//                   </div>
//                   <ul className="space-y-2 mb-6">
//                     <li className="flex items-center">
//                       <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
//                       <span className="text-sm">Unlimited Network Notes</span>
//                     </li>
//                     <li className="flex items-center">
//                       <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
//                       <span className="text-sm">HD Video Recording</span>
//                     </li>
//                     <li className="flex items-center">
//                       <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
//                       <span className="text-sm">Advanced Analytics</span>
//                     </li>
//                     <li className="flex items-center">
//                       <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
//                       <span className="text-sm">Priority Support</span>
//                     </li>
//                   </ul>
//                   <Button
//                     className="w-full bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] text-white hover:shadow-lg"
//                     onClick={() => navigate('/auth')}
//                   >
//                     Get Started
//                   </Button>
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Feature Grid */}
//       <section id="solutions" className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
//         <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             className="text-center mb-16"
//           >
//             <h2 className="text-4xl lg:text-5xl font-black mb-6 text-white">
//               BUILT TO HELP JOB SEEKERS STAND OUT
//             </h2>
//             <p className="text-slate-300 text-lg max-w-3xl mx-auto">
//               Create video resumes that reflect your individuality, customize them for specific roles, 
//               and use insights to enhance your job search — all in one intuitive platform.
//             </p>
//           </motion.div>

//           <div className="grid md:grid-cols-2 gap-8">
//             {[
//               {
//                 icon: Sparkles,
//                 title: "Create your video pitch in seconds",
//                 desc: "AI-powered pitch tool helps you craft the perfect message",
//                 color: "from-purple-500 to-pink-500"
//               },
//               {
//                 icon: Video,
//                 title: "Record with in-app teleprompter",
//                 desc: "Never forget what to say with our built-in teleprompter",
//                 color: "from-blue-500 to-cyan-500"
//               },
//               {
//                 icon: BarChart3,
//                 title: "View insights on engagement",
//                 desc: "Track views, applications, and recruiter interest",
//                 color: "from-green-500 to-emerald-500"
//               },
//               {
//                 icon: Share2,
//                 title: "Easily integrate with job platforms",
//                 desc: "Share directly to LinkedIn, Indeed, and ZipRecruiter",
//                 color: "from-orange-500 to-red-500"
//               }
//             ].map((feature, i) => (
//               <motion.div
//                 key={i}
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: i * 0.1 }}
//                 whileHover={{ 
//                   scale: 1.05, 
//                   boxShadow: "0 0 40px rgba(6,182,212,0.4)",
//                   y: -8
//                 }}
//                 className="p-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 cursor-pointer transition-all group"
//               >
//                 <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
//                   <feature.icon className="h-7 w-7 text-white" />
//                 </div>
//                 <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-cyan-400 transition-colors">
//                   {feature.title}
//                 </h3>
//                 <p className="text-slate-300">{feature.desc}</p>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Testimonials */}
//       <section className="py-20 bg-white">
//         <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
//           <motion.div
//             initial={{ opacity: 0 }}
//             whileInView={{ opacity: 1 }}
//             viewport={{ once: true }}
//             className="text-center mb-16"
//           >
//             <h2 className="text-4xl lg:text-5xl font-black mb-4 text-slate-900">
//               HOW NETWORK NOTE HELPED JOB SEEKERS GET HIRED
//             </h2>
//           </motion.div>

//           <div className="grid md:grid-cols-3 gap-8">
//             {testimonials.map((testimonial, i) => (
//               <motion.div
//                 key={i}
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: i * 0.1 }}
//                 whileHover={{ y: -8, boxShadow: "0 0 30px rgba(6,182,212,0.3)" }}
//                 className="p-8 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer transition-all"
//               >
//                 <div className="text-5xl mb-4">{testimonial.avatar}</div>
//                 <div className="flex gap-1 mb-4">
//                   {[...Array(testimonial.rating)].map((_, j) => (
//                     <Star key={j} className="h-4 w-4 fill-cyan-500 text-cyan-500" />
//                   ))}
//                 </div>
//                 <p className="text-slate-700 mb-6 italic">"{testimonial.quote}"</p>
//                 <div>
//                   <p className="font-bold text-slate-900">{testimonial.name}</p>
//                   <p className="text-slate-600 text-sm">{testimonial.role} at {testimonial.company}</p>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* FAQ */}
//       <section id="resources" className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
//         <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
//           <motion.div
//             initial={{ opacity: 0 }}
//             whileInView={{ opacity: 1 }}
//             viewport={{ once: true }}
//             className="text-center mb-16"
//           >
//             <h2 className="text-4xl lg:text-5xl font-black mb-4 text-white">
//               Frequently Asked Questions
//             </h2>
//           </motion.div>

//           <div className="max-w-3xl mx-auto space-y-4">
//             {faqs.map((faq, i) => (
//               <motion.div
//                 key={i}
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: i * 0.05 }}
//                 className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl overflow-hidden hover:border-cyan-400/50 transition-all"
//               >
//                 <button
//                   onClick={() => setOpenFaq(openFaq === i ? null : i)}
//                   className="w-full p-6 flex items-center justify-between text-left"
//                 >
//                   <span className="font-semibold text-white">{faq.q}</span>
//                   <motion.div
//                     animate={{ rotate: openFaq === i ? 180 : 0 }}
//                     transition={{ duration: 0.3 }}
//                   >
//                     {openFaq === i ? (
//                       <Minus className="h-5 w-5 text-cyan-400" />
//                     ) : (
//                       <Plus className="h-5 w-5 text-slate-400" />
//                     )}
//                   </motion.div>
//                 </button>
//                 <motion.div
//                   initial={false}
//                   animate={{ height: openFaq === i ? "auto" : 0 }}
//                   transition={{ duration: 0.3 }}
//                   className="overflow-hidden"
//                 >
//                   <p className="px-6 pb-6 text-slate-300">{faq.a}</p>
//                 </motion.div>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer id="company" className="border-t border-slate-200 bg-slate-50">
//         <div className="max-w-[1440px] mx-auto px-8 lg:px-20 py-16">
//           <div className="grid md:grid-cols-3 gap-12 mb-12">
//             <div>
//               <div className="flex items-center gap-2 mb-4">
//                 <div >
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
//               </div>
//               <p className="text-slate-600">Your Career, Better.</p>
//             </div>

//             <div>
//               <h4 className="font-bold mb-4 text-slate-900">Quick Links</h4>
//               <div className="space-y-2">
//                 {["Solutions", "Pricing", "Privacy", "Terms", "Careers"].map((link) => (
//                   <a
//                     key={link}
//                     href="#"
//                     className="block text-slate-600 hover:text-cyan-600 transition-colors"
//                   >
//                     {link}
//                   </a>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <h4 className="font-bold mb-4 text-slate-900">Connect</h4>
//               <div className="flex gap-4">
//                 {[
//                   { icon: Linkedin, href: "#" },
//                   { icon: Youtube, href: "#" },
//                   { icon: Twitter, href: "#" },
//                   { icon: Instagram, href: "#" }
//                 ].map((social, i) => (
//                   <motion.a
//                     key={i}
//                     href={social.href}
//                     whileHover={{ scale: 1.2, boxShadow: "0 0 20px rgba(6,182,212,0.5)" }}
//                     className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:border-cyan-400 transition-all"
//                   >
//                     <social.icon className="h-5 w-5 text-slate-600" />
//                   </motion.a>
//                 ))}
//               </div>
//             </div>
//           </div>

//           <div className="pt-8 border-t border-slate-200 text-center text-slate-600 text-sm">
//             <p>© 2025 Network Note | All Rights Reserved</p>
//           </div>
//         </div>
//       </footer>

//       {/* Pricing Modal */}
//       {showPricing && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
//           <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//             <button
//               onClick={() => setShowPricing(false)}
//               className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
//             >
//               <X className="h-6 w-6" />
//             </button>

//             <div className="p-6 sm:p-8">
//               <h2 className="text-3xl font-bold text-center mb-2">Choose Your Plan</h2>
//               <p className="text-gray-600 text-center mb-8">Start your journey with Network Note today</p>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* US Pricing Card */}
//                 <div className={`rounded-2xl border-2 p-6 transition-all ${userCountry === 'US' ? 'border-[#0B4F6C] shadow-lg' : 'border-gray-200'}`}>
//                   {userCountry === 'US' && (
//                     <div className="bg-[#0B4F6C] text-white text-center py-2 rounded-t-lg -m-6 mb-4 font-semibold">
//                       Recommended for you
//                     </div>
//                   )}
//                   <div className="flex items-center justify-between mb-4">
//                     <h3 className="text-xl font-bold">US Plan</h3>
//                     <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
//                       USD
//                     </div>
//                   </div>
//                   <div className="mb-6">
//                     <span className="text-4xl font-bold">$12.99</span>
//                     <span className="text-gray-600">/month</span>
//                   </div>
//                   <ul className="space-y-3 mb-8">
//                     <li className="flex items-center">
//                       <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
//                       <span>Unlimited Network Notes</span>
//                     </li>
//                     <li className="flex items-center">
//                       <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
//                       <span>HD Video Recording</span>
//                     </li>
//                     <li className="flex items-center">
//                       <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
//                       <span>Advanced Analytics</span>
//                     </li>
//                     <li className="flex items-center">
//                       <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
//                       <span>Priority Support</span>
//                     </li>
//                   </ul>
//                   <Button
//                     className="w-full bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] text-white hover:shadow-lg"
//                     onClick={() => {
//                       // Handle US payment
//                       navigate('/auth');
//                     }}
//                   >
//                     Get Started
//                   </Button>
//                 </div>

//                 {/* UK Pricing Card */}
//                 <div className={`rounded-2xl border-2 p-6 transition-all ${userCountry === 'GB' ? 'border-[#0B4F6C] shadow-lg' : 'border-gray-200'}`}>
//                   {userCountry === 'GB' && (
//                     <div className="bg-[#0B4F6C] text-white text-center py-2 rounded-t-lg -m-6 mb-4 font-semibold">
//                       Recommended for you
//                     </div>
//                   )}
//                   <div className="flex items-center justify-between mb-4">
//                     <h3 className="text-xl font-bold">UK Plan</h3>
//                     <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
//                       GBP
//                     </div>
//                   </div>
//                   <div className="mb-6">
//                     <span className="text-4xl font-bold">£12.99</span>
//                     <span className="text-gray-600">/month</span>
//                   </div>
//                   <ul className="space-y-3 mb-8">
//                     <li className="flex items-center">
//                       <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
//                       <span>Unlimited Network Notes</span>
//                     </li>
//                     <li className="flex items-center">
//                       <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
//                       <span>HD Video Recording</span>
//                     </li>
//                     <li className="flex items-center">
//                       <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
//                       <span>Advanced Analytics</span>
//                     </li>
//                     <li className="flex items-center">
//                       <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
//                       <span>Priority Support</span>
//                     </li>
//                   </ul>
//                   <Button
//                     className="w-full bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] text-white hover:shadow-lg"
//                     onClick={() => {
//                       // Handle UK payment
//                       navigate('/auth');
//                     }}
//                   >
//                     Get Started
//                   </Button>
//                 </div>
//               </div>

//               <div className="mt-8 text-center">
//                 <button 
//                   onClick={() => setShowTerms(true)}
//                   className="text-blue-600 hover:underline text-sm"
//                 >
//                   View Terms & Conditions
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Terms and Conditions Modal */}
//       {showTerms && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
//           <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//             <button
//               onClick={() => setShowTerms(false)}
//               className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
//             >
//               <X className="h-6 w-6" />
//             </button>

//             <div className="p-6 sm:p-8">
//               <h2 className="text-2xl font-bold mb-4">Network Note - Terms & Conditions</h2>
              
//               <div className="text-gray-600 space-y-4">
//                 <p className="font-medium">By proceeding, I agree that:</p>

//                 <ul className="space-y-2 list-disc list-inside">
//                   <li>I am purchasing a subscription to Network Note's premium features</li>
//                   <li>This is a digital service, non-refundable after 14 days of purchase</li>
//                   <li>Subscription renews automatically unless cancelled</li>
//                   <li>Network Note is not a recruitment agency and does not guarantee any job or sponsorship</li>
//                   <li>I will use the platform only for personal job search purposes</li>
//                   <li>Video content created is my own and does not violate any rights</li>
//                 </ul>

//                 <div className="pt-4 mt-4 border-t border-gray-200">
//                   <h3 className="font-bold mb-2">Pricing Information:</h3>
//                   <ul className="space-y-1 list-disc list-inside">
//                     <li>US Plan: $12.99/month (billed monthly)</li>
//                     <li>UK Plan: £12.99/month (billed monthly)</li>
//                     <li>Prices exclude applicable taxes</li>
//                     <li>Subscription can be cancelled anytime through your account settings</li>
//                   </ul>
//                 </div>

//                 <div className="pt-4">
//                   <h3 className="font-bold mb-2">Refund Policy:</h3>
//                   <p>We offer a 14-day money-back guarantee for new subscribers. After this period, no refunds will be issued for partial months of service.</p>
//                 </div>

//                 <div className="pt-4">
//                   <button
//                     onClick={() => setShowTerms(false)}
//                     className="px-4 py-2 bg-[#0B4F6C] text-white rounded-lg hover:bg-[#159A9C] focus:ring-2 focus:ring-blue-300"
//                   >
//                     Close
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



// import { motion, useScroll, useTransform } from "framer-motion";
// import gsap from "gsap";
// import { ScrollToPlugin } from "gsap/ScrollToPlugin";
// import { useEffect, useRef, useState } from "react";
// import {
//   ArrowRight,
//   CheckCircle2,
//   Video,
//   Upload,
//   Share2,
//   BarChart3,
//   Sparkles,
//   Star,
//   Linkedin,
//   Youtube,
//   Twitter,
//   Instagram,
//   Plus,
//   Minus,
// } from "lucide-react";
// import { Button } from "../components/ui/button";
// import { Card, CardContent } from "../components/ui/card";
// import { Input } from "../components/ui/input";
// import { useNavigate } from "react-router-dom";
// import { useAuthContext } from "../contexts/AuthContext";
// import { TypeAnimation } from "react-type-animation";
// import { ChevronLeft, ChevronRight } from "lucide-react";


// // ---- Animation + style helpers for pricing card ----
// const slideUp = {
//   hidden: { opacity: 0, y: 40 },
//   visible: (i = 0) => ({
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.6,
//       delay: i * 0.15,
//       ease: "easeOut",
//     },
//   }),
// };

// const cardClass = "relative rounded-2xl";
// const glow =
//   "pointer-events-none absolute -inset-0.5 bg-gradient-to-r from-blue-500/40 to-purple-600/40 blur-lg opacity-60";

// export default function Landing() {
//   const navigate = useNavigate();
//   const { isAuthenticated } = useAuthContext();

//   const [openFaq, setOpenFaq] = useState<number | null>(null);
//   const [userCountry, setUserCountry] = useState<"US" | "GB" | "OTHER">("OTHER");
//   const [showTermsModal, setShowTermsModal] = useState(false);
//   const [activePlanIndex, setActivePlanIndex] = useState(0); // 0 -> US, 1 -> UK

//   const { scrollY } = useScroll();
//   const headerBlur = useTransform(scrollY, [0, 100], [10, 25]);
//   const mainRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (mainRef.current) {
//       mainRef.current.style.scrollBehavior = "smooth";
//     }
//   }, []);

//   useEffect(() => {
//     gsap.registerPlugin(ScrollToPlugin);
//     const links = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');

//     const onClick = (e: Event) => {
//       const anchor = e.currentTarget as HTMLAnchorElement;
//       const href = anchor.getAttribute("href") || "";
//       if (!href.startsWith("#")) return;

//       const id = href.slice(1);
//       const target = id ? document.getElementById(id) : null;

//       e.preventDefault();
//       gsap.to(window, {
//         duration: 0.8,
//         ease: "power2.out",
//         scrollTo: target ?? 0,
//       });
//     };

//     links.forEach((a) => a.addEventListener("click", onClick));
//     return () => links.forEach((a) => a.removeEventListener("click", onClick));
//   }, []);

//   // Detect user country & set default pricing slide
//   useEffect(() => {
//     const detectCountry = async () => {
//       try {
//         const response = await fetch("https://ipapi.co/json/");
//         const data = await response.json();
//         if (data.country_code === "US") {
//           setUserCountry("US");
//           setActivePlanIndex(0); // US slide
//         } else if (data.country_code === "GB") {
//           setUserCountry("GB");
//           setActivePlanIndex(1); // UK slide
//         } else {
//           setUserCountry("OTHER");
//           setActivePlanIndex(0); // default to US
//         }
//       } catch (error) {
//         console.log("Could not detect country, defaulting to OTHER");
//         setUserCountry("OTHER");
//         setActivePlanIndex(0);
//       }
//     };

//     detectCountry();
//   }, []);

//   const handleBuyNow = (plan: "US" | "UK") => {
//     // In future, pass `plan` to your checkout logic
//     navigate("/signup");
//   };

//   const openTermsModal = () => setShowTermsModal(true);
//   const closeTermsModal = () => setShowTermsModal(false);

//   const companies = [
//     "Amazon",
//     "Meta",
//     "EY",
//     "Revolut",
//     "Accenture",
//     "HubSpot",
//     "Adobe",
//     "Tesla",
//     "Coca-Cola",
//   ];

//   const testimonials = [
//     {
//       name: "Sarah Chen",
//       role: "Software Engineer",
//       company: "Meta",
//       avatar: "👩‍💻",
//       quote:
//         "Network Note helped me stand out from 200+ applicants. I got 3 interview requests within a week!",
//       rating: 5,
//     },
//     {
//       name: "Marcus Johnson",
//       role: "Product Manager",
//       company: "Amazon",
//       avatar: "👨‍💼",
//       quote:
//         "The video resume format let me showcase my personality. Recruiters loved it and I landed my dream job.",
//       rating: 5,
//     },
//     {
//       name: "Priya Patel",
//       role: "UX Designer",
//       company: "Adobe",
//       avatar: "👩‍🎨",
//       quote:
//         "I was skeptical at first, but Network Note completely transformed my job search. Highly recommend!",
//       rating: 5,
//     },
//   ];

//   const faqs = [
//     {
//       q: "How do I create my first Network Note?",
//       a: "Simply sign up for free, upload your resume, record a 60-90 second video pitch, and share it with recruiters. Our platform guides you through each step.",
//     },
//     {
//       q: "Can I re-record my video?",
//       a: "Absolutely! You can record as many takes as you need until you're happy with your video pitch.",
//     },
//     {
//       q: "What file formats are supported?",
//       a: "We support PDF and DOCX for resumes, and MP4, MOV, and WEBM for video files.",
//     },
//     {
//       q: "How secure is my data?",
//       a: "Your data is encrypted and stored securely. We never share your information without your explicit permission.",
//     },
//     {
//       q: "Is Network Note really free?",
//       a: "Yes! Our basic plan is completely free. Premium features are available for advanced users.",
//     },
//     {
//       q: "How long should my video be?",
//       a: "We recommend 60-90 seconds. This is enough time to make an impact without losing the recruiter's attention.",
//     },
//   ];

//   return (
//     <div
//       ref={mainRef}
//       className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-foreground overflow-x-hidden"
//     >
//       {/* Sticky Glass Header */}
//       <motion.header
//         className="sticky top-0 z-50 border-b border-border/50 bg-white/80 shadow-sm"
//         style={{
//           backdropFilter: useTransform(headerBlur, (v) => `blur(${v}px)`),
//         }}
//       >
//         <div className="max-w-[1440px] mx-auto px-8 lg:px-20 py-4">
//           <div className="flex items-center justify-between">
//             {/* Logo + Branding */}
//             <div
//               className="flex items-center gap-2 cursor-pointer"
//               onClick={() => navigate("/")}
//             >
//               <div>
//                 <img
//                   src="/images/networknote_final_logo_1 (2).jpg"
//                   alt="Network Note Logo"
//                   className="h-8 w-8 rounded-lg"
//                 />
//               </div>
//               <span className="text-xl font-bold text-[#000000] font-noto">
//                 NetworkNote
//               </span>
//             </div>

//             {/* Navigation */}
//             <nav className="hidden md:flex items-center gap-8">
//               {["Solutions", "Resources", "Company", "Pricing"].map((item) => (
//                 <a
//                   key={item}
//                   href={`#${item.toLowerCase()}`}
//                   className="text-muted-foreground hover:text-foreground transition-colors relative group font-medium"
//                 >
//                   {item}
//                   <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] group-hover:w-full transition-all duration-300" />
//                 </a>
//               ))}
//             </nav>

//             {/* Right Action Buttons */}
//             <div className="flex items-center gap-3">
//               <Button
//                 variant="outline"
//                 className="border-border text-gray-700 hover:border-cyan-400 hover:text-cyan-600 hover:bg-cyan-50 transition-all"
//                 onClick={() => navigate("/auth")}
//               >
//                 Login
//               </Button>

//               <Button
//                 className="bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] text-white font-semibold hover:shadow-lg hover:scale-105 transition-all px-5 py-2"
//                 onClick={() => navigate("/auth")}
//               >
//                 {isAuthenticated ? "Dashboard" : "Get Started"}
//               </Button>
//             </div>
//           </div>
//         </div>
//       </motion.header>

//       {/* Hero Section */}
//       <section className="relative py-20 lg:py-32">
//         <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
//           <div className="grid lg:grid-cols-2 gap-12 items-center">
//             <motion.div
//               initial={{ opacity: 0, x: -50 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.8 }}
//             >
//               <h1 className="text-5xl lg:text-7xl font-black tracking-tight mb-6 leading-tight text-gray-900">
//                 <TypeAnimation
//                   sequence={["YOUR NETWORK NOTE.", 1000]}
//                   speed={0.2 as any}
//                   repeat={0}
//                   cursor={true}
//                   className="text-gray-900"
//                 />
//               </h1>

//               <p className="text-lg text-muted-foreground mb-6 leading-relaxed max-w-xl">
//                 Network Note helps you stand out and land interviews by creating
//                 personalized video resumes that build instant connections with
//                 recruiters.
//               </p>

//               <Button
//                 size="lg"
//                 className="bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] text-white hover:shadow-xl hover:scale-105 transition-all text-lg px-8"
//                 onClick={() => navigate("/auth")}
//               >
//                 Sign up for free
//                 <ArrowRight className="ml-2 h-5 w-5" />
//               </Button>
//             </motion.div>

//             <motion.div
//               initial={{ opacity: 0, x: 50 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.8, delay: 0.2 }}
//               className="relative"
//             >
//               <div className="relative rounded-2xl overflow-hidden backdrop-blur-xl bg-white/80 border border-border shadow-2xl p-8">
//                 <div className="aspect-video bg-gradient-to-br from-slate-100 to-cyan-50 rounded-xl flex items-center justify-center relative overflow-hidden border border-border shadow-lg">
//                   <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-cyan-400/10 z-10 pointer-events-none" />
//                   <video
//                     src="/videos/demo.mp4"
//                     autoPlay
//                     muted
//                     loop
//                     playsInline
//                     className="absolute inset-0 w-full h-full object-cover rounded-xl"
//                   >
//                     Your browser does not support the video tag.
//                   </video>
//                 </div>
//               </div>
//               <div className="absolute -bottom-4 -right-4 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl -z-10" />
//             </motion.div>
//           </div>
//         </div>
//       </section>

//       {/* Dashboard Preview */}
//       <section className="py-20">
//         <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
//           <motion.div
//             initial={{ opacity: 0, y: 50 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.8 }}
//             className="relative rounded-3xl overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10 p-8 lg:p-12"
//           >
//             <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
//               <div className="flex-1">
//                 <h2 className="text-3xl font-bold mb-4">Your Dashboard</h2>
//                 <p className="text-slate-600">
//                   Manage all your Network Notes in one place
//                 </p>
//               </div>
//               <Button
//                 size="lg"
//                 className="bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] text-black hover:shadow-[0_0_30px_rgba(132,204,22,0.5)] transition-all font-semibold"
//                 onClick={() => navigate("/auth")}
//               >
//                 <Plus className="mr-2 h-5 w-5" />
//                 New Network Note
//               </Button>
//             </div>
//             <div
//               className="mt-8 aspect-video rounded-xl border border-white/10 bg-cover bg-center bg-no-repeat shadow-lg"
//               style={{
//                 backgroundImage: "url('/images/image.png')",
//                 backgroundSize: "100%",
//               }}
//             />
//           </motion.div>
//         </div>
//       </section>

//       {/* Featured In */}
//       <section className="py-16 backdrop-blur-xl bg-white/5 border-y border-white/10">
//         <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
//           <motion.div
//             initial={{ opacity: 0 }}
//             whileInView={{ opacity: 1 }}
//             viewport={{ once: true }}
//             className="text-center mb-12"
//           >
//             <h3 className="text-2xl font-bold mb-2">
//               Over 200 candidates have landed interviews globally through
//               Network Note
//             </h3>
//           </motion.div>
//           <div className="relative overflow-hidden">
//             <motion.div
//               className="flex gap-12 items-center"
//               animate={{ x: [0, -1000] }}
//               transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
//             >
//               {[...companies, ...companies].map((company, i) => (
//                 <div
//                   key={i}
//                   className="text-2xl font-bold text-slate-400 whitespace-nowrap"
//                 >
//                   {company}
//                 </div>
//               ))}
//             </motion.div>
//           </div>
//         </div>
//       </section>

//       {/* Value Proposition */}
//       <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
//         <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
//           <div className="grid lg:grid-cols-2 gap-12 items-center">
//             <motion.div
//               initial={{ opacity: 0, x: -50 }}
//               whileInView={{ opacity: 1, x: 0 }}
//               viewport={{ once: true }}
//             >
//               <h2 className="text-4xl lg:text-5xl font-black mb-6 leading-tight text-white">
//                 GET HIRED FASTER WITH A PERSONALIZED VIDEO RESUME
//               </h2>
//               <p className="text-slate-300 text-lg">
//                 Recruiters skim hundreds of resumes daily — Network Note helps
//                 put your story front and center.
//               </p>
//             </motion.div>

//             <div className="grid gap-6">
//               {[
//                 {
//                   title: "Highlight your key skills",
//                   desc: "Showcase what makes you unique",
//                 },
//                 {
//                   title: "Stand out from other applicants",
//                   desc: "Be memorable in a sea of resumes",
//                 },
//                 {
//                   title: "Build instant connections",
//                   desc: "Let your personality shine through",
//                 },
//               ].map((item, i) => (
//                 <motion.div
//                   key={i}
//                   initial={{ opacity: 0, y: 20 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   viewport={{ once: true }}
//                   transition={{ delay: i * 0.1 }}
//                   whileHover={{
//                     scale: 1.02,
//                     boxShadow: "0 0 30px rgba(132,204,22,0.3)",
//                   }}
//                   className="p-6 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 cursor-pointer transition-all"
//                 >
//                   <h3 className="text-xl font-bold mb-2 text-white">
//                     {item.title.split(" ").map((word, j, arr) =>
//                       j === arr.length - 2 ? (
//                         <span key={j} className="text-lime-400">
//                           {word}{" "}
//                         </span>
//                       ) : (
//                         word + " "
//                       )
//                     )}
//                   </h3>
//                   <p className="text-slate-300">{item.desc}</p>
//                 </motion.div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* STEP #1 */}
//       <section className="py-20 bg-white">
//         <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
//           <motion.div
//             initial={{ opacity: 0 }}
//             whileInView={{ opacity: 1 }}
//             viewport={{ once: true }}
//             className="grid lg:grid-cols-2 gap-12 items-center"
//           >
//             <Card className="backdrop-blur-xl bg-slate-50 border-slate-200">
//               <CardContent className="p-8">
//                 <div className="space-y-4">
//                   <Input
//                     placeholder="First Name"
//                     className="bg-white border-slate-300 text-slate-900"
//                   />
//                   <Input
//                     placeholder="Last Name"
//                     className="bg-white border-slate-300 text-slate-900"
//                   />
//                   <Input
//                     placeholder="Email"
//                     type="email"
//                     className="bg-white border-slate-300 text-slate-900"
//                   />
//                   <Input
//                     placeholder="Password"
//                     type="password"
//                     className="bg-white border-slate-300 text-slate-900"
//                   />
//                   <Input
//                     placeholder="Confirm Password"
//                     type="password"
//                     className="bg-white border-slate-300 text-slate-900"
//                   />
//                 </div>
//               </CardContent>
//             </Card>

//             <div>
//               <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] text-white font-bold mb-4">
//                 STEP #1
//               </div>
//               <h2 className="text-4xl font-black mb-6 text-slate-900">
//                 Create your Network Note account for free
//               </h2>
//               <div className="space-y-3">
//                 <div className="flex items-start gap-3">
//                   <CheckCircle2 className="h-6 w-6 text-lime-500 flex-shrink-0 mt-1" />
//                   <p className="text-slate-700">
//                     Create your free account in seconds
//                   </p>
//                 </div>
//                 <div className="flex items-start gap-3">
//                   <CheckCircle2 className="h-6 w-6 text-lime-500 flex-shrink-0 mt-1" />
//                   <p className="text-slate-700">
//                     Start personalizing your video resume
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {/* STEP #2 */}
//       <section className="py-20 bg-slate-50">
//         <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
//           <motion.div
//             initial={{ opacity: 0 }}
//             whileInView={{ opacity: 1 }}
//             viewport={{ once: true }}
//             className="grid lg:grid-cols-2 gap-12 items-center"
//           >
//             <div>
//               <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] text-white font-bold mb-4">
//                 STEP #2
//               </div>
//               <h2 className="text-4xl font-black mb-6 text-slate-900">
//                 Upload your resume to the platform
//               </h2>
//               <div className="space-y-3">
//                 <div className="flex items-start gap-3">
//                   <CheckCircle2 className="h-6 w-6 text-lime-500 flex-shrink-0 mt-1" />
//                   <p className="text-slate-700">
//                     Upload your traditional resume
//                   </p>
//                 </div>
//                 <div className="flex items-start gap-3">
//                   <CheckCircle2 className="h-6 w-6 text-lime-500 flex-shrink-0 mt-1" />
//                   <p className="text-slate-700">
//                     Build the foundation for your Network Note
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <Card className="backdrop-blur-xl bg-white border-slate-200">
//               <CardContent className="p-12 text-center">
//                 <Upload className="h-16 w-16 from-[#0B4F6C] to-[#159A9C] mx-auto mb-4" />
//                 <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 mb-4">
//                   <p className="text-slate-600">
//                     Drag & drop your resume here
//                   </p>
//                   <p className="text-slate-400 text-sm mt-2">PDF or DOCX</p>
//                 </div>
//                 <Button className="bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] text-white w-full hover:shadow-lg">
//                   Next Step
//                 </Button>
//               </CardContent>
//             </Card>
//           </motion.div>
//         </div>
//       </section>

//       {/* STEP #3 */}
//       <section className="py-20 bg-white">
//         <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
//           <motion.div
//             initial={{ opacity: 0 }}
//             whileInView={{ opacity: 1 }}
//             viewport={{ once: true }}
//             className="grid lg:grid-cols-2 gap-12 items-center"
//           >
//             <Card className="backdrop-blur-xl bg-slate-50 border-slate-200">
//               <CardContent className="p-8">
//                 <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center relative">
//                   <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/20 px-3 py-1 rounded-full border border-red-400">
//                     <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
//                     <span className="text-red-400 text-xs font-bold">REC</span>
//                   </div>
//                   <Video className="h-16 w-16 text-slate-400" />
//                 </div>
//               </CardContent>
//             </Card>

//             <div>
//               <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] text-white font-bold mb-4">
//                 STEP #3
//               </div>
//               <h2 className="text-4xl font-black mb-6 text-slate-900">
//                 Record or attach a video pitch
//               </h2>
//               <div className="space-y-3">
//                 <div className="flex items-start gap-3">
//                   <CheckCircle2 className="h-6 w-6 text-lime-500 flex-shrink-0 mt-1" />
//                   <p className="text-slate-700">Record a 60–90 second video</p>
//                 </div>
//                 <div className="flex items-start gap-3">
//                   <CheckCircle2 className="h-6 w-6 text-lime-500 flex-shrink-0 mt-1" />
//                   <p className="text-slate-700">
//                     Use our tools to perfect your pitch
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {/* STEP #4 */}
//       <section className="py-20 bg-slate-50">
//         <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
//           <motion.div
//             initial={{ opacity: 0 }}
//             whileInView={{ opacity: 1 }}
//             viewport={{ once: true }}
//             className="grid lg:grid-cols-2 gap-12 items-center"
//           >
//             <div>
//               <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] text-white font-bold mb-4">
//                 STEP #4
//               </div>
//               <h2 className="text-4xl font-black mb-6 text-slate-900">
//                 Share your Network Note with recruiters
//               </h2>
//               <div className="space-y-3">
//                 <div className="flex items-start gap-3">
//                   <CheckCircle2 className="h-6 w-6 text-lime-500 flex-shrink-0 mt-1" />
//                   <p className="text-slate-700">
//                     Make sure your Network Note looks great
//                   </p>
//                 </div>
//                 <div className="flex items-start gap-3">
//                   <CheckCircle2 className="h-6 w-6 text-lime-500 flex-shrink-0 mt-1" />
//                   <p className="text-slate-700">
//                     Send your Network Note to recruiters
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <Card className="backdrop-blur-xl bg-white border-slate-200">
//               <CardContent className="p-8">
//                 <div className="space-y-4">
//                   <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
//                     <p className="text-sm text-slate-500 mb-2">
//                       To: recruiter@company.com
//                     </p>
//                     <p className="text-slate-700 mb-3">
//                       Hi, I'd love to share my Network Note with you...
//                     </p>
//                     <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-50 to-cyan-100 border border-cyan-300">
//                       <p className="text-cyan-700 text-sm font-semibold">
//                         🎥 View My Network Note
//                       </p>
//                     </div>
//                   </div>
//                   <Button className="bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] text-white w-full hover:shadow-lg">
//                     <Share2 className="mr-2 h-4 w-4" />
//                     Send Network Note
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           </motion.div>
//         </div>
//       </section>

//       {/* 🔥 PRICING – CAROUSEL FOR US & UK */}
// {/* <section id="pricing" className="py-24 bg-gray-50">
//   <div className="container mx-auto px-6">
//     <p className="text-center text-sm font-bold tracking-wider uppercase text-purple-700">
//       Pricing
//     </p>
//     <motion.h2
//       variants={slideUp}
//       initial="hidden"
//       whileInView="visible"
//       viewport={{ once: true, amount: 0.3 }}
//       custom={0}
//       className="text-4xl font-bold text-center mb-20"
//     >
//       Simple one-time pricing
//     </motion.h2>

//     <motion.div
//       variants={slideUp}
//       initial="hidden"
//       whileInView="visible"
//       viewport={{ once: true, amount: 0.3 }}
//       custom={1}
//       className="max-w-md mx-auto"
//     >
//       <div className="relative">
//         {/* Layered cards container */}
//         {/* <div className="relative h-[420px]">
//           {/* US Plan Card */}
//           {/* <motion.div
//             className="absolute inset-0"
//             animate={
//               activePlanIndex === 0
//                 ? {
//                     scale: 1,
//                     x: 0,
//                     y: 0,
//                     opacity: 1,
//                     zIndex: 20,
//                   }
//                 : {
//                     scale: 0.9,
//                     x: -80,
//                     y: 30,
//                     opacity: 0.7,
//                     zIndex: 10,
//                   }
//             }
//             transition={{ duration: 0.4, ease: "easeInOut" }}
//           >
//             <div className={cardClass}>
//               <div className={glow} />
//               <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl p-8 text-white overflow-hidden shadow-xl">
//                 <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10" />
//                 <div className="relative">
//                   <div className="flex items-center justify-between mb-2">
//                     <h3 className="text-xl font-semibold text-gray-300">
//                       Lifetime Access (US)
//                     </h3>
//                     {userCountry === "US" && (
//                       <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-600/80">
//                         Recommended
//                       </span>
//                     )}
//                   </div>
//                   <div className="mb-6">
//                     <span className="text-4xl font-bold">$12.99</span>
//                     <span className="text-gray-400 ml-2">/lifetime</span>
//                   </div>
//                   <ul className="space-y-3 mb-8">
//                     <li className="flex items-center gap-3">
//                       <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
//                         <span className="text-white text-xs">✓</span>
//                       </div>
//                       <span>Access 150+ verified companies</span>
//                     </li>
//                     <li className="flex items-center gap-3">
//                       <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
//                         <span className="text-white text-xs">✓</span>
//                       </div>
//                       <span>Company names, domains & career links</span>
//                     </li>
//                     <li className="flex items-center gap-3">
//                       <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
//                         <span className="text-white text-xs">✓</span>
//                       </div>
//                       <span>Weekly list updates included</span>
//                     </li>
//                     <li className="flex items-center gap-3">
//                       <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
//                         <span className="text-white text-xs">✓</span>
//                       </div>
//                       <span>Lifetime login, no expiry</span>
//                     </li>
//                   </ul>
//                   <button
//                     onClick={() => handleBuyNow("US")}
//                     className="w-full bg-blue-700 text-white py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
//                   >
//                     Buy Now (USD)
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </motion.div> */}

//           {/* UK Plan Card */}
//           {/* <motion.div
//             className="absolute inset-0"
//             animate={
//               activePlanIndex === 1
//                 ? {
//                     scale: 1,
//                     x: 0,
//                     y: 0,
//                     opacity: 1,
//                     zIndex: 20,
//                   }
//                 : {
//                     scale: 0.9,
//                     x: 80,
//                     y: 30,
//                     opacity: 0.7,
//                     zIndex: 10,
//                   }
//             }
//             transition={{ duration: 0.4, ease: "easeInOut" }}
//           >
//             <div className={cardClass}>
//               <div className={glow} />
//               <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl p-8 text-white overflow-hidden shadow-xl">
//                 <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10" />
//                 <div className="relative">
//                   <div className="flex items-center justify-between mb-2">
//                     <h3 className="text-xl font-semibold text-gray-300">
//                       Lifetime Access (UK)
//                     </h3>
//                     {userCountry === "GB" && (
//                       <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-600/80">
//                         Recommended
//                       </span>
//                     )}
//                   </div>
//                   <div className="mb-6">
//                     <span className="text-4xl font-bold">£12.99</span>
//                     <span className="text-gray-400 ml-2">/lifetime</span>
//                   </div>
//                   <ul className="space-y-3 mb-8">
//                     <li className="flex items-center gap-3">
//                       <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
//                         <span className="text-white text-xs">✓</span>
//                       </div>
//                       <span>Access 150+ verified companies</span>
//                     </li>
//                     <li className="flex items-center gap-3">
//                       <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
//                         <span className="text-white text-xs">✓</span>
//                       </div>
//                       <span>Company names, domains & career links</span>
//                     </li>
//                     <li className="flex items-center gap-3">
//                       <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
//                         <span className="text-white text-xs">✓</span>
//                       </div>
//                       <span>Weekly list updates included</span>
//                     </li>
//                     <li className="flex items-center gap-3">
//                       <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
//                         <span className="text-white text-xs">✓</span>
//                       </div>
//                       <span>Lifetime login, no expiry</span>
//                     </li>
//                   </ul>
//                   <button
//                     onClick={() => handleBuyNow("UK")}
//                     className="w-full bg-blue-700 text-white py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
//                   >
//                     Buy Now (GBP)
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         </div>  */}

//         {/* Dots / controls */}
//         {/* <div className="flex justify-center gap-3 mt-6">
//           <button
//             type="button"
//             onClick={() => setActivePlanIndex(0)}
//             className={`h-2.5 w-2.5 rounded-full transition-all ${
//               activePlanIndex === 0
//                 ? "bg-blue-600 w-6"
//                 : "bg-gray-400 hover:bg-gray-500"
//             }`}
//           />
//           <button
//             type="button"
//             onClick={() => setActivePlanIndex(1)}
//             className={`h-2.5 w-2.5 rounded-full transition-all ${
//               activePlanIndex === 1
//                 ? "bg-blue-600 w-6"
//                 : "bg-gray-400 hover:bg-gray-500"
//             }`}
//           />
//         </div> */}

//         {/* Terms link */}
//         {/* <p className="mt-6 text-xs text-gray-500 text-center">
//           By proceeding, you agree to our{" "}
//           <button
//             type="button"
//             onClick={openTermsModal}
//             className="underline hover:text-blue-600"
//           >
//             Terms &amp; Conditions
//           </button>
//           .
//         </p>
//       </div>
//     </motion.div>
//   </div>
// </section>  */}

























// <section id="pricing" className="py-24 bg-gray-50">
//   <div className="container mx-auto px-6">
//     <p className="text-center text-sm font-bold tracking-wider uppercase text-purple-700">
//       Pricing
//     </p>
//     <motion.h2
//       variants={slideUp}
//       initial="hidden"
//       whileInView="visible"
//       viewport={{ once: true, amount: 0.3 }}
//       custom={0}
//       className="text-4xl font-bold text-center mb-20"
//     >
//       Simple one-time pricing
//     </motion.h2>

//     <motion.div
//       variants={slideUp}
//       initial="hidden"
//       whileInView="visible"
//       viewport={{ once: true, amount: 0.3 }}
//       custom={1}
//       className="max-w-md mx-auto"
//     >
//       <div className="relative overflow-visible">
//         {/* ===== US ONLY ===== */}
//         {userCountry === "US" && (
//           <div className="relative h-[420px] overflow-visible">
//             <div className={cardClass}>
//               <div className={glow} />
//               <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl p-8 text-white overflow-hidden shadow-xl">
//                 <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10" />
//                 <div className="relative">
//                   <div className="flex items-center justify-between mb-2">
//                     <h3 className="text-xl font-semibold text-gray-300">
//                       Lifetime Access (US)
//                     </h3>
//                     <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-600/80">
//                       Recommended
//                     </span>
//                   </div>
//                   <div className="mb-6">
//                     <span className="text-4xl font-bold">$12.99</span>
//                     <span className="text-gray-400 ml-2">/lifetime</span>
//                   </div>
//                   <ul className="space-y-3 mb-8">
//                     <li className="flex items-center gap-3">
//                       <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
//                         <span className="text-white text-xs">✓</span>
//                       </div>
//                       <span>Access 150+ verified companies</span>
//                     </li>
//                     <li className="flex items-center gap-3">
//                       <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
//                         <span className="text-white text-xs">✓</span>
//                       </div>
//                       <span>Company names, domains & career links</span>
//                     </li>
//                     <li className="flex items-center gap-3">
//                       <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
//                         <span className="text-white text-xs">✓</span>
//                       </div>
//                       <span>Weekly list updates included</span>
//                     </li>
//                     <li className="flex items-center gap-3">
//                       <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
//                         <span className="text-white text-xs">✓</span>
//                       </div>
//                       <span>Lifetime login, no expiry</span>
//                     </li>
//                   </ul>
//                   <button
//                     onClick={() => handleBuyNow("US")}
//                     className="w-full bg-blue-700 text-white py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
//                   >
//                     Buy Now (USD)
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ===== UK ONLY ===== */}
//         {userCountry === "GB" && (
//           <div className="relative h-[420px] overflow-visible">
//             <div className={cardClass}>
//               <div className={glow} />
//               <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl p-8 text-white overflow-hidden shadow-xl">
//                 <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10" />
//                 <div className="relative">
//                   <div className="flex items-center justify-between mb-2">
//                     <h3 className="text-xl font-semibold text-gray-300">
//                       Lifetime Access (UK)
//                     </h3>
//                     <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-600/80">
//                       Recommended
//                     </span>
//                   </div>
//                   <div className="mb-6">
//                     <span className="text-4xl font-bold">£12.99</span>
//                     <span className="text-gray-400 ml-2">/lifetime</span>
//                   </div>
//                   <ul className="space-y-3 mb-8">
//                     <li className="flex items-center gap-3">
//                       <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
//                         <span className="text-white text-xs">✓</span>
//                       </div>
//                       <span>Access 150+ verified companies</span>
//                     </li>
//                     <li className="flex items-center gap-3">
//                       <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
//                         <span className="text-white text-xs">✓</span>
//                       </div>
//                       <span>Company names, domains & career links</span>
//                     </li>
//                     <li className="flex items-center gap-3">
//                       <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
//                         <span className="text-white text-xs">✓</span>
//                       </div>
//                       <span>Weekly list updates included</span>
//                     </li>
//                     <li className="flex items-center gap-3">
//                       <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
//                         <span className="text-white text-xs">✓</span>
//                       </div>
//                       <span>Lifetime login, no expiry</span>
//                     </li>
//                   </ul>
//                   <button
//                     onClick={() => handleBuyNow("UK")}
//                     className="w-full bg-blue-700 text-white py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
//                   >
//                     Buy Now (GBP)
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ===== OTHER COUNTRIES → old 2-card carousel with chevrons ===== */}
//         {userCountry === "OTHER" && (
//           <>
//             <div className="relative h-[420px] overflow-visible">
//               {/* US Plan Card */}
//               <motion.div
//                 className="absolute inset-0"
//                 animate={
//                   activePlanIndex === 0
//                     ? {
//                         scale: 1,
//                         x: 0,
//                         y: 0,
//                         opacity: 1,
//                         zIndex: 20,
//                       }
//                     : {
//                         scale: 0.9,
//                         x: -140,
//                         y: 30,
//                         opacity: 0.7,
//                         zIndex: 10,
//                       }
//                 }
//                 transition={{ duration: 0.4, ease: "easeInOut" }}
//               >
//                 <div className={cardClass}>
//                   <div className={glow} />
//                   <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl p-8 text-white overflow-hidden shadow-xl">
//                     <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10" />
//                     <div className="relative">
//                       <div className="flex items-center justify-between mb-2">
//                         <h3 className="text-xl font-semibold text-gray-300">
//                           Lifetime Access (US)
//                         </h3>
//                       </div>
//                       <div className="mb-6">
//                         <span className="text-4xl font-bold">$12.99</span>
//                         <span className="text-gray-400 ml-2">/lifetime</span>
//                       </div>
//                       <ul className="space-y-3 mb-8">
//                         <li className="flex items-center gap-3">
//                           <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
//                             <span className="text-white text-xs">✓</span>
//                           </div>
//                           <span>Access 150+ verified companies</span>
//                         </li>
//                         <li className="flex items-center gap-3">
//                           <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
//                             <span className="text-white text-xs">✓</span>
//                           </div>
//                           <span>Company names, domains & career links</span>
//                         </li>
//                         <li className="flex items-center gap-3">
//                           <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
//                             <span className="text-white text-xs">✓</span>
//                           </div>
//                           <span>Weekly list updates included</span>
//                         </li>
//                         <li className="flex items-center gap-3">
//                           <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
//                             <span className="text-white text-xs">✓</span>
//                           </div>
//                           <span>Lifetime login, no expiry</span>
//                         </li>
//                       </ul>
//                       <button
//                         onClick={() => handleBuyNow("US")}
//                         className="w-full bg-blue-700 text-white py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
//                       >
//                         Buy Now (USD)
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>

//               {/* UK Plan Card */}
//               <motion.div
//                 className="absolute inset-0"
//                 animate={
//                   activePlanIndex === 1
//                     ? {
//                         scale: 1,
//                         x: 0,
//                         y: 0,
//                         opacity: 1,
//                         zIndex: 20,
//                       }
//                     : {
//                         scale: 0.9,
//                         x: 140,
//                         y: 30,
//                         opacity: 0.7,
//                         zIndex: 10,
//                       }
//                 }
//                 transition={{ duration: 0.4, ease: "easeInOut" }}
//               >
//                 <div className={cardClass}>
//                   <div className={glow} />
//                   <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl p-8 text-white overflow-hidden shadow-xl">
//                     <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10" />
//                     <div className="relative">
//                       <div className="flex items-center justify-between mb-2">
//                         <h3 className="text-xl font-semibold text-gray-300">
//                           Lifetime Access (UK)
//                         </h3>
//                       </div>
//                       <div className="mb-6">
//                         <span className="text-4xl font-bold">£12.99</span>
//                         <span className="text-gray-400 ml-2">/lifetime</span>
//                       </div>
//                       <ul className="space-y-3 mb-8">
//                         <li className="flex items-center gap-3">
//                           <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
//                             <span className="text-white text-xs">✓</span>
//                           </div>
//                           <span>Access 150+ verified companies</span>
//                         </li>
//                         <li className="flex items-center gap-3">
//                           <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
//                             <span className="text-white text-xs">✓</span>
//                           </div>
//                           <span>Company names, domains & career links</span>
//                         </li>
//                         <li className="flex items-center gap-3">
//                           <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
//                             <span className="text-white text-xs">✓</span>
//                           </div>
//                           <span>Weekly list updates included</span>
//                         </li>
//                         <li className="flex items-center gap-3">
//                           <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
//                             <span className="text-white text-xs">✓</span>
//                           </div>
//                           <span>Lifetime login, no expiry</span>
//                         </li>
//                       </ul>
//                       <button
//                         onClick={() => handleBuyNow("UK")}
//                         className="w-full bg-blue-700 text-white py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
//                       >
//                         Buy Now (GBP)
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
//             </div>

//             {/* Chevron controls only when BOTH cards are visible */}
//             <div className="flex justify-center items-center gap-6 mt-6">
//               <button
//                 type="button"
//                 onClick={() => setActivePlanIndex(0)}
//                 className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition-all shadow-md"
//               >
//                 <ChevronLeft className="h-6 w-6 text-gray-700" />
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setActivePlanIndex(1)}
//                 className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition-all shadow-md"
//               >
//                 <ChevronRight className="h-6 w-6 text-gray-700" />
//               </button>
//             </div>
//           </>
//         )}

//         {/* Terms link (always visible) */}
//         <p className="mt-6 text-xs text-gray-500 text-center">
//           By proceeding, you agree to our{" "}
//           <button
//             type="button"
//             onClick={openTermsModal}
//             className="underline hover:text-blue-600"
//           >
//             Terms &amp; Conditions
//           </button>
//           .
//         </p>
//       </div>
//     </motion.div>
//   </div>
// </section>




//       {/* Feature Grid */}
//       <section
//         id="solutions"
//         className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
//       >
//         <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             className="text-center mb-16"
//           >
//             <h2 className="text-4xl lg:text-5xl font-black mb-6 text-white">
//               BUILT TO HELP JOB SEEKERS STAND OUT
//             </h2>
//             <p className="text-slate-300 text-lg max-w-3xl mx-auto">
//               Create video resumes that reflect your individuality, customize
//               them for specific roles, and use insights to enhance your job
//               search — all in one intuitive platform.
//             </p>
//           </motion.div>

//           <div className="grid md:grid-cols-2 gap-8">
//             {[
//               {
//                 icon: Sparkles,
//                 title: "Create your video pitch in seconds",
//                 desc: "AI-powered pitch tool helps you craft the perfect message",
//                 color: "from-purple-500 to-pink-500",
//               },
//               {
//                 icon: Video,
//                 title: "Record with in-app teleprompter",
//                 desc: "Never forget what to say with our built-in teleprompter",
//                 color: "from-blue-500 to-cyan-500",
//               },
//               {
//                 icon: BarChart3,
//                 title: "View insights on engagement",
//                 desc: "Track views, applications, and recruiter interest",
//                 color: "from-green-500 to-emerald-500",
//               },
//               {
//                 icon: Share2,
//                 title: "Easily integrate with job platforms",
//                 desc: "Share directly to LinkedIn, Indeed, and ZipRecruiter",
//                 color: "from-orange-500 to-red-500",
//               },
//             ].map((feature, i) => (
//               <motion.div
//                 key={i}
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: i * 0.1 }}
//                 whileHover={{
//                   scale: 1.05,
//                   boxShadow: "0 0 40px rgba(6,182,212,0.4)",
//                   y: -8,
//                 }}
//                 className="p-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 cursor-pointer transition-all group"
//               >
//                 <div
//                   className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
//                 >
//                   <feature.icon className="h-7 w-7 text-white" />
//                 </div>
//                 <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-cyan-400 transition-colors">
//                   {feature.title}
//                 </h3>
//                 <p className="text-slate-300">{feature.desc}</p>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Testimonials */}
//       <section className="py-20 bg-white">
//         <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
//           <motion.div
//             initial={{ opacity: 0 }}
//             whileInView={{ opacity: 1 }}
//             viewport={{ once: true }}
//             className="text-center mb-16"
//           >
//             <h2 className="text-4xl lg:text-5xl font-black mb-4 text-slate-900">
//               HOW NETWORK NOTE HELPED JOB SEEKERS GET HIRED
//             </h2>
//           </motion.div>

//           <div className="grid md:grid-cols-3 gap-8">
//             {testimonials.map((testimonial, i) => (
//               <motion.div
//                 key={i}
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: i * 0.1 }}
//                 whileHover={{
//                   y: -8,
//                   boxShadow: "0 0 30px rgba(6,182,212,0.3)",
//                 }}
//                 className="p-8 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer transition-all"
//               >
//                 <div className="text-5xl mb-4">{testimonial.avatar}</div>
//                 <div className="flex gap-1 mb-4">
//                   {[...Array(testimonial.rating)].map((_, j) => (
//                     <Star
//                       key={j}
//                       className="h-4 w-4 fill-cyan-500 text-cyan-500"
//                     />
//                   ))}
//                 </div>
//                 <p className="text-slate-700 mb-6 italic">
//                   "{testimonial.quote}"
//                 </p>
//                 <div>
//                   <p className="font-bold text-slate-900">
//                     {testimonial.name}
//                   </p>
//                   <p className="text-slate-600 text-sm">
//                     {testimonial.role} at {testimonial.company}
//                   </p>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* FAQ */}
//       <section
//         id="resources"
//         className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
//       >
//         <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
//           <motion.div
//             initial={{ opacity: 0 }}
//             whileInView={{ opacity: 1 }}
//             viewport={{ once: true }}
//             className="text-center mb-16"
//           >
//             <h2 className="text-4xl lg:text-5xl font-black mb-4 text-white">
//               Frequently Asked Questions
//             </h2>
//           </motion.div>

//           <div className="max-w-3xl mx-auto space-y-4">
//             {faqs.map((faq, i) => (
//               <motion.div
//                 key={i}
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: i * 0.05 }}
//                 className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl overflow-hidden hover:border-cyan-400/50 transition-all"
//               >
//                 <button
//                   onClick={() => setOpenFaq(openFaq === i ? null : i)}
//                   className="w-full p-6 flex items-center justify-between text-left"
//                 >
//                   <span className="font-semibold text-white">{faq.q}</span>
//                   <motion.div
//                     animate={{ rotate: openFaq === i ? 180 : 0 }}
//                     transition={{ duration: 0.3 }}
//                   >
//                     {openFaq === i ? (
//                       <Minus className="h-5 w-5 text-cyan-400" />
//                     ) : (
//                       <Plus className="h-5 w-5 text-slate-400" />
//                     )}
//                   </motion.div>
//                 </button>
//                 <motion.div
//                   initial={false}
//                   animate={{ height: openFaq === i ? "auto" : 0 }}
//                   transition={{ duration: 0.3 }}
//                   className="overflow-hidden"
//                 >
//                   <p className="px-6 pb-6 text-slate-300">{faq.a}</p>
//                 </motion.div>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer id="company" className="border-t border-slate-200 bg-slate-50">
//         <div className="max-w-[1440px] mx-auto px-8 lg:px-20 py-16">
//           <div className="grid md:grid-cols-3 gap-12 mb-12">
//             <div>
//               <div className="flex items-center gap-2 mb-4">
//                 <div>
//                   <img
//                     src="/images/networknote_final_logo_1 (2).jpg"
//                     alt="Network Note Logo"
//                     className="h-8 w-8 rounded-lg"
//                   />
//                 </div>
//                 <span className="text-xl font-bold text-[#000000] font-noto">
//                   NetworkNote
//                 </span>
//               </div>
//               <p className="text-slate-600">Your Career, Better.</p>
//             </div>

//             <div>
//               <h4 className="font-bold mb-4 text-slate-900">Quick Links</h4>
//               <div className="space-y-2">
//                 {["Solutions", "Pricing", "Privacy", "Terms", "Careers"].map(
//                   (link) => (
//                     <a
//                       key={link}
//                       href="#"
//                       className="block text-slate-600 hover:text-cyan-600 transition-colors"
//                     >
//                       {link}
//                     </a>
//                   )
//                 )}
//               </div>
//             </div>

//             <div>
//               <h4 className="font-bold mb-4 text-slate-900">Connect</h4>
//               <div className="flex gap-4">
//                 {[
//                   { icon: Linkedin, href: "#" },
//                   { icon: Youtube, href: "#" },
//                   { icon: Twitter, href: "#" },
//                   { icon: Instagram, href: "#" },
//                 ].map((social, i) => (
//                   <motion.a
//                     key={i}
//                     href={social.href}
//                     whileHover={{
//                       scale: 1.2,
//                       boxShadow: "0 0 20px rgba(6,182,212,0.5)",
//                     }}
//                     className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:border-cyan-400 transition-all"
//                   >
//                     <social.icon className="h-5 w-5 text-slate-600" />
//                   </motion.a>
//                 ))}
//               </div>
//             </div>
//           </div>

//           <div className="pt-8 border-t border-slate-200 text-center text-slate-600 text-sm">
//             <p>© 2025 Network Note | All Rights Reserved</p>
//           </div>
//         </div>
//       </footer>

//       {/* ✅ Terms and Conditions Modal */}
//       {showTermsModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="relative mx-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
//             <button
//               onClick={closeTermsModal}
//               className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-6 w-6"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M6 18L18 6M6 6l12 12"
//                 />
//               </svg>
//             </button>

//             <h2 className="text-2xl font-bold text-gray-900 mb-4">
//               Network Note – Terms &amp; Conditions
//             </h2>

//             <div className="text-gray-600 space-y-3">
//               <p className="font-medium">By proceeding, I agree that:</p>

//               <ul className="space-y-2 list-disc list-inside">
//                 <li>
//                   I am purchasing lifetime access to Network Note&apos;s premium
//                   features and resources
//                 </li>
//                 <li>
//                   This is a digital, non-refundable product, no cancellations or
//                   refunds after purchase
//                 </li>
//                 <li>
//                   Job links, company information or career portals shown inside
//                   the product may change over time
//                 </li>
//                 <li>
//                   Sponsorship or job availability depends on each company&apos;s
//                   hiring policy at the time of access
//                 </li>
//                 <li>
//                   Network Note is not a recruitment agency and does not
//                   guarantee any job or sponsorship
//                 </li>
//                 <li>
//                   I will use the platform only for my personal job search
//                   purposes
//                 </li>
//               </ul>

//               <div className="pt-4 mt-4 border-t border-gray-200">
//                 <button
//                   onClick={closeTermsModal}
//                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-300"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// // src/pages/Landing.tsx
// import React, { useEffect, useRef, useState } from "react";
// import { motion, useScroll, useTransform } from "framer-motion";
// import gsap from "gsap";
// import { ScrollToPlugin } from "gsap/ScrollToPlugin";
// import { useNavigate } from "react-router-dom";
// import {
//   ArrowRight,
//   CheckCircle2,
//   Video,
//   Upload,
//   Share2,
//   BarChart3,
//   Sparkles,
//   Star,
//   Linkedin,
//   Youtube,
//   Twitter,
//   Instagram,
//   Plus,
//   Minus,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";
// import { Button } from "../components/ui/button";
// import { Card, CardContent } from "../components/ui/card";
// import { Input } from "../components/ui/input";
// import { useAuthContext } from "../contexts/AuthContext";
// import { TypeAnimation } from "react-type-animation";

// // Developer-supplied asset path (do not change unless you uploaded different file)
// const ASSET_IMAGE = "/mnt/data/ba866d83-dfcd-42fc-a5c0-f6581a9a459e.png";

// // small animation helpers
// const slideUp = {
//   hidden: { opacity: 0, y: 40 },
//   visible: (i = 0) => ({
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.6,
//       delay: i * 0.12,
//       ease: "easeOut",
//     },
//   }),
// };

// const cardClass = "relative rounded-2xl";
// const glow =
//   "pointer-events-none absolute -inset-0.5 bg-gradient-to-r from-blue-500/40 to-purple-600/40 blur-lg opacity-60";

// export default function Landing() {
//   const navigate = useNavigate();
//   const { isAuthenticated } = useAuthContext();

//   // UI / state
//   const mainRef = useRef<HTMLDivElement | null>(null);
//   const { scrollY } = useScroll();
//   const headerBlur = useTransform(scrollY, [0, 100], [10, 25]);

//   const [openFaq, setOpenFaq] = useState<number | null>(null);
//   const [userCountry, setUserCountry] = useState<"US" | "GB" | "OTHER">(
//     "OTHER"
//   );
//   const [activePlanIndex, setActivePlanIndex] = useState(0); // 0 -> left (US), 1 -> right (UK)
//   const [showTermsModal, setShowTermsModal] = useState(false);

//   // sample arrays used elsewhere on page
//   const companies = [
//     "Amazon",
//     "Meta",
//     "EY",
//     "Revolut",
//     "Accenture",
//     "HubSpot",
//     "Adobe",
//     "Tesla",
//     "Coca-Cola",
//   ];

//   const testimonials = [
//     {
//       name: "Sarah Chen",
//       role: "Software Engineer",
//       company: "Meta",
//       avatar: "👩‍💻",
//       quote:
//         "Network Note helped me stand out from 200+ applicants. I got 3 interview requests within a week!",
//       rating: 5,
//     },
//     {
//       name: "Marcus Johnson",
//       role: "Product Manager",
//       company: "Amazon",
//       avatar: "👨‍💼",
//       quote:
//         "The video resume format let me showcase my personality. Recruiters loved it and I landed my dream job.",
//       rating: 5,
//     },
//     {
//       name: "Priya Patel",
//       role: "UX Designer",
//       company: "Adobe",
//       avatar: "👩‍🎨",
//       quote:
//         "I was skeptical at first, but Network Note completely transformed my job search. Highly recommend!",
//       rating: 5,
//     },
//   ];

//   const faqs = [
//     {
//       q: "How do I create my first Network Note?",
//       a: "Simply sign up for free, upload your resume, record a 60-90 second video pitch, and share it with recruiters. Our platform guides you through each step.",
//     },
//     {
//       q: "Can I re-record my video?",
//       a: "Absolutely! You can record as many takes as you need until you're happy with your video pitch.",
//     },
//     {
//       q: "What file formats are supported?",
//       a: "We support PDF and DOCX for resumes, and MP4, MOV, and WEBM for video files.",
//     },
//     {
//       q: "How secure is my data?",
//       a: "Your data is encrypted and stored securely. We never share your information without your explicit permission.",
//     },
//     {
//       q: "Is Network Note really free?",
//       a: "Yes! Our basic plan is completely free. Premium features are available for advanced users.",
//     },
//     {
//       q: "How long should my video be?",
//       a: "We recommend 60-90 seconds. This is enough time to make an impact without losing the recruiter's attention.",
//     },
//   ];

//   // Smooth anchor scrolling setup
//   useEffect(() => {
//     if (mainRef.current) {
//       mainRef.current.style.scrollBehavior = "smooth";
//     }
//   }, []);

//   useEffect(() => {
//     gsap.registerPlugin(ScrollToPlugin);
//     const links = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');

//     const onClick = (e: Event) => {
//       const anchor = e.currentTarget as HTMLAnchorElement;
//       const href = anchor.getAttribute("href") || "";
//       if (!href.startsWith("#")) return;

//       const id = href.slice(1);
//       const target = id ? document.getElementById(id) : null;

//       e.preventDefault();
//       gsap.to(window, {
//         duration: 0.8,
//         ease: "power2.out",
//         scrollTo: target ?? 0,
//       });
//     };

//     links.forEach((a) => a.addEventListener("click", onClick));
//     return () => links.forEach((a) => a.removeEventListener("click", onClick));
//   }, []);

//   // Detect country to control pricing visibility + default active slide
//   useEffect(() => {
//     const detectCountry = async () => {
//       try {
//         const response = await fetch("https://ipapi.co/json/");
//         const data = await response.json();
//         if (data.country_code === "US") {
//           setUserCountry("US");
//           setActivePlanIndex(0);
//         } else if (data.country_code === "GB") {
//           setUserCountry("GB");
//           setActivePlanIndex(1);
//         } else {
//           setUserCountry("OTHER");
//           setActivePlanIndex(0);
//         }
//       } catch (error) {
//         console.warn("Could not detect country:", error);
//         setUserCountry("OTHER");
//         setActivePlanIndex(0);
//       }
//     };

//     detectCountry();
//   }, []);

//   // Navigate to signup with chosen plan/currency/amount
//   const handleBuyNow = (plan: "US" | "UK") => {
//     const isUK = plan === "UK";
//     const amount = isUK ? 12.99 : 12.99;
//     const currency = isUK ? "GBP" : "USD";

//     navigate("/signup", {
//       state: { plan, amount, currency },
//     });
//   };

//   const openTermsModal = () => setShowTermsModal(true);
//   const closeTermsModal = () => setShowTermsModal(false);

//   return (
//     <div
//       ref={mainRef}
//       className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-foreground overflow-x-hidden"
//     >
//       {/* Header */}
//       <motion.header
//         className="sticky top-0 z-50 border-b border-border/50 bg-white/80 shadow-sm"
//         style={{
//           backdropFilter: useTransform(headerBlur, (v) => `blur(${v}px)`),
//         }}
//       >
//         <div className="max-w-[1440px] mx-auto px-8 lg:px-20 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
//               <img src="/images/networknote_final_logo_1 (2).jpg" alt="NetworkNote" className="h-8 w-8 rounded-lg" />
//               <span className="text-xl font-bold text-[#000000] font-noto">NetworkNote</span>
//             </div>

//             <nav className="hidden md:flex items-center gap-8">
//               {["Solutions", "Resources", "Company", "Pricing"].map((item) => (
//                 <a key={item} href={`#${item.toLowerCase()}`} className="text-muted-foreground hover:text-foreground transition-colors relative group font-medium">
//                   {item}
//                   <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] group-hover:w-full transition-all duration-300" />
//                 </a>
//               ))}
//             </nav>

//             <div className="flex items-center gap-3">
//               <Button variant="outline" className="border-border text-gray-700 hover:border-cyan-400 hover:text-cyan-600 hover:bg-cyan-50 transition-all" onClick={() => navigate("/auth")}>
//                 Login
//               </Button>

//               <Button className="bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] text-white font-semibold hover:shadow-lg hover:scale-105 transition-all px-5 py-2" onClick={() => navigate("/signup")}>
//                 {isAuthenticated ? "Dashboard" : "Get Started"}
//               </Button>
//             </div>
//           </div>
//         </div>
//       </motion.header>

//       {/* Hero */}
//       <section className="relative py-20 lg:py-32">
//         <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
//           <div className="grid lg:grid-cols-2 gap-12 items-center">
//             <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
//               <h1 className="text-5xl lg:text-7xl font-black tracking-tight mb-6 leading-tight text-gray-900">
//                 <TypeAnimation sequence={["YOUR NETWORK NOTE.", 1000]} speed={0.2 as any} repeat={0} cursor={true} className="text-gray-900" />
//               </h1>

//               <p className="text-lg text-muted-foreground mb-6 leading-relaxed max-w-xl">
//                 Network Note helps you stand out and land interviews by creating personalized video resumes that build instant connections with recruiters.
//               </p>

//               <Button size="lg" className="bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] text-white hover:shadow-xl hover:scale-105 transition-all text-lg px-8" onClick={() => navigate("/signup")}>
//                 Sign up for free
//                 <ArrowRight className="ml-2 h-5 w-5" />
//               </Button>
//             </motion.div>

//             <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative">
//               <div className="relative rounded-2xl overflow-hidden backdrop-blur-xl bg-white/80 border border-border shadow-2xl p-8">
//                 <div className="aspect-video bg-gradient-to-br from-slate-100 to-cyan-50 rounded-xl flex items-center justify-center relative overflow-hidden border border-border shadow-lg">
//                   <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-cyan-400/10 z-10 pointer-events-none" />
//                   <video src="/videos/demo.mp4" autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover rounded-xl">
//                     Your browser does not support the video tag.
//                   </video>
//                 </div>
//               </div>
//               <div className="absolute -bottom-4 -right-4 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl -z-10" />
//             </motion.div>
//           </div>
//         </div>
//       </section>

//       {/* Dashboard Preview */}
//       <section className="py-20">
//         <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
//           <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative rounded-3xl overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10 p-8 lg:p-12">
//             <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
//               <div className="flex-1">
//                 <h2 className="text-3xl font-bold mb-4">Your Dashboard</h2>
//                 <p className="text-slate-600">Manage all your Network Notes in one place</p>
//               </div>
//               <Button size="lg" className="bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] text-black hover:shadow-[0_0_30px_rgba(132,204,22,0.5)] transition-all font-semibold" onClick={() => navigate("/auth")}>
//                 <Plus className="mr-2 h-5 w-5" /> New Network Note
//               </Button>
//             </div>
//             <div className="mt-8 aspect-video rounded-xl border border-white/10 bg-cover bg-center bg-no-repeat shadow-lg" style={{ backgroundImage: `url('${ASSET_IMAGE}')`, backgroundSize: "100%" }} />
//           </motion.div>
//         </div>
//       </section>

//       {/* Featured In */}
//       <section className="py-16 backdrop-blur-xl bg-white/5 border-y border-white/10">
//         <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
//           <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
//             <h3 className="text-2xl font-bold mb-2">Over 200 candidates have landed interviews globally through Network Note</h3>
//           </motion.div>
//           <div className="relative overflow-hidden">
//             <motion.div className="flex gap-12 items-center" animate={{ x: [0, -1000] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}>
//               {[...companies, ...companies].map((company, i) => (
//                 <div key={i} className="text-2xl font-bold text-slate-400 whitespace-nowrap">
//                   {company}
//                 </div>
//               ))}
//             </motion.div>
//           </div>
//         </div>
//       </section>

//       {/* Value Proposition */}
//       <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
//         <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
//           <div className="grid lg:grid-cols-2 gap-12 items-center">
//             <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
//               <h2 className="text-4xl lg:text-5xl font-black mb-6 leading-tight text-white">GET HIRED FASTER WITH A PERSONALIZED VIDEO RESUME</h2>
//               <p className="text-slate-300 text-lg">Recruiters skim hundreds of resumes daily — Network Note helps put your story front and center.</p>
//             </motion.div>

//             <div className="grid gap-6">
//               {[
//                 { icon: Sparkles, title: "Create your video pitch in seconds", desc: "AI-powered pitch tool helps you craft the perfect message", color: "from-purple-500 to-pink-500" },
//                 { icon: Video, title: "Record with in-app teleprompter", desc: "Never forget what to say with our built-in teleprompter", color: "from-blue-500 to-cyan-500" },
//                 { icon: BarChart3, title: "View insights on engagement", desc: "Track views, applications, and recruiter interest", color: "from-green-500 to-emerald-500" },
//                 { icon: Share2, title: "Easily integrate with job platforms", desc: "Share directly to LinkedIn, Indeed, and ZipRecruiter", color: "from-orange-500 to-red-500" },
//               ].map((feature, i) => (
//                 <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(6,182,212,0.4)", y: -8 }} className="p-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 cursor-pointer transition-all group">
//                   <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
//                     <feature.icon className="h-7 w-7 text-white" />
//                   </div>
//                   <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-cyan-400 transition-colors">{feature.title}</h3>
//                   <p className="text-slate-300">{feature.desc}</p>
//                 </motion.div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* STEP sections omitted for brevity — keep existing content in your app */}

//       {/* 🔥 PRICING */}
//       <section id="pricing" className="py-24 bg-gray-50">
//         <div className="container mx-auto px-6">
//           <p className="text-center text-sm font-bold tracking-wider uppercase text-purple-700">Pricing</p>
//           <motion.h2 variants={slideUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} custom={0} className="text-4xl font-bold text-center mb-20">
//             Simple one-time pricing
//           </motion.h2>

//           <motion.div variants={slideUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} custom={1} className="max-w-md mx-auto">
//             <div className="relative overflow-visible">

//               {/* Pricing layout:
//                   - If userCountry === 'US' -> show only US card
//                   - If userCountry === 'GB' -> show only UK card
//                   - Else show both layered (UK slightly behind)
//               */}
//               <div className="relative h-[420px] overflow-visible">
//                 {/* US Card */}
//                 {(userCountry === "US" || userCountry === "OTHER") && (
//                   <motion.div
//                     className="absolute inset-0"
//                     animate={
//                       activePlanIndex === 0
//                         ? { scale: 1, x: 0, y: 0, opacity: 1, zIndex: 20 }
//                         : { scale: 0.92, x: -110, y: 24, opacity: 0.75, zIndex: 10 }
//                     }
//                     transition={{ duration: 0.45, ease: "easeInOut" }}
//                   >
//                     <div className={cardClass}>
//                       <div className={glow} />
//                       <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl p-8 text-white overflow-hidden shadow-xl">
//                         <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10" />
//                         <div className="relative">
//                           <div className="flex items-center justify-between mb-2">
//                             <h3 className="text-xl font-semibold text-gray-300">Lifetime Access (US)</h3>
//                             {userCountry === "US" && <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-600/80">Recommended</span>}
//                           </div>
//                           <div className="mb-6">
//                             <span className="text-4xl font-bold">$12.99</span>
//                             <span className="text-gray-400 ml-2">/lifetime</span>
//                           </div>
//                           <ul className="space-y-3 mb-8">
//                             <li className="flex items-center gap-3">
//                               <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"><span className="text-white text-xs">✓</span></div>
//                               <span>Access 150+ verified companies</span>
//                             </li>
//                             <li className="flex items-center gap-3">
//                               <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"><span className="text-white text-xs">✓</span></div>
//                               <span>Company names, domains & career links</span>
//                             </li>
//                             <li className="flex items-center gap-3">
//                               <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"><span className="text-white text-xs">✓</span></div>
//                               <span>Weekly list updates included</span>
//                             </li>
//                             <li className="flex items-center gap-3">
//                               <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"><span className="text-white text-xs">✓</span></div>
//                               <span>Lifetime login, no expiry</span>
//                             </li>
//                           </ul>
//                           <button onClick={() => handleBuyNow("US")} className="w-full bg-blue-700 text-white py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300">Buy Now (USD)</button>
//                         </div>
//                       </div>
//                     </div>
//                   </motion.div>
//                 )}

//                 {/* UK Card */}
//                 {(userCountry === "GB" || userCountry === "OTHER") && (
//                   <motion.div
//                     className="absolute inset-0"
//                     animate={
//                       activePlanIndex === 1
//                         ? { scale: 1, x: 0, y: 0, opacity: 1, zIndex: 20 }
//                         : { scale: 0.92, x: 110, y: 24, opacity: 0.75, zIndex: 10 }
//                     }
//                     transition={{ duration: 0.45, ease: "easeInOut" }}
//                   >
//                     <div className={cardClass}>
//                       <div className={glow} />
//                       <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl p-8 text-white overflow-hidden shadow-xl">
//                         <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10" />
//                         <div className="relative">
//                           <div className="flex items-center justify-between mb-2">
//                             <h3 className="text-xl font-semibold text-gray-300">Lifetime Access (UK)</h3>
//                             {userCountry === "GB" && <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-600/80">Recommended</span>}
//                           </div>
//                           <div className="mb-6">
//                             <span className="text-4xl font-bold">£12.99</span>
//                             <span className="text-gray-400 ml-2">/lifetime</span>
//                           </div>
//                           <ul className="space-y-3 mb-8">
//                             <li className="flex items-center gap-3">
//                               <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"><span className="text-white text-xs">✓</span></div>
//                               <span>Access 150+ verified companies</span>
//                             </li>
//                             <li className="flex items-center gap-3">
//                               <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"><span className="text-white text-xs">✓</span></div>
//                               <span>Company names, domains & career links</span>
//                             </li>
//                             <li className="flex items-center gap-3">
//                               <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"><span className="text-white text-xs">✓</span></div>
//                               <span>Weekly list updates included</span>
//                             </li>
//                             <li className="flex items-center gap-3">
//                               <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"><span className="text-white text-xs">✓</span></div>
//                               <span>Lifetime login, no expiry</span>
//                             </li>
//                           </ul>
//                           <button onClick={() => handleBuyNow("UK")} className="w-full bg-blue-700 text-white py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300">Buy Now (GBP)</button>
//                         </div>
//                       </div>
//                     </div>
//                   </motion.div>
//                 )}
//               </div>

//               {/* Chevron controls (replaces dots) */}
//               {/* If we only show one card (userCountry 'US' or 'GB'), keep chevrons disabled/hidden */}
//               <div className="flex justify-center items-center gap-6 mt-6">
//                 {/* If both are visible (OTHER) enable chevrons to toggle */}
//                 {userCountry === "OTHER" ? (
//                   <>
//                     <button type="button" onClick={() => setActivePlanIndex(0)} className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition-all shadow-md">
//                       <ChevronLeft className="h-6 w-6 text-gray-700" />
//                     </button>
//                     <button type="button" onClick={() => setActivePlanIndex(1)} className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition-all shadow-md">
//                       <ChevronRight className="h-6 w-6 text-gray-700" />
//                     </button>
//                   </>
//                 ) : null}
//               </div>

//               <p className="mt-6 text-xs text-gray-500 text-center">
//                 By proceeding, you agree to our{" "}
//                 <button type="button" onClick={openTermsModal} className="underline hover:text-blue-600">Terms &amp; Conditions</button>.
//               </p>
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {/* Testimonials and FAQ truncated here for brevity; reuse the same blocks as in your app */}
//       <section className="py-20 bg-white">
//         <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
//           <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
//             <h2 className="text-4xl lg:text-5xl font-black mb-4 text-slate-900">HOW NETWORK NOTE HELPED JOB SEEKERS GET HIRED</h2>
//           </motion.div>

//           <div className="grid md:grid-cols-3 gap-8">
//             {testimonials.map((testimonial, i) => (
//               <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -8, boxShadow: "0 0 30px rgba(6,182,212,0.3)" }} className="p-8 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer transition-all">
//                 <div className="text-5xl mb-4">{testimonial.avatar}</div>
//                 <div className="flex gap-1 mb-4"> {[...Array(testimonial.rating)].map((_, j) => (<Star key={j} className="h-4 w-4 fill-cyan-500 text-cyan-500" />))} </div>
//                 <p className="text-slate-700 mb-6 italic">"{testimonial.quote}"</p>
//                 <div>
//                   <p className="font-bold text-slate-900">{testimonial.name}</p>
//                   <p className="text-slate-600 text-sm">{testimonial.role} at {testimonial.company}</p>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* FAQ */}
//       <section id="resources" className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
//         <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
//           <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
//             <h2 className="text-4xl lg:text-5xl font-black mb-4 text-white">Frequently Asked Questions</h2>
//           </motion.div>

//           <div className="max-w-3xl mx-auto space-y-4">
//             {faqs.map((faq, i) => (
//               <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl overflow-hidden hover:border-cyan-400/50 transition-all">
//                 <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full p-6 flex items-center justify-between text-left">
//                   <span className="font-semibold text-white">{faq.q}</span>
//                   <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.3 }}>
//                     {openFaq === i ? <Minus className="h-5 w-5 text-cyan-400" /> : <Plus className="h-5 w-5 text-slate-400" />}
//                   </motion.div>
//                 </button>
//                 <motion.div initial={false} animate={{ height: openFaq === i ? "auto" : 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
//                   <p className="px-6 pb-6 text-slate-300">{faq.a}</p>
//                 </motion.div>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer id="company" className="border-t border-slate-200 bg-slate-50">
//         <div className="max-w-[1440px] mx-auto px-8 lg:px-20 py-16">
//           <div className="grid md:grid-cols-3 gap-12 mb-12">
//             <div>
//               <div className="flex items-center gap-2 mb-4">
//                 <img src="/images/networknote_final_logo_1 (2).jpg" alt="Network Note Logo" className="h-8 w-8 rounded-lg" />
//                 <span className="text-xl font-bold text-[#000000] font-noto">NetworkNote</span>
//               </div>
//               <p className="text-slate-600">Your Career, Better.</p>
//             </div>

//             <div>
//               <h4 className="font-bold mb-4 text-slate-900">Quick Links</h4>
//               <div className="space-y-2">
//                 {["Solutions", "Pricing", "Privacy", "Terms", "Careers"].map((link) => (
//                   <a key={link} href="#" className="block text-slate-600 hover:text-cyan-600 transition-colors">{link}</a>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <h4 className="font-bold mb-4 text-slate-900">Connect</h4>
//               <div className="flex gap-4">
//                 {[{ icon: Linkedin, href: "#" }, { icon: Youtube, href: "#" }, { icon: Twitter, href: "#" }, { icon: Instagram, href: "#" }].map((social, i) => (
//                   <motion.a key={i} href={social.href} whileHover={{ scale: 1.2, boxShadow: "0 0 20px rgba(6,182,212,0.5)" }} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:border-cyan-400 transition-all">
//                     <social.icon className="h-5 w-5 text-slate-600" />
//                   </motion.a>
//                 ))}
//               </div>
//             </div>
//           </div>

//           <div className="pt-8 border-t border-slate-200 text-center text-slate-600 text-sm">
//             <p>© {new Date().getFullYear()} Network Note | All Rights Reserved</p>
//           </div>
//         </div>
//       </footer>

//       {/* Terms Modal */}
//       {showTermsModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="relative mx-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
//             <button onClick={closeTermsModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>

//             <h2 className="text-2xl font-bold text-gray-900 mb-4">Network Note – Terms & Conditions</h2>

//             <div className="text-gray-600 space-y-3">
//               <p className="font-medium">By proceeding, I agree that:</p>

//               <ul className="space-y-2 list-disc list-inside">
//                 <li>I am purchasing lifetime access to Network Note's premium features and resources</li>
//                 <li>This is a digital, non-refundable product, no cancellations or refunds after purchase</li>
//                 <li>Job links, company information or career portals shown inside the product may change over time</li>
//                 <li>Sponsorship or job availability depends on each company's hiring policy at the time of access</li>
//                 <li>Network Note is not a recruitment agency and does not guarantee any job or sponsorship</li>
//                 <li>I will use the platform only for my personal job search purposes</li>
//               </ul>

//               <div className="pt-4 mt-4 border-t border-gray-200">
//                 <button onClick={closeTermsModal} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-300">Close</button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }









// // src/pages/Landing.tsx
// import React, { useEffect, useRef, useState } from "react";
// import { motion, useScroll, useTransform } from "framer-motion";
// import gsap from "gsap";
// import { ScrollToPlugin } from "gsap/ScrollToPlugin";
// import { useNavigate } from "react-router-dom";
// import {
//   ArrowRight,
//   CheckCircle2,
//   Video,
//   Upload,
//   Share2,
//   BarChart3,
//   Sparkles,
//   Star,
//   Linkedin,
//   Youtube,
//   Twitter,
//   Instagram,
//   Plus,
//   Minus,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";
// import { Button } from "../components/ui/button";
// import { Card, CardContent } from "../components/ui/card";
// import { Input } from "../components/ui/input";
// import { useAuthContext } from "../contexts/AuthContext";
// import { TypeAnimation } from "react-type-animation";

// const ASSET_IMAGE = "/mnt/data/ba866d83-dfcd-42fc-a5c0-f6581a9a459e.png";

// const slideUp = {
//   hidden: { opacity: 0, y: 40 },
//   visible: (i = 0) => ({
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.6,
//       delay: i * 0.12,
//       ease: "easeOut",
//     },
//   }),
// };

// const cardClass = "relative rounded-2xl";
// const glow =
//   "pointer-events-none absolute -inset-0.5 bg-gradient-to-r from-blue-500/40 to-purple-600/40 blur-lg opacity-60";

// export default function Landing() {
//   const navigate = useNavigate();
//   const { isAuthenticated } = useAuthContext();

//   const mainRef = useRef<HTMLDivElement | null>(null);
//   const { scrollY } = useScroll();
//   const headerBlur = useTransform(scrollY, [0, 100], [8, 18]);

//   const [openFaq, setOpenFaq] = useState<number | null>(null);
//   const [userCountry, setUserCountry] = useState<"US" | "GB" | "OTHER">(
//     "OTHER"
//   );
//   const [activePlanIndex, setActivePlanIndex] = useState(0);
//   const [showTermsModal, setShowTermsModal] = useState(false);

//   const companies = [
//     "Amazon",
//     "Meta",
//     "EY",
//     "Revolut",
//     "Accenture",
//     "HubSpot",
//     "Adobe",
//     "Tesla",
//     "Coca-Cola",
//   ];

//   const testimonials = [
//     {
//       name: "Sarah Chen",
//       role: "Software Engineer",
//       company: "Meta",
//       avatar: "👩‍💻",
//       quote:
//         "Network Note helped me stand out from 200+ applicants. I got 3 interview requests within a week!",
//       rating: 5,
//     },
//     {
//       name: "Marcus Johnson",
//       role: "Product Manager",
//       company: "Amazon",
//       avatar: "👨‍💼",
//       quote:
//         "The video resume format let me showcase my personality. Recruiters loved it and I landed my dream job.",
//       rating: 5,
//     },
//     {
//       name: "Priya Patel",
//       role: "UX Designer",
//       company: "Adobe",
//       avatar: "👩‍🎨",
//       quote:
//         "I was skeptical at first, but Network Note completely transformed my job search. Highly recommend!",
//       rating: 5,
//     },
//   ];

//   const faqs = [
//     {
//       q: "How do I create my first Network Note?",
//       a: "Simply sign up for free, upload your resume, record a 60-90 second video pitch, and share it with recruiters. Our platform guides you through each step.",
//     },
//     {
//       q: "Can I re-record my video?",
//       a: "Absolutely! You can record as many takes as you need until you're happy with your video pitch.",
//     },
//     {
//       q: "What file formats are supported?",
//       a: "We support PDF and DOCX for resumes, and MP4, MOV, and WEBM for video files.",
//     },
//     {
//       q: "How secure is my data?",
//       a: "Your data is encrypted and stored securely. We never share your information without your explicit permission.",
//     },
//     {
//       q: "Is Network Note really free?",
//       a: "Yes! Our basic plan is completely free. Premium features are available for advanced users.",
//     },
//     {
//       q: "How long should my video be?",
//       a: "We recommend 60-90 seconds. This is enough time to make an impact without losing the recruiter's attention.",
//     },
//   ];

//   useEffect(() => {
//     if (mainRef.current) {
//       mainRef.current.style.scrollBehavior = "smooth";
//     }
//   }, []);

//   useEffect(() => {
//     gsap.registerPlugin(ScrollToPlugin);
//     const links = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');

//     const onClick = (e: Event) => {
//       const anchor = e.currentTarget as HTMLAnchorElement;
//       const href = anchor.getAttribute("href") || "";
//       if (!href.startsWith("#")) return;

//       const id = href.slice(1);
//       const target = id ? document.getElementById(id) : null;

//       e.preventDefault();
//       gsap.to(window, {
//         duration: 0.8,
//         ease: "power2.out",
//         scrollTo: target ?? 0,
//       });
//     };

//     links.forEach((a) => a.addEventListener("click", onClick));
//     return () => links.forEach((a) => a.removeEventListener("click", onClick));
//   }, []);

//   useEffect(() => {
//     const detectCountry = async () => {
//       try {
//         const response = await fetch("https://ipapi.co/json/");
//         const data = await response.json();
//         if (data.country_code === "US") {
//           setUserCountry("US");
//           setActivePlanIndex(0);
//         } else if (data.country_code === "GB") {
//           setUserCountry("GB");
//           setActivePlanIndex(1);
//         } else {
//           setUserCountry("OTHER");
//           setActivePlanIndex(0);
//         }
//       } catch (error) {
//         console.warn("Could not detect country:", error);
//         setUserCountry("OTHER");
//         setActivePlanIndex(0);
//       }
//     };

//     detectCountry();
//   }, []);

//   const handleBuyNow = (plan: "US" | "UK") => {
//     const isUK = plan === "UK";
//     const amount = isUK ? 12.99 : 12.99;
//     const currency = isUK ? "GBP" : "USD";

//     navigate("/signup", {
//       state: { plan, amount, currency },
//     });
//   };

//   const openTermsModal = () => setShowTermsModal(true);
//   const closeTermsModal = () => setShowTermsModal(false);

//   return (
//     <div
//       ref={mainRef}
//       className="fixed inset-0 bg-slate-50 text-slate-900 overflow-x-hidden"
//     >
//       {/* HEADER – matches sidebar theme */}
//       <motion.header
//         className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 shadow-sm"
//         style={{
//           backdropFilter: useTransform(headerBlur, (v) => `blur(${v}px)`),
//         }}
//       >
//         <div className="w-full px-8 lg:px-16 py-3.5">
//           <div className="flex items-center justify-between gap-4">
//             {/* Brand */}
//             <div
//               className="flex items-center gap-3 cursor-pointer"
//               onClick={() => navigate("/")}
//             >
//               {/* <div className="h-8 w-8 rounded-xl bg-violet-100 flex items-center justify-center">
//                 <span className="text-xs font-semibold text-violet-700">
//                   NN
//                 </span>
//               </div> */}
//               <div className="h-8 w-8 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
//   <img
//     src="/images/networknote_final_logo_1 (2).jpg"
//     alt="NetworkNote logo"
//     className="h-full w-full object-cover"
//   />
// </div>

//               <div className="flex flex-col">
//                 <span className="text-base font-semibold text-slate-900">
//                   NetworkNote
//                 </span>
//                 {/* <span className="text-[11px] text-slate-400">
//                   Email Intelligence
//                 </span> */}
//               </div>
//             </div>

//             {/* Nav */}
//             <nav className="hidden md:flex items-center gap-6">
//               {["Solutions", "Resources", "Company", "Pricing"].map((item) => (
//                 <a
//                   key={item}
//                   href={`#${item.toLowerCase()}`}
//                   className="text-l text-slate-500 hover:text-slate-900 transition-colors relative group font-xl"
//                 >
//                   {item}
//                   <span className="absolute bottom-[-6px] left-0 w-0 h-[2px] bg-gradient-to-r from-violet-500 to-cyan-400 group-hover:w-full transition-all duration-300" />
//                 </a>
//               ))}
//             </nav>

//             {/* Auth buttons */}
//             <div className="flex items-center gap-2">
//               <Button
//                 variant="outline"
//                 className="hidden sm:inline-flex border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 rounded-xl px-4 py-2 text-sm"
//                 onClick={() => navigate("/auth")}
//               >
//                 Login
//               </Button>

//               <Button
//                 className="bg-slate-900 text-white rounded-xl px-4 sm:px-5 py-2 text-sm font-semibold hover:bg-slate-800 hover:shadow-lg active:scale-[0.98] transition-all"
//                 onClick={() => navigate(isAuthenticated ? "/dashboard" : "/signup")}
//               >
//                 {isAuthenticated ? "Dashboard" : "Get Started"}
//                 <ArrowRight className="ml-2 h-4 w-4" />
//               </Button>
//             </div>
//           </div>
//         </div>
//       </motion.header>

//       {/* HERO – neutral / dark button theme */}
//       <section className="relative py-16 lg:py-24">
//   <div className="w-full px-8 lg:px-16">

//           <div className="grid lg:grid-cols-2 gap-12 items-center">
//             <motion.div
//               initial={{ opacity: 0, x: -50 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.8 }}
//             >
//               <h1 className="text-6xl lg:text-6xl font-black tracking-tight mb-5 leading-tight text-slate-900">
//                 <TypeAnimation
//                   sequence={["YOUR NETWORK NOTE.", 1000]}
//                   speed={0.2 as any}
//                   repeat={0}
//                   cursor={true}
//                   className="text-slate-900"
//                 />
//               </h1>

//               <p className="text-base sm:text-xl text-slate-600 mb-6 leading-relaxed max-w-xl">
//                 Network Note helps you stand out and land interviews by creating
//                 personalized video resumes that build instant connections with
//                 recruiters.
//               </p>

//               <Button
//                 size="lg"
//                 className="bg-slate-900 text-white rounded-xl hover:bg-slate-800 hover:shadow-xl active:scale-[0.98] transition-all text-base px-7"
//                 onClick={() => navigate("/signup")}
//               >
//                 Sign up for free
//                 <ArrowRight className="ml-2 h-5 w-5" />
//               </Button>
//             </motion.div>

//             <motion.div
//               initial={{ opacity: 0, x: 50 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.8, delay: 0.2 }}
//               className="relative"
//             >
//               <div className="relative rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-xl p-6 lg:p-8">
//                 <div className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center relative overflow-hidden border border-slate-200 shadow-md">
//                   <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/10 to-violet-400/10 pointer-events-none" />
//                   <video
//                     src="/videos/demo.mp4"
//                     autoPlay
//                     muted
//                     loop
//                     playsInline
//                     className="absolute inset-0 w-full h-full object-cover rounded-xl"
//                   >
//                     Your browser does not support the video tag.
//                   </video>
//                 </div>
//               </div>
//               <div className="absolute -bottom-4 -right-4 w-52 h-52 bg-cyan-400/20 rounded-full blur-3xl -z-10" />
//             </motion.div>
//           </div>
//         </div>
//       </section>

//       {/* DASHBOARD PREVIEW – light card like sidebar */}
//       <section className="py-16">
//         <div className="w-full px-8 lg:px-16">
//           <motion.div
//             initial={{ opacity: 0, y: 50 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.8 }}
//             className="relative rounded-3xl bg-white border border-slate-200 shadow-md p-6 lg:p-10"
//           >
//             <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
//               <div className="flex-1">
//                 <h2 className="text-2xl font-bold mb-2 text-slate-900">
//                   Your Dashboard
//                 </h2>
//                 <p className="text-slate-500">
//                   Manage all your Network Notes in one place.
//                 </p>
//               </div>
//               <Button
//                 size="lg"
//                 className="bg-slate-900 text-white rounded-xl hover:bg-slate-800 hover:shadow-lg transition-all font-semibold"
//                 onClick={() => navigate("/auth")}
//               >
//                 <Plus className="mr-2 h-5 w-5" /> New Network Note
//               </Button>
//             </div>
//             <div
//               className="mt-8 aspect-video rounded-xl border border-slate-200 bg-cover bg-center bg-no-repeat shadow-sm"
//               style={{
//                 backgroundImage: `url('${ASSET_IMAGE}')`,
//                 backgroundSize: "100%",
//               }}
//             />
//           </motion.div>
//         </div>
//       </section>

//       {/* FEATURED IN */}
//       <section className="py-14 bg-white border-y border-slate-200">
//         <div className="w-full px-8 lg:px-16">
//           <motion.div
//             initial={{ opacity: 0 }}
//             whileInView={{ opacity: 1 }}
//             viewport={{ once: true }}
//             className="text-center mb-10"
//           >
//             <h3 className="text-xl font-semibold mb-2 text-slate-900">
//               Over 200 candidates have landed interviews globally through
//               Network Note
//             </h3>
//           </motion.div>
//           <div className="relative overflow-hidden">
//             <motion.div
//               className="flex gap-10 items-center"
//               animate={{ x: [0, -1000] }}
//               transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
//             >
//               {[...companies, ...companies].map((company, i) => (
//                 <div
//                   key={i}
//                   className="text-lg font-semibold text-slate-300 whitespace-nowrap"
//                 >
//                   {company}
//                 </div>
//               ))}
//             </motion.div>
//           </div>
//         </div>
//       </section>

//       {/* VALUE PROPOSITION – keep dark section for contrast */}
//       <section className="py-20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
//         <div className="w-full px-8 lg:px-16">
//           <div className="grid lg:grid-cols-2 gap-12 items-center">
//             <motion.div
//               initial={{ opacity: 0, x: -50 }}
//               whileInView={{ opacity: 1, x: 0 }}
//               viewport={{ once: true }}
//             >
//               <h2 className="text-3xl lg:text-4xl font-black mb-5 leading-tight text-white">
//                 GET HIRED FASTER WITH A PERSONALIZED VIDEO RESUME
//               </h2>
//               <p className="text-slate-300 text-base sm:text-lg">
//                 Recruiters skim hundreds of resumes daily — Network Note helps
//                 put your story front and center.
//               </p>
//             </motion.div>

//             <div className="grid gap-6">
//               {[
//                 {
//                   icon: Sparkles,
//                   title: "Create your video pitch in seconds",
//                   desc: "AI-powered pitch tool helps you craft the perfect message.",
//                   color: "from-purple-500 to-pink-500",
//                 },
//                 {
//                   icon: Video,
//                   title: "Record with in-app teleprompter",
//                   desc: "Never forget what to say with our built-in teleprompter.",
//                   color: "from-blue-500 to-cyan-500",
//                 },
//                 {
//                   icon: BarChart3,
//                   title: "View insights on engagement",
//                   desc: "Track views, applications, and recruiter interest.",
//                   color: "from-green-500 to-emerald-500",
//                 },
//                 {
//                   icon: Share2,
//                   title: "Easily integrate with job platforms",
//                   desc: "Share directly to LinkedIn, Indeed, and ZipRecruiter.",
//                   color: "from-orange-500 to-red-500",
//                 },
//               ].map((feature, i) => (
//                 <motion.div
//                   key={i}
//                   initial={{ opacity: 0, y: 20 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   viewport={{ once: true }}
//                   transition={{ delay: i * 0.1 }}
//                   whileHover={{
//                     scale: 1.04,
//                     boxShadow: "0 0 40px rgba(34,211,238,0.35)",
//                     y: -6,
//                   }}
//                   className="p-6 rounded-2xl bg-white/5 border border-white/10 cursor-pointer transition-all group"
//                 >
//                   <div
//                     className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
//                   >
//                     <feature.icon className="h-6 w-6 text-white" />
//                   </div>
//                   <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-cyan-300 transition-colors">
//                     {feature.title}
//                   </h3>
//                   <p className="text-slate-300 text-sm">{feature.desc}</p>
//                 </motion.div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* PRICING – light cards, dark buttons */}
//       <section id="pricing" className="py-24 bg-slate-50">
//         <div className="container mx-auto px-6">
//           <p className="text-center text-xs font-semibold tracking-[0.2em] uppercase text-violet-600">
//             Pricing
//           </p>
//           <motion.h2
//             variants={slideUp}
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true, amount: 0.3 }}
//             custom={0}
//             className="text-3xl sm:text-4xl font-bold text-center mb-16 text-slate-900"
//           >
//             Simple one-time pricing
//           </motion.h2>

//           <motion.div
//             variants={slideUp}
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true, amount: 0.3 }}
//             custom={1}
//             className="max-w-md mx-auto"
//           >
//             <div className="relative overflow-visible">
//               <div className="relative h-[420px] overflow-visible">
//                 {/* US Card */}
//                 {(userCountry === "US" || userCountry === "OTHER") && (
//                   <motion.div
//                     className="absolute inset-0"
//                     animate={
//                       activePlanIndex === 0
//                         ? {
//                             scale: 1,
//                             x: 0,
//                             y: 0,
//                             opacity: 1,
//                             zIndex: 20,
//                           }
//                         : {
//                             scale: 0.92,
//                             x: -110,
//                             y: 24,
//                             opacity: 0.75,
//                             zIndex: 10,
//                           }
//                     }
//                     transition={{ duration: 0.45, ease: "easeInOut" }}
//                   >
//                     <div className={cardClass}>
//                       <div className={glow} />
//                       <div className="relative bg-slate-900 rounded-2xl p-8 text-white overflow-hidden shadow-xl">
//                         <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-violet-500/10" />
//                         <div className="relative">
//                           <div className="flex items-center justify-between mb-2">
//                             <h3 className="text-lg font-semibold text-slate-100">
//                               Lifetime Access (US)
//                             </h3>
//                             {userCountry === "US" && (
//                               <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-cyan-500/90 text-slate-900">
//                                 Recommended
//                               </span>
//                             )}
//                           </div>
//                           <div className="mb-6">
//                             <span className="text-4xl font-bold">$12.99</span>
//                             <span className="text-slate-300 ml-2">
//                               / lifetime
//                             </span>
//                           </div>
//                           <ul className="space-y-3 mb-8 text-sm">
//                             {[
//                               "Access 150+ verified companies",
//                               "Company names, domains & career links",
//                               "Weekly list updates included",
//                               "Lifetime login, no expiry",
//                             ].map((text, idx) => (
//                               <li
//                                 key={idx}
//                                 className="flex items-center gap-3"
//                               >
//                                 <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
//                                   <span className="text-white text-xs">✓</span>
//                                 </div>
//                                 <span>{text}</span>
//                               </li>
//                             ))}
//                           </ul>
//                           <button
//                             onClick={() => handleBuyNow("US")}
//                             className="w-full bg-white text-slate-900 py-3 rounded-full text-sm font-semibold hover:bg-slate-100 hover:shadow-lg transition-all duration-300"
//                           >
//                             Buy Now (USD)
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </motion.div>
//                 )}

//                 {/* UK Card */}
//                 {(userCountry === "GB" || userCountry === "OTHER") && (
//                   <motion.div
//                     className="absolute inset-0"
//                     animate={
//                       activePlanIndex === 1
//                         ? {
//                             scale: 1,
//                             x: 0,
//                             y: 0,
//                             opacity: 1,
//                             zIndex: 20,
//                           }
//                         : {
//                             scale: 0.92,
//                             x: 110,
//                             y: 24,
//                             opacity: 0.75,
//                             zIndex: 10,
//                           }
//                     }
//                     transition={{ duration: 0.45, ease: "easeInOut" }}
//                   >
//                     <div className={cardClass}>
//                       <div className={glow} />
//                       <div className="relative bg-slate-900 rounded-2xl p-8 text-white overflow-hidden shadow-xl">
//                         <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-violet-500/10" />
//                         <div className="relative">
//                           <div className="flex items-center justify-between mb-2">
//                             <h3 className="text-lg font-semibold text-slate-100">
//                               Lifetime Access (UK)
//                             </h3>
//                             {userCountry === "GB" && (
//                               <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-cyan-500/90 text-slate-900">
//                                 Recommended
//                               </span>
//                             )}
//                           </div>
//                           <div className="mb-6">
//                             <span className="text-4xl font-bold">£12.99</span>
//                             <span className="text-slate-300 ml-2">
//                               / lifetime
//                             </span>
//                           </div>
//                           <ul className="space-y-3 mb-8 text-sm">
//                             {[
//                               "Access 150+ verified companies",
//                               "Company names, domains & career links",
//                               "Weekly list updates included",
//                               "Lifetime login, no expiry",
//                             ].map((text, idx) => (
//                               <li
//                                 key={idx}
//                                 className="flex items-center gap-3"
//                               >
//                                 <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
//                                   <span className="text-white text-xs">✓</span>
//                                 </div>
//                                 <span>{text}</span>
//                               </li>
//                             ))}
//                           </ul>
//                           <button
//                             onClick={() => handleBuyNow("UK")}
//                             className="w-full bg-white text-slate-900 py-3 rounded-full text-sm font-semibold hover:bg-slate-100 hover:shadow-lg transition-all duration-300"
//                           >
//                             Buy Now (GBP)
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </motion.div>
//                 )}
//               </div>

//               {/* Chevron controls only when both visible */}
//               <div className="flex justify-center items-center gap-6 mt-6">
//                 {userCountry === "OTHER" && (
//                   <>
//                     <button
//                       type="button"
//                       onClick={() => setActivePlanIndex(0)}
//                       className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-full transition-all shadow-sm"
//                     >
//                       <ChevronLeft className="h-5 w-5 text-slate-700" />
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => setActivePlanIndex(1)}
//                       className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-full transition-all shadow-sm"
//                     >
//                       <ChevronRight className="h-5 w-5 text-slate-700" />
//                     </button>
//                   </>
//                 )}
//               </div>

//               <p className="mt-6 text-xs text-slate-500 text-center">
//                 By proceeding, you agree to our{" "}
//                 <button
//                   type="button"
//                   onClick={openTermsModal}
//                   className="underline decoration-slate-400 hover:decoration-slate-700 hover:text-slate-800"
//                 >
//                   Terms &amp; Conditions
//                 </button>
//                 .
//               </p>
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {/* TESTIMONIALS */}
//       <section className="py-20 bg-white">
//         <div className="w-full px-8 lg:px-16">
//           <motion.div
//             initial={{ opacity: 0 }}
//             whileInView={{ opacity: 1 }}
//             viewport={{ once: true }}
//             className="text-center mb-14"
//           >
//             <h2 className="text-3xl lg:text-4xl font-black mb-3 text-slate-900">
//               HOW NETWORK NOTE HELPED JOB SEEKERS GET HIRED
//             </h2>
//           </motion.div>

//           <div className="grid md:grid-cols-3 gap-8">
//             {testimonials.map((testimonial, i) => (
//               <motion.div
//                 key={i}
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: i * 0.1 }}
//                 whileHover={{
//                   y: -6,
//                   boxShadow: "0 0 30px rgba(148,163,184,0.4)",
//                 }}
//                 className="p-7 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer transition-all"
//               >
//                 <div className="text-5xl mb-4">{testimonial.avatar}</div>
//                 <div className="flex gap-1 mb-4">
//                   {Array.from({ length: testimonial.rating }).map((_, j) => (
//                     <Star
//                       key={j}
//                       className="h-4 w-4 fill-cyan-500 text-cyan-500"
//                     />
//                   ))}
//                 </div>
//                 <p className="text-slate-700 mb-6 italic text-sm">
//                   "{testimonial.quote}"
//                 </p>
//                 <div>
//                   <p className="font-semibold text-slate-900">
//                     {testimonial.name}
//                   </p>
//                   <p className="text-slate-600 text-xs">
//                     {testimonial.role} at {testimonial.company}
//                   </p>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* FAQ – leave dark to contrast but tuned to match value section */}
//       <section
//         id="resources"
//         className="py-20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
//       >
//         <div className="w-full px-8 lg:px-16">
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             className="text-center mb-14"
//           >
//             <h2 className="text-3xl lg:text-4xl font-black mb-3 text-white">
//               Frequently Asked Questions
//             </h2>
//           </motion.div>

//           <div className="max-w-3xl mx-auto space-y-4">
//             {faqs.map((faq, i) => (
//               <motion.div
//                 key={i}
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: i * 0.05 }}
//                 className="backdrop-blur-xl bg-white/5 border border-white/15 rounded-xl overflow-hidden hover:border-cyan-400/50 transition-all"
//               >
//                 <button
//                   onClick={() =>
//                     setOpenFaq(openFaq === i ? null : i)
//                   }
//                   className="w-full p-5 flex items-center justify-between text-left"
//                 >
//                   <span className="font-semibold text-white text-sm">
//                     {faq.q}
//                   </span>
//                   <motion.div
//                     animate={{ rotate: openFaq === i ? 180 : 0 }}
//                     transition={{ duration: 0.3 }}
//                   >
//                     {openFaq === i ? (
//                       <Minus className="h-4 w-4 text-cyan-400" />
//                     ) : (
//                       <Plus className="h-4 w-4 text-slate-400" />
//                     )}
//                   </motion.div>
//                 </button>
//                 <motion.div
//                   initial={false}
//                   animate={{ height: openFaq === i ? "auto" : 0 }}
//                   transition={{ duration: 0.3 }}
//                   className="overflow-hidden"
//                 >
//                   <p className="px-5 pb-5 text-slate-200 text-sm">
//                     {faq.a}
//                   </p>
//                 </motion.div>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* FOOTER – light like sidebar */}
//       <footer id="company" className="border-t border-slate-200 bg-slate-50">
//         <div className="w-full px-8 lg:px-16 py-14">
//           <div className="grid md:grid-cols-3 gap-10 mb-10">
//             <div>
//               <div className="flex items-center gap-3 mb-4">
//                 {/* <div className="h-8 w-8 rounded-xl bg-violet-100 flex items-center justify-center">
//                   <span className="text-xs font-semibold text-violet-700">
//                     NN
//                   </span>
//                 </div> */}
//                 <div className="h-8 w-8 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
//   <img
//     src="/images/networknote_final_logo_1 (2).jpg"
//     alt="NetworkNote logo"
//     className="h-full w-full object-cover"
//   />
// </div>

//                 <span className="text-lg font-semibold text-slate-900">
//                   NetworkNote
//                 </span>
//               </div>
//               <p className="text-slate-600 text-sm">Your Career, Better.</p>
//             </div>

//             <div>
//               <h4 className="font-semibold mb-4 text-slate-900 text-sm">
//                 Quick Links
//               </h4>
//               <div className="space-y-2 text-sm">
//                 {["Solutions", "Pricing", "Privacy", "Terms", "Careers"].map(
//                   (link) => (
//                     <a
//                       key={link}
//                       href="#"
//                       className="block text-slate-600 hover:text-slate-900 transition-colors"
//                     >
//                       {link}
//                     </a>
//                   )
//                 )}
//               </div>
//             </div>

//             <div>
//               <h4 className="font-semibold mb-4 text-slate-900 text-sm">
//                 Connect
//               </h4>
//               <div className="flex gap-3">
//                 {[
//                   { icon: Linkedin, href: "#" },
//                   { icon: Youtube, href: "#" },
//                   { icon: Twitter, href: "#" },
//                   { icon: Instagram, href: "#" },
//                 ].map((social, i) => (
//                   <motion.a
//                     key={i}
//                     href={social.href}
//                     whileHover={{
//                       scale: 1.1,
//                       boxShadow: "0 0 18px rgba(148,163,184,0.6)",
//                     }}
//                     className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:border-cyan-400 transition-all"
//                   >
//                     <social.icon className="h-4 w-4 text-slate-600" />
//                   </motion.a>
//                 ))}
//               </div>
//             </div>
//           </div>

//           <div className="pt-6 border-t border-slate-200 text-center text-slate-500 text-xs">
//             <p>© {new Date().getFullYear()} Network Note | All Rights Reserved</p>
//           </div>
//         </div>
//       </footer>

//       {/* TERMS MODAL – unchanged except colors tweaked slightly */}
//       {showTermsModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//           <div className="relative mx-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
//             <button
//               onClick={closeTermsModal}
//               className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-5 w-5"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M6 18L18 6M6 6l12 12"
//                 />
//               </svg>
//             </button>

//             <h2 className="text-xl font-semibold text-slate-900 mb-4">
//               Network Note – Terms &amp; Conditions
//             </h2>

//             <div className="text-slate-600 space-y-3 text-sm">
//               <p className="font-medium">
//                 By proceeding, I agree that:
//               </p>

//               <ul className="space-y-2 list-disc list-inside">
//                 <li>
//                   I am purchasing lifetime access to Network Note&apos;s premium
//                   features and resources
//                 </li>
//                 <li>
//                   This is a digital, non-refundable product, no cancellations or
//                   refunds after purchase
//                 </li>
//                 <li>
//                   Job links, company information or career portals shown inside
//                   the product may change over time
//                 </li>
//                 <li>
//                   Sponsorship or job availability depends on each company&apos;s
//                   hiring policy at the time of access
//                 </li>
//                 <li>
//                   Network Note is not a recruitment agency and does not
//                   guarantee any job or sponsorship
//                 </li>
//                 <li>
//                   I will use the platform only for my personal job search
//                   purposes
//                 </li>
//               </ul>

//               <div className="pt-4 mt-4 border-t border-slate-200">
//                 <button
//                   onClick={closeTermsModal}
//                   className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 focus:ring-2 focus:ring-slate-400 text-sm"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



// import React, { useEffect, useRef, useState } from "react";
// import { motion, useScroll, useTransform } from "framer-motion";
// // Removed GSAP imports and related logic due to module resolution errors.
// // Scrolling is now handled using native browser smooth scrolling.
// import { useNavigate } from "react-router-dom";
// import {
//   ArrowRight,
//   CheckCircle2,
//   Video,
//   Upload,
//   Share2,
//   BarChart3,
//   Sparkles,
//   Star,
//   Linkedin,
//   Youtube,
//   Twitter,
//   Instagram,
//   Plus,
//   Minus,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";

// // --- START: Mocked/Local Dependencies to resolve import errors ---

// // Mock Auth Context (since ../contexts/AuthContext is not available)
// const AuthContext = React.createContext({ isAuthenticated: false });
// const useAuthContext = () => React.useContext(AuthContext);

// // Simple mock for Button component (since ../components/ui/button is not available)
// const Button = ({ children, className = "", onClick, variant, size, ...props }: any) => (
//   <button className={`p-2 rounded-xl text-sm font-medium ${className}`} onClick={onClick} {...props}>
//     {children}
//   </button>
// );
// // Simple mock for Card/Input components (since ../components/ui/card/input are not available)
// const Card = ({ children, className = "" }: any) => <div className={`rounded-xl border bg-white shadow-sm ${className}`}>{children}</div>;
// const CardContent = ({ children, className = "" }: any) => <div className={`p-6 ${className}`}>{children}</div>;
// const Input = ({ className = "", ...props }: any) => <input className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${className}`} {...props} />;

// // Simple mock for TypeAnimation (since react-type-animation is not available)
// const TypeAnimation = ({ sequence, cursor, className, ...props }: any) => (
//   <span className={className}>{sequence[0]}</span>
// );

// // --- END: Mocked/Local Dependencies ---


// const ASSET_IMAGE = "/mnt/data/ba866d83-dfcd-42fc-a5c0-f6581a9a459e.png";

// const slideUp = {
//   hidden: { opacity: 0, y: 40 },
//   visible: (i = 0) => ({
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.6,
//       delay: i * 0.12,
//       ease: "easeOut",
//     },
//   }),
// };

// const cardClass = "relative rounded-2xl";
// const glow =
//   "pointer-events-none absolute -inset-0.5 bg-gradient-to-r from-blue-500/40 to-purple-600/40 blur-lg opacity-60";

// export default function Landing() {
//   const navigate = useNavigate();
//   const { isAuthenticated } = useAuthContext();

//   const mainRef = useRef<HTMLDivElement | null>(null);
//   const { scrollY } = useScroll();
//   const headerBlur = useTransform(scrollY, [0, 100], [8, 18]);

//   const [openFaq, setOpenFaq] = useState<number | null>(null);
//   const [userCountry, setUserCountry] = useState<"US" | "GB" | "OTHER">(
//     "OTHER"
//   );
//   const [activePlanIndex, setActivePlanIndex] = useState(0);
//   const [showTermsModal, setShowTermsModal] = useState(false);

//   const companies = [
//     "Amazon",
//     "Meta",
//     "EY",
//     "Revolut",
//     "Accenture",
//     "HubSpot",
//     "Adobe",
//     "Tesla",
//     "Coca-Cola",
//   ];

//   const testimonials = [
//     {
//       name: "Sarah Chen",
//       role: "Software Engineer",
//       company: "Meta",
//       avatar: "👩‍💻",
//       quote:
//         "Network Note helped me stand out from 200+ applicants. I got 3 interview requests within a week!",
//       rating: 5,
//     },
//     {
//       name: "Marcus Johnson",
//       role: "Product Manager",
//       company: "Amazon",
//       avatar: "👨‍💼",
//       quote:
//         "The video resume format let me showcase my personality. Recruiters loved it and I landed my dream job.",
//       rating: 5,
//     },
//     {
//       name: "Priya Patel",
//       role: "UX Designer",
//       company: "Adobe",
//       avatar: "👩‍🎨",
//       quote:
//         "I was skeptical at first, but Network Note completely transformed my job search. Highly recommend!",
//       rating: 5,
//     },
//   ];

//   const faqs = [
//     {
//       q: "How do I create my first Network Note?",
//       a: "Simply sign up for free, upload your resume, record a 60-90 second video pitch, and share it with recruiters. Our platform guides you through each step.",
//     },
//     {
//       q: "Can I re-record my video?",
//       a: "Absolutely! You can record as many takes as you need until you're happy with your video pitch.",
//     },
//     {
//       q: "What file formats are supported?",
//       a: "We support PDF and DOCX for resumes, and MP4, MOV, and WEBM for video files.",
//     },
//     {
//       q: "How secure is my data?",
//       a: "Your data is encrypted and stored securely. We never share your information without your explicit permission.",
//     },
//     {
//       q: "Is Network Note really free?",
//       a: "Yes! Our basic plan is completely free. Premium features are available for advanced users.",
//     },
//     {
//       q: "How long should my video be?",
//       a: "We recommend 60-90 seconds. This is enough time to make an impact without losing the recruiter's attention.",
//     },
//   ];

//   // Removed useEffect setting scrollBehavior as it's handled by scrollIntoView

//   // Updated scrolling to use native scrollIntoView({ behavior: 'smooth' }) instead of GSAP
//   useEffect(() => {
//     const links = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');

//     const onClick = (e: Event) => {
//       const anchor = e.currentTarget as HTMLAnchorElement;
//       const href = anchor.getAttribute("href") || "";
//       if (!href.startsWith("#")) return;

//       const id = href.slice(1);
//       const target = id ? document.getElementById(id) : null;

//       e.preventDefault();
      
//       if (target) {
//           target.scrollIntoView({ behavior: 'smooth', block: 'start' });
//       } else {
//           window.scrollTo({ top: 0, behavior: 'smooth' });
//       }
//     };

//     links.forEach((a) => a.addEventListener("click", onClick));
//     return () => links.forEach((a) => a.removeEventListener("click", onClick));
//   }, []);

//   useEffect(() => {
//     const detectCountry = async () => {
//       try {
//         // Attempt to fetch country based on IP
//         const response = await fetch("https://ipapi.co/json/");
//         const data = await response.json();
//         if (data.country_code === "US") {
//           setUserCountry("US");
//           setActivePlanIndex(0);
//         } else if (data.country_code === "GB") {
//           setUserCountry("GB");
//           setActivePlanIndex(1);
//         } else {
//           setUserCountry("OTHER");
//           setActivePlanIndex(0);
//         }
//       } catch (error) {
//         console.warn("Could not detect country:", error);
//         setUserCountry("OTHER");
//         setActivePlanIndex(0);
//       }
//     };

//     detectCountry();
//   }, []);

//   const handleBuyNow = (plan: "US" | "UK") => {
//     const isUK = plan === "UK";
//     const amount = isUK ? 0.1 : 0.1;
//     const currency = isUK ? "GBP" : "USD";

//     navigate("/signup", {
//       state: { plan, amount, currency },
//     });
//   };

//   const openTermsModal = () => setShowTermsModal(true);
//   const closeTermsModal = () => setShowTermsModal(false);

//   return (
//     <div
//       ref={mainRef}
//       className="fixed inset-0 bg-slate-50 text-slate-900 overflow-x-hidden"
//     >
//       {/* HEADER – matches sidebar theme */}
//       <motion.header
//         className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 shadow-sm"
//         style={{
//           backdropFilter: useTransform(headerBlur, (v) => `blur(${v}px)`),
//         }}
//       >
//         <div className="w-full px-8 lg:px-16 py-3.5">
//           <div className="flex items-center justify-between gap-4">
//             {/* Brand */}
//             <div
//               className="flex items-center gap-3 cursor-pointer"
//               onClick={() => navigate("/")}
//             >
//               {/* <div className="h-8 w-8 rounded-xl bg-violet-100 flex items-center justify-center">
//                 <span className="text-xs font-semibold text-violet-700">
//                   NN
//                 </span>
//               </div> */}
//               <div className="h-8 w-8 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
//                 <img
//                   src="/images/networknote_final_logo_1 (2).jpg"
//                   alt="NetworkNote logo"
//                   className="h-full w-full object-cover"
//                 />
//               </div>

//               <div className="flex flex-col">
//                 <span className="text-base font-semibold text-slate-900">
//                   NetworkNote
//                 </span>
//                 {/* <span className="text-[11px] text-slate-400">
//                   Email Intelligence
//                 </span> */}
//               </div>
//             </div>

//             {/* Nav */}
//             <nav className="hidden md:flex items-center gap-6">
//               {["Solutions", "Resources", "Company", "Pricing"].map((item) => (
//                 <a
//                   key={item}
//                   href={`#${item.toLowerCase()}`}
//                   className="text-l text-slate-500 hover:text-slate-900 transition-colors relative group font-xl"
//                 >
//                   {item}
//                   <span className="absolute bottom-[-6px] left-0 w-0 h-[2px] bg-gradient-to-r from-violet-500 to-cyan-400 group-hover:w-full transition-all duration-300" />
//                 </a>
//               ))}
//             </nav>

//             {/* Auth buttons */}
//             <div className="flex items-center gap-2">
//               <Button
//                 variant="outline"
//                 className="hidden sm:inline-flex border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 rounded-xl px-4 py-2 text-sm"
//                 onClick={() => navigate("/auth")}
//               >
//                 Login
//               </Button>

//               <Button
//                 className="bg-slate-900 text-white rounded-xl px-4 sm:px-5 py-2 text-sm font-semibold hover:bg-slate-800 hover:shadow-lg active:scale-[0.98] transition-all flex items-center"
//                 onClick={() => navigate(isAuthenticated ? "/dashboard" : "/signup")}
//               >
//                 {isAuthenticated ? "Dashboard" : "Get Started"}
//                 <ArrowRight className="ml-2 h-4 w-4" />
//               </Button>
//             </div>
//           </div>
//         </div>
//       </motion.header>

//       {/* HERO – neutral / dark button theme */}
//       <section className="relative py-16 lg:py-24">
//         <div className="w-full px-8 lg:px-16">
//           <div className="grid lg:grid-cols-2 gap-12 items-center">
//             <motion.div
//               initial={{ opacity: 0, x: -50 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.8 }}
//             >
//               <h1 className="text-6xl lg:text-6xl font-black tracking-tight mb-5 leading-tight text-slate-900">
//                 <TypeAnimation
//                   sequence={["YOUR NETWORK NOTE.", 1000]}
//                   speed={0.2 as any}
//                   repeat={0}
//                   cursor={true}
//                   className="text-slate-900"
//                 />
//               </h1>

//               <p className="text-base sm:text-xl text-slate-600 mb-6 leading-relaxed max-w-xl">
//                 Network Note helps you stand out and land interviews by creating
//                 personalized video resumes that build instant connections with
//                 recruiters.
//               </p>

//               {/* FIX APPLIED: Added flex and items-center to the Button to align text and icon */}
//               <Button
//                 size="lg"
//                 className="bg-slate-900 text-white rounded-xl hover:bg-slate-800 hover:shadow-xl active:scale-[0.98] transition-all text-base px-7 flex items-center" 
//                 onClick={() => navigate("/signup")}
//               >
//                 Sign up for free
//                 <ArrowRight className="ml-2 h-5 w-5" />
//               </Button>
//             </motion.div>

//             <motion.div
//               initial={{ opacity: 0, x: 50 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.8, delay: 0.2 }}
//               className="relative"
//             >
//               <div className="relative rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-xl p-6 lg:p-8">
//                 <div className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center relative overflow-hidden border border-slate-200 shadow-md">
//                   <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/10 to-violet-400/10 pointer-events-none" />
//                   <video
//                     src="/videos/demo.mp4"
//                     autoPlay
//                     muted
//                     loop
//                     playsInline
//                     className="absolute inset-0 w-full h-full object-cover rounded-xl"
//                   >
//                     Your browser does not support the video tag.
//                   </video>
//                 </div>
//               </div>
//               <div className="absolute -bottom-4 -right-4 w-52 h-52 bg-cyan-400/20 rounded-full blur-3xl -z-10" />
//             </motion.div>
//           </div>
//         </div>
//       </section>

//       {/* DASHBOARD PREVIEW – light card like sidebar */}
//       <section className="py-16">
//         <div className="w-full px-8 lg:px-16">
//           <motion.div
//             initial={{ opacity: 0, y: 50 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.8 }}
//             className="relative rounded-3xl bg-white border border-slate-200 shadow-md p-6 lg:p-10"
//           >
//             <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
//               <div className="flex-1">
//                 <h2 className="text-2xl font-bold mb-2 text-slate-900">
//                   Your Dashboard
//                 </h2>
//                 <p className="text-slate-500">
//                   Manage all your Network Notes in one place.
//                 </p>
//               </div>
//               <Button
//                 size="lg"
//                 className="bg-slate-900 text-white rounded-xl hover:bg-slate-800 hover:shadow-lg transition-all font-semibold flex items-center"
//                 onClick={() => navigate("/auth")}
//               >
//                 <Plus className="mr-2 h-5 w-5" /> New Network Note
//               </Button>
//             </div>
//             <div
//               className="mt-8 aspect-video rounded-xl border border-slate-200 bg-cover bg-center bg-no-repeat shadow-sm"
//               style={{
//                 backgroundImage: `url('${ASSET_IMAGE}')`,
//                 backgroundSize: "100%",
//               }}
//             />
//           </motion.div>
//         </div>
//       </section>

//       {/* FEATURED IN */}
//       <section className="py-14 bg-white border-y border-slate-200">
//         <div className="w-full px-8 lg:px-16">
//           <motion.div
//             initial={{ opacity: 0 }}
//             whileInView={{ opacity: 1 }}
//             viewport={{ once: true }}
//             className="text-center mb-10"
//           >
//             <h3 className="text-xl font-semibold mb-2 text-slate-900">
//               Over 200 candidates have landed interviews globally through
//               Network Note
//             </h3>
//           </motion.div>
//           <div className="relative overflow-hidden">
//             <motion.div
//               className="flex gap-10 items-center"
//               animate={{ x: [0, -1000] }}
//               transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
//             >
//               {[...companies, ...companies].map((company, i) => (
//                 <div
//                   key={i}
//                   className="text-3xl font-bold text-slate-300 whitespace-nowrap"
//                 >
//                   {company}
//                 </div>
//               ))}
//             </motion.div>
//           </div>
//         </div>
//       </section>

//       {/* VALUE PROPOSITION – This section now has id="solutions" for navigation */}
//       <section 
//         id="solutions" 
//         className="py-20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
//       >
//         <div className="w-full px-8 lg:px-16">
//           <div className="grid lg:grid-cols-2 gap-12 items-center">
//             <motion.div
//               initial={{ opacity: 0, x: -50 }}
//               whileInView={{ opacity: 1, x: 0 }}
//               viewport={{ once: true }}
//             >
//               <h2 className="text-3xl lg:text-4xl font-black mb-5 leading-tight text-white">
//                 GET HIRED FASTER WITH A PERSONALIZED VIDEO RESUME
//               </h2>
//               <p className="text-slate-300 text-base sm:text-lg">
//                 Recruiters skim hundreds of resumes daily — Network Note helps
//                 put your story front and center.
//               </p>
//             </motion.div>

//             <div className="grid gap-6">
//               {[
//                 {
//                   icon: Sparkles,
//                   title: "Create your video pitch in seconds",
//                   desc: "AI-powered pitch tool helps you craft the perfect message.",
//                   color: "from-purple-500 to-pink-500",
//                 },
//                 {
//                   icon: Video,
//                   title: "Record with in-app teleprompter",
//                   desc: "Never forget what to say with our built-in teleprompter.",
//                   color: "from-blue-500 to-cyan-500",
//                 },
//                 {
//                   icon: BarChart3,
//                   title: "View insights on engagement",
//                   desc: "Track views, applications, and recruiter interest.",
//                   color: "from-green-500 to-emerald-500",
//                 },
//                 {
//                   icon: Share2,
//                   title: "Easily integrate with job platforms",
//                   desc: "Share directly to LinkedIn, Indeed, and ZipRecruiter.",
//                   color: "from-orange-500 to-red-500",
//                 },
//               ].map((feature, i) => (
//                 <motion.div
//                   key={i}
//                   initial={{ opacity: 0, y: 20 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   viewport={{ once: true }}
//                   transition={{ delay: i * 0.1 }}
//                   whileHover={{
//                     scale: 1.04,
//                     boxShadow: "0 0 40px rgba(34,211,238,0.35)",
//                     y: -6,
//                   }}
//                   className="p-6 rounded-2xl bg-white/5 border border-white/10 cursor-pointer transition-all group"
//                 >
//                   <div
//                     className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
//                   >
//                     <feature.icon className="h-6 w-6 text-white" />
//                   </div>
//                   <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-cyan-300 transition-colors">
//                     {feature.title}
//                   </h3>
//                   <p className="text-slate-300 text-sm">{feature.desc}</p>
//                 </motion.div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* PRICING – light cards, dark buttons */}
//       <section id="pricing" className="py-24 bg-slate-50">
//         <div className="container mx-auto px-6">
//           <p className="text-center text-lg font-semibold tracking-[0.2em] uppercase text-violet-600">
//             Pricing
//           </p>
//           <motion.h2
//             variants={slideUp}
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true, amount: 0.3 }}
//             custom={0}
//             className="text-3xl sm:text-4xl font-bold text-center mb-16 text-slate-900"
//           >
//             Simple one-time pricing
//           </motion.h2>

//           <motion.div
//             variants={slideUp}
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true, amount: 0.3 }}
//             custom={1}
//             className="max-w-md mx-auto"
//           >
//             <div className="relative overflow-visible">
//               <div className="relative h-[420px] overflow-visible">
//                 {/* US Card */}
//                 {(userCountry === "US" || userCountry === "OTHER") && (
//                   <motion.div
//                     className="absolute inset-0"
//                     animate={
//                       activePlanIndex === 0
//                         ? {
//                             scale: 1,
//                             x: 0,
//                             y: 0,
//                             opacity: 1,
//                             zIndex: 20,
//                           }
//                         : {
//                             scale: 0.92,
//                             x: -110,
//                             y: 24,
//                             opacity: 0.75,
//                             zIndex: 10,
//                           }
//                     }
//                     transition={{ duration: 0.45, ease: "easeInOut" }}
//                   >
//                     <div className={cardClass}>
//                       <div className={glow} />
//                       <div className="relative bg-slate-900 rounded-2xl p-8 text-white overflow-hidden shadow-xl">
//                         <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-violet-500/10" />
//                         <div className="relative">
//                           <div className="flex items-center justify-between mb-2">
//                             <h3 className="text-lg font-semibold text-slate-100">
//                               Lifetime Access (US)
//                             </h3>
//                             {userCountry === "US" && (
//                               <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-cyan-500/90 text-slate-900">
//                                 Recommended
//                               </span>
//                             )}
//                           </div>
//                           <div className="mb-6">
//                             <span className="text-4xl font-bold">$12.99</span>
//                             <span className="text-slate-300 ml-2">
//                               / lifetime
//                             </span>
//                           </div>
//                           <ul className="space-y-3 mb-8 text-sm">
//                             {[
//                               "Access 150+ verified companies",
//                               "Company names, domains & career links",
//                               "Weekly list updates included",
//                               "Lifetime login, no expiry",
//                             ].map((text, idx) => (
//                               <li
//                                 key={idx}
//                                 className="flex items-center gap-3"
//                               >
//                                 <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
//                                   <span className="text-white text-xs">✓</span>
//                                 </div>
//                                 <span>{text}</span>
//                               </li>
//                             ))}
//                           </ul>
//                           <button
//                             onClick={() => handleBuyNow("US")}
//                             className="w-full bg-white text-slate-900 py-3 rounded-full text-sm font-semibold hover:bg-slate-100 hover:shadow-lg transition-all duration-300"
//                           >
//                             Buy Now (USD)
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </motion.div>
//                 )}

//                 {/* UK Card */}
//                 {(userCountry === "GB" || userCountry === "OTHER") && (
//                   <motion.div
//                     className="absolute inset-0"
//                     animate={
//                       activePlanIndex === 1
//                         ? {
//                             scale: 1,
//                             x: 0,
//                             y: 0,
//                             opacity: 1,
//                             zIndex: 20,
//                           }
//                         : {
//                             scale: 0.92,
//                             x: 110,
//                             y: 24,
//                             opacity: 0.75,
//                             zIndex: 10,
//                           }
//                     }
//                     transition={{ duration: 0.45, ease: "easeInOut" }}
//                   >
//                     <div className={cardClass}>
//                       <div className={glow} />
//                       <div className="relative bg-slate-900 rounded-2xl p-8 text-white overflow-hidden shadow-xl">
//                         <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-violet-500/10" />
//                         <div className="relative">
//                           <div className="flex items-center justify-between mb-2">
//                             <h3 className="text-lg font-semibold text-slate-100">
//                               Lifetime Access (UK)
//                             </h3>
//                             {userCountry === "GB" && (
//                               <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-cyan-500/90 text-slate-900">
//                                 Recommended
//                               </span>
//                             )}
//                           </div>
//                           <div className="mb-6">
//                             <span className="text-4xl font-bold">£12.99</span>
//                             <span className="text-slate-300 ml-2">
//                               / lifetime
//                             </span>
//                           </div>
//                           <ul className="space-y-3 mb-8 text-sm">
//                             {[
//                               "Access 150+ verified companies",
//                               "Company names, domains & career links",
//                               "Weekly list updates included",
//                               "Lifetime login, no expiry",
//                             ].map((text, idx) => (
//                               <li
//                                 key={idx}
//                                 className="flex items-center gap-3"
//                               >
//                                 <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
//                                   <span className="text-white text-xs">✓</span>
//                                 </div>
//                                 <span>{text}</span>
//                               </li>
//                             ))}
//                           </ul>
//                           <button
//                             onClick={() => handleBuyNow("UK")}
//                             className="w-full bg-white text-slate-900 py-3 rounded-full text-sm font-semibold hover:bg-slate-100 hover:shadow-lg transition-all duration-300"
//                           >
//                             Buy Now (GBP)
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </motion.div>
//                 )}
//               </div>

//               {/* Chevron controls only when both visible */}
//               <div className="flex justify-center items-center gap-6 mt-6">
//                 {userCountry === "OTHER" && (
//                   <>
//                     <button
//                       type="button"
//                       onClick={() => setActivePlanIndex(0)}
//                       className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-full transition-all shadow-sm"
//                     >
//                       <ChevronLeft className="h-5 w-5 text-slate-700" />
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => setActivePlanIndex(1)}
//                       className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-full transition-all shadow-sm"
//                     >
//                       <ChevronRight className="h-5 w-5 text-slate-700" />
//                     </button>
//                   </>
//                 )}
//               </div>

//               {/* <p className="mt-6 text-xs text-slate-500 text-center">
//                 By proceeding, you agree to our{" "}
//                 <button
//                   type="button"
//                   onClick={openTermsModal}
//                   className="underline decoration-slate-400 hover:decoration-slate-700 hover:text-slate-800"
//                 >
//                   Terms &amp; Conditions
//                 </button>
//                 .
//               </p> */}
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {/* TESTIMONIALS */}
//       <section className="py-20 bg-white">
//         <div className="w-full px-8 lg:px-16">
//           <motion.div
//             initial={{ opacity: 0 }}
//             whileInView={{ opacity: 1 }}
//             viewport={{ once: true }}
//             className="text-center mb-14"
//           >
//             <h2 className="text-3xl lg:text-4xl font-black mb-3 text-slate-900">
//               HOW NETWORK NOTE HELPED JOB SEEKERS GET HIRED
//             </h2>
//           </motion.div>

//           <div className="grid md:grid-cols-3 gap-8">
//             {testimonials.map((testimonial, i) => (
//               <motion.div
//                 key={i}
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: i * 0.1 }}
//                 whileHover={{
//                   y: -6,
//                   boxShadow: "0 0 30px rgba(148,163,184,0.4)",
//                 }}
//                 className="p-7 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer transition-all"
//               >
//                 <div className="text-5xl mb-4">{testimonial.avatar}</div>
//                 <div className="flex gap-1 mb-4">
//                   {Array.from({ length: testimonial.rating }).map((_, j) => (
//                     <Star
//                       key={j}
//                       className="h-4 w-4 fill-cyan-500 text-cyan-500"
//                     />
//                   ))}
//                 </div>
//                 <p className="text-slate-700 mb-6 italic text-sm">
//                   "{testimonial.quote}"
//                 </p>
//                 <div>
//                   <p className="font-semibold text-slate-900">
//                     {testimonial.name}
//                   </p>
//                   <p className="text-slate-600 text-xs">
//                     {testimonial.role} at {testimonial.company}
//                   </p>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* FAQ – The 'Resources' nav link points here */}
//       <section
//         id="resources"
//         className="py-20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
//       >
//         <div className="w-full px-8 lg:px-16">
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             className="text-center mb-14"
//           >
//             <h2 className="text-3xl lg:text-4xl font-black mb-3 text-white">
//               Frequently Asked Questions
//             </h2>
//           </motion.div>

//           <div className="max-w-3xl mx-auto space-y-4">
//             {faqs.map((faq, i) => (
//               <motion.div
//                 key={i}
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: i * 0.05 }}
//                 className="backdrop-blur-xl bg-white/5 border border-white/15 rounded-xl overflow-hidden hover:border-cyan-400/50 transition-all"
//               >
//                 <button
//                   onClick={() =>
//                     setOpenFaq(openFaq === i ? null : i)
//                   }
//                   className="w-full p-5 flex items-center justify-between text-left"
//                 >
//                   <span className="font-semibold text-white text-sm">
//                     {faq.q}
//                   </span>
//                   <motion.div
//                     animate={{ rotate: openFaq === i ? 180 : 0 }}
//                     transition={{ duration: 0.3 }}
//                   >
//                     {openFaq === i ? (
//                       <Minus className="h-4 w-4 text-cyan-400" />
//                     ) : (
//                       <Plus className="h-4 w-4 text-slate-400" />
//                     )}
//                   </motion.div>
//                 </button>
//                 <motion.div
//                   initial={false}
//                   animate={{ height: openFaq === i ? "auto" : 0 }}
//                   transition={{ duration: 0.3 }}
//                   className="overflow-hidden"
//                 >
//                   <p className="px-5 pb-5 text-slate-200 text-sm">
//                     {faq.a}
//                   </p>
//                 </motion.div>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* FOOTER – The 'Company' nav link points here */}
//       <footer id="company" className="border-t border-slate-200 bg-slate-50">
//         <div className="w-full px-8 lg:px-16 py-14">
//           <div className="grid md:grid-cols-3 gap-10 mb-10">
//             <div>
//               <div className="flex items-center gap-3 mb-4">
//                 {/* <div className="h-8 w-8 rounded-xl bg-violet-100 flex items-center justify-center">
//                   <span className="text-xs font-semibold text-violet-700">
//                     NN
//                   </span>
//                 </div> */}
//                 <div className="h-8 w-8 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
//                   <img
//                     src="/images/networknote_final_logo_1 (2).jpg"
//                     alt="NetworkNote logo"
//                     className="h-full w-full object-cover"
//                   />
//                 </div>

//                 <span className="text-lg font-semibold text-slate-900">
//                   NetworkNote
//                 </span>
//               </div>
//               <p className="text-slate-600 text-sm">Your Career, Better.</p>
//             </div>

//             <div>
//               <h4 className="font-semibold mb-4 text-slate-900 text-sm">
//                 Quick Links
//               </h4>
//               <div className="space-y-2 text-sm">
//                 {["Solutions", "Pricing", "Privacy", "Terms", "Careers"].map(
//                   (link) => (
//                     <a
//                       key={link}
//                       href="#"
//                       className="block text-slate-600 hover:text-slate-900 transition-colors"
//                     >
//                       {link}
//                     </a>
//                   )
//                 )}
//               </div>
//             </div>

//             <div>
//               <h4 className="font-semibold mb-4 text-slate-900 text-sm">
//                 Connect
//               </h4>
//               <div className="flex gap-3">
//                 {[
//                   { icon: Linkedin, href: "#" },
//                   { icon: Youtube, href: "#" },
//                   { icon: Twitter, href: "#" },
//                   { icon: Instagram, href: "#" },
//                 ].map((social, i) => (
//                   <motion.a
//                     key={i}
//                     href={social.href}
//                     whileHover={{
//                       scale: 1.1,
//                       boxShadow: "0 0 18px rgba(148,163,184,0.6)",
//                     }}
//                     className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:border-cyan-400 transition-all"
//                   >
//                     <social.icon className="h-4 w-4 text-slate-600" />
//                   </motion.a>
//                 ))}
//               </div>
//             </div>
//           </div>

//           <div className="pt-6 border-t border-slate-200 text-center text-slate-500 text-xs">
//             <p>© {new Date().getFullYear()} Network Note | All Rights Reserved</p>
//           </div>
//         </div>
//       </footer>

//       {/* TERMS MODAL – unchanged except colors tweaked slightly */}
//       {showTermsModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//           <div className="relative mx-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
//             <button
//               onClick={closeTermsModal}
//               className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-5 w-5"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M6 18L18 6M6 6l12 12"
//                 />
//               </svg>
//             </button>

//             <h2 className="text-xl font-semibold text-slate-900 mb-4">
//               Network Note – Terms &amp; Conditions
//             </h2>

//             <div className="text-slate-600 space-y-3 text-sm">
//               <p className="font-medium">
//                 By proceeding, I agree that:
//               </p>

//               <ul className="space-y-2 list-disc list-inside">
//                 <li>
//                   I am purchasing lifetime access to Network Note&apos;s premium
//                   features and resources
//                 </li>
//                 <li>
//                   This is a digital, non-refundable product, no cancellations or
//                   refunds after purchase
//                 </li>
//                 <li>
//                   Job links, company information or career portals shown inside
//                   the product may change over time
//                 </li>
//                 <li>
//                   Sponsorship or job availability depends on each company&apos;s
//                   hiring policy at the time of access
//                 </li>
//                 <li>
//                   Network Note is not a recruitment agency and does not
//                   guarantee any job or sponsorship
//                 </li>
//                 <li>
//                   I will use the platform only for my personal job search
//                   purposes
//                 </li>
//               </ul>

//               <div className="pt-4 mt-4 border-t border-slate-200">
//                 <button
//                   onClick={closeTermsModal}
//                   className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 focus:ring-2 focus:ring-slate-400 text-sm"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }





// src/pages/Landing.tsx
import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
// Removed GSAP imports and related logic due to module resolution errors.
// Scrolling is now handled using native browser smooth scrolling.
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Video,
  Upload,
  Share2,
  BarChart3,
  Sparkles,
  Star,
  Linkedin,
  Youtube,
  Twitter,
  Instagram,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// --- START: Mocked/Local Dependencies to resolve import errors ---
// (keep these if you don't have the real components in this environment)
const AuthContext = React.createContext({ isAuthenticated: false });
const useAuthContext = () => React.useContext(AuthContext);
const Button = ({ children, className = "", onClick, variant, size, ...props }: any) => (
  <button className={`p-2 rounded-xl text-sm font-medium ${className}`} onClick={onClick} {...props}>
    {children}
  </button>
);
const Card = ({ children, className = "" }: any) => <div className={`rounded-xl border bg-white shadow-sm ${className}`}>{children}</div>;
const CardContent = ({ children, className = "" }: any) => <div className={`p-6 ${className}`}>{children}</div>;
const Input = ({ className = "", ...props }: any) => <input className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${className}`} {...props} />;
const TypeAnimation = ({ sequence, cursor, className, ...props }: any) => (
  <span className={className}>{sequence[0]}</span>
);
// --- END: Mocked/Local Dependencies ---

const ASSET_IMAGE = "/mnt/data/ba866d83-dfcd-42fc-a5c0-f6581a9a459e.png";

const slideUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.12,
      ease: "easeOut",
    },
  }),
};

const cardClass = "relative rounded-2xl";
const glow = "pointer-events-none absolute -inset-0.5 bg-gradient-to-r from-blue-500/40 to-purple-600/40 blur-lg opacity-60";

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();

  const mainRef = useRef<HTMLDivElement | null>(null);
  const { scrollY } = useScroll();
  const headerBlur = useTransform(scrollY, [0, 100], [8, 18]);

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [userCountry, setUserCountry] = useState<"US" | "GB" | "OTHER">("OTHER");
  const [activePlanIndex, setActivePlanIndex] = useState(0);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const companies = [
    "Amazon",
    "Meta",
    "EY",
    "Revolut",
    "Accenture",
    "HubSpot",
    "Adobe",
    "Tesla",
    "Coca-Cola",
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer",
      company: "Meta",
      avatar: "👩‍💻",
      quote:
        "Network Note helped me stand out from 200+ applicants. I got 3 interview requests within a week!",
      rating: 5,
    },
    {
      name: "Marcus Johnson",
      role: "Product Manager",
      company: "Amazon",
      avatar: "👨‍💼",
      quote:
        "The video resume format let me showcase my personality. Recruiters loved it and I landed my dream job.",
      rating: 5,
    },
    {
      name: "Priya Patel",
      role: "UX Designer",
      company: "Adobe",
      avatar: "👩‍🎨",
      quote:
        "I was skeptical at first, but Network Note completely transformed my job search. Highly recommend!",
      rating: 5,
    },
  ];

  const faqs = [
    {
      q: "How do I create my first Network Note?",
      a: "Simply sign up for free, upload your resume, record a 60-90 second video pitch, and share it with recruiters. Our platform guides you through each step.",
    },
    {
      q: "Can I re-record my video?",
      a: "Absolutely! You can record as many takes as you need until you're happy with your video pitch.",
    },
    {
      q: "What file formats are supported?",
      a: "We support PDF and DOCX for resumes, and MP4, MOV, and WEBM for video files.",
    },
    {
      q: "How secure is my data?",
      a: "Your data is encrypted and stored securely. We never share your information without your explicit permission.",
    },
    {
      q: "Is Network Note really free?",
      a: "Yes! Our basic plan is completely free. Premium features are available for advanced users.",
    },
    {
      q: "How long should my video be?",
      a: "We recommend 60-90 seconds. This is enough time to make an impact without losing the recruiter's attention.",
    },
  ];

  useEffect(() => {
    const links = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');
    const onClick = (e: Event) => {
      const anchor = e.currentTarget as HTMLAnchorElement;
      const href = anchor.getAttribute("href") || "";
      if (!href.startsWith("#")) return;
      const id = href.slice(1);
      const target = id ? document.getElementById(id) : null;
      e.preventDefault();
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    links.forEach((a) => a.addEventListener("click", onClick));
    return () => links.forEach((a) => a.removeEventListener("click", onClick));
  }, []);

  useEffect(() => {
    const detectCountry = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        if (data?.country_code === "US") {
          setUserCountry("US");
          setActivePlanIndex(0);
        } else if (data?.country_code === "GB") {
          setUserCountry("GB");
          setActivePlanIndex(1);
        } else {
          // unknown — show BOTH cards for user to choose
          setUserCountry("OTHER");
          setActivePlanIndex(0);
        }
      } catch (error) {
        console.warn("Could not detect country:", error);
        setUserCountry("OTHER");
        setActivePlanIndex(0);
      }
    };

    detectCountry();
  }, []);

  const handleBuyNow = (plan: "US" | "UK") => {
    const isUK = plan === "UK";
    const amount = isUK ? 0.1 : 0.1;
    const currency = isUK ? "GBP" : "USD";
    navigate("/signup", {
      state: { plan, amount, currency },
    });
  };

  const openTermsModal = () => setShowTermsModal(true);
  const closeTermsModal = () => setShowTermsModal(false);

  return (
    <div ref={mainRef} className="fixed inset-0 bg-slate-50 text-slate-900 overflow-x-hidden">
      <motion.header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 shadow-sm" style={{ backdropFilter: useTransform(headerBlur, (v) => `blur(${v}px)`) }}>
        <div className="w-full px-8 lg:px-16 py-3.5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
              <div className="h-8 w-8 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                <img src="/images/networknote_final_logo_1 (2).jpg" alt="NetworkNote logo" className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-semibold text-slate-900">NetworkNote</span>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              {["Solutions", "Resources", "Company", "Pricing"].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-l text-slate-500 hover:text-slate-900 transition-colors relative group font-xl">
                  {item}
                  <span className="absolute bottom-[-6px] left-0 w-0 h-[2px] bg-gradient-to-r from-violet-500 to-cyan-400 group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Button variant="outline" className="hidden sm:inline-flex border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 rounded-xl px-4 py-2 text-sm" onClick={() => navigate("/auth")}>Login</Button>
              <Button className="bg-slate-900 text-white rounded-xl px-4 sm:px-5 py-2 text-sm font-semibold hover:bg-slate-800 hover:shadow-lg active:scale-[0.98] transition-all flex items-center" onClick={() => navigate(isAuthenticated ? "/dashboard" : "/signup")}>
                {isAuthenticated ? "Dashboard" : "Get Started"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <section className="relative py-16 lg:py-24">
        <div className="w-full px-8 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <h1 className="text-6xl lg:text-6xl font-black tracking-tight mb-5 leading-tight text-slate-900">
                <TypeAnimation sequence={["YOUR NETWORK NOTE.", 1000]} speed={0.2 as any} repeat={0} cursor={true} className="text-slate-900" />
              </h1>

              <p className="text-base sm:text-xl text-slate-600 mb-6 leading-relaxed max-w-xl">
                Network Note helps you stand out and land interviews by creating personalized video resumes that build instant connections with recruiters.
              </p>

              <Button size="lg" className="bg-slate-900 text-white rounded-xl hover:bg-slate-800 hover:shadow-xl active:scale-[0.98] transition-all text-base px-7 flex items-center" onClick={() => navigate("/signup")}>
                Sign up for free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative">
              <div className="relative rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-xl p-6 lg:p-8">
                <div className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center relative overflow-hidden border border-slate-200 shadow-md">
                  <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/10 to-violet-400/10 pointer-events-none" />
                  <video src="/videos/demo.mp4" autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover rounded-xl">Your browser does not support the video tag.</video>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-52 h-52 bg-cyan-400/20 rounded-full blur-3xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="w-full px-8 lg:px-16">
          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative rounded-3xl bg-white border border-slate-200 shadow-md p-6 lg:p-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2 text-slate-900">Your Dashboard</h2>
                <p className="text-slate-500">Manage all your Network Notes in one place.</p>
              </div>
              <Button size="lg" className="bg-slate-900 text-white rounded-xl hover:bg-slate-800 hover:shadow-lg transition-all font-semibold flex items-center" onClick={() => navigate("/auth")}>
                <Plus className="mr-2 h-5 w-5" /> New Network Note
              </Button>
            </div>
            <div className="mt-8 aspect-video rounded-xl border border-slate-200 bg-cover bg-center bg-no-repeat shadow-sm" style={{ backgroundImage: `url('${ASSET_IMAGE}')`, backgroundSize: "100%" }} />
          </motion.div>
        </div>
      </section>

      <section className="py-14 bg-white border-y border-slate-200">
        <div className="w-full px-8 lg:px-16">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
            <h3 className="text-xl font-semibold mb-2 text-slate-900">Over 200 candidates have landed interviews globally through Network Note</h3>
          </motion.div>
          <div className="relative overflow-hidden">
            <motion.div className="flex gap-10 items-center" animate={{ x: [0, -1000] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}>
              {[...companies, ...companies].map((company, i) => (
                <div key={i} className="text-3xl font-bold text-slate-300 whitespace-nowrap">{company}</div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section id="solutions" className="py-20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="w-full px-8 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl lg:text-4xl font-black mb-5 leading-tight text-white">GET HIRED FASTER WITH A PERSONALIZED VIDEO RESUME</h2>
              <p className="text-slate-300 text-base sm:text-lg">Recruiters skim hundreds of resumes daily — Network Note helps put your story front and center.</p>
            </motion.div>

            <div className="grid gap-6">
              {[{ icon: Sparkles, title: "Create your video pitch in seconds", desc: "AI-powered pitch tool helps you craft the perfect message.", color: "from-purple-500 to-pink-500" }, { icon: Video, title: "Record with in-app teleprompter", desc: "Never forget what to say with our built-in teleprompter.", color: "from-blue-500 to-cyan-500" }, { icon: BarChart3, title: "View insights on engagement", desc: "Track views, applications, and recruiter interest.", color: "from-green-500 to-emerald-500" }, { icon: Share2, title: "Easily integrate with job platforms", desc: "Share directly to LinkedIn, Indeed, and ZipRecruiter.", color: "from-orange-500 to-red-500" }].map((feature, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(34,211,238,0.35)", y: -6 }} className="p-6 rounded-2xl bg-white/5 border border-white/10 cursor-pointer transition-all group">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}><feature.icon className="h-6 w-6 text-white" /></div>
                  <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-cyan-300 transition-colors">{feature.title}</h3>
                  <p className="text-slate-300 text-sm">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRICING – fixed rendering logic: US-only, GB-only, or BOTH when UNKNOWN */}
      <section id="pricing" className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <p className="text-center text-lg font-semibold tracking-[0.2em] uppercase text-violet-600">Pricing</p>
          <motion.h2 variants={slideUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} custom={0} className="text-3xl sm:text-4xl font-bold text-center mb-16 text-slate-900">Simple one-time pricing</motion.h2>

          <motion.div variants={slideUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} custom={1} className="max-w-md mx-auto">
            <div className="relative overflow-visible">
              <div className="relative h-[420px] overflow-visible">
                {/* RENDER LOGIC: only render the matching region card, unless userCountry === "OTHER" (unknown) -> show both */}
                {/* US Card: show if detected US OR if unknown (OTHER) and you want to show both; here we show only when US or OTHER */}
                { (userCountry === "US" || userCountry === "OTHER") && (
                  <motion.div className="absolute inset-0" animate={ activePlanIndex === 0 ? { scale: 1, x: 0, y: 0, opacity: 1, zIndex: 20 } : { scale: 0.92, x: -110, y: 24, opacity: 0.75, zIndex: 10 } } transition={{ duration: 0.45, ease: "easeInOut" }}>
                    <div className={cardClass}>
                      <div className={glow} />
                      <div className="relative bg-slate-900 rounded-2xl p-8 text-white overflow-hidden shadow-xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-violet-500/10" />
                        <div className="relative">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-slate-100">Lifetime Access (US)</h3>
                            {userCountry === "US" && <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-cyan-500/90 text-slate-900">Recommended</span>}
                          </div>
                          <div className="mb-6">
                            <span className="text-4xl font-bold">$12.99</span>
                            <span className="text-slate-300 ml-2"> / lifetime</span>
                          </div>
                          <ul className="space-y-3 mb-8 text-sm">
                            {["Access 150+ verified companies","Company names, domains & career links","Weekly list updates included","Lifetime login, no expiry"].map((text, idx) => (
                              <li key={idx} className="flex items-center gap-3">
                                <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"><span className="text-white text-xs">✓</span></div>
                                <span>{text}</span>
                              </li>
                            ))}
                          </ul>
                          <button onClick={() => handleBuyNow("US")} className="w-full bg-white text-slate-900 py-3 rounded-full text-sm font-semibold hover:bg-slate-100 hover:shadow-lg transition-all duration-300">Buy Now (USD)</button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* UK Card: show if detected GB OR if unknown (OTHER) -> show both */}
                { (userCountry === "GB" || userCountry === "OTHER") && (
                  <motion.div className="absolute inset-0" animate={ activePlanIndex === 1 ? { scale: 1, x: 0, y: 0, opacity: 1, zIndex: 20 } : { scale: 0.92, x: 110, y: 24, opacity: 0.75, zIndex: 10 } } transition={{ duration: 0.45, ease: "easeInOut" }}>
                    <div className={cardClass}>
                      <div className={glow} />
                      <div className="relative bg-slate-900 rounded-2xl p-8 text-white overflow-hidden shadow-xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-violet-500/10" />
                        <div className="relative">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-slate-100">Lifetime Access (UK)</h3>
                            {userCountry === "GB" && <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-cyan-500/90 text-slate-900">Recommended</span>}
                          </div>
                          <div className="mb-6">
                            <span className="text-4xl font-bold">£12.99</span>
                            <span className="text-slate-300 ml-2"> / lifetime</span>
                          </div>
                          <ul className="space-y-3 mb-8 text-sm">
                            {["Access 150+ verified companies","Company names, domains & career links","Weekly list updates included","Lifetime login, no expiry"].map((text, idx) => (
                              <li key={idx} className="flex items-center gap-3">
                                <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"><span className="text-white text-xs">✓</span></div>
                                <span>{text}</span>
                              </li>
                            ))}
                          </ul>
                          <button onClick={() => handleBuyNow("UK")} className="w-full bg-white text-slate-900 py-3 rounded-full text-sm font-semibold hover:bg-slate-100 hover:shadow-lg transition-all duration-300">Buy Now (GBP)</button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Show chevrons only when BOTH cards are visible (i.e. userCountry === "OTHER") */}
              <div className="flex justify-center items-center gap-6 mt-6">
                {userCountry === "OTHER" && (
                  <>
                    <button type="button" onClick={() => setActivePlanIndex(0)} className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-full transition-all shadow-sm"><ChevronLeft className="h-5 w-5 text-slate-700" /></button>
                    <button type="button" onClick={() => setActivePlanIndex(1)} className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-full transition-all shadow-sm"><ChevronRight className="h-5 w-5 text-slate-700" /></button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* REST OF THE PAGE (testimonials, faq, footer) unchanged below */}
      <section className="py-20 bg-white">
        <div className="w-full px-8 lg:px-16">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-black mb-3 text-slate-900">HOW NETWORK NOTE HELPED JOB SEEKERS GET HIRED</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -6, boxShadow: "0 0 30px rgba(148,163,184,0.4)" }} className="p-7 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer transition-all">
                <div className="text-5xl mb-4">{testimonial.avatar}</div>
                <div className="flex gap-1 mb-4">{Array.from({ length: testimonial.rating }).map((_, j) => <Star key={j} className="h-4 w-4 fill-cyan-500 text-cyan-500" />)}</div>
                <p className="text-slate-700 mb-6 italic text-sm">"{testimonial.quote}"</p>
                <div><p className="font-semibold text-slate-900">{testimonial.name}</p><p className="text-slate-600 text-xs">{testimonial.role} at {testimonial.company}</p></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="resources" className="py-20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="w-full px-8 lg:px-16">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-black mb-3 text-white">Frequently Asked Questions</h2>
          </motion.div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="backdrop-blur-xl bg-white/5 border border-white/15 rounded-xl overflow-hidden hover:border-cyan-400/50 transition-all">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full p-5 flex items-center justify-between text-left">
                  <span className="font-semibold text-white text-sm">{faq.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.3 }}>{openFaq === i ? <Minus className="h-4 w-4 text-cyan-400" /> : <Plus className="h-4 w-4 text-slate-400" />}</motion.div>
                </button>
                <motion.div initial={false} animate={{ height: openFaq === i ? "auto" : 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                  <p className="px-5 pb-5 text-slate-200 text-sm">{faq.a}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer id="company" className="border-t border-slate-200 bg-slate-50">
        <div className="w-full px-8 lg:px-16 py-14">
          <div className="grid md:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center"><img src="/images/networknote_final_logo_1 (2).jpg" alt="NetworkNote logo" className="h-full w-full object-cover" /></div>
                <span className="text-lg font-semibold text-slate-900">NetworkNote</span>
              </div>
              <p className="text-slate-600 text-sm">Your Career, Better.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-slate-900 text-sm">Quick Links</h4>
              <div className="space-y-2 text-sm">{["Solutions","Pricing","Privacy","Terms","Careers"].map((link) => <a key={link} href="#" className="block text-slate-600 hover:text-slate-900 transition-colors">{link}</a>)}</div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-slate-900 text-sm">Connect</h4>
              <div className="flex gap-3">{[{ icon: Linkedin, href: "#" },{ icon: Youtube, href: "#" },{ icon: Twitter, href: "#" },{ icon: Instagram, href: "#" }].map((social, i) => <motion.a key={i} href={social.href} whileHover={{ scale: 1.1, boxShadow: "0 0 18px rgba(148,163,184,0.6)" }} className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:border-cyan-400 transition-all"><social.icon className="h-4 w-4 text-slate-600" /></motion.a>)}</div>
            </div>
          </div>
          <div className="pt-6 border-t border-slate-200 text-center text-slate-500 text-xs"><p>© {new Date().getFullYear()} Network Note | All Rights Reserved</p></div>
        </div>
      </footer>

      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative mx-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <button onClick={closeTermsModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Network Note – Terms &amp; Conditions</h2>
            <div className="text-slate-600 space-y-3 text-sm">
              <p className="font-medium">By proceeding, I agree that:</p>
              <ul className="space-y-2 list-disc list-inside">
                <li>I am purchasing lifetime access to Network Note's premium features and resources</li>
                <li>This is a digital, non-refundable product, no cancellations or refunds after purchase</li>
                <li>Job links, company information or career portals shown inside the product may change over time</li>
                <li>Sponsorship or job availability depends on each company's hiring policy at the time of access</li>
                <li>Network Note is not a recruitment agency and does not guarantee any job or sponsorship</li>
                <li>I will use the platform only for my personal job search purposes</li>
              </ul>
              <div className="pt-4 mt-4 border-t border-slate-200">
                <button onClick={closeTermsModal} className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 focus:ring-2 focus:ring-slate-400 text-sm">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
