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
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendLog = (log) => {
        const data = `data: ${JSON.stringify(log)}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      let totalImported = 0;
      let totalErrors = 0;

      try {
        sendLog({ type: 'info', message: 'Starting incremental import from Google Sheets...' });
        sendLog({ type: 'info', message: 'Existing records will be preserved, only new data will be added' });

        const sheets = await getGoogleSheetsClient();
        sendLog({ type: 'success', message: 'Connected to Google Sheets API' });

        // Import data from each sheet (skipping duplicates)
        for (const sheetName of SHEETS) {
          try {
            sendLog({ type: 'info', message: `Processing sheet: ${sheetName}...` });

            const response = await sheets.spreadsheets.values.get({
              spreadsheetId: SPREADSHEET_ID,
              range: `${sheetName}!A:Q`,
            });

            const rows = response.data.values;
            if (!rows || rows.length === 0) {
              sendLog({ type: 'warning', message: `No data found in sheet: ${sheetName}` });
              continue;
            }

            const dataRows = rows.slice(1);
            const totalRowsInSheet = dataRows.length;
            sendLog({ type: 'info', message: `Found ${totalRowsInSheet} rows in ${sheetName}` });

            let sheetImported = 0;
            let sheetErrors = 0;
            let sheetDuplicates = 0;
            let currentRow = 0;

            for (const row of dataRows) {
              currentRow++;

              if (!row || row.length === 0 || !row.some(cell => cell && cell.trim())) {
                continue;
              }

              try {
                const nama = row[3] || null;
                const tglLahir = normalizeDate(row[5]);

                if (nama || tglLahir) {
                  const existing = await prisma.census.findFirst({
                    where: { nama, tglLahir, sheet: sheetName },
                  });

                  if (existing) {
                    sheetDuplicates++;
                    continue;
                  }
                }

                await prisma.census.create({
                  data: {
                    no: row[0] || null,
                    desa: row[1] || null,
                    kelompok: row[2] || null,
                    nama,
                    tempatLahir: row[4] || null,
                    tglLahir,
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

                if (currentRow % 50 === 0 || currentRow === totalRowsInSheet) {
                  sendLog({
                    type: 'info',
                    message: `${sheetName}: Processing row ${currentRow} of ${totalRowsInSheet} (${Math.round((currentRow / totalRowsInSheet) * 100)}%)`,
                  });
                }
              } catch (error) {
                sheetErrors++;
                const errorMsg = `Row ${currentRow} in ${sheetName}: ${error.message}`;
                console.error(`❌ Error importing row ${currentRow} from ${sheetName}:`, error);
                sendLog({
                  type: 'error',
                  message: errorMsg
                });
              }
            }

            totalImported += sheetImported;
            totalErrors += sheetErrors;

            sendLog({
              type: 'success',
              message: `✓ ${sheetName}: Imported ${sheetImported} records${sheetDuplicates > 0 ? `, skipped ${sheetDuplicates} duplicates` : ''}${sheetErrors > 0 ? `, ${sheetErrors} errors` : ''}`,
            });
          } catch (error) {
            console.error(`❌ Error processing sheet ${sheetName}:`, error);
            sendLog({ type: 'error', message: `Error processing ${sheetName}: ${error.message}` });
            totalErrors++;
          }
        }

        sendLog({
          type: 'success',
          message: `Import completed! ${totalImported} new records added${totalErrors > 0 ? `, ${totalErrors} errors` : ''}`,
        });

        sendLog({ type: 'done', success: true, imported: totalImported, errors: totalErrors });
      } catch (error) {
        console.error('❌ FATAL IMPORT ERROR:', error);
        console.error('Error stack:', error.stack);
        sendLog({ type: 'error', message: `Fatal error: ${error.message}` });
        sendLog({ type: 'done', success: false, error: error.message });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export const maxDuration = 60;
