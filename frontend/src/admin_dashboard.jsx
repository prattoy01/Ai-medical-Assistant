import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Edit3, 
  Check, 
  X, 
  Download, 
  Users, 
  FileText, 
  Moon, 
  Sun, 
  LogOut,
  Eye,
  Calendar,
  Pill,
  DollarSign,
  User,
  Clock,
  ChevronDown,
  Save,
  AlertCircle,
  CheckCircle,
  Loader,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  RefreshCw,
  XCircle,
  Image as ImageIcon
} from 'lucide-react';
import { getApiUrl, getUploadUrl } from './config';

const AdminDashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('prescriptions');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [expandedEditForms, setExpandedEditForms] = useState({});
  const [expandedViewPanels, setExpandedViewPanels] = useState({});

  const [editForm, setEditForm] = useState({
    medicines: [],
    aiExplanation: '',
    nutritionTips: [],
    foodToAvoid: '',
    recommendations: []
  });

  // Fetch prescriptions from backend
  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(getApiUrl('/admin/prescriptions'));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setPrescriptions(data);
    } catch (error) {
      console.error('Failed to fetch prescriptions:', error);
      setError('Failed to load prescriptions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    
    try {
      const response = await fetch(getApiUrl('/admin/users'));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch users when user panel is shown
  useEffect(() => {
    if (showUserPanel) {
      fetchUsers();
    }
  }, [showUserPanel]);

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (prescription.analysis?.medicines || []).some(med => med.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || prescription.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (prescription) => {
    setEditingId(prescription.id);
    setEditForm({
      medicines: [...(prescription.analysis?.medicines || [])],
      aiExplanation: prescription.analysis?.explanation || '',
      nutritionTips: prescription.analysis?.nutrition_tips || [],
      foodToAvoid: prescription.analysis?.foodToAvoid || '',
      recommendations: prescription.analysis?.recommendations || []
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      const updatedAnalysis = {
        medicines: editForm.medicines,
        explanation: editForm.aiExplanation,
        nutrition_tips: editForm.nutritionTips,
        foodToAvoid: editForm.foodToAvoid,
        analysis_confidence: 0.9,
        recommendations: editForm.recommendations
      };

      const response = await fetch(getApiUrl(`/admin/prescription/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'approved',
          analysis: updatedAnalysis
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update prescription');
      }

      // Refresh prescriptions
      await fetchPrescriptions();
      setEditingId(null);
      setEditForm({
        medicines: [],
        aiExplanation: '',
        nutritionTips: [],
        foodToAvoid: '',
        recommendations: []
      });
    } catch (error) {
      console.error('Error saving prescription:', error);
      alert('Failed to save prescription. Please try again.');
    }
  };

  const handleApprove = async (id) => {
    try {
      const response = await fetch(getApiUrl(`/admin/prescription/${id}/approve`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error('Failed to approve prescription');
      }

      await fetchPrescriptions();
      alert('Prescription approved successfully!');
    } catch (error) {
      console.error('Error approving prescription:', error);
      alert('Failed to approve prescription. Please try again.');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const response = await fetch(getApiUrl(`/admin/prescription/${id}/reject`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        throw new Error('Failed to reject prescription');
      }

      await fetchPrescriptions();
      alert('Prescription rejected successfully!');
    } catch (error) {
      console.error('Error rejecting prescription:', error);
      alert('Failed to reject prescription. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prescription?')) {
      return;
    }

    try {
      const response = await fetch(getApiUrl(`/prescription/${id}`), {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchPrescriptions();
        alert('Prescription deleted successfully');
      } else {
        alert('Failed to delete prescription');
      }
    } catch (error) {
      console.error('Error deleting prescription:', error);
      alert('Failed to delete prescription');
    }
  };

  const exportPDF = (prescription) => {
    // Mock PDF export functionality
    alert(`Exporting prescription ${prescription.id} to PDF...`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Loader className="text-yellow-500" size={16} />;
      case 'approved':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'rejected':
        return <AlertCircle className="text-red-500" size={16} />;
      default:
        return <Clock className="text-gray-500" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Add new medicine to edit form
  const addMedicine = () => {
    const newMedicine = {
      name: '',
      price: '',
      purpose: '',
      dosage: '',
      alternatives: [],
      side_effects: [],
      foodToAvoid: []
    };
    setEditForm(prev => ({
      ...prev,
      medicines: [...prev.medicines, newMedicine]
    }));
  };

  // Remove medicine from edit form
  const removeMedicine = (index) => {
    setEditForm(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  // Update medicine field
  const updateMedicine = (index, field, value) => {
    setEditForm(prev => ({
      ...prev,
      medicines: prev.medicines.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  // Update medicine array field (alternatives, side_effects, foodToAvoid)
  const updateMedicineArray = (index, field, value) => {
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item);
    updateMedicine(index, field, arrayValue);
  };

  // Add nutrition tip
  const addNutritionTip = () => {
    setEditForm(prev => ({
      ...prev,
      nutritionTips: [...prev.nutritionTips, '']
    }));
  };

  // Remove nutrition tip
  const removeNutritionTip = (index) => {
    setEditForm(prev => ({
      ...prev,
      nutritionTips: prev.nutritionTips.filter((_, i) => i !== index)
    }));
  };

  // Update nutrition tip
  const updateNutritionTip = (index, value) => {
    setEditForm(prev => ({
      ...prev,
      nutritionTips: prev.nutritionTips.map((tip, i) => i === index ? value : tip)
    }));
  };

  // Add recommendation
  const addRecommendation = () => {
    setEditForm(prev => ({
      ...prev,
      recommendations: [...prev.recommendations, '']
    }));
  };

  // Remove recommendation
  const removeRecommendation = (index) => {
    setEditForm(prev => ({
      ...prev,
      recommendations: prev.recommendations.filter((_, i) => i !== index)
    }));
  };

  // Update recommendation
  const updateRecommendation = (index, value) => {
    setEditForm(prev => ({
      ...prev,
      recommendations: prev.recommendations.map((rec, i) => i === index ? value : rec)
    }));
  };

  // Toggle edit form expansion
  const toggleEditFormExpansion = (prescriptionId) => {
    setExpandedEditForms(prev => ({
      ...prev,
      [prescriptionId]: !prev[prescriptionId]
    }));
  };

  // Check if edit form is expanded
  const isEditFormExpanded = (prescriptionId) => {
    return expandedEditForms[prescriptionId] || false;
  };

  // Toggle view panel expansion
  const toggleViewPanelExpansion = (prescriptionId) => {
    setExpandedViewPanels(prev => ({
      ...prev,
      [prescriptionId]: !prev[prescriptionId]
    }));
  };

  // Check if view panel is expanded
  const isViewPanelExpanded = (prescriptionId) => {
    return expandedViewPanels[prescriptionId] || false;
  };

  // Copy text to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Text copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Text copied to clipboard!');
    }
  };

  // Get prescription box background color based on status
  const getPrescriptionBoxColor = (status, index) => {
    const baseColors = {
      pending: darkMode ? 'bg-yellow-900/20 border-yellow-600/30 hover:bg-yellow-900/30' : 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
      approved: darkMode ? 'bg-green-900/20 border-green-600/30 hover:bg-green-900/30' : 'bg-green-50 border-green-200 hover:bg-green-100',
      rejected: darkMode ? 'bg-red-900/20 border-red-600/30 hover:bg-red-900/30' : 'bg-red-50 border-red-200 hover:bg-red-100'
    };
    
    // Alternate colors for better distinction
    const alternateColors = {
      pending: darkMode ? 'bg-orange-900/20 border-orange-600/30 hover:bg-orange-900/30' : 'bg-orange-50 border-orange-200 hover:bg-orange-100',
      approved: darkMode ? 'bg-emerald-900/20 border-emerald-600/30 hover:bg-emerald-900/30' : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100',
      rejected: darkMode ? 'bg-rose-900/20 border-rose-600/30 hover:bg-rose-900/30' : 'bg-rose-50 border-rose-200 hover:bg-rose-100'
    };
    
    return index % 2 === 0 ? baseColors[status] || baseColors.pending : alternateColors[status] || alternateColors.pending;
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Admin Dashboard
            </h1>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Welcome back, admin@healthsystem.com
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${darkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`w-64 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'} min-h-screen`}>
          <nav className="p-4">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('prescriptions')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left ${
                  activeTab === 'prescriptions'
                    ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
                    : (darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')
                }`}
              >
                <FileText size={20} />
                <span>Prescriptions</span>
              </button>
              <button
                onClick={() => setShowUserPanel(!showUserPanel)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left ${
                  showUserPanel
                    ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
                    : (darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')
                }`}
              >
                <Users size={20} />
                <span>Users Overview</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {!showUserPanel ? (
            <div>
              {/* Search and Filters */}
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-6 mb-6`}>
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-64">
                    <div className="relative">
                      <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
                      <input
                        type="text"
                        placeholder="Search by user, email, or medicine..."
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
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`px-4 py-2 border rounded-lg ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className={`px-4 py-2 border rounded-lg ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
              </div>

              {/* Prescriptions Table */}
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading prescriptions...</p>
                  </div>
                ) : error ? (
                  <div className="p-8 text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-4" size={32} />
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{error}</p>
                    <button 
                      onClick={fetchPrescriptions}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Retry
                    </button>
                  </div>
                ) : filteredPrescriptions.length === 0 ? (
                  <div className="p-8 text-center">
                    <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>No prescriptions found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    {filteredPrescriptions.map((prescription, idx) => (
                      <div
                        key={prescription.id}
                        className={`mb-6 rounded-2xl shadow-md transition-all duration-200 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} ${isViewPanelExpanded(prescription.id) ? 'ring-2 ring-blue-400' : ''}`}
                        style={{ overflow: 'hidden' }}
                      >
                        {/* Summary Row */}
                        <div className="flex items-center justify-between px-6 py-5 cursor-pointer group" onClick={() => toggleViewPanelExpansion(prescription.id)}>
                          <div className="flex items-center space-x-5">
                            <div className={`rounded-full p-3 ${darkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                              <FileText size={28} className={darkMode ? 'text-blue-300' : 'text-blue-500'} />
                            </div>
                            <div>
                              <div className="flex items-center space-x-3">
                                <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Prescription #{prescription.id}</span>
                                <span className="flex items-center text-xs font-medium space-x-1">
                                  <Clock size={14} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{prescription.timestamp}</span>
                                </span>
                              </div>
                              <div className="flex items-center space-x-3 mt-1">
                                <span className={`text-sm font-semibold flex items-center space-x-1 ${
                                  prescription.status === 'pending' ? 'text-yellow-600' :
                                  prescription.status === 'approved' ? 'text-green-600' :
                                  'text-red-600'
                                }`}>
                                  {prescription.status === 'pending' && <RefreshCw size={15} />}
                                  {prescription.status === 'approved' && <CheckCircle size={15} />}
                                  {prescription.status === 'rejected' && <XCircle size={15} />}
                                  <span>{prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}</span>
                                </span>
                                <span className={`text-xs flex items-center space-x-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {prescription.status === 'pending' && <span>Under Review</span>}
                                  {prescription.status === 'approved' && <span>Analyzed</span>}
                                  {prescription.status === 'rejected' && <span>Rejected</span>}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <User size={13} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{prescription.user.name}</span>
                                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>({prescription.user.email})</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <button
                              className={`rounded-full p-2 transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                              aria-label={isViewPanelExpanded(prescription.id) ? 'Collapse' : 'Expand'}
                            >
                              {isViewPanelExpanded(prescription.id) ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                            </button>
                          </div>
                        </div>
                        {/* Expanded Content */}
                        {isViewPanelExpanded(prescription.id) && (
                          <div className={`px-6 pb-6 pt-2 animate-fade-in`}>
                            {editingId === prescription.id ? (
                              <div className="space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Edit Prescription #{prescription.id}</h3>
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleSaveEdit(prescription.id)}
                                      className="flex items-center space-x-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
                                    >
                                      <Save size={18} />
                                      <span>Save & Approve</span>
                                    </button>
                                    <button
                                      onClick={() => setEditingId(null)}
                                      className={`flex items-center space-x-2 px-6 py-3 ${darkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-600'} text-white rounded-lg font-medium`}
                                    >
                                      <X size={18} />
                                      <span>Cancel</span>
                                    </button>
                                  </div>
                                </div>
                                {/* Raw Prescription Text */}
                                <div className={`mb-6 p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>📄 Original Prescription Text</h4>
                                    <button
                                      onClick={() => copyToClipboard(prescription.raw_text)}
                                      className="flex items-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
                                      title="Copy to clipboard"
                                    >
                                      <Copy size={16} />
                                      <span>Copy</span>
                                    </button>
                                  </div>
                                  {prescription.raw_text ? (
                                    <pre className={`text-sm p-3 rounded ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'} whitespace-pre-wrap font-mono`}>{prescription.raw_text}</pre>
                                  ) : prescription.file_path ? (
                                    <div className={`text-sm p-3 rounded ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                                      <p className="italic text-gray-500">No text provided - prescription uploaded as image only</p>
                                      <p className="text-xs mt-1">Please review the uploaded image below for prescription content</p>
                                    </div>
                                  ) : (
                                    <div className={`text-sm p-3 rounded ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                                      <p className="italic text-gray-500">No prescription text or file provided</p>
                                    </div>
                                  )}
                                </div>

                                {/* Uploaded File/Image Display */}
                                {prescription.file_path && (
                                  <div className={`mb-6 p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                                    <div className="flex items-center justify-between mb-3">
                                      <h4 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>📎 Uploaded File</h4>
                                      <div className="flex items-center space-x-2">
                                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                          {prescription.file_type || 'Unknown type'}
                                        </span>
                                        <button
                                          onClick={() => window.open(getUploadUrl(prescription.file_path), '_blank')}
                                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
                                            darkMode 
                                              ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                          }`}
                                        >
                                          <ImageIcon size={16} />
                                          <span>View File</span>
                                        </button>
                                      </div>
                                    </div>
                                    
                                    {/* Image Preview */}
                                    {prescription.file_type && prescription.file_type.startsWith('image/') && (
                                      <div className="mt-3">
                                        <img 
                                          src={getUploadUrl(prescription.file_path)}
                                          alt="Prescription Image"
                                          className="max-w-full h-auto max-h-96 rounded-lg border shadow-sm"
                                          onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'block';
                                          }}
                                        />
                                        <div 
                                          className="hidden text-center py-8 text-gray-500"
                                          style={{ display: 'none' }}
                                        >
                                          <ImageIcon size={48} className="mx-auto mb-2 text-gray-400" />
                                          <p>Image could not be loaded</p>
                                                                                      <button
                                              onClick={() => window.open(getUploadUrl(prescription.file_path), '_blank')}
                                              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                            >
                                              Open in New Tab
                                            </button>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Non-image file info */}
                                    {prescription.file_type && !prescription.file_type.startsWith('image/') && (
                                      <div className={`mt-3 p-3 rounded ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                                        <div className="flex items-center space-x-2">
                                          <FileText size={20} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {prescription.file_path}
                                          </span>
                                        </div>
                                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                          Click "View File" to open this document
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}
                                {/* Medicines Edit Section */}
                                <div className={`p-6 rounded-lg border-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}> 
                                  <div className="flex items-center justify-between mb-6">
                                    <h4 className={`font-bold text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>💊 Medications Analysis</h4>
                                    <button
                                      onClick={addMedicine}
                                      className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                                    >
                                      <Plus size={18} />
                                      <span>Add Medicine</span>
                                    </button>
                                  </div>
                                  {editForm.medicines.length === 0 ? (
                                    <div className="text-center py-8">
                                      <Pill className="mx-auto text-gray-400 mb-4" size={48} />
                                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>No medicines added yet. Click "Add Medicine" to start.</p>
                                    </div>
                                  ) : (
                                    <div className="space-y-6">
                                      {editForm.medicines.map((medicine, index) => (
                                        <div key={index} className={`p-6 rounded-lg border-2 ${darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                                          <div className="flex items-center justify-between mb-4">
                                            <h5 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>💊 Medicine #{index + 1}</h5>
                                            <button
                                              onClick={() => removeMedicine(index)}
                                              className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                                            >
                                              <Trash2 size={16} />
                                            </button>
                                          </div>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                              <label className={`block font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Medicine Name *</label>
                                              <input
                                                type="text"
                                                value={medicine.name || ''}
                                                onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                                                className={`w-full p-3 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                                placeholder="e.g., Napa 500mg"
                                              />
                                            </div>
                                            <div>
                                              <label className={`block font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Price *</label>
                                              <input
                                                type="text"
                                                value={medicine.price || ''}
                                                onChange={(e) => updateMedicine(index, 'price', e.target.value)}
                                                className={`w-full p-3 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                                placeholder="e.g., ৳3"
                                              />
                                            </div>
                                          </div>
                                          <div className="mb-4">
                                            <label className={`block font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Purpose *</label>
                                            <input
                                              type="text"
                                              value={medicine.purpose || ''}
                                              onChange={(e) => updateMedicine(index, 'purpose', e.target.value)}
                                              className={`w-full p-3 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                              placeholder="e.g., Fever reducer"
                                            />
                                          </div>
                                          <div className="mb-4">
                                            <label className={`block font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dosage</label>
                                            <input
                                              type="text"
                                              value={medicine.dosage || ''}
                                              onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                                              className={`w-full p-3 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                              placeholder="e.g., 1 tablet every 6 hours"
                                            />
                                          </div>
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                              <label className={`block font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Alternatives</label>
                                              <input
                                                type="text"
                                                value={Array.isArray(medicine.alternatives) ? medicine.alternatives.join(', ') : ''}
                                                onChange={(e) => updateMedicineArray(index, 'alternatives', e.target.value)}
                                                className={`w-full p-3 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                                placeholder="e.g., Ace, Paracetamol, Fevco"
                                              />
                                            </div>
                                            <div>
                                              <label className={`block font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Side Effects</label>
                                              <input
                                                type="text"
                                                value={Array.isArray(medicine.side_effects) ? medicine.side_effects.join(', ') : ''}
                                                onChange={(e) => updateMedicineArray(index, 'side_effects', e.target.value)}
                                                className={`w-full p-3 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                                placeholder="e.g., Drowsiness, Nausea"
                                              />
                                            </div>
                                            <div>
                                              <label className={`block font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Foods to Avoid</label>
                                              <input
                                                type="text"
                                                value={Array.isArray(medicine.foodToAvoid) ? medicine.foodToAvoid.join(', ') : ''}
                                                onChange={(e) => updateMedicineArray(index, 'foodToAvoid', e.target.value)}
                                                className={`w-full p-3 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                                placeholder="e.g., Alcohol, High-fat meals"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                {/* AI Explanation */}
                                <div className={`p-6 rounded-lg border-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}> 
                                  <h4 className={`font-bold text-xl mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>🧠 AI Explanation</h4>
                                  <textarea
                                    value={editForm.aiExplanation}
                                    onChange={(e) => setEditForm({...editForm, aiExplanation: e.target.value})}
                                    className={`w-full p-4 border rounded-lg text-lg leading-relaxed ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                    rows="4"
                                    placeholder="Explain how these medications work together and their combined effects..."
                                  />
                                </div>
                                {/* Nutrition Tips */}
                                <div className={`p-6 rounded-lg border-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}> 
                                  <div className="flex items-center justify-between mb-4">
                                    <h4 className={`font-bold text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>🍽️ Nutrition Tips</h4>
                                    <button
                                      onClick={addNutritionTip}
                                      className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                                    >
                                      <Plus size={18} />
                                      <span>Add Tip</span>
                                    </button>
                                  </div>
                                  {editForm.nutritionTips.length === 0 ? (
                                    <div className="text-center py-4">
                                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>No nutrition tips added yet.</p>
                                    </div>
                                  ) : (
                                    <div className="space-y-3">
                                      {editForm.nutritionTips.map((tip, index) => (
                                        <div key={index} className="flex items-center space-x-3">
                                          <span className="text-green-500 font-bold">•</span>
                                          <input
                                            type="text"
                                            value={tip}
                                            onChange={(e) => updateNutritionTip(index, e.target.value)}
                                            className={`flex-1 p-3 border rounded-lg ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                            placeholder="Enter nutrition tip..."
                                          />
                                          <button
                                            onClick={() => removeNutritionTip(index)}
                                            className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                                          >
                                            <X size={16} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                {/* General Foods to Avoid */}
                                <div className={`p-6 rounded-lg border-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}> 
                                  <h4 className={`font-bold text-xl mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>⚠️ General Foods to Avoid</h4>
                                  <textarea
                                    value={editForm.foodToAvoid}
                                    onChange={(e) => setEditForm({...editForm, foodToAvoid: e.target.value})}
                                    className={`w-full p-4 border rounded-lg text-lg ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                    rows="3"
                                    placeholder="List general foods to avoid with these medications..."
                                  />
                                </div>
                                {/* Recommendations */}
                                <div className={`p-6 rounded-lg border-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}> 
                                  <div className="flex items-center justify-between mb-4">
                                    <h4 className={`font-bold text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>💡 Recommendations</h4>
                                    <button
                                      onClick={addRecommendation}
                                      className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                                    >
                                      <Plus size={18} />
                                      <span>Add Recommendation</span>
                                    </button>
                                  </div>
                                  {editForm.recommendations.length === 0 ? (
                                    <div className="text-center py-4">
                                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>No recommendations added yet.</p>
                                    </div>
                                  ) : (
                                    <div className="space-y-3">
                                      {editForm.recommendations.map((rec, index) => (
                                        <div key={index} className="flex items-center space-x-3">
                                          <span className="text-blue-500 font-bold">•</span>
                                          <input
                                            type="text"
                                            value={rec}
                                            onChange={(e) => updateRecommendation(index, e.target.value)}
                                            className={`flex-1 p-3 border rounded-lg ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                            placeholder="Enter recommendation..."
                                          />
                                          <button
                                            onClick={() => removeRecommendation(index)}
                                            className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                                          >
                                            <X size={16} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <>
                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                  <button
                                    onClick={() => handleEdit(prescription)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                                    title="Edit"
                                  >
                                    <Edit3 size={16} />
                                    <span>Edit</span>
                                  </button>
                                  {prescription.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => handleApprove(prescription.id)}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
                                        title="Approve"
                                      >
                                        <Check size={16} />
                                        <span>Approve</span>
                                      </button>
                                      <button
                                        onClick={() => handleReject(prescription.id)}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white`}
                                        title="Reject"
                                      >
                                        <X size={16} />
                                        <span>Reject</span>
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => exportPDF(prescription)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${darkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'} text-white`}
                                    title="Export PDF"
                                  >
                                    <Download size={16} />
                                    <span>Export PDF</span>
                                  </button>
                                  <button
                                    onClick={() => handleDelete(prescription.id)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white`}
                                    title="Delete"
                                  >
                                    <Trash2 size={16} />
                                    <span>Delete</span>
                                  </button>
                                </div>
                                {/* Raw Prescription Text */}
                                <div className={`mb-6 p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>📄 Original Prescription Text</h4>
                                    <button
                                      onClick={() => copyToClipboard(prescription.raw_text)}
                                      className="flex items-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
                                      title="Copy to clipboard"
                                    >
                                      <Copy size={16} />
                                      <span>Copy</span>
                                    </button>
                                  </div>
                                  {prescription.raw_text ? (
                                    <pre className={`text-sm p-3 rounded ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'} whitespace-pre-wrap font-mono`}>{prescription.raw_text}</pre>
                                  ) : prescription.file_path ? (
                                    <div className={`text-sm p-3 rounded ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                                      <p className="italic text-gray-500">No text provided - prescription uploaded as image only</p>
                                      <p className="text-xs mt-1">Please review the uploaded image below for prescription content</p>
                                    </div>
                                  ) : (
                                    <div className={`text-sm p-3 rounded ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                                      <p className="italic text-gray-500">No prescription text or file provided</p>
                                    </div>
                                  )}
                                </div>

                                {/* Uploaded File/Image Display */}
                                {prescription.file_path && (
                                  <div className={`mb-6 p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                                    <div className="flex items-center justify-between mb-3">
                                      <h4 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>📎 Uploaded File</h4>
                                      <div className="flex items-center space-x-2">
                                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                          {prescription.file_type || 'Unknown type'}
                                        </span>
                                        <button
                                          onClick={() => window.open(getUploadUrl(prescription.file_path), '_blank')}
                                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
                                            darkMode 
                                              ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                          }`}
                                        >
                                          <ImageIcon size={16} />
                                          <span>View File</span>
                                        </button>
                                      </div>
                                    </div>
                                    
                                    {/* Image Preview */}
                                    {prescription.file_type && prescription.file_type.startsWith('image/') && (
                                      <div className="mt-3">
                                        <img 
                                          src={getUploadUrl(prescription.file_path)}
                                          alt="Prescription Image"
                                          className="max-w-full h-auto max-h-96 rounded-lg border shadow-sm"
                                          onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'block';
                                          }}
                                        />
                                        <div 
                                          className="hidden text-center py-8 text-gray-500"
                                          style={{ display: 'none' }}
                                        >
                                          <ImageIcon size={48} className="mx-auto mb-2 text-gray-400" />
                                          <p>Image could not be loaded</p>
                                                                                      <button
                                              onClick={() => window.open(getUploadUrl(prescription.file_path), '_blank')}
                                              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                            >
                                              Open in New Tab
                                            </button>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Non-image file info */}
                                    {prescription.file_type && !prescription.file_type.startsWith('image/') && (
                                      <div className={`mt-3 p-3 rounded ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                                        <div className="flex items-center space-x-2">
                                          <FileText size={20} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {prescription.file_path}
                                          </span>
                                        </div>
                                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                          Click "View File" to open this document
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}
                                {/* Medicines Section */}
                                <div className={`mb-6 p-6 rounded-lg border-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                                  <h4 className={`font-bold text-xl mb-4 flex items-center space-x-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    <Pill size={22} />
                                    <span>Medications</span>
                                  </h4>
                                  {prescription.analysis?.medicines && prescription.analysis.medicines.length > 0 ? (
                                    <div className="space-y-4">
                                      {prescription.analysis.medicines.map((medicine, index) => (
                                        <div key={index} className={`p-4 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                                          <div className="flex justify-between items-start mb-2">
                                            <h5 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{medicine.name}</h5>
                                            <span className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{medicine.price}</span>
                                          </div>
                                          <div className="space-y-1">
                                            <div><span className="font-semibold">Purpose: </span>{medicine.purpose}</div>
                                            {medicine.dosage && <div><span className="font-semibold">Dosage: </span>{medicine.dosage}</div>}
                                            {medicine.alternatives && medicine.alternatives.length > 0 && <div><span className="font-semibold">Alternatives: </span>{medicine.alternatives.join(', ')}</div>}
                                            {medicine.side_effects && medicine.side_effects.length > 0 && <div><span className="font-semibold">Side Effects: </span>{medicine.side_effects.join(', ')}</div>}
                                            {medicine.foodToAvoid && medicine.foodToAvoid.length > 0 && <div><span className="font-semibold">Foods to Avoid: </span>{medicine.foodToAvoid.join(', ')}</div>}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-4 text-gray-400">No medicines analyzed yet</div>
                                  )}
                                </div>
                                {/* AI Analysis & Tips */}
                                <div className={`mb-6 p-6 rounded-lg border-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                                  <h4 className={`font-bold text-xl mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>🧠 AI Analysis & Tips</h4>
                                  <div className="mb-3">
                                    <h5 className="font-semibold mb-1">AI Explanation</h5>
                                    <p className={`text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{prescription.analysis?.explanation || 'No explanation available'}</p>
                                  </div>
                                  {prescription.analysis?.nutrition_tips && prescription.analysis.nutrition_tips.length > 0 && (
                                    <div className="mb-3">
                                      <h5 className="font-semibold mb-1">🍽️ Nutrition Tips</h5>
                                      <ul className="list-disc pl-5">
                                        {prescription.analysis.nutrition_tips.map((tip, index) => (
                                          <li key={index} className={`text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{tip}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {prescription.analysis?.foodToAvoid && (
                                    <div className="mb-3">
                                      <h5 className="font-semibold mb-1">⚠️ Foods to Avoid</h5>
                                      <p className={`text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{prescription.analysis.foodToAvoid}</p>
                                    </div>
                                  )}
                                  {prescription.analysis?.recommendations && prescription.analysis.recommendations.length > 0 && (
                                    <div className="mb-3">
                                      <h5 className="font-semibold mb-1">💡 Recommendations</h5>
                                      <ul className="list-disc pl-5">
                                        {prescription.analysis.recommendations.map((rec, index) => (
                                          <li key={index} className={`text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{rec}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Users Overview Panel */
            <div>
              <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Users Overview
              </h2>
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
                {usersLoading ? (
                  <div className="p-8 text-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading users...</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>No users found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <tr>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                            User Info
                          </th>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                            Prescriptions
                          </th>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                            Last Active
                          </th>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {user.name}
                                </div>
                                <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                  {user.email}
                                </div>
                                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                                  ID: {user.id} | {user.age} years, {user.gender}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                                {user.prescriptions} prescriptions
                              </span>
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              {user.lastActive}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <button className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900'}`}>
                                View History
                              </button>
                              <button className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'}`}>
                                Ban User
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;