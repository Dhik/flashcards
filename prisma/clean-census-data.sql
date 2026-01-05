-- Census Data Cleaning Script
-- Run this script to clean and standardize all census data

-- ====================================
-- 1. Clean jenis_kelamin (Gender)
-- ====================================
-- Standardize lowercase 'p' to uppercase 'P'
UPDATE census SET jenis_kelamin = 'P' WHERE LOWER(jenis_kelamin) = 'p';
UPDATE census SET jenis_kelamin = 'L' WHERE LOWER(jenis_kelamin) = 'l';


-- ====================================
-- 2. Clean kategori
-- ====================================
-- Only allow "Aghnia" and "Dhuafa", case-insensitive
UPDATE census
SET kategori = 'Aghnia'
WHERE UPPER(TRIM(kategori)) = 'AGHNIA';

UPDATE census
SET kategori = 'Dhuafa'
WHERE UPPER(TRIM(kategori)) = 'DHUAFA';

-- Set everything else to null
UPDATE census
SET kategori = NULL
WHERE kategori IS NOT NULL
  AND kategori NOT IN ('Aghnia', 'Dhuafa');


-- ====================================
-- 3. Clean kategori_usia (Age Category)
-- ====================================
-- Calculate from usia_sekarang
UPDATE census
SET kategori_usia = CASE
  WHEN usia_sekarang IS NULL THEN NULL
  WHEN usia_sekarang <= 1 THEN 'Bayi'
  WHEN usia_sekarang > 1 AND usia_sekarang <= 3 THEN 'Balita'
  WHEN usia_sekarang > 3 AND usia_sekarang <= 6 THEN 'Paud'
  WHEN usia_sekarang > 6 AND usia_sekarang <= 12 THEN 'Cabe Rawit'
  WHEN usia_sekarang > 12 AND usia_sekarang <= 15 THEN 'Pra-remaja'
  WHEN usia_sekarang > 15 AND usia_sekarang <= 18 THEN 'Remaja'
  WHEN usia_sekarang > 18 AND usia_sekarang <= 54 THEN 'Dewasa'
  WHEN usia_sekarang > 54 THEN 'Senior'
  ELSE NULL
END;


-- ====================================
-- 4. Clean golongan_darah (Blood Type)
-- ====================================
-- Normalize '0' to 'O'
UPDATE census SET golongan_darah = REPLACE(golongan_darah, '0', 'O') WHERE golongan_darah LIKE '%0%';

-- Remove rhesus (+ or -)
UPDATE census SET golongan_darah = REPLACE(REPLACE(golongan_darah, '+', ''), '-', '');

-- Trim whitespace
UPDATE census SET golongan_darah = TRIM(golongan_darah);

-- Standardize to uppercase
UPDATE census SET golongan_darah = UPPER(golongan_darah) WHERE golongan_darah IS NOT NULL;

-- Set invalid blood types to null (only O, A, B, AB are valid)
UPDATE census
SET golongan_darah = NULL
WHERE golongan_darah IS NOT NULL
  AND golongan_darah NOT IN ('O', 'A', 'B', 'AB');


-- ====================================
-- 5. Clean kemubalighan
-- ====================================
-- Only accept MT and MS
UPDATE census
SET kemubalighan = UPPER(TRIM(kemubalighan))
WHERE kemubalighan IS NOT NULL;

UPDATE census
SET kemubalighan = NULL
WHERE kemubalighan IS NOT NULL
  AND kemubalighan NOT IN ('MT', 'MS');


-- ====================================
-- 6. Clean kelas (Grade/Class)
-- ====================================
-- Extract numbers from various formats
UPDATE census
SET kelas = CASE
  -- Handle "Kelas X" format
  WHEN kelas ILIKE 'kelas %' THEN TRIM(REPLACE(UPPER(kelas), 'KELAS', ''))
  -- Handle Roman numerals
  WHEN UPPER(TRIM(kelas)) = 'I' THEN '1'
  WHEN UPPER(TRIM(kelas)) = 'II' THEN '2'
  WHEN UPPER(TRIM(kelas)) = 'III' THEN '3'
  WHEN UPPER(TRIM(kelas)) = 'IV' THEN '4'
  WHEN UPPER(TRIM(kelas)) = 'V' THEN '5'
  WHEN UPPER(TRIM(kelas)) = 'VI' THEN '6'
  WHEN UPPER(TRIM(kelas)) = 'VII' THEN '7'
  WHEN UPPER(TRIM(kelas)) = 'VIII' THEN '8'
  WHEN UPPER(TRIM(kelas)) = 'IX' THEN '9'
  WHEN UPPER(TRIM(kelas)) = 'X' THEN '10'
  WHEN UPPER(TRIM(kelas)) = 'XI' THEN '11'
  WHEN UPPER(TRIM(kelas)) = 'XII' THEN '12'
  -- Handle plain numbers
  WHEN kelas ~ '^\d+$' THEN kelas
  ELSE kelas
END
WHERE kelas IS NOT NULL;

-- Remove "Kuliah", "TK", "-", and other non-numeric values
UPDATE census
SET kelas = NULL
WHERE kelas IS NOT NULL
  AND (
    UPPER(kelas) IN ('KULIAH', 'TK', '-', '0')
    OR kelas !~ '^\d+$'
  );


-- ====================================
-- 7. Clean pendidikan (Education Level)
-- ====================================
-- Standardize education levels
UPDATE census
SET pendidikan = CASE
  -- Paud/TK
  WHEN UPPER(TRIM(pendidikan)) IN ('PAUD', 'KELOMPOK BERMAIN') THEN 'Paud'
  WHEN UPPER(TRIM(pendidikan)) LIKE 'TK%' THEN 'TK'

  -- SD
  WHEN UPPER(TRIM(pendidikan)) LIKE 'SD%' OR UPPER(TRIM(pendidikan)) = 'SDTT' THEN 'SD'
  WHEN pendidikan ILIKE '%SD %' THEN 'SD'

  -- SMP
  WHEN UPPER(TRIM(pendidikan)) LIKE 'SMP%' OR UPPER(TRIM(pendidikan)) = 'SLTP' THEN 'SMP'

  -- SMA/SMK
  WHEN UPPER(TRIM(pendidikan)) IN ('SMA', 'SMK', 'SLTA', 'SMA/K', 'SMA/SMK', 'STM', 'SLB') THEN 'SMA'
  WHEN pendidikan ILIKE '%SMA%' OR pendidikan ILIKE '%SMK%' OR pendidikan ILIKE '%STM%' THEN 'SMA'

  -- Mahasiswa/Kuliah/Perguruan Tinggi
  WHEN UPPER(TRIM(pendidikan)) IN ('MAHASISWA', 'KULIAH', 'PERGURUAN TINGGI') THEN 'Mahasiswa'
  WHEN pendidikan ILIKE '%perguruan tinggi%' THEN 'Mahasiswa'
  WHEN UPPER(pendidikan) LIKE '%SEDANG KULIAH%' THEN 'Mahasiswa'

  -- D1
  WHEN UPPER(TRIM(pendidikan)) = 'D1' OR UPPER(TRIM(pendidikan)) = 'D-1' THEN 'D1'

  -- D2
  WHEN UPPER(TRIM(pendidikan)) = 'D2' OR UPPER(TRIM(pendidikan)) = 'D-2' THEN 'D2'

  -- D3
  WHEN UPPER(TRIM(pendidikan)) IN ('D3', 'D-3', 'DIPLOMA 3', 'DIPLOMA') THEN 'D3'
  WHEN pendidikan ILIKE 'D3%' OR pendidikan ILIKE 'D-3%' THEN 'D3'

  -- D4/S1
  WHEN UPPER(TRIM(pendidikan)) IN ('D4', 'D-4', 'DIV', 'D4/S1', 'DIPLOMA IV/STRATA I') THEN 'S1'

  -- S1
  WHEN UPPER(TRIM(pendidikan)) IN ('S1', 'S-1', 'SARJANA', 'SE', 'ST', 'SITA') THEN 'S1'
  WHEN pendidikan ILIKE 'S1%' OR pendidikan ILIKE 'S-1%' THEN 'S1'

  -- S2
  WHEN UPPER(TRIM(pendidikan)) = 'S2' OR UPPER(TRIM(pendidikan)) = 'S-2' THEN 'S2'
  WHEN pendidikan ILIKE 'S2%' THEN 'S2'

  -- S3
  WHEN UPPER(TRIM(pendidikan)) = 'S3' OR UPPER(TRIM(pendidikan)) = 'S-3' THEN 'S3'

  -- Belum Sekolah
  WHEN UPPER(TRIM(pendidikan)) = 'BELUM SEKOLAH' THEN NULL

  ELSE NULL
END
WHERE pendidikan IS NOT NULL;


-- ====================================
-- 8. Clean status_pernikahan (Marital Status)
-- ====================================
-- Standardize marital status
UPDATE census
SET status_pernikahan = CASE
  WHEN UPPER(TRIM(status_pernikahan)) = 'JANDA' THEN 'Janda'
  WHEN UPPER(TRIM(status_pernikahan)) = 'DUDA' THEN 'Duda'
  WHEN UPPER(TRIM(status_pernikahan)) = 'MENIKAH' THEN 'Menikah'
  WHEN UPPER(TRIM(status_pernikahan)) = 'BELUM' THEN 'Belum Menikah'
  WHEN UPPER(TRIM(status_pernikahan)) = 'JANDA/DUDA' THEN 'Janda'
  ELSE NULL
END
WHERE status_pernikahan IS NOT NULL;


-- ====================================
-- 9. Clean tempat_lahir (Place of Birth)
-- ====================================
-- Remove dates and extra text
UPDATE census
SET tempat_lahir = TRIM(REGEXP_REPLACE(tempat_lahir, '\d{1,2}[/-]\d{1,2}[/-]\d{2,4}', '', 'g'))
WHERE tempat_lahir IS NOT NULL;

UPDATE census
SET tempat_lahir = TRIM(REGEXP_REPLACE(tempat_lahir, ',\s*\d{1,2}\s+\w+\s+\d{4}', '', 'gi'))
WHERE tempat_lahir IS NOT NULL;

-- Remove trailing commas and extra whitespace
UPDATE census
SET tempat_lahir = TRIM(TRAILING ',' FROM TRIM(tempat_lahir))
WHERE tempat_lahir IS NOT NULL;

-- Standardize to proper case and merge similar locations
UPDATE census
SET tempat_lahir = CASE
  -- Major cities - standardize
  WHEN UPPER(tempat_lahir) LIKE '%JAKARTA%' THEN 'Jakarta'
  WHEN UPPER(tempat_lahir) LIKE '%BANDUNG%' THEN 'Bandung'
  WHEN UPPER(tempat_lahir) LIKE '%SURABAYA%' THEN 'Surabaya'
  WHEN UPPER(tempat_lahir) LIKE '%SEMARANG%' THEN 'Semarang'
  WHEN UPPER(tempat_lahir) LIKE '%MEDAN%' THEN 'Medan'
  WHEN UPPER(tempat_lahir) LIKE '%TASIK%MALAYA%' OR UPPER(tempat_lahir) = 'TASIKMALAYA' THEN 'Tasikmalaya'
  WHEN UPPER(tempat_lahir) LIKE '%CIREBON%' THEN 'Cirebon'
  WHEN UPPER(tempat_lahir) LIKE '%GARUT%' THEN 'Garut'
  WHEN UPPER(tempat_lahir) LIKE '%CIAMIS%' THEN 'Ciamis'
  WHEN UPPER(tempat_lahir) LIKE '%CIMAHI%' THEN 'Cimahi'
  WHEN UPPER(tempat_lahir) LIKE '%SUMEDANG%' THEN 'Sumedang'
  WHEN UPPER(tempat_lahir) LIKE '%KARAWANG%' THEN 'Karawang'
  WHEN UPPER(tempat_lahir) LIKE '%PURWAKARTA%' THEN 'Purwakarta'
  WHEN UPPER(tempat_lahir) LIKE '%SUBANG%' THEN 'Subang'
  WHEN UPPER(tempat_lahir) LIKE '%BOGOR%' THEN 'Bogor'
  WHEN UPPER(tempat_lahir) LIKE '%DEPOK%' THEN 'Depok'

  -- Jawa Tengah
  WHEN UPPER(tempat_lahir) LIKE '%PEMALANG%' THEN 'Pemalang'
  WHEN UPPER(tempat_lahir) LIKE '%PEKALONGAN%' THEN 'Pekalongan'
  WHEN UPPER(tempat_lahir) LIKE '%CILACAP%' THEN 'Cilacap'
  WHEN UPPER(tempat_lahir) LIKE '%PURWOKERTO%' THEN 'Purwokerto'
  WHEN UPPER(tempat_lahir) LIKE '%BANYUMAS%' THEN 'Banyumas'
  WHEN UPPER(tempat_lahir) LIKE '%MAGELANG%' THEN 'Magelang'
  WHEN UPPER(tempat_lahir) LIKE '%KLATEN%' THEN 'Klaten'
  WHEN UPPER(tempat_lahir) LIKE '%SOLO%' THEN 'Solo'
  WHEN UPPER(tempat_lahir) LIKE '%SUKOHARJO%' THEN 'Sukoharjo'
  WHEN UPPER(tempat_lahir) LIKE '%BOYOLALI%' THEN 'Boyolali'
  WHEN UPPER(tempat_lahir) LIKE '%GROBOGAN%' THEN 'Grobogan'
  WHEN UPPER(tempat_lahir) LIKE '%WONOGIRI%' THEN 'Wonogiri'
  WHEN UPPER(tempat_lahir) LIKE '%BATANG%' THEN 'Batang'
  WHEN UPPER(tempat_lahir) LIKE '%BREBES%' THEN 'Brebes'

  -- Jawa Timur
  WHEN UPPER(tempat_lahir) LIKE '%MALANG%' THEN 'Malang'
  WHEN UPPER(tempat_lahir) LIKE '%BLITAR%' THEN 'Blitar'
  WHEN UPPER(tempat_lahir) LIKE '%KEDIRI%' THEN 'Kediri'
  WHEN UPPER(tempat_lahir) LIKE '%MADIUN%' THEN 'Madiun'
  WHEN UPPER(tempat_lahir) LIKE '%MOJOKERTO%' THEN 'Mojokerto'
  WHEN UPPER(tempat_lahir) LIKE '%PONOROGO%' THEN 'Ponorogo'
  WHEN UPPER(tempat_lahir) LIKE '%BANYUWANGI%' THEN 'Banyuwangi'
  WHEN UPPER(tempat_lahir) LIKE '%SIDOARJO%' THEN 'Sidoarjo'
  WHEN UPPER(tempat_lahir) LIKE '%LAMONGAN%' THEN 'Lamongan'
  WHEN UPPER(tempat_lahir) LIKE '%BOJONEGORO%' THEN 'Bojonegoro'
  WHEN UPPER(tempat_lahir) LIKE '%BLORA%' THEN 'Blora'

  -- DIY
  WHEN UPPER(tempat_lahir) LIKE '%BANTUL%' THEN 'Bantul'
  WHEN UPPER(tempat_lahir) LIKE '%GUNUNG%KIDUL%' OR UPPER(tempat_lahir) = 'KULONPROGO' THEN 'Gunung Kidul'

  -- Sumatera
  WHEN UPPER(tempat_lahir) LIKE '%LAMPUNG%' THEN 'Lampung'
  WHEN UPPER(tempat_lahir) LIKE '%BANDAR%LAMPUNG%' THEN 'Bandar Lampung'
  WHEN UPPER(tempat_lahir) LIKE '%BENGKULU%' THEN 'Bengkulu'
  WHEN UPPER(tempat_lahir) LIKE '%PADANG%' THEN 'Padang'
  WHEN UPPER(tempat_lahir) LIKE '%PEKANBARU%' OR UPPER(tempat_lahir) LIKE '%PEKAN%BARU%' THEN 'Pekanbaru'
  WHEN UPPER(tempat_lahir) LIKE '%RIAU%' THEN 'Riau'
  WHEN UPPER(tempat_lahir) LIKE '%PAGAR%ALAM%' THEN 'Pagar Alam'
  WHEN UPPER(tempat_lahir) LIKE '%PRABUMULIH%' THEN 'Prabumulih'

  -- Kalimantan
  WHEN UPPER(tempat_lahir) LIKE '%PONTIANAK%' THEN 'Pontianak'
  WHEN UPPER(tempat_lahir) LIKE '%BANJAR%' THEN 'Banjar'
  WHEN UPPER(tempat_lahir) LIKE '%BALIKPAPAN%' THEN 'Balikpapan'
  WHEN UPPER(tempat_lahir) LIKE '%PANGKALAN%BUN%' THEN 'Pangkalan Bun'
  WHEN UPPER(tempat_lahir) LIKE '%KETAPANG%' THEN 'Ketapang'

  -- Sulawesi
  WHEN UPPER(tempat_lahir) LIKE '%GORONTALO%' THEN 'Gorontalo'

  -- Others
  WHEN UPPER(tempat_lahir) LIKE '%BATAM%' THEN 'Batam'
  WHEN UPPER(tempat_lahir) LIKE '%AMBON%' THEN 'Ambon'
  WHEN UPPER(tempat_lahir) LIKE '%KUWAIT%' THEN 'Kuwait'

  -- Capitalize first letter of each word for others
  ELSE INITCAP(LOWER(tempat_lahir))
END
WHERE tempat_lahir IS NOT NULL AND tempat_lahir != '';

-- Clean up empty strings and dashes
UPDATE census
SET tempat_lahir = NULL
WHERE tempat_lahir IS NOT NULL
  AND (TRIM(tempat_lahir) = '' OR TRIM(tempat_lahir) = '-');


-- ====================================
-- Final cleanup - Set empty strings to NULL
-- ====================================
UPDATE census SET no = NULL WHERE TRIM(no) IN ('', '-');
UPDATE census SET desa = NULL WHERE TRIM(desa) IN ('', '-');
UPDATE census SET kelompok = NULL WHERE TRIM(kelompok) IN ('', '-');
UPDATE census SET nama = NULL WHERE TRIM(nama) IN ('', '-');
UPDATE census SET tgl_lahir = NULL WHERE TRIM(tgl_lahir) IN ('', '-');
UPDATE census SET pendidikan = NULL WHERE TRIM(pendidikan) IN ('', '-');
UPDATE census SET nama_lembaga_pendidikan = NULL WHERE TRIM(nama_lembaga_pendidikan) IN ('', '-');
UPDATE census SET dapukan = NULL WHERE TRIM(dapukan) IN ('', '-');


-- ====================================
-- Summary Query - Check results
-- ====================================
SELECT
  'jenis_kelamin' as field,
  jenis_kelamin as value,
  COUNT(*) as count
FROM census
GROUP BY jenis_kelamin
ORDER BY count DESC;

SELECT
  'kategori' as field,
  kategori as value,
  COUNT(*) as count
FROM census
GROUP BY kategori
ORDER BY count DESC;

SELECT
  'kategori_usia' as field,
  kategori_usia as value,
  COUNT(*) as count
FROM census
GROUP BY kategori_usia
ORDER BY count DESC;

SELECT
  'golongan_darah' as field,
  golongan_darah as value,
  COUNT(*) as count
FROM census
GROUP BY golongan_darah
ORDER BY count DESC;

SELECT
  'kemubalighan' as field,
  kemubalighan as value,
  COUNT(*) as count
FROM census
GROUP BY kemubalighan
ORDER BY count DESC;

SELECT
  'status_pernikahan' as field,
  status_pernikahan as value,
  COUNT(*) as count
FROM census
GROUP BY status_pernikahan
ORDER BY count DESC;

SELECT
  'pendidikan' as field,
  pendidikan as value,
  COUNT(*) as count
FROM census
GROUP BY pendidikan
ORDER BY count DESC;
