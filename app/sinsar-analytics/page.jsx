'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function SinsarAnalyticsPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importLogs, setImportLogs] = useState([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/census/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    setImportLogs([]);
    setShowImportModal(true);

    console.log('🚀 Starting Google Sheets import...');
    console.log('📊 Watch this console for detailed server logs');

    try {
      const response = await fetch('/api/census/import', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Read the SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const log = JSON.parse(line.slice(6));

              // Log to console for debugging
              const logPrefix = log.type === 'error' ? '❌' : log.type === 'success' ? '✅' : log.type === 'warning' ? '⚠️' : 'ℹ️';
              console.log(`${logPrefix} ${log.message}`);

              // Add log to state in real-time
              setImportLogs(prev => [...prev, log]);

              // Check if import is done
              if (log.type === 'done') {
                setImporting(false);

                if (log.success) {
                  console.log('✅ Import completed successfully!');
                  console.log(`📊 Imported: ${log.imported} records, Errors: ${log.errors || 0}`);
                  // Reload stats after successful import
                  setTimeout(() => {
                    loadStats();
                  }, 1000);
                } else {
                  console.error('❌ Import failed:', log.error);
                  console.log('💡 Check the modal for error details');
                }
              }
            } catch (parseError) {
              console.error('❌ Error parsing SSE log:', parseError, 'Raw line:', line);
              // Add parse error to logs so user can see it
              setImportLogs(prev => [...prev, {
                type: 'error',
                message: `Failed to parse server message: ${line.slice(0, 100)}...`
              }]);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Import fetch error:', error);
      console.error('Error stack:', error.stack);

      // Add error to logs so it's visible in UI
      setImportLogs(prev => [
        ...prev,
        { type: 'error', message: `Connection error: ${error.message}` },
        { type: 'error', message: 'Import failed. Please check the terminal/console for details.' },
      ]);
      setImporting(false);
    }
  };

  const closeModal = () => {
    if (!importing) {
      setShowImportModal(false);
      setImportLogs([]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-800 mb-4 flex items-center gap-2"
            >
              ← Back to Home
            </button>
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600">
              SinsarAnalytics Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Census data analytics and insights</p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => router.push('/census-analytics')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
            >
              📈 Analytics Dashboard
            </button>
            <button
              onClick={() => router.push('/desa-analytics')}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
            >
              🏘️ Per-Desa Analytics
            </button>
            <button
              onClick={() => router.push('/census-table')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
            >
              📋 View Table
            </button>
            <button
              onClick={handleImport}
              disabled={importing}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importing ? 'Importing...' : '📊 Import from Google Sheets'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto">
        {stats ? (
          <div className="space-y-6">
            {/* Total Count */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8 text-center"
            >
              <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600">
                {stats.total.toLocaleString()}
              </div>
              <div className="text-gray-600 text-xl mt-2">Total Records</div>
            </motion.div>

            {/* By Sheet */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">By Sheet</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.bySheet.map((item, index) => (
                  <div key={index} className="bg-green-50 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-green-600">{item.count}</div>
                    <div className="text-gray-600 text-sm mt-1">{item.sheet}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* By Gender */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">By Gender</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.byGender.map((item, index) => (
                  <div key={index} className="bg-teal-50 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-teal-600">{item.count}</div>
                    <div className="text-gray-600 text-sm mt-1">{item.gender}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* By Age Category */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">By Age Category</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {stats.byAgeCategory.map((item, index) => (
                  <div key={index} className="bg-blue-50 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600">{item.count}</div>
                    <div className="text-gray-600 text-sm mt-1">{item.category}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* By Marital Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">By Marital Status</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.byMaritalStatus.map((item, index) => (
                  <div key={index} className="bg-purple-50 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-purple-600">{item.count}</div>
                    <div className="text-gray-600 text-sm mt-1">{item.status}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* By Category (Dhuafa/Aghnia) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">By Category</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {stats.byCategory.map((item, index) => (
                  <div key={index} className="bg-orange-50 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-orange-600">{item.count}</div>
                    <div className="text-gray-600 text-sm mt-1">{item.category}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* By Desa */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">By Desa</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.byDesa.map((item, index) => (
                  <div key={index} className="bg-pink-50 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-pink-600">{item.count}</div>
                    <div className="text-gray-600 text-sm mt-1">{item.desa}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Data Available</h2>
            <p className="text-gray-600 mb-6">
              Click the import button above to load census data from Google Sheets.
            </p>
          </div>
        )}
      </div>

      {/* Import Modal */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-800">Import Progress</h3>
                  {!importing && (
                    <button
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                {importing && importLogs.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mb-4"></div>
                    <p className="text-gray-600">Connecting to Google Sheets...</p>
                  </div>
                )}

                <div className="space-y-2">
                  {importLogs.map((log, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 rounded-lg flex items-start gap-3 ${
                        log.type === 'success'
                          ? 'bg-green-50 text-green-800'
                          : log.type === 'error'
                          ? 'bg-red-50 text-red-800'
                          : log.type === 'warning'
                          ? 'bg-yellow-50 text-yellow-800'
                          : 'bg-blue-50 text-blue-800'
                      }`}
                    >
                      <span className="text-xl flex-shrink-0">
                        {log.type === 'success'
                          ? '✓'
                          : log.type === 'error'
                          ? '✗'
                          : log.type === 'warning'
                          ? '⚠'
                          : 'ℹ'}
                      </span>
                      <p className="flex-1 text-sm">{log.message}</p>
                    </motion.div>
                  ))}
                </div>

                {importing && importLogs.length > 0 && (
                  <div className="flex items-center justify-center gap-3 mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <p className="text-blue-800 font-medium">Processing...</p>
                  </div>
                )}
              </div>

              {!importing && importLogs.length > 0 && (
                <div className="p-6 border-t border-gray-200">
                  <button
                    onClick={closeModal}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Close
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
