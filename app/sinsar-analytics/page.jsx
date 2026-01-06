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

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const log = JSON.parse(line.slice(6));

              const logPrefix = log.type === 'error' ? '❌' : log.type === 'success' ? '✅' : log.type === 'warning' ? '⚠️' : 'ℹ️';
              console.log(`${logPrefix} ${log.message}`);

              setImportLogs(prev => [...prev, log]);

              if (log.type === 'done') {
                setImporting(false);

                if (log.success) {
                  console.log('✅ Import completed successfully!');
                  console.log(`📊 Imported: ${log.imported} records, Errors: ${log.errors || 0}`);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <button
                onClick={() => router.push('/')}
                className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-flex items-center gap-1"
              >
                ← Back to Home
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">Census Analytics</h1>
              <p className="text-sm text-gray-500 mt-1">Overview and data management</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => router.push('/census-analytics')}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push('/desa-analytics')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Per-Desa
              </button>
              <button
                onClick={() => router.push('/census-table')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Data Table
              </button>
              <button
                onClick={handleImport}
                disabled={importing}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? 'Importing...' : 'Import Data'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {stats ? (
          <div className="space-y-6">
            {/* Total Count KPI */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Records</p>
                <p className="mt-2 text-4xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* By Sheet */}
              <StatCard title="By Sheet">
                <div className="grid grid-cols-2 gap-3">
                  {stats.bySheet.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">{item.sheet}</span>
                      <span className="text-lg font-semibold text-gray-900">{item.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </StatCard>

              {/* By Gender */}
              <StatCard title="By Gender">
                <div className="space-y-2">
                  {stats.byGender.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">{item.gender}</span>
                      <span className="text-lg font-semibold text-gray-900">{item.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </StatCard>

              {/* By Age Category */}
              <StatCard title="By Age Category">
                <div className="grid grid-cols-2 gap-2">
                  {stats.byAgeCategory.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded text-xs">
                      <span className="text-gray-600 truncate">{item.category}</span>
                      <span className="font-semibold text-gray-900 ml-2">{item.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </StatCard>

              {/* By Marital Status */}
              <StatCard title="By Marital Status">
                <div className="grid grid-cols-2 gap-3">
                  {stats.byMaritalStatus.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">{item.status}</span>
                      <span className="text-lg font-semibold text-gray-900">{item.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </StatCard>

              {/* By Category */}
              <StatCard title="Economic Category">
                <div className="space-y-2">
                  {stats.byCategory.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">{item.category || 'Unknown'}</span>
                      <span className="text-lg font-semibold text-gray-900">{item.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </StatCard>

              {/* By Desa */}
              <StatCard title="By Village (Desa)">
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {stats.byDesa.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded text-xs">
                      <span className="text-gray-600 truncate">{item.desa}</span>
                      <span className="font-semibold text-gray-900 ml-2">{item.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </StatCard>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <div className="text-gray-400 text-5xl mb-4">📊</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h2>
            <p className="text-gray-500 mb-6">
              Click the Import Data button to load census data from Google Sheets.
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
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Import Progress</h3>
                  {!importing && (
                    <button
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                {importing && importLogs.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-sm text-gray-600">Connecting to Google Sheets...</p>
                  </div>
                )}

                <div className="space-y-2">
                  {importLogs.map((log, index) => (
                    <div
                      key={index}
                      className={`px-3 py-2 rounded text-sm ${
                        log.type === 'success'
                          ? 'bg-green-50 text-green-800 border border-green-200'
                          : log.type === 'error'
                          ? 'bg-red-50 text-red-800 border border-red-200'
                          : log.type === 'warning'
                          ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                          : 'bg-blue-50 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {log.message}
                    </div>
                  ))}
                </div>

                {importing && importLogs.length > 0 && (
                  <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <p className="text-sm text-blue-800 font-medium">Processing...</p>
                  </div>
                )}
              </div>

              {!importing && importLogs.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <button
                    onClick={closeModal}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
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

function StatCard({ title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      {children}
    </div>
  );
}
