import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Get filter parameters
    const age = searchParams.get('age');
    const desa = searchParams.get('desa');
    const kelompok = searchParams.get('kelompok');
    const gender = searchParams.get('gender');
    const category = searchParams.get('category');
    const maritalStatus = searchParams.get('maritalStatus');
    const search = searchParams.get('search');

    // Get pagination parameters
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};

    if (age) {
      where.usiaSekarang = parseInt(age);
    }

    if (desa && desa !== 'all') {
      where.desa = desa;
    }

    if (kelompok && kelompok !== 'all') {
      where.kelompok = kelompok;
    }

    if (gender && gender !== 'all') {
      where.jenisKelamin = gender;
    }

    if (category && category !== 'all') {
      where.kategori = category;
    }

    if (maritalStatus && maritalStatus !== 'all') {
      where.statusPernikahan = maritalStatus;
    }

    if (search) {
      where.OR = [
        { nama: { contains: search, mode: 'insensitive' } },
        { tempatLahir: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count for pagination
    const total = await prisma.census.count({ where });

    // Get paginated data
    const data = await prisma.census.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get filter options
    const desaOptions = await prisma.census.groupBy({
      by: ['desa'],
      where: { desa: { not: null } },
    });

    const kelompokOptions = await prisma.census.groupBy({
      by: ['kelompok'],
      where: { kelompok: { not: null } },
    });

    const genderOptions = await prisma.census.groupBy({
      by: ['jenisKelamin'],
      where: { jenisKelamin: { not: null } },
    });

    const categoryOptions = await prisma.census.groupBy({
      by: ['kategori'],
      where: { kategori: { not: null } },
    });

    const maritalStatusOptions = await prisma.census.groupBy({
      by: ['statusPernikahan'],
      where: { statusPernikahan: { not: null } },
    });

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filterOptions: {
        desa: desaOptions.map(item => item.desa),
        kelompok: kelompokOptions.map(item => item.kelompok),
        gender: genderOptions.map(item => item.jenisKelamin),
        category: categoryOptions.map(item => item.kategori),
        maritalStatus: maritalStatusOptions.map(item => item.statusPernikahan),
      },
    });
  } catch (error) {
    console.error('Error fetching census list:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
