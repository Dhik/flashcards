'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function CensusTablePage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [filterOptions, setFilterOptions] = useState({
    desa: [],
    kelompok: [],
    gender: [],
    category: [],
    maritalStatus: [],
  });

  // Filter states
  const [filters, setFilters] = useState({
    desa: 'all',
    kelompok: 'all',
    gender: 'all',
    category: 'all',
    maritalStatus: 'all',
    search: '',
  });

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    loadData();
  }, [pagination.page, filters]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Build query params
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value);
        }
      });

      const response = await fetch(`/api/census/list?${params}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setPagination(result.pagination);
        setFilterOptions(result.filterOptions);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleView = (record) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setEditFormData(record);
    setShowEditModal(true);
  };

  const handleDelete = (record) => {
    setSelectedRecord(record);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/census/${selectedRecord.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setShowDeleteModal(false);
        setSelectedRecord(null);
        loadData();
      } else {
        alert('Failed to delete record: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      alert('Failed to delete record');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/census/${selectedRecord.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      const result = await response.json();

      if (result.success) {
        setShowEditModal(false);
        setSelectedRecord(null);
        loadData();
      } else {
        alert('Failed to update record: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating record:', error);
      alert('Failed to update record');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <button
          onClick={() => router.push('/sinsar-analytics')}
          className="text-gray-600 hover:text-gray-800 mb-4 flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600">
          Census Data Table
        </h1>
        <p className="text-gray-600 mt-2">View and manage census records</p>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Filters</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by name or place..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Desa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Desa</label>
              <select
                value={filters.desa}
                onChange={(e) => handleFilterChange('desa', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All</option>
                {filterOptions.desa.map((desa, index) => (
                  <option key={index} value={desa}>{desa}</option>
                ))}
              </select>
            </div>

            {/* Kelompok */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kelompok</label>
              <select
                value={filters.kelompok}
                onChange={(e) => handleFilterChange('kelompok', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All</option>
                {filterOptions.kelompok.map((kelompok, index) => (
                  <option key={index} value={kelompok}>{kelompok}</option>
                ))}
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All</option>
                {filterOptions.gender.map((gender, index) => (
                  <option key={index} value={gender}>{gender}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All</option>
                {filterOptions.category.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Marital Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
              <select
                value={filters.maritalStatus}
                onChange={(e) => handleFilterChange('maritalStatus', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All</option>
                {filterOptions.maritalStatus.map((status, index) => (
                  <option key={index} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => {
              setFilters({
                desa: 'all',
                kelompok: 'all',
                gender: 'all',
                category: 'all',
                maritalStatus: 'all',
                search: '',
              });
            }}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading data...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Data Found</h3>
              <p className="text-gray-600">Try adjusting your filters or import data first.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">No</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Nama</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Desa</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Kelompok</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Usia</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Gender</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.map((record, index) => (
                      <tr key={record.id} className="hover:bg-green-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-700">{record.no || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{record.nama || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{record.desa || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{record.kelompok || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{record.usiaSekarang || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{record.jenisKelamin || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{record.kategori || '-'}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleView(record)}
                              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleEdit(record)}
                              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(record)}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} records
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                              pagination.page === pageNum
                                ? 'bg-green-500 text-white'
                                : 'bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Confirm Delete</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete the record for <strong>{selectedRecord?.nama}</strong>?
                  This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {showViewModal && selectedRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={() => setShowViewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-800">Record Details</h3>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <DetailField label="No" value={selectedRecord.no} />
                  <DetailField label="Nama" value={selectedRecord.nama} />
                  <DetailField label="Desa" value={selectedRecord.desa} />
                  <DetailField label="Kelompok" value={selectedRecord.kelompok} />
                  <DetailField label="Tempat Lahir" value={selectedRecord.tempatLahir} />
                  <DetailField label="Tanggal Lahir" value={selectedRecord.tglLahir} />
                  <DetailField label="Usia Sekarang" value={selectedRecord.usiaSekarang} />
                  <DetailField label="Jenis Kelamin" value={selectedRecord.jenisKelamin} />
                  <DetailField label="Status Pernikahan" value={selectedRecord.statusPernikahan} />
                  <DetailField label="Pendidikan" value={selectedRecord.pendidikan} />
                  <DetailField label="Kelas" value={selectedRecord.kelas} />
                  <DetailField label="Nama Lembaga Pendidikan" value={selectedRecord.namaLembagaPendidikan} />
                  <DetailField label="Dapukan" value={selectedRecord.dapukan} />
                  <DetailField label="Kategori" value={selectedRecord.kategori} />
                  <DetailField label="Kategori Usia" value={selectedRecord.kategoriUsia} />
                  <DetailField label="Golongan Darah" value={selectedRecord.golonganDarah} />
                  <DetailField label="Kemubalighan" value={selectedRecord.kemubalighan} />
                  <DetailField label="Sheet" value={selectedRecord.sheet} />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && selectedRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-800">Edit Record</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={handleEditSubmit}>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <EditField label="No" name="no" value={editFormData.no} onChange={(e) => setEditFormData({...editFormData, no: e.target.value})} />
                    <EditField label="Nama" name="nama" value={editFormData.nama} onChange={(e) => setEditFormData({...editFormData, nama: e.target.value})} />
                    <EditField label="Desa" name="desa" value={editFormData.desa} onChange={(e) => setEditFormData({...editFormData, desa: e.target.value})} />
                    <EditField label="Kelompok" name="kelompok" value={editFormData.kelompok} onChange={(e) => setEditFormData({...editFormData, kelompok: e.target.value})} />
                    <EditField label="Tempat Lahir" name="tempatLahir" value={editFormData.tempatLahir} onChange={(e) => setEditFormData({...editFormData, tempatLahir: e.target.value})} />
                    <EditField label="Tanggal Lahir" name="tglLahir" value={editFormData.tglLahir} onChange={(e) => setEditFormData({...editFormData, tglLahir: e.target.value})} />
                    <EditField label="Usia Sekarang" name="usiaSekarang" type="number" value={editFormData.usiaSekarang} onChange={(e) => setEditFormData({...editFormData, usiaSekarang: parseInt(e.target.value) || null})} />
                    <EditField label="Jenis Kelamin" name="jenisKelamin" value={editFormData.jenisKelamin} onChange={(e) => setEditFormData({...editFormData, jenisKelamin: e.target.value})} />
                    <EditField label="Status Pernikahan" name="statusPernikahan" value={editFormData.statusPernikahan} onChange={(e) => setEditFormData({...editFormData, statusPernikahan: e.target.value})} />
                    <EditField label="Pendidikan" name="pendidikan" value={editFormData.pendidikan} onChange={(e) => setEditFormData({...editFormData, pendidikan: e.target.value})} />
                    <EditField label="Kelas" name="kelas" value={editFormData.kelas} onChange={(e) => setEditFormData({...editFormData, kelas: e.target.value})} />
                    <EditField label="Nama Lembaga Pendidikan" name="namaLembagaPendidikan" value={editFormData.namaLembagaPendidikan} onChange={(e) => setEditFormData({...editFormData, namaLembagaPendidikan: e.target.value})} />
                    <EditField label="Dapukan" name="dapukan" value={editFormData.dapukan} onChange={(e) => setEditFormData({...editFormData, dapukan: e.target.value})} />
                    <EditField label="Kategori" name="kategori" value={editFormData.kategori} onChange={(e) => setEditFormData({...editFormData, kategori: e.target.value})} />
                    <EditField label="Kategori Usia" name="kategoriUsia" value={editFormData.kategoriUsia} onChange={(e) => setEditFormData({...editFormData, kategoriUsia: e.target.value})} />
                    <EditField label="Golongan Darah" name="golonganDarah" value={editFormData.golonganDarah} onChange={(e) => setEditFormData({...editFormData, golonganDarah: e.target.value})} />
                    <EditField label="Kemubalighan" name="kemubalighan" value={editFormData.kemubalighan} onChange={(e) => setEditFormData({...editFormData, kemubalighan: e.target.value})} />
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailField({ label, value }) {
  return (
    <div>
      <div className="text-sm font-semibold text-gray-600 mb-1">{label}</div>
      <div className="text-base text-gray-900">{value || '-'}</div>
    </div>
  );
}

function EditField({ label, name, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  );
}
