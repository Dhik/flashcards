import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma.js';
import { Prisma } from '@prisma/client';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Get filter parameters
    const desa = searchParams.get('desa');
    const kelompok = searchParams.get('kelompok');
    const sheet = searchParams.get('sheet');

    // Build where clause for filters
    const where = {};
    if (desa && desa !== 'all') where.desa = desa;
    if (kelompok && kelompok !== 'all') where.kelompok = kelompok;
    if (sheet && sheet !== 'all') where.sheet = sheet;

    // Get all analytics data in parallel
    const [
      total,
      byGender,
      byAgeCategory,
      byEducation,
      byMaritalStatus,
      byCategory,
      byDesa,
      byKelompok,
      bySheet,
      byBloodType,
      byKemubalighan,
      ageDistribution,
    ] = await Promise.all([
      // Total count
      prisma.census.count({ where }),

      // By Gender
      prisma.census.groupBy({
        by: ['jenisKelamin'],
        where,
        _count: true,
      }),

      // By Age Category
      prisma.census.groupBy({
        by: ['kategoriUsia'],
        where,
        _count: true,
      }),

      // By Education
      prisma.census.groupBy({
        by: ['pendidikan'],
        where,
        _count: true,
      }),

      // By Marital Status
      prisma.census.groupBy({
        by: ['statusPernikahan'],
        where,
        _count: true,
      }),

      // By Category (Aghnia/Dhuafa)
      prisma.census.groupBy({
        by: ['kategori'],
        where,
        _count: true,
      }),

      // By Desa
      prisma.census.groupBy({
        by: ['desa'],
        where,
        _count: true,
      }),

      // By Kelompok
      prisma.census.groupBy({
        by: ['kelompok'],
        where,
        _count: true,
      }),

      // By Sheet
      prisma.census.groupBy({
        by: ['sheet'],
        where,
        _count: true,
      }),

      // By Blood Type
      prisma.census.groupBy({
        by: ['golonganDarah'],
        where,
        _count: true,
      }),

      // By Kemubalighan
      prisma.census.groupBy({
        by: ['kemubalighan'],
        where,
        _count: true,
      }),

      // Age Distribution (actual ages) - build query dynamically
      (async () => {
        const conditions = [];
        const params = [];

        if (where.desa) {
          conditions.push(`desa = $${params.length + 1}`);
          params.push(where.desa);
        }
        if (where.kelompok) {
          conditions.push(`kelompok = $${params.length + 1}`);
          params.push(where.kelompok);
        }
        if (where.sheet) {
          conditions.push(`sheet = $${params.length + 1}`);
          params.push(where.sheet);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const query = `
          SELECT
            CASE
              WHEN usia_sekarang BETWEEN 0 AND 10 THEN '0-10'
              WHEN usia_sekarang BETWEEN 11 AND 20 THEN '11-20'
              WHEN usia_sekarang BETWEEN 21 AND 30 THEN '21-30'
              WHEN usia_sekarang BETWEEN 31 AND 40 THEN '31-40'
              WHEN usia_sekarang BETWEEN 41 AND 50 THEN '41-50'
              WHEN usia_sekarang BETWEEN 51 AND 60 THEN '51-60'
              WHEN usia_sekarang > 60 THEN '60+'
              ELSE 'Unknown'
            END as age_range,
            COUNT(*) as count
          FROM census
          ${whereClause}
          GROUP BY age_range
          ORDER BY age_range
        `;

        return prisma.$queryRawUnsafe(query, ...params);
      })(),
    ]);

    // Get filter options
    const [desaOptions, kelompokOptions, sheetOptions] = await Promise.all([
      prisma.census.groupBy({
        by: ['desa'],
        where: { desa: { not: null } },
      }),
      prisma.census.groupBy({
        by: ['kelompok'],
        where: { kelompok: { not: null } },
      }),
      prisma.census.groupBy({
        by: ['sheet'],
        where: { sheet: { not: null } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        total,
        byGender: byGender.map(item => ({
          name: item.jenisKelamin || 'Unknown',
          value: item._count,
        })),
        byAgeCategory: byAgeCategory
          .map(item => ({
            name: item.kategoriUsia || 'Unknown',
            value: item._count,
          }))
          .sort((a, b) => {
            const order = ['Bayi', 'Balita', 'Paud', 'Cabe Rawit', 'Pra-remaja', 'Remaja', 'Dewasa', 'Senior', 'Unknown'];
            return order.indexOf(a.name) - order.indexOf(b.name);
          }),
        byEducation: byEducation
          .map(item => ({
            name: item.pendidikan || 'Unknown',
            value: item._count,
          }))
          .sort((a, b) => b.value - a.value),
        byMaritalStatus: byMaritalStatus.map(item => ({
          name: item.statusPernikahan || 'Unknown',
          value: item._count,
        })),
        byCategory: byCategory.map(item => ({
          name: item.kategori || 'Unknown',
          value: item._count,
        })),
        byDesa: byDesa
          .map(item => ({
            name: item.desa || 'Unknown',
            value: item._count,
          }))
          .sort((a, b) => b.value - a.value),
        byKelompok: byKelompok
          .map(item => ({
            name: item.kelompok || 'Unknown',
            value: item._count,
          }))
          .sort((a, b) => b.value - a.value),
        bySheet: bySheet.map(item => ({
          name: item.sheet || 'Unknown',
          value: item._count,
        })),
        byBloodType: byBloodType.map(item => ({
          name: item.golonganDarah || 'Unknown',
          value: item._count,
        })),
        byKemubalighan: byKemubalighan.map(item => ({
          name: item.kemubalighan || 'Unknown',
          value: item._count,
        })),
        ageDistribution: ageDistribution.map(item => ({
          name: item.age_range,
          value: Number(item.count),
        })),
      },
      filterOptions: {
        desa: desaOptions.map(item => item.desa).sort(),
        kelompok: kelompokOptions.map(item => item.kelompok).sort(),
        sheet: sheetOptions.map(item => item.sheet).sort(),
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
