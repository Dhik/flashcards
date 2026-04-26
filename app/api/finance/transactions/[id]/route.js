import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma.js';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { type, amount, category, description, date, fundId, toFundId } = body;

    const tx = await prisma.financialTransaction.update({
      where: { id },
      data: {
        type,
        amount,
        category,
        description: description || null,
        date: date ? new Date(date) : undefined,
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
    console.error('Error updating transaction:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.financialTransaction.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
