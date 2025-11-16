import { motion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useEffect, useRef } from "react";
import { 
  ArrowRight, 
  CheckCircle2, 
  Video, 
  Upload, 
  Share2, 
  BarChart3, 
  Sparkles,
  ChevronDown,
  Play,
  Star,
  Linkedin,
  Youtube,
  Twitter,
  Instagram,
  Plus,
  Minus
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import { useState } from "react";
import { TypeAnimation } from "react-type-animation";

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { scrollY } = useScroll();
  const headerBlur = useTransform(scrollY, [0, 100], [10, 25]);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Smooth scroll behavior
    if (mainRef.current) {
      mainRef.current.style.scrollBehavior = 'smooth';
    }
  }, []);

  useEffect(() => {
    // GSAP smooth scrolling for in-page anchors
    gsap.registerPlugin(ScrollToPlugin);
    const links = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');

    const onClick = (e: Event) => {
      const anchor = e.currentTarget as HTMLAnchorElement;
      const href = anchor.getAttribute("href") || "";
      if (!href.startsWith("#")) return;

      const id = href.slice(1);
      const target = id ? document.getElementById(id) : null;

      e.preventDefault();
      gsap.to(window, {
        duration: 0.8,
        ease: "power2.out",
        scrollTo: target ?? 0,
      });
    };

    links.forEach((a) => a.addEventListener("click", onClick));
    return () => links.forEach((a) => a.removeEventListener("click", onClick));
  }, []);

  const companies = [
    "Amazon", "Meta", "EY", "Revolut", "Accenture", 
    "HubSpot", "Adobe", "Tesla", "Coca-Cola"
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer",
      company: "Meta",
      avatar: "👩‍💻",
      quote: "Career Cast helped me stand out from 200+ applicants. I got 3 interview requests within a week!",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      role: "Product Manager",
      company: "Amazon",
      avatar: "👨‍💼",
      quote: "The video resume format let me showcase my personality. Recruiters loved it and I landed my dream job.",
      rating: 5
    },
    {
      name: "Priya Patel",
      role: "UX Designer",
      company: "Adobe",
      avatar: "👩‍🎨",
      quote: "I was skeptical at first, but Career Cast completely transformed my job search. Highly recommend!",
      rating: 5
    }
  ];

  const faqs = [
    {
      q: "How do I create my first Career Cast?",
      a: "Simply sign up for free, upload your resume, record a 60-90 second video pitch, and share it with recruiters. Our platform guides you through each step."
    },
    {
      q: "Can I re-record my video?",
      a: "Absolutely! You can record as many takes as you need until you're happy with your video pitch."
    },
    {
      q: "What file formats are supported?",
      a: "We support PDF and DOCX for resumes, and MP4, MOV, and WEBM for video files."
    },
    {
      q: "How secure is my data?",
      a: "Your data is encrypted and stored securely. We never share your information without your explicit permission."
    },
    {
      q: "Is Career Cast really free?",
      a: "Yes! Our basic plan is completely free. Premium features are available for advanced users."
    },
    {
      q: "How long should my video be?",
      a: "We recommend 60-90 seconds. This is enough time to make an impact without losing the recruiter's attention."
    }
  ];

  return (
    <div ref={mainRef} className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-foreground overflow-x-hidden">
      {/* Sticky Glass Header */}
      <motion.header
  className="sticky top-0 z-50 border-b border-border/50 bg-white/80 shadow-sm"
  style={{
    backdropFilter: useTransform(headerBlur, (v) => `blur(${v}px)`),
  }}
>
  <div className="max-w-[1440px] mx-auto px-8 lg:px-20 py-4">
    <div className="flex items-center justify-between">
      {/* Logo + Branding */}
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate("/")}
      >
        {/* Cyan gradient from STEP #1 */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] flex items-center justify-center shadow-md">
          <Video className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] bg-clip-text text-transparent">
          Career Cast
        </span>
      </div>

      {/* Navigation */}
      <nav className="hidden md:flex items-center gap-8">
        {["Solutions", "Resources", "Company", "Pricing"].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            className="text-muted-foreground hover:text-foreground transition-colors relative group font-medium"
          >
            {item}
            {/* Underline gradient */}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] group-hover:w-full transition-all duration-300" />
          </a>
        ))}
      </nav>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          className="border-border text-gray-700 hover:border-cyan-400 hover:text-cyan-600 hover:bg-cyan-50 transition-all"
          onClick={() => navigate("/auth")}
        >
          Login
        </Button>

        {/* Primary Button with gradient */}
        <Button
          className="bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] text-white font-semibold hover:shadow-lg hover:scale-105 transition-all px-5 py-2"
          onClick={() =>
            // navigate(isAuthenticated ? "/dashboard" : "/auth")
            navigate("/auth")
          }
        >
          {isAuthenticated ? "Dashboard" : "Get Started"}
        </Button>
      </div>
    </div>
  </div>
</motion.header>


      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
  <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Gradient line using STEP #1 colors */}
        {/* <div className="w-1 h-24 bg-gradient-to-b from-[#0B4F6C] to-[#159A9C] mb-6 rounded-full" /> */}

       

<h1 className="text-5xl lg:text-7xl font-black tracking-tight mb-6 leading-tight text-gray-900">
  <TypeAnimation
    sequence={[
      "YOUR CAREER, CAST.", // text to type
      1000,                 // pause at end (1s)
    ]}
    speed={0.2 as any}            // ⏳ slower typing speed (higher = slower)
    repeat={0}              // 🔁 0 = no repeat, only types once
    cursor={true}           // blinking cursor stays visible
    className="text-gray-900"
  />
</h1>



        <p className="text-lg text-muted-foreground mb-6 leading-relaxed max-w-xl">
          Career Cast helps you stand out and land interviews by creating personalized video resumes that build instant connections with recruiters.
        </p>

        {/* <div className="flex items-center gap-2 mb-8">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-5 w-5 fill-cyan-400 text-cyan-400" />
          ))}
          <span className="text-muted-foreground ml-2">5,000+ happy users</span>
        </div> */}

        {/* Updated Button gradient */}
        <Button
          size="lg"
          className="bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] text-white hover:shadow-xl hover:scale-105 transition-all text-lg px-8"
          onClick={() => navigate('/auth')}
        >
          Sign up for free
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative"
      >
        <div className="relative rounded-2xl overflow-hidden backdrop-blur-xl bg-white/80 border border-border shadow-2xl p-8">
          {/* Video placeholder card gradient updated */}
          <div className="aspect-video bg-gradient-to-br from-slate-100 to-cyan-50 rounded-xl flex items-center justify-center relative overflow-hidden border border-border shadow-lg">
  {/* Soft overlay gradient */}
  <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-cyan-400/10 z-10 pointer-events-none" />

  {/* 🎥 Video Element */}
  <video
  src="/videos/demo.mp4"
  autoPlay
  muted
  loop
  playsInline
  className="absolute inset-0 w-full h-full object-cover rounded-xl"
>

    Your browser does not support the video tag.
  </video>

  {/* Bottom overlay info bar */}
  {/* <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20">
    <span className="text-foreground text-sm font-medium bg-white/80 px-3 py-1 rounded-md shadow-sm">
      Professional Video Resume
    </span>
    <div className="flex items-center gap-2 bg-red-50/90 px-2 py-1 rounded-full border border-red-200 shadow-sm">
      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      <span className="text-red-600 text-xs font-semibold">REC</span>
    </div>
  </div> */}
</div>

        </div>

        {/* Glow circle updated to cyan */}
        <div className="absolute -bottom-4 -right-4 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl -z-10" />
      </motion.div>
    </div>
  </div>
</section>

      {/* Dashboard Preview */}
      <section id="pricing" className="py-20">
        <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-3xl overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10 p-8 lg:p-12"
          >
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-4">Your Dashboard</h2>
                <p className="text-slate-600">Manage all your Career Casts in one place</p>
              </div>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] text-black hover:shadow-[0_0_30px_rgba(132,204,22,0.5)] transition-all font-semibold"
              >
                <Plus className="mr-2 h-5 w-5" />
                New Career Cast
              </Button>
            </div>
<div
  className="mt-8 aspect-video rounded-xl border border-white/10 bg-cover bg-center bg-no-repeat shadow-lg"
  style={{
    backgroundImage: "url('/images/image.png')",
    backgroundSize: "100%", // Scales the image to 50% of its original size
  }}
/>

          </motion.div>
        </div>
      </section>

      {/* Featured In */}
      <section className="py-16 backdrop-blur-xl bg-white/5 border-y border-white/10">
        <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-2xl font-bold mb-2">
              Over 200 candidates have landed interviews globally through Career Cast
            </h3>
          </motion.div>
          <div className="relative overflow-hidden">
            <motion.div
              className="flex gap-12 items-center"
              animate={{ x: [0, -1000] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
              {[...companies, ...companies].map((company, i) => (
                <div key={i} className="text-2xl font-bold text-slate-400 whitespace-nowrap">
                  {company}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-black mb-6 leading-tight text-white">
                GET HIRED FASTER WITH A PERSONALIZED VIDEO RESUME
              </h2>
              <p className="text-slate-300 text-lg">
                Recruiters skim hundreds of resumes daily — Career Cast helps put your story front and center.
              </p>
            </motion.div>

            <div className="grid gap-6">
              {[
                { title: "Highlight your key skills", desc: "Showcase what makes you unique" },
                { title: "Stand out from other applicants", desc: "Be memorable in a sea of resumes" },
                { title: "Build instant connections", desc: "Let your personality shine through" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(132,204,22,0.3)" }}
                  className="p-6 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 cursor-pointer transition-all"
                >
                  <h3 className="text-xl font-bold mb-2 text-white">
                    {item.title.split(" ").map((word, j) => 
                      j === item.title.split(" ").length - 2 ? (
                        <span key={j} className="text-lime-400">{word} </span>
                      ) : word + " "
                    )}
                  </h3>
                  <p className="text-slate-300">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Step 1 */}
      <section className="py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <Card className="backdrop-blur-xl bg-slate-50 border-slate-200">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <Input placeholder="First Name" className="bg-white border-slate-300 text-slate-900" />
                  <Input placeholder="Last Name" className="bg-white border-slate-300 text-slate-900" />
                  <Input placeholder="Email" type="email" className="bg-white border-slate-300 text-slate-900" />
                  <Input placeholder="Password" type="password" className="bg-white border-slate-300 text-slate-900" />
                  <Input placeholder="Confirm Password" type="password" className="bg-white border-slate-300 text-slate-900" />
                </div>
              </CardContent>
            </Card>

            <div>
              <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] text-white font-bold mb-4">
                STEP #1
              </div>
              <h2 className="text-4xl font-black mb-6 text-slate-900">Create your Career Cast account for free</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-lime-500 flex-shrink-0 mt-1" />
                  <p className="text-slate-700">Create your free account in seconds</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-lime-500 flex-shrink-0 mt-1" />
                  <p className="text-slate-700">Start personalizing your video resume</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Step 2 */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] text-white font-bold mb-4">
                STEP #2
              </div>
              <h2 className="text-4xl font-black mb-6 text-slate-900">Upload your resume to the platform</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-lime-500 flex-shrink-0 mt-1" />
                  <p className="text-slate-700">Upload your traditional resume</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-lime-500 flex-shrink-0 mt-1" />
                  <p className="text-slate-700">Build the foundation for your Career Cast</p>
                </div>
              </div>
            </div>

            <Card className="backdrop-blur-xl bg-white border-slate-200">
              <CardContent className="p-12 text-center">
                <Upload className="h-16 w-16 from-[#0B4F6C] to-[#159A9C] mx-auto mb-4" />
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 mb-4">
                  <p className="text-slate-600">Drag & drop your resume here</p>
                  <p className="text-slate-400 text-sm mt-2">PDF or DOCX</p>
                </div>
                <Button className="bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] text-white w-full hover:shadow-lg">
                  Next Step
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Step 3 */}
      <section className="py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <Card className="backdrop-blur-xl bg-slate-50 border-slate-200">
              <CardContent className="p-8">
                <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center relative">
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/20 px-3 py-1 rounded-full border border-red-400">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-red-400 text-xs font-bold">REC</span>
                  </div>
                  <Video className="h-16 w-16 text-slate-400" />
                </div>
              </CardContent>
            </Card>

            <div>
              <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] text-white font-bold mb-4">
                STEP #3
              </div>
              <h2 className="text-4xl font-black mb-6 text-slate-900">Record or attach a video pitch</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-lime-500 flex-shrink-0 mt-1" />
                  <p className="text-slate-700">Record a 60–90 second video</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-lime-500 flex-shrink-0 mt-1" />
                  <p className="text-slate-700">Use our tools to perfect your pitch</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Step 4 */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] text-white font-bold mb-4">
                STEP #4
              </div>
              <h2 className="text-4xl font-black mb-6 text-slate-900">Share your Career Cast with recruiters</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-lime-500 flex-shrink-0 mt-1" />
                  <p className="text-slate-700">Make sure your Career Cast looks great</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-lime-500 flex-shrink-0 mt-1" />
                  <p className="text-slate-700">Send your Career Cast to recruiters</p>
                </div>
              </div>
            </div>

            <Card className="backdrop-blur-xl bg-white border-slate-200">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-sm text-slate-500 mb-2">To: recruiter@company.com</p>
                    <p className="text-slate-700 mb-3">Hi, I'd love to share my Career Cast with you...</p>
                    <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-50 to-cyan-100 border border-cyan-300">
                      <p className="text-cyan-700 text-sm font-semibold">🎥 View My Career Cast</p>
                    </div>
                  </div>
                  <Button className="bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] text-white w-full hover:shadow-lg">
                    <Share2 className="mr-2 h-4 w-4" />
                    Send Career Cast
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="solutions" className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-white">
              BUILT TO HELP JOB SEEKERS STAND OUT
            </h2>
            <p className="text-slate-300 text-lg max-w-3xl mx-auto">
              Create video resumes that reflect your individuality, customize them for specific roles, 
              and use insights to enhance your job search — all in one intuitive platform.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Sparkles,
                title: "Create your video pitch in seconds",
                desc: "AI-powered pitch tool helps you craft the perfect message",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: Video,
                title: "Record with in-app teleprompter",
                desc: "Never forget what to say with our built-in teleprompter",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: BarChart3,
                title: "View insights on engagement",
                desc: "Track views, applications, and recruiter interest",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: Share2,
                title: "Easily integrate with job platforms",
                desc: "Share directly to LinkedIn, Indeed, and ZipRecruiter",
                color: "from-orange-500 to-red-500"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: "0 0 40px rgba(6,182,212,0.4)",
                  y: -8
                }}
                className="p-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 cursor-pointer transition-all group"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-cyan-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-300">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-slate-900">
              HOW CAREER CAST HELPED JOB SEEKERS GET HIRED
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, boxShadow: "0 0 30px rgba(6,182,212,0.3)" }}
                className="p-8 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer transition-all"
              >
                <div className="text-5xl mb-4">{testimonial.avatar}</div>
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-cyan-500 text-cyan-500" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-bold text-slate-900">{testimonial.name}</p>
                  <p className="text-slate-600 text-sm">{testimonial.role} at {testimonial.company}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="resources" className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-white">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl overflow-hidden hover:border-cyan-400/50 transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-6 flex items-center justify-between text-left"
                >
                  <span className="font-semibold text-white">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {openFaq === i ? (
                      <Minus className="h-5 w-5 text-cyan-400" />
                    ) : (
                      <Plus className="h-5 w-5 text-slate-400" />
                    )}
                  </motion.div>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: openFaq === i ? "auto" : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-6 text-slate-300">{faq.a}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="company" className="border-t border-slate-200 bg-slate-50">
        <div className="max-w-[1440px] mx-auto px-8 lg:px-20 py-16">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#0B4F6C] to-[#159A9C] flex items-center justify-center">
                  <Video className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">Career Cast</span>
              </div>
              <p className="text-slate-600">Your Career, Better.</p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-slate-900">Quick Links</h4>
              <div className="space-y-2">
                {["Solutions", "Pricing", "Privacy", "Terms", "Careers"].map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="block text-slate-600 hover:text-cyan-600 transition-colors"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-slate-900">Connect</h4>
              <div className="flex gap-4">
                {[
                  { icon: Linkedin, href: "#" },
                  { icon: Youtube, href: "#" },
                  { icon: Twitter, href: "#" },
                  { icon: Instagram, href: "#" }
                ].map((social, i) => (
                  <motion.a
                    key={i}
                    href={social.href}
                    whileHover={{ scale: 1.2, boxShadow: "0 0 20px rgba(6,182,212,0.5)" }}
                    className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:border-cyan-400 transition-all"
                  >
                    <social.icon className="h-5 w-5 text-slate-600" />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 text-center text-slate-600 text-sm">
            <p>© 2025 Career Cast | All Rights Reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}