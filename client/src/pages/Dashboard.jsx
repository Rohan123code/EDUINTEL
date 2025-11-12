import { useState, useEffect } from 'react';
import { Upload, FileText, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedFile, setSelectedFile] = useState(null);
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfDescription, setPdfDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const ADMIN_ID = 134;

  // Fetch upload history
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      // Replace with your actual API endpoint for fetching history
      const response = await fetch(`http://localhost:8000/admin/uploads?user_id=${ADMIN_ID}`);
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('Error fetching history:', error);
      // Mock data for demonstration
      setHistory([
        {
          pdf_id: 1,
          filename: "test2.pdf",
          title: "Sample PDF",
          description: "This is a sample",
          vectors: 30,
          uploaded_at: "2024-11-10T10:30:00Z"
        }
      ]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setUploadStatus(null);
    } else {
      alert('Please select a valid PDF file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !pdfTitle || !pdfDescription) {
      setUploadStatus({ type: 'error', message: 'Please fill all fields' });
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("pdf_title", pdfTitle);
      formData.append("pdf_description", pdfDescription);
      formData.append("uploaded_by", ADMIN_ID);

      const response = await fetch("http://localhost:8000/admin/upload", {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      console.log("data",data)
      if (response.ok) {
        if(data.status == "error"){
          setUploadStatus({ 
          type: 'error', 
          message: data.message,
          data: data
        });
        }
        else{

          setUploadStatus({ 
            type: 'success', 
            message: `Successfully uploaded! PDF ID: ${data.pdf_id}, Vectors: ${data.vectors}`,
            data: data
          });
        }
        
        // Reset form
        setSelectedFile(null);
        setPdfTitle('');
        setPdfDescription('');
        const fileInput = document.getElementById('file-input');
        if (fileInput) fileInput.value = '';
      } else {
        throw new Error(data.message || 'Upload failed');
      }
      
    } catch (error) {
      setUploadStatus({ 
        type: 'error', 
        message: error.message || 'Upload failed. Please try again.' 
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-green-800 flex items-center gap-3">
            <FileText className="w-8 h-8" />
            Admin PDF Dashboard
          </h1>
          <p className="text-green-600 mt-2">Manage and upload PDF documents</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex border-b border-green-100">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'upload'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-green-700 hover:bg-green-50'
              }`}
            >
              <Upload className="w-5 h-5" />
              Upload PDF
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'history'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-green-700 hover:bg-green-50'
              }`}
            >
              <Clock className="w-5 h-5" />
              History
            </button>
          </div>

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="p-8">
              <div className="space-y-6">
                {/* File Upload */}
                <div>
                  <label className="block text-green-800 font-semibold mb-2">
                    Select PDF File *
                  </label>
                  <div className="relative">
                    <input
                      id="file-input"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 transition-colors"
                    />
                  </div>
                  {selectedFile && (
                    <p className="mt-2 text-sm text-green-600 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-green-800 font-semibold mb-2">
                    PDF Title *
                  </label>
                  <input
                    type="text"
                    value={pdfTitle}
                    onChange={(e) => setPdfTitle(e.target.value)}
                    placeholder="Enter PDF title"
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 transition-colors"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-green-800 font-semibold mb-2">
                    Description *
                  </label>
                  <textarea
                    value={pdfDescription}
                    onChange={(e) => setPdfDescription(e.target.value)}
                    placeholder="Enter PDF description"
                    rows="4"
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 transition-colors resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className={`w-full py-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                    uploading
                      ? 'bg-green-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'
                  }`}
                >
                  {uploading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload PDF
                    </>
                  )}
                </button>
              </div>

              {/* Status Messages */}
              {uploadStatus && (
                <div
                  className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${
                    uploadStatus.type === 'success'
                      ? 'bg-green-100 border-2 border-green-300'
                      : 'bg-red-100 border-2 border-red-300'
                  }`}
                >
                  {uploadStatus.type === 'success' ? (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`font-semibold ${
                        uploadStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
                      }`}
                    >
                      {uploadStatus.message}
                    </p>
                    {uploadStatus.data && (
                      <div className="mt-2 text-sm text-green-700">
                        <p>Filename: {uploadStatus.data.filename}</p>
                        <p>Cloud ID: {uploadStatus.data.cloud_id}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-green-800 mb-6">Upload History</h2>
              
              {loadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-8 h-8 animate-spin text-green-600" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-12 text-green-600">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No uploads yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((item) => (
                    <div
                      key={item.pdf_id}
                      className="border-2 border-green-200 rounded-lg p-5 hover:border-green-400 transition-colors bg-white"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-green-800 mb-2">
                            {item.title}
                          </h3>
                          <p className="text-green-600 text-sm mb-3">{item.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-green-700">
                            <span className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              {item.filename}
                            </span>
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              {item.vectors} vectors
                            </span>
                            {item.uploaded_at && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {new Date(item.uploaded_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                          ID: {item.pdf_id}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;