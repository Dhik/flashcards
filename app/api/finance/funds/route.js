import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma.js';

export async function GET() {
  try {
    const funds = await prisma.fund.findMany({ orderBy: { createdAt: 'asc' } });

    const fundsWithBalances = await Promise.all(
      funds.map(async (fund) => {
        const [incomeAgg, expenseAgg, transferInAgg, transferOutAgg] = await Promise.all([
          prisma.financialTransaction.aggregate({
            where: { fundId: fund.id, type: 'income' },
            _sum: { amount: true },
          }),
          prisma.financialTransaction.aggregate({
            where: { fundId: fund.id, type: 'expense' },
            _sum: { amount: true },
          }),
          prisma.financialTransaction.aggregate({
            where: { toFundId: fund.id, type: 'transfer' },
            _sum: { amount: true },
          }),
          prisma.financialTransaction.aggregate({
            where: { fundId: fund.id, type: 'transfer' },
            _sum: { amount: true },
          }),
        ]);

        const totalIncome = Number(incomeAgg._sum.amount || 0);
        const totalExpense = Number(expenseAgg._sum.amount || 0);
        const transferIn = Number(transferInAgg._sum.amount || 0);
        const transferOut = Number(transferOutAgg._sum.amount || 0);
        const balance = totalIncome - totalExpense + transferIn - transferOut;

        return { ...fund, balance, totalIncome, totalExpense };
      })
    );

    return NextResponse.json({ success: true, data: fundsWithBalances });
  } catch (error) {
    console.error('Error fetching funds:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, type, color } = body;

    if (!name || !type) {
      return NextResponse.json({ success: false, error: 'name and type are required' }, { status: 400 });
    }

    const fund = await prisma.fund.create({
      data: { name, type, color: color || '#10b981' },
    });

    return NextResponse.json({ success: true, data: { ...fund, balance: 0, totalIncome: 0, totalExpense: 0 } });
  } catch (error) {
    console.error('Error creating fund:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
