import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '../../../../lib/prisma.js';
import path from 'path';

const SPREADSHEET_ID = '1ft5zAdw_MfMxrJv--qyPd526_QCQLdRIC5Gg6C2lOzE';
const SHEETS = ['RCK', 'CNT', 'CNB', 'CLK', 'SINSAR', 'UBER', 'JATEN'];

function parseAge(ageValue) {
  if (!ageValue) return null;
  const age = parseInt(ageValue);
  return isNaN(age) ? null : age;
}

function normalizeDate(dateValue) {
  if (!dateValue) return null;
  // Keep the original string format
  return String(dateValue).trim();
}

async function getGoogleSheetsClient() {
  try {
    const credentialsPath = path.join(process.cwd(), 'google-sheets-credentials.json');
    const auth = new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const authClient = await auth.getClient();
    return google.sheets({ version: 'v4', auth: authClient });
  } catch (error) {
    console.error('Error creating Google Sheets client:', error);
    throw error;
  }
}

export async function POST(request) {
  const logs = [];
  let totalImported = 0;
  let totalErrors = 0;

  try {
    logs.push({ type: 'info', message: 'Starting import from Google Sheets...' });

    const sheets = await getGoogleSheetsClient();
    logs.push({ type: 'success', message: 'Connected to Google Sheets API' });

    // Clear existing data
    logs.push({ type: 'info', message: 'Clearing existing census data...' });
    const deleteResult = await prisma.census.deleteMany({});
    logs.push({ type: 'success', message: `Deleted ${deleteResult.count} existing records` });

    // Import data from each sheet
    for (const sheetName of SHEETS) {
      try {
        logs.push({ type: 'info', message: `Processing sheet: ${sheetName}...` });

        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: `${sheetName}!A:Q`, // Columns A to Q (17 columns)
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
          logs.push({ type: 'warning', message: `No data found in sheet: ${sheetName}` });
          continue;
        }

        // Skip header row
        const dataRows = rows.slice(1);
        const totalRowsInSheet = dataRows.length;
        logs.push({ type: 'info', message: `Found ${totalRowsInSheet} rows in ${sheetName}` });

        let sheetImported = 0;
        let sheetErrors = 0;
        let sheetDuplicates = 0;
        let currentRow = 0;

        for (const row of dataRows) {
          currentRow++;

          // Skip empty rows
          if (!row || row.length === 0 || !row.some(cell => cell && cell.trim())) {
            continue;
          }

          try {
            const nama = row[3] || null;
            const tglLahir = normalizeDate(row[5]);

            // Check for duplicate based on name, birth date, and sheet
            // Skip if all three are null (can't identify uniquely)
            let isDuplicate = false;

            if (nama || tglLahir) {
              const existing = await prisma.census.findFirst({
                where: {
                  nama: nama,
                  tglLahir: tglLahir,
                  sheet: sheetName,
                },
              });

              if (existing) {
                isDuplicate = true;
                sheetDuplicates++;
                // Skip this row as it's a duplicate
                continue;
              }
            }

            await prisma.census.create({
              data: {
                no: row[0] || null,
                desa: row[1] || null,
                kelompok: row[2] || null,
                nama: nama,
                tempatLahir: row[4] || null,
                tglLahir: tglLahir,
                usiaSekarang: parseAge(row[6]),
                jenisKelamin: row[7] || null,
                statusPernikahan: row[8] || null,
                pendidikan: row[9] || null,
                kelas: row[10] || null,
                namaLembagaPendidikan: row[11] || null,
                dapukan: row[12] || null,
                kategori: row[13] || null,
                kategoriUsia: row[14] || null,
                golonganDarah: row[15] || null,
                kemubalighan: row[16] || null,
                sheet: sheetName,
              },
            });

            sheetImported++;

            // Log progress every 50 rows or on last row
            if (currentRow % 50 === 0 || currentRow === totalRowsInSheet) {
              logs.push({
                type: 'info',
                message: `${sheetName}: Processing row ${currentRow} of ${totalRowsInSheet} (${Math.round((currentRow / totalRowsInSheet) * 100)}%)`,
              });
            }
          } catch (error) {
            sheetErrors++;
            console.error(`Error importing row ${currentRow} from ${sheetName}:`, error);
          }
        }

        totalImported += sheetImported;
        totalErrors += sheetErrors;

        logs.push({
          type: 'success',
          message: `✓ ${sheetName}: Imported ${sheetImported} records${sheetDuplicates > 0 ? `, skipped ${sheetDuplicates} duplicates` : ''}${sheetErrors > 0 ? `, ${sheetErrors} errors` : ''}`,
        });
      } catch (error) {
        logs.push({ type: 'error', message: `Error processing ${sheetName}: ${error.message}` });
        totalErrors++;
      }
    }

    logs.push({
      type: 'success',
      message: `Import completed! Total: ${totalImported} records imported${totalErrors > 0 ? `, ${totalErrors} errors` : ''}`,
    });

    return NextResponse.json({
      success: true,
      imported: totalImported,
      errors: totalErrors,
      logs,
    });
  } catch (error) {
    console.error('Import error:', error);
    logs.push({ type: 'error', message: `Fatal error: ${error.message}` });

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        logs,
      },
      { status: 500 }
    );
  }
}

export const maxDuration = 60; // 60 seconds timeout for import
