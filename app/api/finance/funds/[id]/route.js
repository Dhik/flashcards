import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma.js';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, color } = body;

    const fund = await prisma.fund.update({
      where: { id },
      data: { name, color },
    });

    return NextResponse.json({ success: true, data: fund });
  } catch (error) {
    console.error('Error updating fund:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const txCount = await prisma.financialTransaction.count({
      where: { OR: [{ fundId: id }, { toFundId: id }] },
    });

    if (txCount > 0) {
      return NextResponse.json(
        { success: false, error: `Dana ini memiliki ${txCount} transaksi. Hapus transaksi terlebih dahulu.` },
        { status: 400 }
      );
    }

    await prisma.fund.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting fund:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
