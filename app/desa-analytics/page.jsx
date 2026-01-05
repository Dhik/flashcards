'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function DesaAnalyticsPage() {
  const router = useRouter();
  const [selectedDesa, setSelectedDesa] = useState('');
  const [desaList, setDesaList] = useState([]);
  const [data, setData] = useState(null);
  const [overallData, setOverallData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ title: '', data: [], columns: [] });

  useEffect(() => {
    loadDesaList();
    loadOverallData();
  }, []);

  useEffect(() => {
    if (selectedDesa) {
      loadDesaData();
    }
  }, [selectedDesa]);

  const loadDesaList = async () => {
    try {
      const response = await fetch('/api/census/analytics');
      const result = await response.json();
      if (result.success) {
        setDesaList(result.filterOptions.desa);
        if (result.filterOptions.desa.length > 0) {
          setSelectedDesa(result.filterOptions.desa[0]);
        }
      }
    } catch (error) {
      console.error('Error loading desa list:', error);
    }
  };

  const loadOverallData = async () => {
    try {
      const response = await fetch('/api/census/analytics');
      const result = await response.json();
      if (result.success) {
        setOverallData(result.data);
      }
    } catch (error) {
      console.error('Error loading overall data:', error);
    }
  };

  const loadDesaData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/census/analytics?desa=${selectedDesa}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error loading desa data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChartClick = (chartData, title, type) => {
    let columns = [];
    let tableData = [];

    if (type === 'simple') {
      columns = [
        { key: 'name', label: 'Category' },
        { key: 'value', label: 'Count' },
        { key: 'percentage', label: 'Percentage' }
      ];
      const total = chartData.reduce((sum, item) => sum + item.value, 0);
      tableData = chartData.map(item => ({
        name: item.name,
        value: item.value,
        percentage: `${((item.value / total) * 100).toFixed(2)}%`
      }));
    }

    setModalData({ title, data: tableData, columns });
    setShowModal(true);
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const comparisonData = overallData && data ? [
    {
      category: 'Total',
      Overall: overallData.total,
      [selectedDesa]: data.total,
    },
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-4">
      {/* Header */}
      <div className="max-w-[1600px] mx-auto mb-6">
        <button
          onClick={() => router.push('/sinsar-analytics')}
          className="text-gray-600 hover:text-gray-800 mb-3 flex items-center gap-2 text-sm"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600">
          Per-Desa Analytics
        </h1>
        <p className="text-gray-600 mt-1 text-sm">Detailed analysis for each village</p>
      </div>

      {/* Desa Selector */}
      <div className="max-w-[1600px] mx-auto mb-4">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Select Desa</label>
          <select
            value={selectedDesa}
            onChange={(e) => setSelectedDesa(e.target.value)}
            className="w-full md:w-96 px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {desaList.map((desa, index) => (
              <option key={index} value={desa}>{desa}</option>
            ))}
          </select>
        </div>
      </div>

      {data && (
        <>
          {/* Total Count Card */}
          <div className="max-w-[1600px] mx-auto mb-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl shadow-xl p-6 text-white"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold">{data.total.toLocaleString()}</div>
                  <div className="text-sm opacity-90">Total in {selectedDesa}</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{overallData?.total.toLocaleString()}</div>
                  <div className="text-sm opacity-90">Overall Total</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">
                    {((data.total / overallData?.total) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm opacity-90">Percentage of Total</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{data.byKelompok?.length || 0}</div>
                  <div className="text-sm opacity-90">Kelompok in Desa</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Charts Grid */}
          <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Gender Distribution - Clickable Pie */}
            <ChartCard title="Gender Distribution" onClick={() => handleChartClick(data.byGender, 'Gender Distribution', 'simple')}>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.byGender}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    onClick={() => handleChartClick(data.byGender, 'Gender Distribution', 'simple')}
                    cursor="pointer"
                  >
                    {data.byGender.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Age Category - Clickable Bar */}
            <ChartCard title="Age Category Distribution" onClick={() => handleChartClick(data.byAgeCategory, 'Age Category Distribution', 'simple')}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.byAgeCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} style={{ fontSize: '10px' }} />
                  <YAxis style={{ fontSize: '12px' }} />
                  <Tooltip cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }} />
                  <Bar
                    dataKey="value"
                    fill="#10b981"
                    onClick={() => handleChartClick(data.byAgeCategory, 'Age Category Distribution', 'simple')}
                    cursor="pointer"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Economic Category - Clickable Pie */}
            <ChartCard title="Economic Category" onClick={() => handleChartClick(data.byCategory, 'Economic Category', 'simple')}>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.byCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    onClick={() => handleChartClick(data.byCategory, 'Economic Category', 'simple')}
                    cursor="pointer"
                  >
                    {data.byCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Education Level - Clickable Bar */}
            <ChartCard title="Education Level" onClick={() => handleChartClick(data.byEducation, 'Education Level Distribution', 'simple')}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.byEducation?.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" style={{ fontSize: '12px' }} />
                  <YAxis dataKey="name" type="category" width={80} style={{ fontSize: '11px' }} />
                  <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                  <Bar
                    dataKey="value"
                    fill="#3b82f6"
                    onClick={() => handleChartClick(data.byEducation, 'Education Level Distribution', 'simple')}
                    cursor="pointer"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Marital Status - Clickable Pie */}
            <ChartCard title="Marital Status" onClick={() => handleChartClick(data.byMaritalStatus, 'Marital Status', 'simple')}>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.byMaritalStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    onClick={() => handleChartClick(data.byMaritalStatus, 'Marital Status', 'simple')}
                    cursor="pointer"
                  >
                    {data.byMaritalStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* By Kelompok - Clickable Bar */}
            <ChartCard title="Distribution by Kelompok" onClick={() => handleChartClick(data.byKelompok, 'Distribution by Kelompok', 'simple')}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.byKelompok}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} style={{ fontSize: '10px' }} />
                  <YAxis style={{ fontSize: '12px' }} />
                  <Tooltip cursor={{ fill: 'rgba(236, 72, 153, 0.1)' }} />
                  <Bar
                    dataKey="value"
                    fill="#ec4899"
                    onClick={() => handleChartClick(data.byKelompok, 'Distribution by Kelompok', 'simple')}
                    cursor="pointer"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Blood Type - Clickable Pie */}
            <ChartCard title="Blood Type" onClick={() => handleChartClick(data.byBloodType, 'Blood Type Distribution', 'simple')}>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.byBloodType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    onClick={() => handleChartClick(data.byBloodType, 'Blood Type Distribution', 'simple')}
                    cursor="pointer"
                  >
                    {data.byBloodType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Kemubalighan - Clickable Pie */}
            <ChartCard title="Kemubalighan" onClick={() => handleChartClick(data.byKemubalighan, 'Kemubalighan Distribution', 'simple')}>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.byKemubalighan}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    onClick={() => handleChartClick(data.byKemubalighan, 'Kemubalighan Distribution', 'simple')}
                    cursor="pointer"
                  >
                    {data.byKemubalighan.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* By Sheet - Clickable Bar */}
            <ChartCard title="Distribution by Sheet" onClick={() => handleChartClick(data.bySheet, 'Distribution by Sheet', 'simple')}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.bySheet}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" style={{ fontSize: '11px' }} />
                  <YAxis style={{ fontSize: '12px' }} />
                  <Tooltip cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }} />
                  <Bar
                    dataKey="value"
                    fill="#8b5cf6"
                    onClick={() => handleChartClick(data.bySheet, 'Distribution by Sheet', 'simple')}
                    cursor="pointer"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-800">{modalData.title}</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {modalData.columns.map((col) => (
                        <th key={col.key} className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {modalData.data.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {modalData.columns.map((col) => (
                          <td key={col.key} className="px-4 py-3 text-sm text-gray-900">
                            {row[col.key]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChartCard({ title, children, onClick, span2 = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-lg p-4 ${span2 ? 'md:col-span-2 lg:col-span-1' : ''} ${onClick ? 'cursor-pointer hover:shadow-xl transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
        {onClick && (
          <span className="text-xs text-gray-500">Click for details</span>
        )}
      </div>
      {children}
    </motion.div>
  );
}
