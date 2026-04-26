'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

// ─── Constants ───────────────────────────────────────────────────────────────

const EXPENSE_CATEGORIES = ['makanan', 'akomodasi', 'jajan', 'dana_tidak_terduga', 'shodaqoh', 'lainnya'];
const INCOME_CATEGORIES = ['gaji', 'bisnis_freelance', 'investasi', 'lainnya'];
const FUND_TYPES = ['reksa_dana', 'emas', 'e_wallet', 'rekening'];

const EXPENSE_COLORS = ['#ef4444', '#f97316', '#eab308', '#10b981', '#3b82f6', '#8b5cf6'];
const INCOME_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];
const FUND_TYPE_COLORS = { reksa_dana: '#3b82f6', emas: '#f59e0b', e_wallet: '#10b981', rekening: '#8b5cf6' };
const FUND_TYPE_ICONS = { reksa_dana: '📈', emas: '🥇', e_wallet: '📱', rekening: '🏦' };
const FUND_TYPE_LABELS = { reksa_dana: 'Reksa Dana', emas: 'Emas', e_wallet: 'E-Wallet', rekening: 'Rekening' };

const PRESET_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#f97316'];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const MONTH_FULL = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const CATEGORY_LABELS = {
  makanan: 'Makanan', akomodasi: 'Akomodasi', jajan: 'Jajan',
  dana_tidak_terduga: 'Tak Terduga', shodaqoh: 'Shodaqoh', lainnya: 'Lainnya',
  gaji: 'Gaji', bisnis_freelance: 'Bisnis/Freelance', investasi: 'Investasi',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRupiah(v) {
  if (v === undefined || v === null) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);
}

function formatCompact(v) {
  if (!v && v !== 0) return '0';
  const abs = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(1)} M`;
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)} jt`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(0)} rb`;
  return `${sign}${abs}`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function KPICard({ label, value, sub, color }) {
  const colors = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  };
  return (
    <div className={`rounded-xl border p-3 ${colors[color]}`}>
      <p className="text-xs font-medium opacity-70 mb-0.5">{label}</p>
      <p className="text-lg font-bold leading-tight">{value}</p>
      {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
    </div>
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-800">{CATEGORY_LABELS[payload[0].name] || payload[0].name}</p>
      <p className="text-gray-600">{formatRupiah(payload[0].value)}</p>
      <p className="text-gray-400">{payload[0].payload.percentage}%</p>
    </div>
  );
}

function FundTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-800">{payload[0].name}</p>
      <p className="text-gray-600">{formatRupiah(payload[0].value)}</p>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ overview, loading, onEditBudget }) {
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm">Memuat data...</p>
        </div>
      </div>
    );
  }

  const { kpis, expenseByCategory, incomeByCategory, fundAllocation, totalPortfolioValue, budgetProgress } = overview || {};

  const hasExpense = expenseByCategory?.length > 0;
  const hasFunds = fundAllocation?.filter((f) => f.value > 0).length > 0;
  const activeFunds = fundAllocation?.filter((f) => f.value > 0) || [];

  return (
    <div className="h-full p-3 grid grid-rows-[auto_1fr_1fr] gap-3 overflow-hidden">
      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-4 gap-2">
        <KPICard label="Pemasukan" value={formatCompact(kpis?.totalIncome)} sub={formatRupiah(kpis?.totalIncome)} color="emerald" />
        <KPICard label="Pengeluaran" value={formatCompact(kpis?.totalExpense)} sub={formatRupiah(kpis?.totalExpense)} color="red" />
        <KPICard label="Tabungan" value={formatCompact(kpis?.netSavings)} sub={formatRupiah(kpis?.netSavings)} color="blue" />
        <KPICard label="Savings Rate" value={`${kpis?.savingsRate ?? 0}%`} sub={`dari pemasukan`} color="purple" />
      </div>

      {/* Row 2: Donut Charts */}
      <div className="grid grid-cols-2 gap-3 min-h-0">
        {/* Expense Composition */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-col min-h-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Komposisi Pengeluaran</p>
          {hasExpense ? (
            <div className="flex items-center gap-2 flex-1 min-h-0">
              <div className="flex-shrink-0" style={{ width: 120, height: 120 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={expenseByCategory} dataKey="value" nameKey="name" innerRadius={32} outerRadius={52} paddingAngle={2}>
                      {expenseByCategory.map((_, i) => (
                        <Cell key={i} fill={EXPENSE_COLORS[i % EXPENSE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1 overflow-y-auto">
                {expenseByCategory.map((e, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: EXPENSE_COLORS[i % EXPENSE_COLORS.length] }} />
                      <span className="text-gray-600 truncate">{CATEGORY_LABELS[e.name] || e.name}</span>
                    </div>
                    <span className="font-semibold text-gray-800 ml-1 flex-shrink-0">{e.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-300 text-xs">Belum ada pengeluaran</div>
          )}
        </div>

        {/* Fund Allocation */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Alokasi Dana</p>
            <p className="text-xs font-bold text-gray-700">{formatCompact(totalPortfolioValue)}</p>
          </div>
          {hasFunds ? (
            <div className="flex items-center gap-2 flex-1 min-h-0">
              <div className="flex-shrink-0" style={{ width: 120, height: 120 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={activeFunds} dataKey="value" nameKey="name" innerRadius={32} outerRadius={52} paddingAngle={2}>
                      {activeFunds.map((f, i) => (
                        <Cell key={i} fill={f.color || FUND_TYPE_COLORS[f.type]} />
                      ))}
                    </Pie>
                    <Tooltip content={<FundTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1 overflow-y-auto">
                {activeFunds.map((f, i) => {
                  const pct = totalPortfolioValue > 0 ? Math.round((f.value / totalPortfolioValue) * 100) : 0;
                  return (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: f.color || FUND_TYPE_COLORS[f.type] }} />
                        <span className="text-gray-600 truncate">{f.name}</span>
                      </div>
                      <span className="font-semibold text-gray-800 ml-1 flex-shrink-0">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-300 text-xs">Tambah dana di tab Portfolio</div>
          )}
        </div>
      </div>

      {/* Row 3: Budget Progress */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-2 flex-shrink-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Budget Bulanan</p>
          <button
            onClick={onEditBudget}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium px-2 py-0.5 rounded hover:bg-emerald-50 transition-colors"
          >
            Edit Budget
          </button>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 overflow-y-auto flex-1">
          {(budgetProgress || []).map((b) => (
            <div key={b.category}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs text-gray-600">{CATEGORY_LABELS[b.category] || b.category}</span>
                <span className={`text-xs font-semibold ${b.percentage > 100 ? 'text-red-500' : b.percentage > 80 ? 'text-amber-500' : 'text-gray-500'}`}>
                  {b.budgetAmount > 0 ? `${b.percentage}%` : '—'}
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${b.percentage > 100 ? 'bg-red-500' : b.percentage > 80 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(b.percentage, 100)}%` }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {b.budgetAmount > 0 ? `${formatCompact(b.spentAmount)} / ${formatCompact(b.budgetAmount)}` : 'Belum diset'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Edit Transaction Modal ───────────────────────────────────────────────────

function EditTransactionModal({ tx, funds, onClose, onSave }) {
  const [txType, setTxType] = useState(tx.type);
  const [amount, setAmount] = useState(String(tx.amount));
  const [category, setCategory] = useState(tx.category);
  const [fundId, setFundId] = useState(tx.fund?.id || '');
  const [toFundId, setToFundId] = useState(tx.toFund?.id || '');
  const [description, setDescription] = useState(tx.description || '');
  const [date, setDate] = useState(tx.date ? tx.date.split('T')[0] : todayISO());
  const [saving, setSaving] = useState(false);

  const categories = txType === 'expense' ? EXPENSE_CATEGORIES : txType === 'income' ? INCOME_CATEGORIES : [];

  const handleSave = async () => {
    if (!amount || !fundId) return;
    setSaving(true);
    try {
      await onSave(tx.id, { type: txType, amount: parseFloat(amount), category, description, date, fundId, toFundId: txType === 'transfer' ? toFundId : null });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-bold text-gray-800 mb-4">Edit Transaksi</h3>

        <div className="space-y-3">
          {/* Type */}
          <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-lg">
            {['expense', 'income', 'transfer'].map((t) => (
              <button key={t} onClick={() => { setTxType(t); setCategory(t === 'expense' ? 'makanan' : t === 'income' ? 'gaji' : 'transfer'); }}
                className={`py-1.5 rounded-md text-xs font-medium transition-all ${txType === t ? 'bg-white shadow text-emerald-700' : 'text-gray-500'}`}>
                {t === 'expense' ? 'Keluar' : t === 'income' ? 'Masuk' : 'Pindah'}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Jumlah (Rp)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>

          {/* Category */}
          {txType !== 'transfer' && (
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Kategori</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                {categories.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>)}
              </select>
            </div>
          )}

          {/* Fund */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">{txType === 'transfer' ? 'Dari Dana' : 'Dana'}</label>
            <select value={fundId} onChange={(e) => setFundId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
              {funds.map((f) => <option key={f.id} value={f.id}>{FUND_TYPE_ICONS[f.type]} {f.name}</option>)}
            </select>
          </div>

          {/* To Fund */}
          {txType === 'transfer' && (
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Ke Dana</label>
              <select value={toFundId} onChange={(e) => setToFundId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                {funds.filter((f) => f.id !== fundId).map((f) => <option key={f.id} value={f.id}>{FUND_TYPE_ICONS[f.type]} {f.name}</option>)}
              </select>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Keterangan</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>

          {/* Date */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Tanggal</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            Batal
          </button>
          <button onClick={handleSave} disabled={saving || !amount || !fundId}
            className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Transaction Row ──────────────────────────────────────────────────────────

function TransactionRow({ tx, onDelete, onEdit }) {
  const isIncome = tx.type === 'income';
  const isTransfer = tx.type === 'transfer';

  return (
    <div className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 group">
      <div className={`w-1.5 h-8 rounded-full flex-shrink-0 ${isIncome ? 'bg-emerald-400' : isTransfer ? 'bg-blue-400' : 'bg-red-400'}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-gray-700 truncate">
            {CATEGORY_LABELS[tx.category] || tx.category}
          </span>
          {tx.description && (
            <span className="text-xs text-gray-400 truncate hidden sm:inline">· {tx.description}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs text-gray-400">{formatDate(tx.date)}</span>
          <span className="text-xs px-1.5 py-0.5 rounded-full text-white text-[10px] font-medium"
            style={{ background: tx.fund?.color || '#10b981' }}>
            {tx.fund?.name}
          </span>
          {isTransfer && tx.toFund && (
            <>
              <span className="text-gray-300 text-xs">→</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full text-white text-[10px] font-medium"
                style={{ background: tx.toFund?.color || '#3b82f6' }}>
                {tx.toFund?.name}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className={`text-sm font-bold ${isIncome ? 'text-emerald-600' : isTransfer ? 'text-blue-600' : 'text-red-500'}`}>
          {isIncome ? '+' : isTransfer ? '↔' : '-'}{formatCompact(tx.amount)}
        </span>
        <button
          onClick={() => onEdit(tx)}
          className="w-6 h-6 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-xs"
          title="Edit"
        >
          ✎
        </button>
        <button
          onClick={() => onDelete(tx.id)}
          className="w-6 h-6 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-xs"
          title="Hapus"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// ─── Transaksi Tab ────────────────────────────────────────────────────────────

function TransaksiTab({ transactions, funds, loading, onAdd, onDelete, onEdit, month, year }) {
  const [txType, setTxType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('makanan');
  const [fundId, setFundId] = useState('');
  const [toFundId, setToFundId] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(todayISO());
  const [filterType, setFilterType] = useState('all');
  const [filterFund, setFilterFund] = useState('all');
  const [saving, setSaving] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  useEffect(() => {
    if (txType === 'expense') setCategory('makanan');
    else if (txType === 'income') setCategory('gaji');
    else setCategory('transfer');
  }, [txType]);

  useEffect(() => {
    if (funds.length > 0 && !fundId) setFundId(funds[0].id);
  }, [funds]);

  const categories = txType === 'expense' ? EXPENSE_CATEGORIES : txType === 'income' ? INCOME_CATEGORIES : [];

  const filteredTx = transactions.filter((tx) => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (filterFund !== 'all' && tx.fund?.id !== filterFund && tx.toFund?.id !== filterFund) return false;
    return true;
  });

  const handleSubmit = async () => {
    if (!amount || !fundId) return;
    setSaving(true);
    try {
      await onAdd({ type: txType, amount: parseFloat(amount), category, description, date, fundId, toFundId: txType === 'transfer' ? toFundId : null });
      setAmount('');
      setDescription('');
      setDate(todayISO());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full p-3 flex gap-3 overflow-hidden">
      {/* Left: Form */}
      <div className="w-72 flex-shrink-0 bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3 overflow-y-auto">
        <h3 className="text-sm font-semibold text-gray-700">Tambah Transaksi</h3>

        {/* Type Selector */}
        <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-lg">
          {['expense', 'income', 'transfer'].map((t) => (
            <button
              key={t}
              onClick={() => setTxType(t)}
              className={`py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                txType === t ? 'bg-white shadow text-emerald-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'expense' ? 'Keluar' : t === 'income' ? 'Masuk' : 'Pindah'}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Jumlah (Rp)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        {/* Category */}
        {txType !== 'transfer' && (
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>
              ))}
            </select>
          </div>
        )}

        {/* Fund */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">{txType === 'transfer' ? 'Dari Dana' : 'Dana'}</label>
          <select
            value={fundId}
            onChange={(e) => setFundId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            {funds.length === 0 && <option value="">— Tambah dana dulu —</option>}
            {funds.map((f) => (
              <option key={f.id} value={f.id}>{FUND_TYPE_ICONS[f.type]} {f.name}</option>
            ))}
          </select>
        </div>

        {/* To Fund (transfer only) */}
        {txType === 'transfer' && (
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Ke Dana</label>
            <select
              value={toFundId}
              onChange={(e) => setToFundId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              {funds.filter((f) => f.id !== fundId).map((f) => (
                <option key={f.id} value={f.id}>{FUND_TYPE_ICONS[f.type]} {f.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Keterangan (opsional)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Makan siang warteg"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        {/* Date */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Tanggal</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving || !amount || !fundId || funds.length === 0}
          className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-auto"
        >
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>

      {/* Right: Transaction List */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden min-w-0">
        {/* Filter bar */}
        <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2 flex-shrink-0">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-400"
          >
            <option value="all">Semua Tipe</option>
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
            <option value="transfer">Transfer</option>
          </select>
          <select
            value={filterFund}
            onChange={(e) => setFilterFund(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-400"
          >
            <option value="all">Semua Dana</option>
            {funds.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <span className="ml-auto text-xs text-gray-400">{filteredTx.length} transaksi</span>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-2" />
              Memuat...
            </div>
          ) : filteredTx.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2">
              <span className="text-3xl">📋</span>
              <p className="text-sm">Belum ada transaksi bulan ini</p>
            </div>
          ) : (
            filteredTx.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} onDelete={onDelete} onEdit={setEditingTx} />
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {editingTx && (
          <EditTransactionModal
            tx={editingTx}
            funds={funds}
            onClose={() => setEditingTx(null)}
            onSave={onEdit}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Fund Card ────────────────────────────────────────────────────────────────

function FundCard({ fund, onDelete }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
            style={{ background: fund.color + '22', border: `2px solid ${fund.color}` }}
          >
            {FUND_TYPE_ICONS[fund.type]}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 leading-tight">{fund.name}</p>
            <p className="text-xs text-gray-400">{FUND_TYPE_LABELS[fund.type]}</p>
          </div>
        </div>
        <button
          onClick={() => onDelete(fund.id)}
          className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-sm w-6 h-6 flex items-center justify-center rounded hover:bg-red-50"
        >
          ×
        </button>
      </div>
      <p className={`text-xl font-bold mb-2 ${fund.balance < 0 ? 'text-red-500' : 'text-gray-900'}`}>
        {formatCompact(fund.balance)}
      </p>
      <p className="text-xs text-gray-400 mb-2">{formatRupiah(fund.balance)}</p>
      <div className="grid grid-cols-2 gap-2 text-xs border-t border-gray-100 pt-2">
        <div>
          <span className="text-gray-400">Masuk </span>
          <span className="text-emerald-600 font-medium">{formatCompact(fund.totalIncome)}</span>
        </div>
        <div>
          <span className="text-gray-400">Keluar </span>
          <span className="text-red-500 font-medium">{formatCompact(fund.totalExpense)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Portfolio Tab ────────────────────────────────────────────────────────────

function PortfolioTab({ funds, loading, onAddFund, onDeleteFund }) {
  const totalPortfolio = funds.reduce((s, f) => s + f.balance, 0);

  const byType = FUND_TYPES.map((type) => {
    const typeFunds = funds.filter((f) => f.type === type);
    const total = typeFunds.reduce((s, f) => s + f.balance, 0);
    return { type, total, count: typeFunds.length };
  });

  return (
    <div className="h-full p-3 flex flex-col gap-3 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <p className="text-xs text-gray-400">Total Portofolio</p>
          <p className="text-2xl font-bold text-gray-900">{formatRupiah(totalPortfolio)}</p>
        </div>
        <button
          onClick={onAddFund}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          + Tambah Dana
        </button>
      </div>

      {/* Type Summary Pills */}
      <div className="grid grid-cols-4 gap-2 flex-shrink-0">
        {byType.map(({ type, total, count }) => (
          <div key={type} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
            <div className="text-xl mb-1">{FUND_TYPE_ICONS[type]}</div>
            <p className="text-xs text-gray-500 mb-1">{FUND_TYPE_LABELS[type]}</p>
            <p className="font-bold text-gray-900 text-sm">{formatCompact(total)}</p>
            <p className="text-xs text-gray-400">{count} akun</p>
          </div>
        ))}
      </div>

      {/* Fund Cards Grid */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-gray-400">
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-2" />
            Memuat...
          </div>
        ) : funds.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-300 gap-2">
            <span className="text-3xl">💳</span>
            <p className="text-sm">Belum ada dana. Klik "+ Tambah Dana"</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 pb-2">
            {funds.map((fund) => (
              <FundCard key={fund.id} fund={fund} onDelete={onDeleteFund} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Budget Modal ─────────────────────────────────────────────────────────────

function BudgetModal({ budgetProgress, month, year, onClose, onSave }) {
  const [inputs, setInputs] = useState(() => {
    const init = {};
    EXPENSE_CATEGORIES.forEach((cat) => {
      const found = budgetProgress?.find((b) => b.category === cat);
      init[cat] = found?.budgetAmount || '';
    });
    return init;
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        EXPENSE_CATEGORIES.map((cat) =>
          onSave({ category: cat, month, year, amount: parseFloat(inputs[cat]) || 0 })
        )
      );
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-bold text-gray-800 mb-1">Set Budget Bulanan</h3>
        <p className="text-xs text-gray-400 mb-4">{MONTH_FULL[month - 1]} {year}</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {EXPENSE_CATEGORIES.map((cat) => (
            <div key={cat}>
              <label className="text-xs text-gray-600 mb-1 block capitalize">{CATEGORY_LABELS[cat]}</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">Rp</span>
                <input
                  type="number"
                  value={inputs[cat]}
                  onChange={(e) => setInputs((prev) => ({ ...prev, [cat]: e.target.value }))}
                  placeholder="0"
                  className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan Budget'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Add Fund Modal ───────────────────────────────────────────────────────────

function AddFundModal({ onClose, onSave }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('rekening');
  const [color, setColor] = useState('#10b981');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({ name: name.trim(), type, color });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-bold text-gray-800 mb-4">Tambah Dana Baru</h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Nama Dana</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. BCA Tabungan, GoPay, Emas Antam"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Tipe Dana</label>
            <div className="grid grid-cols-2 gap-2">
              {FUND_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                    type === t ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span>{FUND_TYPE_ICONS[t]}</span>
                  <span className="text-xs">{FUND_TYPE_LABELS[t]}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-2 block">Warna</label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Tambah Dana'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function KeuanganPage() {
  const router = useRouter();

  const now = new Date();
  const [activeTab, setActiveTab] = useState('overview');
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [overview, setOverview] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [funds, setFunds] = useState([]);

  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [loadingFunds, setLoadingFunds] = useState(true);

  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showAddFundModal, setShowAddFundModal] = useState(false);

  const fetchOverview = useCallback(async (m, y) => {
    setLoadingOverview(true);
    try {
      const res = await fetch(`/api/finance/overview?month=${m}&year=${y}`);
      const json = await res.json();
      if (json.success) setOverview(json.data);
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  const fetchTransactions = useCallback(async (m, y) => {
    setLoadingTransactions(true);
    try {
      const res = await fetch(`/api/finance/transactions?month=${m}&year=${y}`);
      const json = await res.json();
      if (json.success) setTransactions(json.data);
    } finally {
      setLoadingTransactions(false);
    }
  }, []);

  const fetchFunds = useCallback(async () => {
    setLoadingFunds(true);
    try {
      const res = await fetch('/api/finance/funds');
      const json = await res.json();
      if (json.success) setFunds(json.data);
    } finally {
      setLoadingFunds(false);
    }
  }, []);

  useEffect(() => {
    fetchFunds();
    fetchOverview(month, year);
    fetchTransactions(month, year);
  }, []);

  useEffect(() => {
    fetchOverview(month, year);
    fetchTransactions(month, year);
  }, [month, year]);

  const handleAddTransaction = async (data) => {
    const res = await fetch('/api/finance/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      await Promise.all([fetchTransactions(month, year), fetchOverview(month, year), fetchFunds()]);
    } else {
      alert(json.error || 'Gagal menyimpan transaksi');
    }
  };

  const handleDeleteTransaction = async (id) => {
    const res = await fetch(`/api/finance/transactions/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) {
      await Promise.all([fetchTransactions(month, year), fetchOverview(month, year), fetchFunds()]);
    }
  };

  const handleEditTransaction = async (id, data) => {
    const res = await fetch(`/api/finance/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      await Promise.all([fetchTransactions(month, year), fetchOverview(month, year), fetchFunds()]);
    } else {
      alert(json.error || 'Gagal mengedit transaksi');
    }
  };

  const handleAddFund = async (data) => {
    const res = await fetch('/api/finance/funds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      await fetchFunds();
      await fetchOverview(month, year);
    } else {
      alert(json.error || 'Gagal menambah dana');
    }
  };

  const handleDeleteFund = async (id) => {
    const res = await fetch(`/api/finance/funds/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) {
      await fetchFunds();
      await fetchOverview(month, year);
    } else {
      alert(json.error);
    }
  };

  const handleSaveBudget = async (data) => {
    await fetch('/api/finance/budget', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  };

  const handleBudgetSaved = async () => {
    await fetchOverview(month, year);
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'transaksi', label: 'Transaksi' },
    { id: 'portfolio', label: 'Portfolio' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm transition-colors"
        >
          <span>←</span>
          <span className="hidden sm:inline">Home</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xl">💰</span>
          <h1 className="font-bold text-gray-800 text-base">Keuangan</h1>
        </div>

        {/* Month/Year Picker */}
        <div className="flex items-center gap-1.5">
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Tab Bar */}
      <nav className="bg-white border-b border-gray-200 px-4 flex-shrink-0">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Tab Content */}
      <main className="flex-1 overflow-hidden min-h-0">
        {activeTab === 'overview' && (
          <OverviewTab
            overview={overview}
            loading={loadingOverview}
            onEditBudget={() => setShowBudgetModal(true)}
          />
        )}
        {activeTab === 'transaksi' && (
          <TransaksiTab
            transactions={transactions}
            funds={funds}
            loading={loadingTransactions}
            onAdd={handleAddTransaction}
            onDelete={handleDeleteTransaction}
            onEdit={handleEditTransaction}
            month={month}
            year={year}
          />
        )}
        {activeTab === 'portfolio' && (
          <PortfolioTab
            funds={funds}
            loading={loadingFunds}
            onAddFund={() => setShowAddFundModal(true)}
            onDeleteFund={handleDeleteFund}
          />
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showBudgetModal && (
          <BudgetModal
            budgetProgress={overview?.budgetProgress}
            month={month}
            year={year}
            onClose={() => { setShowBudgetModal(false); handleBudgetSaved(); }}
            onSave={handleSaveBudget}
          />
        )}
        {showAddFundModal && (
          <AddFundModal
            onClose={() => setShowAddFundModal(false)}
            onSave={handleAddFund}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
