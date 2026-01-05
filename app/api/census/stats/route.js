import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get total count
    const total = await prisma.census.count();

    // Get counts by sheet
    const bySheet = await prisma.census.groupBy({
      by: ['sheet'],
      _count: true,
    });

    // Get counts by gender
    const byGender = await prisma.census.groupBy({
      by: ['jenisKelamin'],
      _count: true,
    });

    // Get counts by age category
    const byAgeCategory = await prisma.census.groupBy({
      by: ['kategoriUsia'],
      _count: true,
    });

    // Get counts by marital status
    const byMaritalStatus = await prisma.census.groupBy({
      by: ['statusPernikahan'],
      _count: true,
    });

    // Get counts by education
    const byEducation = await prisma.census.groupBy({
      by: ['pendidikan'],
      _count: true,
    });

    // Get counts by category (Dhuafa/Aghnia)
    const byCategory = await prisma.census.groupBy({
      by: ['kategori'],
      _count: true,
    });

    // Get counts by desa
    const byDesa = await prisma.census.groupBy({
      by: ['desa'],
      _count: true,
    });

    return NextResponse.json({
      success: true,
      data: {
        total,
        bySheet: bySheet.map(item => ({
          sheet: item.sheet || 'Unknown',
          count: item._count,
        })),
        byGender: byGender.map(item => ({
          gender: item.jenisKelamin || 'Unknown',
          count: item._count,
        })),
        byAgeCategory: byAgeCategory.map(item => ({
          category: item.kategoriUsia || 'Unknown',
          count: item._count,
        })),
        byMaritalStatus: byMaritalStatus.map(item => ({
          status: item.statusPernikahan || 'Unknown',
          count: item._count,
        })),
        byEducation: byEducation.map(item => ({
          education: item.pendidikan || 'Unknown',
          count: item._count,
        })),
        byCategory: byCategory.map(item => ({
          category: item.kategori || 'Unknown',
          count: item._count,
        })),
        byDesa: byDesa.map(item => ({
          desa: item.desa || 'Unknown',
          count: item._count,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching census stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
