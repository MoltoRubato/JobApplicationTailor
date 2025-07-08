import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Copy, Trash2, Download, History, Sparkles, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { generateApplication } from './services/ai-service';

function App() {
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [cvBullets, setCvBullets] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const handleFileUpload = (file) => {
    if (file && (file.type === 'text/plain' || file.type === 'application/pdf')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setResume(e.target.result);
        toast({
          title: "Resume uploaded successfully!",
          description: "Your resume has been processed and is ready to use.",
        });
      };
      reader.readAsText(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a .txt or .pdf file.",
        variant: "destructive",
      });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const generateApplicationHandler = async () => {
    if (!resume.trim() || !jobDescription.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both your resume and job description.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('🚀 Starting AI generation...');
      console.log('📄 Resume length:', resume.length);
      console.log('📋 Job description length:', jobDescription.length);
      
      const result = await generateApplication(resume, jobDescription);
      
      setCoverLetter(result.coverLetter);
      setCvBullets(result.cvBullets);
      
      // Add to history
      const newEntry = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        jobTitle: jobDescription.substring(0, 50) + '...',
        coverLetter: result.coverLetter,
        cvBullets: result.cvBullets
      };
      setHistory(prev => [newEntry, ...prev]);
      
      toast({
        title: "Application generated successfully!",
        description: "Your tailored cover letter and CV bullets are ready.",
      });
      
    } catch (error) {
      console.error('💥 Error generating application:', error);
      
      let errorMessage = "There was an error generating your application. Please try again.";
      
      if (error.message.includes('503')) {
        errorMessage = "AI model is loading. Please wait a moment and try again.";
      } else if (error.message.includes('rate limit')) {
        errorMessage = "Too many requests. Please wait a moment before trying again.";
      } else if (error.message.includes('404')) {
        errorMessage = "API endpoint not found. Please check your deployment.";
      }
      
      toast({
        title: "Generation failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard!",
      description: "The content has been copied successfully.",
    });
  };

  const clearHistory = () => {
    setHistory([]);
    toast({
      title: "History cleared",
      description: "All previous applications have been removed.",
    });
  };

  const loadFromHistory = (entry) => {
    setCoverLetter(entry.coverLetter);
    setCvBullets(entry.cvBullets);
    setShowHistory(false);
    toast({
      title: "Application loaded",
      description: "Previous application has been loaded successfully.",
    });
  };

  return (
    <>
      <Helmet>
        <title>Ryan's Job Application Tailor</title>
        <meta name="description" content="Transform your job applications with AI. Upload your resume, paste a job description, and get a tailored cover letter and CV bullet points instantly." />
      </Helmet>
      
      <div className="min-h-screen p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl lg:text-5xl font-bold gradient-text mb-4">
              Ryan's AI Job Application Tailor
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Welcome to my AI Job Application Tailor! <br />
              Fast-track your job applications with AI. Upload your resume, paste a job description, 
              and get a tailored cover letter and CV bullet points instantly. <br />
              <em>*The AI model is currently limited daily.</em>
            </p>
          </motion.div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Input Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 card-shadow hover:card-shadow-hover transition-all duration-300"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Upload className="w-6 h-6 text-blue-600" />
                Input Your Information
              </h2>

              {/* Resume Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume Upload
                </label>
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer ${
                    dragOver ? 'drag-over' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">
                    Drag and drop your resume here, or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports .txt and .pdf files
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.pdf"
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                    className="hidden"
                  />
                </div>
                {resume && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Resume uploaded successfully
                    </p>
                  </div>
                )}
              </div>

              {/* Job Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="w-full h-40 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={generateApplicationHandler}
                disabled={isGenerating || !resume.trim() || !jobDescription.trim()}
                className="w-full generate-button"
              >
                {isGenerating ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 mr-2"
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <Sparkles className="w-5 h-5 mr-2" />
                )}
                {isGenerating ? 'Generating...' : 'Generate Application'}
              </Button>
            </motion.div>

            {/* Output Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 card-shadow hover:card-shadow-hover transition-all duration-300"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-purple-600" />
                Generated Content
              </h2>

              {/* Cover Letter */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Cover Letter
                  </label>
                  {coverLetter && (
                    <button
                      onClick={() => copyToClipboard(coverLetter)}
                      className="copy-button"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </button>
                  )}
                </div>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Your tailored cover letter will appear here..."
                  className="w-full h-64 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              {/* CV Bullets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tailored CV Bullet Points
                </label>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  <AnimatePresence>
                    {cvBullets.map((bullet, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.1 }}
                        className="bullet-point"
                      >
                        <div className="flex justify-between items-start gap-3">
                          <p className="text-sm text-gray-700 flex-1">
                            • {bullet}
                          </p>
                          <button
                            onClick={() => copyToClipboard(bullet)}
                            className="copy-button flex-shrink-0"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {cvBullets.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Your tailored CV bullet points will appear here...</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* History Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 card-shadow"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <History className="w-6 h-6 text-green-600" />
                Application History
              </h2>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowHistory(!showHistory)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <History className="w-4 h-4" />
                  {showHistory ? 'Hide' : 'Show'} History
                </Button>
                {history.length > 0 && (
                  <Button
                    onClick={clearHistory}
                    variant="outline"
                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  {history.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No previous applications yet. Generate your first one above!</p>
                    </div>
                  ) : (
                    history.map((entry) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => loadFromHistory(entry)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-800 mb-1">
                              {entry.jobTitle}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Generated on {entry.timestamp}
                            </p>
                          </div>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              toast({
                                title: "🚧 Export feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
                              });
                            }}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            Export
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
        
        <Toaster />
      </div>
    </>
  );
}

export default App;

