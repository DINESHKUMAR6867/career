import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { BookOpen, Video, FileText, Lightbulb, TrendingUp, Award, X, Menu, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Resources() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<number | null>(null);

  const handleLogout = () => {
    navigate('/');
  };

  const handleCloseModal = () => {
    setSelectedResource(null);
  };

  const resources = [
    {
      icon: Video,
      title: 'Video Resume Best Practices',
      description: 'Learn how to create compelling video resumes that stand out to employers',
      color: 'from-blue-500 to-blue-600',
      link: 'https://example.com/video-resume-best-practices',
      detailedContent: `
        <h3 class="text-xl font-bold text-gray-900 mb-4">Video Resume Best Practices</h3>
        <p class="text-gray-600 mb-4">Creating an effective video resume requires more than just recording yourself talking. Here are key strategies to make your video resume stand out:</p>
        
        <h4 class="font-bold text-gray-900 mb-2">1. Preparation is Key</h4>
        <ul class="list-disc list-inside text-gray-600 mb-4">
          <li>Research the company and role thoroughly</li>
          <li>Prepare a clear, concise script (60-90 seconds)</li>
          <li>Practice your delivery multiple times</li>
          <li>Prepare for potential follow-up questions</li>
        </ul>
        
        <h4 class="font-bold text-gray-900 mb-2">2. Technical Setup</h4>
        <ul class="list-disc list-inside text-gray-600 mb-4">
          <li>Use good lighting (natural light works best)</li>
          <li>Ensure clear audio quality</li>
          <li>Choose a clean, professional background</li>
          <li>Test your equipment before recording</li>
        </ul>
        
        <h4 class="font-bold text-gray-900 mb-2">3. Content Structure</h4>
        <ul class="list-disc list-inside text-gray-600 mb-4">
          <li>Start with a strong introduction</li>
          <li>Highlight 2-3 key achievements</li>
          <li>Show enthusiasm for the role/company</li>
          <li>End with a clear call-to-action</li>
        </ul>
        
        <h4 class="font-bold text-gray-900 mb-2">4. Presentation Tips</h4>
        <ul class="list-disc list-inside text-gray-600 mb-4">
          <li>Maintain good eye contact with the camera</li>
          <li>Speak clearly and at a moderate pace</li>
          <li>Use natural gestures to emphasize points</li>
          <li>Dress professionally (business casual or formal)</li>
        </ul>
      `
    },
    {
      icon: FileText,
      title: 'Resume Templates',
      description: 'Download professional resume templates tailored for various industries',
      color: 'from-green-500 to-green-600',
      link: 'https://example.com/resume-templates',
      detailedContent: `
        <h3 class="text-xl font-bold text-gray-900 mb-4">Professional Resume Templates</h3>
        <p class="text-gray-600 mb-4">Our professionally designed templates help you create a standout resume that gets noticed by employers:</p>
        
        <h4 class="font-bold text-gray-900 mb-2">Template Features</h4>
        <ul class="list-disc list-inside text-gray-600 mb-4">
          <li>Clean, modern designs that pass ATS systems</li>
          <li>Industry-specific formatting options</li>
          <li>Easy to customize with your information</li>
          <li>Multiple layout choices (chronological, functional, hybrid)</li>
        </ul>
        
        <h4 class="font-bold text-gray-900 mb-2">Popular Industries</h4>
        <ul class="list-disc list-inside text-gray-600 mb-4">
          <li>Technology and IT</li>
          <li>Healthcare and Medical</li>
          <li>Finance and Accounting</li>
          <li>Marketing and Communications</li>
          <li>Engineering and Construction</li>
          <li>Education and Academia</li>
        </ul>
        
        <h4 class="font-bold text-gray-900 mb-2">Customization Tips</h4>
        <ul class="list-disc list-inside text-gray-600 mb-4">
          <li>Tailor content for each job application</li>
          <li>Use industry-specific keywords</li>
          <li>Quantify achievements with numbers</li>
          <li>Keep it concise (1-2 pages max)</li>
        </ul>
      `
    },
    {
      icon: Lightbulb,
      title: 'Interview Tips',
      description: 'Master the art of interviewing with our comprehensive guide',
      color: 'from-yellow-500 to-yellow-600',
      link: 'https://example.com/interview-tips',
      detailedContent: `
        <h3 class="text-xl font-bold text-gray-900 mb-4">Mastering Job Interviews</h3>
        <p class="text-gray-600 mb-4">Ace your next interview with these proven strategies and techniques:</p>
        
        <h4 class="font-bold text-gray-900 mb-2">Preparation Strategies</h4>
        <ul class="list-disc list-inside text-gray-600 mb-4">
          <li>Research the company culture and values</li>
          <li>Practice common interview questions</li>
          <li>Prepare specific examples using the STAR method</li>
          <li>Plan thoughtful questions for the interviewer</li>
        </ul>
        
        <h4 class="font-bold text-gray-900 mb-2">During the Interview</h4>
        <ul class="list-disc list-inside text-gray-600 mb-4">
          <li>Arrive 10-15 minutes early</li>
          <li>Maintain confident body language</li>
          <li>Listen actively and answer concisely</li>
          <li>Ask insightful questions about the role</li>
        </ul>
        
        <h4 class="font-bold text-gray-900 mb-2">Handling Difficult Questions</h4>
        <ul class="list-disc list-inside text-gray-600 mb-4">
          <li>Address weaknesses positively</li>
          <li>Explain employment gaps honestly</li>
          <li>Discuss salary expectations strategically</li>
          <li>Handle behavioral questions with specific examples</li>
        </ul>
        
        <h4 class="font-bold text-gray-900 mb-2">Follow-Up Best Practices</h4>
        <ul class="list-disc list-inside text-gray-600 mb-4">
          <li>Send a thank-you email within 24 hours</li>
          <li>Reiterate your interest in the position</li>
          <li>Address any concerns raised during the interview</li>
          <li>Be patient but proactive in follow-ups</li>
        </ul>
      `
    },
    {
      icon: TrendingUp,
      title: 'Career Development',
      description: 'Strategies for advancing your career and achieving professional goals',
      color: 'from-purple-500 to-purple-600',
      link: 'https://example.com/career-development',
      detailedContent: `
        <h3 class="text-xl font-bold text-gray-900 mb-4">Career Advancement Strategies</h3>
        <p class="text-gray-600 mb-4">Take control of your professional growth with these proven development techniques:</p>
        
        <h4 class="font-bold text-gray-900 mb-2">Setting Career Goals</h4>
        <ul class="list-disc list-inside text-gray-600 mb-4">
          <li>Define short-term and long-term objectives</li>
          <li>Align goals with your values and interests</li>
          <li>Create measurable, time-bound milestones</li>
          <li>Regularly review and adjust your goals</li>
        </ul>
        
        <h4 class="font-bold text-gray-900 mb-2">Skills Development</h4>
        <ul class="list-disc list-inside text-gray-600 mb-4">
          <li>Identify in-demand skills in your industry</li>
          <li>Pursue relevant certifications and courses</li>
          <li>Seek mentorship and coaching opportunities</li>
          <li>Practice new skills in real-world projects</li>
        </ul>
        
        <h4 class="font-bold text-gray-900 mb-2">Networking and Relationships</h4>
        <ul class="list-disc list-inside text-gray-600 mb-4">
          <li>Build genuine professional relationships</li>
          <li>Attend industry events and conferences</li>
          <li>Engage on professional social platforms</li>
          <li>Offer value to your network connections</li>
        </ul>
        
        <h4 class="font-bold text-gray-900 mb-2">Performance and Visibility</h4>
        <ul class="list-disc list-inside text-gray-600 mb-4">
          <li>Exceed expectations in your current role</li>
          <li>Document and communicate your achievements</li>
          <li>Volunteer for high-visibility projects</li>
          <li>Seek feedback and act on it constructively</li>
        </ul>
      `
    },
    {
      icon: Award,
      title: 'Skill Building',
      description: 'Courses and certifications to enhance your professional skillset',
      color: 'from-red-500 to-red-600',
      link: 'https://example.com/skill-building',
      detailedContent: `
        <h3 class="text-xl font-bold text-gray-900 mb-4">Professional Skill Enhancement</h3>
        <p class="text-gray-600 mb-4">Boost your career prospects with these essential skill-building resources:</p>
        
        <h4 class="font-bold text-gray-900 mb-2">Technical Skills</h4>
        <ul class="list-disc list-inside text-gray-600 mb-4">
          <li>Programming languages (Python, JavaScript, Java)</li>
          <li>Data analysis and visualization tools</li>
          <li>Cloud platforms (AWS, Azure, Google Cloud)</li>
          <li>Digital marketing and SEO strategies</li>
        </ul>
        
        <h4 class="font-bold text-gray-900 mb-2">Soft Skills</h4>
        <ul class="list-disc list-inside text-gray-600 mb-4">
          <li>Leadership and management capabilities</li>
          <li>Communication and presentation skills</li>
          <li>Problem-solving and critical thinking</li>
          <li>Time management and organization</li>
        </ul>
        
        <h4 class="font-bold text-gray-900 mb-2">Certification Paths</h4>
        <ul class="list-disc list-inside text-gray-600 mb-4">
          <li>Project Management (PMP, Agile, Scrum)</li>
          <li>Data Science and Analytics</li>
          <li>Cybersecurity and IT Security</li>
          <li>Digital Marketing and Social Media</li>
        </ul>
        
        <h4 class="font-bold text-gray-900 mb-2">Learning Platforms</h4>
        <ul class="list-disc list-inside text-gray-600 mb-4">
          <li>Coursera and edX for university courses</li>
          <li>LinkedIn Learning for professional development</li>
          <li>Udemy and Skillshare for practical skills</li>
          <li>Industry-specific training programs</li>
        </ul>
      `
    }
  ];

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
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
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
          <div className="font-bold text-xl text-[#0B4F6C]">Careercast</div>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Career Resources</h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Enhance your career prospects with our curated collection of professional resources
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {resources.map((resource, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all group"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${resource.color} rounded-lg flex items-center justify-center mb-4`}>
                    <resource.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-base sm:text-lg group-hover:text-[#01796F] transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {resource.description}
                  </p>
                  <div className="mt-4">
                    <a 
                      href={resource.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#01796F] hover:underline text-sm font-medium flex items-center gap-1"
                    >
                      Free Links <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <button 
                    onClick={() => setSelectedResource(index)}
                    className="mt-3 w-full py-2 text-center text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Resource Detail Modal */}
        {selectedResource !== null && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex justify-between items-center rounded-t-lg sm:rounded-t-xl">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  {resources[selectedResource].title}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div 
                className="p-4 sm:p-6"
                dangerouslySetInnerHTML={{ __html: resources[selectedResource].detailedContent }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}