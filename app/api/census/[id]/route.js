import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma.js';

// GET single census record by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const record = await prisma.census.findUnique({
      where: { id },
    });

    if (!record) {
      return NextResponse.json(
        { success: false, error: 'Record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error('Error fetching census record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT update census record by ID
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    // Remove id and timestamps from update data
    const { id: _, createdAt, updatedAt, ...updateData } = body;

    const record = await prisma.census.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: record,
      message: 'Record updated successfully',
    });
  } catch (error) {
    console.error('Error updating census record:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE census record by ID
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    await prisma.census.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Record deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting census record:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
