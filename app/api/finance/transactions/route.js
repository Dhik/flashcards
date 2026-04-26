import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || new Date().getMonth() + 1);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear());
    const type = searchParams.get('type');
    const fundId = searchParams.get('fundId');

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const where = { date: { gte: startDate, lt: endDate } };
    if (type && type !== 'all') where.type = type;
    if (fundId && fundId !== 'all') {
      where.OR = [{ fundId }, { toFundId: fundId }];
    }

    const transactions = await prisma.financialTransaction.findMany({
      where,
      include: {
        fund: { select: { id: true, name: true, type: true, color: true } },
        toFund: { select: { id: true, name: true, type: true, color: true } },
      },
      orderBy: { date: 'desc' },
    });

    const formatted = transactions.map((tx) => ({
      ...tx,
      amount: Number(tx.amount),
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, amount, category, description, date, fundId, toFundId } = body;

    if (!type || !amount || !fundId) {
      return NextResponse.json({ success: false, error: 'type, amount, and fundId are required' }, { status: 400 });
    }

    if (type === 'transfer' && !toFundId) {
      return NextResponse.json({ success: false, error: 'toFundId is required for transfers' }, { status: 400 });
    }

    if (type === 'transfer' && toFundId === fundId) {
      return NextResponse.json({ success: false, error: 'Dana asal dan tujuan tidak boleh sama' }, { status: 400 });
    }

    const tx = await prisma.financialTransaction.create({
      data: {
        type,
        amount,
        category: category || 'lainnya',
        description: description || null,
        date: date ? new Date(date) : new Date(),
        fundId,
        toFundId: type === 'transfer' ? toFundId : null,
      },
      include: {
        fund: { select: { id: true, name: true, type: true, color: true } },
        toFund: { select: { id: true, name: true, type: true, color: true } },
      },
    });

    return NextResponse.json({ success: true, data: { ...tx, amount: Number(tx.amount) } });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
