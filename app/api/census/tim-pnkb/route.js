import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Build where clause based on filters
    const where = {
      usiaSekarang: {
        gte: 21,
        lte: 35,
      },
    };

    // Handle additional filters
    if (searchParams.get('desa') && searchParams.get('desa') !== 'all') {
      where.desa = searchParams.get('desa');
    }
    if (searchParams.get('kelompok') && searchParams.get('kelompok') !== 'all') {
      where.kelompok = searchParams.get('kelompok');
    }
    if (searchParams.get('sheet') && searchParams.get('sheet') !== 'all') {
      where.sheet = searchParams.get('sheet');
    }

    // Fetch all marriage-age records
    const records = await prisma.census.findMany({
      where,
      select: {
        id: true,
        nama: true,
        desa: true,
        kelompok: true,
        usiaSekarang: true,
        jenisKelamin: true,
        kategori: true,
        statusPernikahan: true,
        pendidikan: true,
        tempatLahir: true,
        tglLahir: true,
      },
      orderBy: { nama: 'asc' },
    });

    // Calculate composition statistics
    const total = records.length;

    // Gender breakdown
    const byGender = [
      {
        name: 'L',
        value: records.filter(r => r.jenisKelamin === 'L').length,
      },
      {
        name: 'P',
        value: records.filter(r => r.jenisKelamin === 'P').length,
      },
    ].filter(item => item.value > 0);

    // Marital status breakdown
    const maritalStatusMap = new Map();
    records.forEach(record => {
      const status = record.statusPernikahan || 'Unknown';
      maritalStatusMap.set(status, (maritalStatusMap.get(status) || 0) + 1);
    });
    const byMaritalStatus = Array.from(maritalStatusMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Economic category breakdown
    const categoryMap = new Map();
    records.forEach(record => {
      const cat = record.kategori || 'Unknown';
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
    });
    const byCategory = Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Education breakdown
    const educationMap = new Map();
    records.forEach(record => {
      const edu = record.pendidikan || 'Unknown';
      educationMap.set(edu, (educationMap.get(edu) || 0) + 1);
    });
    const byEducation = Array.from(educationMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Singles (ready for marriage)
    const singles = records.filter(r =>
      r.statusPernikahan === 'Belum Menikah' ||
      r.statusPernikahan === 'Lajang' ||
      !r.statusPernikahan
    ).length;

    return NextResponse.json({
      success: true,
      data: {
        total,
        singles,
        byGender,
        byMaritalStatus,
        byCategory,
        byEducation,
        records,
      },
    });
  } catch (error) {
    console.error('Error fetching Tim PNKB data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
