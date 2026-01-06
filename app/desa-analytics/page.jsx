'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function DesaAnalyticsPage() {
  const router = useRouter();
  const [selectedDesa, setSelectedDesa] = useState('');
  const [desaList, setDesaList] = useState([]);
  const [data, setData] = useState(null);
  const [overallData, setOverallData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ title: '', data: [], columns: [] });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailData, setDetailData] = useState([]);
  const [detailTitle, setDetailTitle] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [timPnkbData, setTimPnkbData] = useState(null);
  const [timPnkbLoading, setTimPnkbLoading] = useState(true);

  useEffect(() => {
    loadDesaList();
    loadOverallData();
  }, []);

  useEffect(() => {
    if (selectedDesa) {
      loadDesaData();
      loadTimPnkbData();
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

  const loadTimPnkbData = async () => {
    try {
      setTimPnkbLoading(true);
      const response = await fetch(`/api/census/tim-pnkb?desa=${selectedDesa}`);
      const result = await response.json();
      if (result.success) {
        setTimPnkbData(result.data);
      }
    } catch (error) {
      console.error('Error loading Tim PNKB data:', error);
    } finally {
      setTimPnkbLoading(false);
    }
  };

  const handleChartClick = async (filterType, filterValue, title, ageRange = null) => {
    setDetailLoading(true);
    setShowDetailModal(true);
    setDetailTitle(title);
    setDetailData([]);

    try {
      const params = new URLSearchParams();

      // Add desa filter
      params.append('desa', selectedDesa);

      // Add clicked filter
      params.append(filterType, filterValue);

      // Add age range filter if provided (for Tim PNKB)
      if (ageRange) {
        if (ageRange.min) params.append('minAge', ageRange.min);
        if (ageRange.max) params.append('maxAge', ageRange.max);
      }

      const response = await fetch(`/api/census/details?${params}`);
      const result = await response.json();

      if (result.success) {
        setDetailData(result.data);
      }
    } catch (error) {
      console.error('Error fetching details:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading && !data) {
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
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/sinsar-analytics')}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-flex items-center gap-1"
          >
            ← Back to Overview
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">Per-Desa Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Detailed analysis by village</p>
        </div>
      </div>

      {/* Desa Selector */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Select Village:</label>
            <select
              value={selectedDesa}
              onChange={(e) => setSelectedDesa(e.target.value)}
              className="flex-1 max-w-md px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {desaList.map((desa, index) => (
                <option key={index} value={desa}>{desa}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {data && (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Village Overview */}
          <SectionHeader title="Village Overview" icon="🏘️" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPICard
              label="Total in Village"
              value={data.total.toLocaleString()}
              color="blue"
            />
            <KPICard
              label="Overall Total"
              value={overallData?.total.toLocaleString()}
              color="gray"
            />
            <KPICard
              label="Percentage of Total"
              value={`${((data.total / overallData?.total) * 100).toFixed(1)}%`}
              color="green"
            />
            <KPICard
              label="Groups in Village"
              value={data.byKelompok?.length || 0}
              color="purple"
            />
          </div>

          {/* Tim PNKB - Village Marriage-Age Population */}
          <SectionHeader title={`Tim PNKB - ${selectedDesa} (Age 21-35)`} icon="💑" />
          {timPnkbLoading ? (
            <div className="flex items-center justify-center py-12 mb-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Tim PNKB KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <KPICard
                  label="Total (21-35 yrs)"
                  value={timPnkbData?.total?.toLocaleString() || 0}
                  color="purple"
                />
                <KPICard
                  label="Singles"
                  value={timPnkbData?.singles?.toLocaleString() || 0}
                  color="pink"
                />
                <KPICard
                  label="Male (21-35)"
                  value={timPnkbData?.byGender?.find(g => g.name === 'L')?.value?.toLocaleString() || 0}
                  color="blue"
                />
                <KPICard
                  label="Female (21-35)"
                  value={timPnkbData?.byGender?.find(g => g.name === 'P')?.value?.toLocaleString() || 0}
                  color="pink"
                />
              </div>

              {/* Tim PNKB Composition Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {/* Gender Distribution - Donut */}
                <ChartCard title="Gender Breakdown" subtitle="Marriage-age population">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={timPnkbData?.byGender}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        fill="#8884d8"
                        dataKey="value"
                        onClick={(entry) => handleChartClick('jenisKelamin', entry.name, `Tim PNKB - Gender: ${entry.name} (21-35 years)`, { min: 21, max: 35 })}
                        cursor="pointer"
                      >
                        {timPnkbData?.byGender?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>

                {/* Marital Status - Donut */}
                <ChartCard title="Marital Status" subtitle="Ready for marriage">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={timPnkbData?.byMaritalStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        labelLine={false}
                        label={({ name, percent }) => `${name.substring(0, 10)} ${(percent * 100).toFixed(0)}%`}
                        fill="#8884d8"
                        dataKey="value"
                        onClick={(entry) => handleChartClick('statusPernikahan', entry.name, `Tim PNKB - ${entry.name} (21-35 years)`, { min: 21, max: 35 })}
                        cursor="pointer"
                      >
                        {timPnkbData?.byMaritalStatus?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>

                {/* Economic Category - Donut */}
                <ChartCard title="Economic Status" subtitle="Aghnia vs Dhuafa">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={timPnkbData?.byCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        fill="#8884d8"
                        dataKey="value"
                        onClick={(entry) => handleChartClick('kategori', entry.name, `Tim PNKB - ${entry.name} (21-35 years)`, { min: 21, max: 35 })}
                        cursor="pointer"
                      >
                        {timPnkbData?.byCategory?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>

                {/* Education - Horizontal Bar */}
                <ChartCard title="Education Level" subtitle="Top education levels">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={timPnkbData?.byEducation?.slice(0, 5)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 9 }} />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        fill="#8b5cf6"
                        radius={[0, 4, 4, 0]}
                        onClick={(entry) => handleChartClick('pendidikan', entry.name, `Tim PNKB - Education: ${entry.name} (21-35 years)`, { min: 21, max: 35 })}
                        cursor="pointer"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              {/* Tim PNKB Detailed Table */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-8">
                <div className="mb-3">
                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Marriage-Age Individuals in {selectedDesa} (21-35 years)
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {timPnkbData?.records?.length || 0} individuals
                  </p>
                </div>
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">No</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Age</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Gender</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Group</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Marital</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Education</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {timPnkbData?.records?.map((record, index) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-900">{index + 1}</td>
                          <td className="px-3 py-2 text-gray-900 font-medium">{record.nama || '-'}</td>
                          <td className="px-3 py-2 text-gray-600">{record.usiaSekarang || '-'}</td>
                          <td className="px-3 py-2 text-gray-600">{record.jenisKelamin || '-'}</td>
                          <td className="px-3 py-2 text-gray-600">{record.kelompok || '-'}</td>
                          <td className="px-3 py-2 text-gray-600">{record.statusPernikahan || '-'}</td>
                          <td className="px-3 py-2 text-gray-600">{record.kategori || '-'}</td>
                          <td className="px-3 py-2 text-gray-600">{record.pendidikan || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Population Composition */}
          <SectionHeader title="Population Composition" icon="👥" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            {/* Gender Distribution - Donut */}
            <ChartCard title="Gender Distribution" subtitle="Male vs Female">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={data.byGender}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    fill="#8884d8"
                    dataKey="value"
                    onClick={(entry) => handleChartClick('jenisKelamin', entry.name, `Gender: ${entry.name}`)}
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

            {/* Age Category */}
            <ChartCard title="Age Category Distribution" subtitle="Population by age groups">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.byAgeCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                  <Bar
                    dataKey="value"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    onClick={(entry) => handleChartClick('kategoriUsia', entry.name, `Age Category: ${entry.name}`)}
                    cursor="pointer"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Economic Category - Donut */}
            <ChartCard title="Economic Category" subtitle="Aghnia vs Dhuafa">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={data.byCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    fill="#8884d8"
                    dataKey="value"
                    onClick={(entry) => handleChartClick('kategori', entry.name, `Economic Category: ${entry.name}`)}
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
          </div>

          {/* Demographics */}
          <SectionHeader title="Demographics" icon="📊" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">

            {/* Education Level - Horizontal Bar */}
            <ChartCard title="Education Level Distribution" subtitle="Top 8 education levels">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.byEducation?.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 10 }} />
                  <Tooltip cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }} />
                  <Bar
                    dataKey="value"
                    fill="#10b981"
                    radius={[0, 4, 4, 0]}
                    onClick={(entry) => handleChartClick('pendidikan', entry.name, `Education: ${entry.name}`)}
                    cursor="pointer"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Marital Status - Donut */}
            <ChartCard title="Marital Status" subtitle="Distribution by marriage status">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={data.byMaritalStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    fill="#8884d8"
                    dataKey="value"
                    onClick={(entry) => handleChartClick('statusPernikahan', entry.name, `Marital Status: ${entry.name}`)}
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
          </div>

          {/* Distribution Analysis */}
          <SectionHeader title="Distribution Analysis" icon="📈" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            {/* By Kelompok - Horizontal Bar */}
            <ChartCard title="Distribution by Group" subtitle="All groups in this village">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.byKelompok} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} />
                  <Tooltip cursor={{ fill: 'rgba(236, 72, 153, 0.1)' }} />
                  <Bar
                    dataKey="value"
                    fill="#ec4899"
                    radius={[0, 4, 4, 0]}
                    onClick={(entry) => handleChartClick('kelompok', entry.name, `Group: ${entry.name}`)}
                    cursor="pointer"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* By Sheet */}
            <ChartCard title="Distribution by Data Sheet" subtitle="Records per source sheet">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.bySheet}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }} />
                  <Bar
                    dataKey="value"
                    fill="#8b5cf6"
                    radius={[4, 4, 0, 0]}
                    onClick={(entry) => handleChartClick('sheet', entry.name, `Sheet: ${entry.name}`)}
                    cursor="pointer"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Additional Insights */}
          <SectionHeader title="Additional Insights" icon="🔍" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Blood Type - Donut */}
            <ChartCard title="Blood Type Distribution" subtitle="ABO blood group distribution">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={data.byBloodType}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    fill="#8884d8"
                    dataKey="value"
                    onClick={(entry) => handleChartClick('golonganDarah', entry.name, `Blood Type: ${entry.name}`)}
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

            {/* Kemubalighan - Donut */}
            <ChartCard title="Kemubalighan Status" subtitle="Religious maturity status">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={data.byKemubalighan}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    fill="#8884d8"
                    dataKey="value"
                    onClick={(entry) => handleChartClick('kemubalighan', entry.name, `Kemubalighan: ${entry.name}`)}
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
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{detailTitle}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {detailLoading ? 'Loading...' : `${detailData.length} records found in ${selectedDesa}`}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
                {detailLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : detailData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">No</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Group</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Age</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Gender</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Education</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Birth Place</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {detailData.map((record, index) => (
                          <tr key={record.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-gray-900">{index + 1}</td>
                            <td className="px-3 py-2 text-gray-900 font-medium">{record.nama || '-'}</td>
                            <td className="px-3 py-2 text-gray-600">{record.kelompok || '-'}</td>
                            <td className="px-3 py-2 text-gray-600">{record.usiaSekarang || '-'}</td>
                            <td className="px-3 py-2 text-gray-600">{record.jenisKelamin || '-'}</td>
                            <td className="px-3 py-2 text-gray-600">{record.kategori || '-'}</td>
                            <td className="px-3 py-2 text-gray-600">{record.pendidikan || '-'}</td>
                            <td className="px-3 py-2 text-gray-600">{record.tempatLahir || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No records found
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
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

function SectionHeader({ title, icon }) {
  return (
    <div className="mb-4 mt-2">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <span>{icon}</span>
        <span>{title}</span>
      </h2>
      <div className="h-0.5 bg-gradient-to-r from-blue-500 to-transparent mt-2"></div>
    </div>
  );
}

function KPICard({ label, value, color, clickable, onClick }) {
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50',
    gray: 'border-gray-200 bg-gray-50',
    green: 'border-green-200 bg-green-50',
    purple: 'border-purple-200 bg-purple-50',
    pink: 'border-pink-200 bg-pink-50',
  };

  return (
    <div
      className={`border rounded-lg p-4 ${colorClasses[color]} ${clickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
      {clickable && (
        <p className="text-xs text-gray-500 mt-1">Click for details</p>
      )}
    </div>
  );
}

function ChartCard({ title, subtitle, children, span2 = false }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${span2 ? 'lg:col-span-2' : ''}`}>
      <div className="mb-3">
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{title}</h3>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}
