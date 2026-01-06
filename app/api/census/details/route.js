import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Build where clause based on filters
    const where = {};

    // Handle all possible filters
    if (searchParams.get('desa') && searchParams.get('desa') !== 'all') {
      where.desa = searchParams.get('desa');
    }
    if (searchParams.get('kelompok') && searchParams.get('kelompok') !== 'all') {
      where.kelompok = searchParams.get('kelompok');
    }
    if (searchParams.get('sheet') && searchParams.get('sheet') !== 'all') {
      where.sheet = searchParams.get('sheet');
    }
    if (searchParams.get('jenisKelamin')) {
      where.jenisKelamin = searchParams.get('jenisKelamin');
    }
    if (searchParams.get('kategori')) {
      where.kategori = searchParams.get('kategori');
    }
    if (searchParams.get('kategoriUsia')) {
      where.kategoriUsia = searchParams.get('kategoriUsia');
    }
    if (searchParams.get('statusPernikahan')) {
      where.statusPernikahan = searchParams.get('statusPernikahan');
    }
    if (searchParams.get('pendidikan')) {
      where.pendidikan = searchParams.get('pendidikan');
    }
    if (searchParams.get('golonganDarah')) {
      where.golonganDarah = searchParams.get('golonganDarah');
    }
    if (searchParams.get('kemubalighan')) {
      where.kemubalighan = searchParams.get('kemubalighan');
    }

    // Handle age range filtering (for Tim PNKB)
    const minAge = searchParams.get('minAge');
    const maxAge = searchParams.get('maxAge');
    if (minAge || maxAge) {
      where.usiaSekarang = {};
      if (minAge) {
        where.usiaSekarang.gte = parseInt(minAge);
      }
      if (maxAge) {
        where.usiaSekarang.lte = parseInt(maxAge);
      }
    }

    // Pagination
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 100;
    const skip = (page - 1) * limit;

    // Fetch records
    const [records, total] = await Promise.all([
      prisma.census.findMany({
        where,
        select: {
          id: true,
          nama: true,
          desa: true,
          kelompok: true,
          usiaSekarang: true,
          jenisKelamin: true,
          kategori: true,
          kategoriUsia: true,
          statusPernikahan: true,
          pendidikan: true,
          tempatLahir: true,
          tglLahir: true,
        },
        orderBy: { nama: 'asc' },
        skip,
        take: limit,
      }),
      prisma.census.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: records,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching census details:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
