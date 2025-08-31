import React, { useState, useEffect } from 'react';
import { PlusCircle, LogOut, ChevronDown, ChevronUp, Upload, FileText, Clock, AlertTriangle, Lightbulb, Trash2, Search, Filter, Moon, Sun, Download, Image as ImageIcon, Calendar, Check, X } from 'lucide-react';
import { getApiUrl, getUploadUrl } from './config';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [prescriptionText, setPrescriptionText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedPrescriptions, setExpandedPrescriptions] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [error, setError] = useState('');

  // Load user from localStorage and fetch prescriptions on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        if (parsedUser?.id) {
          fetchPrescriptions(parsedUser.id);
        }
      } catch (err) {
        console.error('Error parsing stored user:', err);
        localStorage.removeItem('user');
      }
    } else {
      // If no user found, redirect to login
      window.location.href = '/login';
    }
  }, []);

  const fetchPrescriptions = async (userId) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(getApiUrl(`/dashboard?user_id=${userId}`));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform backend data to match frontend format
      const formattedPrescriptions = data.map(prescription => ({
        id: prescription.id,
        date: new Date(prescription.timestamp).toLocaleString('en-GB', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit' 
        }).replace(/(\d+)\/(\d+)\/(\d+),/, '$3-$2-$1'),
        timestamp: new Date(prescription.timestamp),
        medicines: prescription.analysis?.medicines || [],
        aiExplanation: prescription.analysis?.explanation || 'No explanation available',
        nutritionTips: prescription.analysis?.nutrition_tips || [],
        recommendations: prescription.analysis?.recommendations || [],
        confidence: prescription.analysis?.analysis_confidence || 0,
        filePath: prescription.file_path,
        fileType: prescription.file_type,
        status: prescription.status,
        analysis: prescription.analysis || {},
        raw_text: prescription.raw_text
      }));
      
      setPrescriptions(formattedPrescriptions);
    } catch (error) {
      console.error('Failed to fetch prescriptions:', error);
      setError('Failed to load prescriptions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid file type (JPEG, PNG, GIF, PDF, or TXT)');
        return;
      }
      
      // Validate file size (16MB max)
      if (file.size > 16 * 1024 * 1024) {
        alert('File size must be less than 16MB');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleAnalyze = async () => {
    if ((!prescriptionText.trim() && !selectedFile) || !user) {
      setError('Please enter prescription text or upload a file');
      return;
    }
    
    setIsAnalyzing(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('user_id', user.id);
      formData.append('text', prescriptionText);
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const response = await fetch(getApiUrl('/analyze'), {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Refresh prescriptions list
      await fetchPrescriptions(user.id);
      setPrescriptionText('');
      setSelectedFile(null);
      
      // Show success message
      alert('Prescription submitted for review! Our medical team will analyze it and provide you with detailed information.');
      
    } catch (error) {
      console.error('Error submitting prescription:', error);
      setError('Submission failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleExpanded = (id) => {
    setExpandedPrescriptions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleDelete = async (prescriptionId) => {
    if (!window.confirm('Are you sure you want to delete this prescription?')) {
      return;
    }

    try {
      const response = await fetch(getApiUrl(`/prescription/${prescriptionId}`), {
        method: 'DELETE'
      });

      if (response.ok) {
        setPrescriptions(prev => prev.filter(p => p.id !== prescriptionId));
        alert('Prescription deleted successfully');
      } else {
        alert('Failed to delete prescription');
      }
    } catch (error) {
      console.error('Error deleting prescription:', error);
      alert('Failed to delete prescription');
    }
  };

  const handleExportPDF = (prescriptionId) => {
    alert('PDF export feature coming soon!');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.medicines.some(medicine => 
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.purpose.toLowerCase().includes(searchTerm.toLowerCase())
    ) || prescription.aiExplanation.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = dateFilter === 'all' || 
      (dateFilter === 'today' && prescription.timestamp.toDateString() === new Date().toDateString()) ||
      (dateFilter === 'week' && prescription.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesDate;
  });

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-500';
    if (confidence >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getConfidenceText = (confidence) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <h1 className="text-xl font-bold">Medical Assistant</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm">{user?.firstName} {user?.lastName}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-8`}>
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
            <PlusCircle className="text-blue-500" />
            <span>Analyze New Prescription</span>
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Text Input */}
            <div>
              <label className="block text-sm font-medium mb-2">Prescription Text</label>
              <textarea
                value={prescriptionText}
                onChange={(e) => setPrescriptionText(e.target.value)}
                placeholder="Enter prescription details or medication information..."
                className={`w-full h-32 p-4 border rounded-lg resize-none ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
            
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Upload Prescription</label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
              }`}>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.txt"
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="text-gray-400" size={32} />
                    <span className="text-sm text-gray-500">
                      {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                    </span>
                    <span className="text-xs text-gray-400">
                      PNG, JPG, GIF, PDF, TXT up to 16MB
                    </span>
                  </div>
                </label>
              </div>
              {selectedFile && (
                <div className="mt-2 flex items-center space-x-2 text-sm text-green-600">
                  <FileText size={16} />
                  <span>{selectedFile.name}</span>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || (!prescriptionText.trim() && !selectedFile)}
            className="mt-6 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Lightbulb size={20} />
                <span>Analyze with AI</span>
              </>
            )}
          </button>
        </div>

        {/* Search and Filter */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-8`}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search prescriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-400" size={20} />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className={`px-3 py-2 border rounded-lg ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
              </select>
            </div>
          </div>
        </div>

        {/* Prescription History */}
        <div className="space-y-6">
          {/* Header with count */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center space-x-2">
                <FileText className="text-blue-500" />
                <span>Prescription History</span>
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Total Prescriptions:</span>
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  {filteredPrescriptions.length}
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading prescriptions...</p>
            </div>
          ) : filteredPrescriptions.length === 0 ? (
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-12 text-center`}>
              <FileText className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium mb-2">No prescriptions found</h3>
              <p className="text-gray-500">Upload your first prescription to get started with AI analysis.</p>
            </div>
          ) : (
            filteredPrescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}
              >
                {/* Header */}
                <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <FileText className={`${darkMode ? 'text-blue-400' : 'text-blue-500'}`} size={24} />
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Prescription #{prescription.id}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Calendar size={14} />
                            <span>{prescription.date}</span>
                          </span>
                          <span className={`flex items-center space-x-1 ${
                            prescription.status === 'pending' ? 'text-yellow-600' :
                            prescription.status === 'approved' ? 'text-green-600' :
                            prescription.status === 'rejected' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {prescription.status === 'pending' && <Clock size={14} />}
                            {prescription.status === 'approved' && <Check size={14} />}
                            {prescription.status === 'rejected' && <X size={14} />}
                            <span className="capitalize">{prescription.status}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {prescription.status === 'pending' && (
                        <div className="flex items-center space-x-2 text-yellow-600">
                          <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm">Under Review</span>
                        </div>
                      )}
                      <button
                        onClick={() => toggleExpanded(prescription.id)}
                        className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        {expandedPrescriptions[prescription.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className={`p-6 ${expandedPrescriptions[prescription.id] ? 'block' : 'hidden'}`}>
                  {prescription.status === 'pending' ? (
                    /* Pending Status - Show waiting message */
                    <div className="text-center py-8">
                      <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <h4 className="text-lg font-medium text-yellow-600 mb-2">Prescription Under Review</h4>
                      <p className="text-gray-600 mb-4">
                        Your prescription has been submitted and is currently being reviewed by our medical team.
                      </p>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h5 className="font-medium text-yellow-800 mb-2">What happens next?</h5>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          <li>• Our medical professionals will analyze your prescription</li>
                          <li>• We'll identify medications and provide detailed information</li>
                          <li>• You'll receive nutrition tips and safety recommendations</li>
                          <li>• Analysis typically takes 1-2 hours during business hours</li>
                        </ul>
                      </div>
                      <div className="mt-4 text-xs text-gray-500">
                        Submitted on {prescription.date}
                      </div>
                    </div>
                  ) : prescription.status === 'rejected' ? (
                    /* Rejected Status - Show rejection message */
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="text-red-600" size={32} />
                      </div>
                      <h4 className="text-lg font-medium text-red-600 mb-2">Prescription Rejected</h4>
                      <p className="text-gray-600 mb-4">
                        {prescription.analysis?.explanation || 'Your prescription could not be processed.'}
                      </p>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h5 className="font-medium text-red-800 mb-2">Recommendations:</h5>
                        <ul className="text-sm text-red-700 space-y-1">
                          {prescription.analysis?.recommendations?.map((rec, index) => (
                            <li key={index}>• {rec}</li>
                          )) || ['Please consult with your healthcare provider']}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    /* Approved Status - Show full analysis */
                    <div className="space-y-6">
                      {/* Confidence Score */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Analysis Confidence:</span>
                        <span className={`text-sm font-medium ${getConfidenceColor(prescription.confidence)}`}>
                          {Math.round(prescription.confidence * 100)}%
                        </span>
                      </div>

                      {/* Medicines */}
                      {prescription.medicines.length > 0 && (
                        <div className="space-y-6">
                          {prescription.medicines.map((medicine, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-2xl"><span role='img' aria-label='pill'>💊</span></span>
                                  <span className="font-bold text-lg text-gray-900">{medicine.name}</span>
                                </div>
                                <span className="text-green-600 font-bold text-lg">{medicine.price}</span>
                              </div>
                              <div className="mb-2">
                                <span className="font-semibold text-gray-700">Purpose:</span>
                                <span className="ml-1 text-gray-800">{medicine.purpose}</span>
                              </div>
                              {medicine.alternatives && medicine.alternatives.length > 0 && (
                                <div className="mb-2">
                                  <span className="font-semibold text-gray-700">Alternatives:</span>
                                  <span className="ml-2 space-x-2">
                                    {medicine.alternatives.map((alt, i) => (
                                      <span key={i} className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium mr-1">{alt}</span>
                                    ))}
                                  </span>
                                </div>
                              )}
                              {medicine.foodToAvoid && medicine.foodToAvoid.length > 0 && (
                                <div className="mb-2">
                                  <span className="font-semibold text-orange-700 flex items-center"><span className="mr-1">⚠️</span>Food to avoid:</span>
                                  <span className="ml-2 space-x-2">
                                    {medicine.foodToAvoid.map((food, i) => (
                                      <span key={i} className="inline-block bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium mr-1">{food}</span>
                                    ))}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* AI Explanation */}
                      {prescription.aiExplanation && prescription.aiExplanation !== 'No explanation available' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-4 flex items-start space-x-3">
                          <span className="text-2xl mt-1"><span role='img' aria-label='ai'>🧠</span></span>
                          <div>
                            <div className="font-semibold text-blue-700 mb-1 flex items-center"><span className="mr-2">AI Explanation</span></div>
                            <div className="text-blue-900 text-base">{prescription.aiExplanation}</div>
                          </div>
                        </div>
                      )}

                      {/* Nutrition Tips */}
                      {prescription.nutritionTips && prescription.nutritionTips.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-4 flex items-start space-x-3">
                          <span className="text-2xl mt-1"><span role='img' aria-label='nutrition'>🥗</span></span>
                          <div>
                            <div className="font-semibold text-green-700 mb-1 flex items-center"><span className="mr-2">Nutrition Tips</span></div>
                            <ul className="list-disc pl-5 text-green-900">
                              {prescription.nutritionTips.map((tip, i) => (
                                <li key={i} className="mb-1">{tip}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      {prescription.recommendations && prescription.recommendations.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-3 flex items-center space-x-2">
                            <AlertTriangle className="text-orange-500" size={16} />
                            <span>Recommendations</span>
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {prescription.recommendations.map((rec, index) => (
                              <div key={index} className="flex items-start space-x-2">
                                <span className="text-orange-500 mt-1">•</span>
                                <span className="text-sm text-gray-600">{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Raw Prescription Text */}
                      {prescription.raw_text ? (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-4">
                          <div className="font-semibold text-gray-700 mb-2">Original Prescription Text:</div>
                          <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">{prescription.raw_text}</pre>
                        </div>
                      ) : prescription.filePath ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-4">
                          <div className="font-semibold text-blue-700 mb-2">📷 Image Prescription</div>
                          <p className="text-blue-800 text-sm">Your prescription was uploaded as an image. Our medical team will review the image and provide analysis.</p>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      {prescription.filePath && (
                        <button
                          onClick={() => window.open(getUploadUrl(prescription.filePath), '_blank')}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
                            darkMode 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <ImageIcon size={16} />
                          <span>View File</span>
                        </button>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleExportPDF(prescription.id)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
                          darkMode 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        <Download size={16} />
                        <span>Export PDF</span>
                      </button>
                      <button
                        onClick={() => handleDelete(prescription.id)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
                          darkMode 
                            ? 'bg-red-600 text-white hover:bg-red-700' 
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                      >
                        <Trash2 size={16} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;