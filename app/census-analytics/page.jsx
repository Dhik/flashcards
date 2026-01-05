'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function CensusAnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    desa: 'all',
    kelompok: 'all',
    sheet: 'all',
  });
  const [filterOptions, setFilterOptions] = useState({
    desa: [],
    kelompok: [],
    sheet: [],
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value);
        }
      });

      const response = await fetch(`/api/census/analytics?${params}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setFilterOptions(result.filterOptions);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 mt-1 text-sm">Comprehensive census data insights</p>
      </div>

      {/* Filters */}
      <div className="max-w-[1600px] mx-auto mb-4">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Filter by Desa</label>
              <select
                value={filters.desa}
                onChange={(e) => handleFilterChange('desa', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Desa</option>
                {filterOptions.desa.map((option, index) => (
                  <option key={index} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Filter by Kelompok</label>
              <select
                value={filters.kelompok}
                onChange={(e) => handleFilterChange('kelompok', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Kelompok</option>
                {filterOptions.kelompok.map((option, index) => (
                  <option key={index} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Filter by Sheet</label>
              <select
                value={filters.sheet}
                onChange={(e) => handleFilterChange('sheet', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Sheets</option>
                {filterOptions.sheet.map((option, index) => (
                  <option key={index} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({ desa: 'all', kelompok: 'all', sheet: 'all' })}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-semibold"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Total Count Card */}
      <div className="max-w-[1600px] mx-auto mb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl shadow-xl p-6 text-center text-white"
        >
          <div className="text-5xl font-bold">{data?.total?.toLocaleString() || 0}</div>
          <div className="text-lg mt-2 opacity-90">Total Records</div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Gender Distribution - Pie */}
        <ChartCard title="Gender Distribution">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data?.byGender}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data?.byGender?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Age Category Distribution - Bar */}
        <ChartCard title="Age Category Distribution">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data?.byAgeCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} style={{ fontSize: '10px' }} />
              <YAxis style={{ fontSize: '12px' }} />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Category (Aghnia/Dhuafa) - Pie */}
        <ChartCard title="Economic Category">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data?.byCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data?.byCategory?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Education Level - Bar */}
        <ChartCard title="Education Level Distribution">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data?.byEducation?.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" style={{ fontSize: '12px' }} />
              <YAxis dataKey="name" type="category" width={80} style={{ fontSize: '11px' }} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Marital Status - Pie */}
        <ChartCard title="Marital Status">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data?.byMaritalStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data?.byMaritalStatus?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Age Range Distribution - Line */}
        <ChartCard title="Age Range Distribution">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data?.ageDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" style={{ fontSize: '12px' }} />
              <YAxis style={{ fontSize: '12px' }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* By Desa - Bar (Top 10) */}
        <ChartCard title="Distribution by Desa" span2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data?.byDesa?.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} style={{ fontSize: '10px' }} />
              <YAxis style={{ fontSize: '12px' }} />
              <Tooltip />
              <Bar dataKey="value" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* By Sheet - Bar */}
        <ChartCard title="Distribution by Sheet">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data?.bySheet}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" style={{ fontSize: '11px' }} />
              <YAxis style={{ fontSize: '12px' }} />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Blood Type - Pie */}
        <ChartCard title="Blood Type Distribution">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data?.byBloodType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data?.byBloodType?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Kemubalighan - Pie */}
        <ChartCard title="Kemubalighan Distribution">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data?.byKemubalighan}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data?.byKemubalighan?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* By Kelompok - Bar (Top 10) */}
        <ChartCard title="Distribution by Kelompok" span2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data?.byKelompok?.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} style={{ fontSize: '10px' }} />
              <YAxis style={{ fontSize: '12px' }} />
              <Tooltip />
              <Bar dataKey="value" fill="#ec4899" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, children, span2 = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-lg p-4 ${span2 ? 'md:col-span-2 lg:col-span-1' : ''}`}
    >
      <h3 className="text-sm font-bold text-gray-800 mb-3">{title}</h3>
      {children}
    </motion.div>
  );
}
