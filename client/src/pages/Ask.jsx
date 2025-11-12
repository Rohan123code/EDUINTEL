import { useState, useEffect } from 'react';
import { Send, Loader, FileText, ExternalLink, MessageCircle, AlertCircle, ChevronDown, ChevronUp, History, Trash2 } from 'lucide-react';

function Ask() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('questionHistory');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('questionHistory', JSON.stringify(history));
    }
  }, [history]);

  const handleAsk = async () => {
    if (!query.trim()) {
      setError('Please enter a question');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch(`http://localhost:8000/user/ask?query=${encodeURIComponent(query)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await res.json();

      if (data.status === 'success') {
        setResponse(data);
        
        // Add to history
        const newEntry = {
          id: Date.now(),
          query: data.query,
          answer: data.answer,
          results: data.results,
          timestamp: new Date().toISOString()
        };
        
        setHistory(prev => [newEntry, ...prev]);
        setQuery(''); // Clear input after successful query
      } else {
        setError(data.message || 'Failed to get answer');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const loadFromHistory = (item) => {
    setResponse({
      status: 'success',
      query: item.query,
      answer: item.answer,
      results: item.results
    });
    setExpandedIndex(null);
  };

  const deleteHistoryItem = (id, e) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('questionHistory', JSON.stringify(updated));
  };

  const clearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      setHistory([]);
      localStorage.removeItem('questionHistory');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-green-800 flex items-center gap-3">
            <MessageCircle className="w-8 h-8" />
            Ask Your Question
          </h1>
          <p className="text-green-600 mt-2">Get answers from your uploaded PDF documents</p>
        </div>

        {/* Question Input Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <label className="block text-green-800 font-semibold mb-3 text-lg">
            What would you like to know?
          </label>
          <div className="flex gap-3">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your question here... (Press Enter to submit)"
              rows="4"
              className="flex-1 px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 transition-colors resize-none"
            />
          </div>
          <button
            onClick={handleAsk}
            disabled={loading || !query.trim()}
            className={`mt-4 w-full py-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
              loading || !query.trim()
                ? 'bg-green-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'
            }`}
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Ask Question
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 font-semibold">{error}</p>
          </div>
        )}

        {/* Answer Section */}
        {response && (
          <div className="space-y-6 mb-6">
            {/* Main Answer */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center gap-2">
                <MessageCircle className="w-6 h-6" />
                Answer
              </h2>
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                <p className="text-green-900 text-lg leading-relaxed whitespace-pre-wrap">
                  {response.answer}
                </p>
              </div>
            </div>

            {/* Source Documents */}
            {response.results && response.results.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  Source Documents ({response.results.length})
                </h2>
                <div className="space-y-4">
                  {response.results.map((result, index) => (
                    <div
                      key={index}
                      className="border-2 border-green-200 rounded-lg p-5 hover:border-green-400 transition-colors bg-green-50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-green-600" />
                          <h3 className="font-bold text-green-800">{result.pdf_name}</h3>
                        </div>
                        {result.cloud_url && (
                          <a
                            href={result.cloud_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-green-600 hover:text-green-800 transition-colors text-sm font-semibold"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Open PDF
                          </a>
                        )}
                      </div>
                      <div className="bg-white border border-green-200 rounded p-4 mb-3">
                        <p className="text-green-900 text-sm leading-relaxed">
                          {result.chunk}
                        </p>
                      </div>
                      <div className="flex gap-3 text-xs text-green-600">
                        <span className="bg-green-100 px-3 py-1 rounded-full">
                          Vector ID: {result.vector_id}
                        </span>
                        <span className="bg-green-100 px-3 py-1 rounded-full">
                          Cloud ID: {result.cloud_id}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Query Info */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <p className="text-green-700">
                <span className="font-semibold">Your question:</span> {response.query}
              </p>
            </div>
          </div>
        )}

        {/* Question History */}
        {history.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-green-800 flex items-center gap-2">
                <History className="w-6 h-6" />
                Question History ({history.length})
              </h2>
              <button
                onClick={clearAllHistory}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 border-2 border-red-300 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>
            <div className="space-y-3">
              {history.map((item, index) => (
                <div
                  key={item.id}
                  className="border-2 border-green-200 rounded-lg overflow-hidden hover:border-green-400 transition-colors"
                >
                  <div
                    onClick={() => toggleExpand(index)}
                    className="flex items-center justify-between p-4 cursor-pointer bg-green-50 hover:bg-green-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-green-800">{item.query}</p>
                      <p className="text-sm text-green-600 mt-1">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          loadFromHistory(item);
                        }}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                      >
                        View
                      </button>
                      <button
                        onClick={(e) => deleteHistoryItem(item.id, e)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {expandedIndex === index ? (
                        <ChevronUp className="w-5 h-5 text-green-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  </div>
                  
                  {expandedIndex === index && (
                    <div className="p-4 bg-white border-t-2 border-green-200">
                      <div className="mb-4">
                        <h4 className="font-semibold text-green-800 mb-2">Answer:</h4>
                        <p className="text-green-900 text-sm leading-relaxed whitespace-pre-wrap">
                          {item.answer}
                        </p>
                      </div>
                      
                      {item.results && item.results.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-green-800 mb-2">
                            Sources ({item.results.length}):
                          </h4>
                          <div className="space-y-2">
                            {item.results.map((result, idx) => (
                              <div key={idx} className="bg-green-50 border border-green-200 rounded p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-semibold text-green-800 text-sm">
                                    {result.pdf_name}
                                  </span>
                                  {result.cloud_url && (
                                    <a
                                      href={result.cloud_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-green-600 hover:text-green-800 text-xs"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      Open
                                    </a>
                                  )}
                                </div>
                                <p className="text-green-900 text-xs mb-2">{result.chunk}</p>
                                <div className="flex gap-2 text-xs">
                                  <span className="bg-green-100 px-2 py-0.5 rounded-full text-green-700">
                                    Vector: {result.vector_id}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Ask;