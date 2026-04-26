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

    const [targets, spendingByCategory] = await Promise.all([
      prisma.budgetTarget.findMany({ where: { month, year } }),
      prisma.financialTransaction.groupBy({
        by: ['category'],
        where: { type: 'expense', date: { gte: startDate, lt: endDate } },
        _sum: { amount: true },
      }),
    ]);

    const spendingMap = {};
    spendingByCategory.forEach((s) => {
      spendingMap[s.category] = Number(s._sum.amount || 0);
    });

    const targetsMap = {};
    targets.forEach((t) => {
      targetsMap[t.category] = Number(t.amount);
    });

    const budgetProgress = EXPENSE_CATEGORIES.map((cat) => {
      const budgetAmount = targetsMap[cat] || 0;
      const spentAmount = spendingMap[cat] || 0;
      const percentage = budgetAmount > 0 ? Math.round((spentAmount / budgetAmount) * 100) : 0;
      return { category: cat, budgetAmount, spentAmount, percentage };
    });

    return NextResponse.json({ success: true, data: budgetProgress });
  } catch (error) {
    console.error('Error fetching budget:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { category, month, year, amount } = body;

    if (!category || !month || !year || amount === undefined) {
      return NextResponse.json({ success: false, error: 'All fields required' }, { status: 400 });
    }

    const target = await prisma.budgetTarget.upsert({
      where: { category_month_year: { category, month, year } },
      update: { amount },
      create: { category, month, year, amount },
    });

    return NextResponse.json({ success: true, data: { ...target, amount: Number(target.amount) } });
  } catch (error) {
    console.error('Error upserting budget:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
