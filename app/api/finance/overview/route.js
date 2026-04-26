import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || new Date().getMonth() + 1);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear());

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const EXPENSE_CATEGORIES = ['makanan', 'akomodasi', 'jajan', 'dana_tidak_terduga', 'shodaqoh', 'lainnya'];

    const [
      incomeAgg,
      expenseAgg,
      expenseByCategory,
      incomeByCategory,
      funds,
      budgetTargets,
      spendingByCategory,
    ] = await Promise.all([
      prisma.financialTransaction.aggregate({
        where: { type: 'income', date: { gte: startDate, lt: endDate } },
        _sum: { amount: true },
      }),
      prisma.financialTransaction.aggregate({
        where: { type: 'expense', date: { gte: startDate, lt: endDate } },
        _sum: { amount: true },
      }),
      prisma.financialTransaction.groupBy({
        by: ['category'],
        where: { type: 'expense', date: { gte: startDate, lt: endDate } },
        _sum: { amount: true },
      }),
      prisma.financialTransaction.groupBy({
        by: ['category'],
        where: { type: 'income', date: { gte: startDate, lt: endDate } },
        _sum: { amount: true },
      }),
      prisma.fund.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.budgetTarget.findMany({ where: { month, year } }),
      prisma.financialTransaction.groupBy({
        by: ['category'],
        where: { type: 'expense', date: { gte: startDate, lt: endDate } },
        _sum: { amount: true },
      }),
    ]);

    const totalIncome = Number(incomeAgg._sum.amount || 0);
    const totalExpense = Number(expenseAgg._sum.amount || 0);
    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

    const totalExpenseForPct = expenseByCategory.reduce((s, e) => s + Number(e._sum.amount || 0), 0);
    const expenseByCategoryFormatted = expenseByCategory
      .filter((e) => Number(e._sum.amount || 0) > 0)
      .map((e) => ({
        name: e.category,
        value: Number(e._sum.amount || 0),
        percentage: totalExpenseForPct > 0 ? Math.round((Number(e._sum.amount || 0) / totalExpenseForPct) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value);

    const totalIncomeForPct = incomeByCategory.reduce((s, e) => s + Number(e._sum.amount || 0), 0);
    const incomeByCategoryFormatted = incomeByCategory
      .filter((e) => Number(e._sum.amount || 0) > 0)
      .map((e) => ({
        name: e.category,
        value: Number(e._sum.amount || 0),
        percentage: totalIncomeForPct > 0 ? Math.round((Number(e._sum.amount || 0) / totalIncomeForPct) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value);

    // Compute fund balances (all-time)
    const fundAllocation = await Promise.all(
      funds.map(async (fund) => {
        const [inc, exp, tin, tout] = await Promise.all([
          prisma.financialTransaction.aggregate({ where: { fundId: fund.id, type: 'income' }, _sum: { amount: true } }),
          prisma.financialTransaction.aggregate({ where: { fundId: fund.id, type: 'expense' }, _sum: { amount: true } }),
          prisma.financialTransaction.aggregate({ where: { toFundId: fund.id, type: 'transfer' }, _sum: { amount: true } }),
          prisma.financialTransaction.aggregate({ where: { fundId: fund.id, type: 'transfer' }, _sum: { amount: true } }),
        ]);
        const balance = Number(inc._sum.amount || 0) - Number(exp._sum.amount || 0)
          + Number(tin._sum.amount || 0) - Number(tout._sum.amount || 0);
        return { id: fund.id, name: fund.name, type: fund.type, value: balance, color: fund.color };
      })
    );

    const totalPortfolioValue = fundAllocation.reduce((s, f) => s + f.value, 0);

    const spendingMap = {};
    spendingByCategory.forEach((s) => { spendingMap[s.category] = Number(s._sum.amount || 0); });
    const targetsMap = {};
    budgetTargets.forEach((t) => { targetsMap[t.category] = Number(t.amount); });

    const budgetProgress = EXPENSE_CATEGORIES.map((cat) => {
      const budgetAmount = targetsMap[cat] || 0;
      const spentAmount = spendingMap[cat] || 0;
      const percentage = budgetAmount > 0 ? Math.round((spentAmount / budgetAmount) * 100) : 0;
      return { category: cat, budgetAmount, spentAmount, percentage };
    });

    return NextResponse.json({
      success: true,
      data: {
        kpis: { totalIncome, totalExpense, netSavings, savingsRate },
        expenseByCategory: expenseByCategoryFormatted,
        incomeByCategory: incomeByCategoryFormatted,
        fundAllocation,
        totalPortfolioValue,
        budgetProgress,
      },
    });
  } catch (error) {
    console.error('Error fetching overview:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
