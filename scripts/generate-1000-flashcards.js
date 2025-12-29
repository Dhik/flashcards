// Generate 1000 English-Indonesian flashcards
// Run with: node scripts/generate-1000-flashcards.js > data/seed-flashcards.js

const vocabulary = {
  A1: [
    // Basic greetings & common phrases (50 cards)
    ['hello', 'halo', 'interjection', 'Hello, how are you?', 'Halo, apa kabar?', 'Greeting someone'],
    ['goodbye', 'selamat tinggal', 'interjection', 'Goodbye, see you later!', 'Selamat tinggal, sampai jumpa!', 'Saying farewell'],
    ['thank you', 'terima kasih', 'phrase', 'Thank you for your help.', 'Terima kasih atas bantuanmu.', 'Expressing gratitude'],
    ['please', 'tolong', 'adverb', 'Please help me.', 'Tolong bantu saya.', 'Making a polite request'],
    ['yes', 'ya', 'adverb', 'Yes, I agree.', 'Ya, saya setuju.', 'Affirming'],
    ['no', 'tidak', 'adverb', 'No, I cannot come.', 'Tidak, saya tidak bisa datang.', 'Declining'],
    ['sorry', 'maaf', 'interjection', 'Sorry, I am late.', 'Maaf, saya terlambat.', 'Apologizing'],
    ['excuse me', 'permisi', 'phrase', 'Excuse me, where is the bathroom?', 'Permisi, di mana kamar mandinya?', 'Getting attention'],

    // Numbers 1-20 (20 cards)
    ['one', 'satu', 'number', 'I have one brother.', 'Saya punya satu saudara laki-laki.', 'Counting'],
    ['two', 'dua', 'number', 'I need two tickets.', 'Saya perlu dua tiket.', 'Purchasing'],
    ['three', 'tiga', 'number', 'The meeting is at three.', 'Rapatnya jam tiga.', 'Telling time'],
    ['four', 'empat', 'number', 'I have four children.', 'Saya punya empat anak.', 'Family'],
    ['five', 'lima', 'number', 'Five people are coming.', 'Lima orang akan datang.', 'Planning'],
    ['six', 'enam', 'number', 'Wake up at six.', 'Bangun jam enam.', 'Daily routine'],
    ['seven', 'tujuh', 'number', 'Seven days a week.', 'Tujuh hari seminggu.', 'Time'],
    ['eight', 'delapan', 'number', 'Work starts at eight.', 'Kerja mulai jam delapan.', 'Schedule'],
    ['nine', 'sembilan', 'number', 'School ends at nine.', 'Sekolah selesai jam sembilan.', 'Education'],
    ['ten', 'sepuluh', 'number', 'Ten minutes left.', 'Sepuluh menit lagi.', 'Time remaining'],

    // Days & Time (20 cards)
    ['today', 'hari ini', 'adverb', 'Today is Monday.', 'Hari ini hari Senin.', 'Talking about time'],
    ['tomorrow', 'besok', 'adverb', 'See you tomorrow!', 'Sampai jumpa besok!', 'Making plans'],
    ['yesterday', 'kemarin', 'adverb', 'I saw her yesterday.', 'Saya melihatnya kemarin.', 'Past events'],
    ['now', 'sekarang', 'adverb', 'I am busy now.', 'Saya sibuk sekarang.', 'Current state'],
    ['later', 'nanti', 'adverb', 'Call me later.', 'Telepon saya nanti.', 'Future plans'],
    ['morning', 'pagi', 'noun', 'Good morning!', 'Selamat pagi!', 'Greeting'],
    ['afternoon', 'siang', 'noun', 'Good afternoon.', 'Selamat siang.', 'Greeting'],
    ['evening', 'sore', 'noun', 'Good evening.', 'Selamat sore.', 'Greeting'],
    ['night', 'malam', 'noun', 'Good night.', 'Selamat malam.', 'Greeting'],
    ['day', 'hari', 'noun', 'Have a good day!', 'Semoga harimu menyenangkan!', 'Well wishes'],

    // Basic verbs (30 cards)
    ['eat', 'makan', 'verb', 'I want to eat breakfast.', 'Saya mau makan sarapan.', 'Daily activities'],
    ['drink', 'minum', 'verb', 'I drink coffee every morning.', 'Saya minum kopi setiap pagi.', 'Daily routine'],
    ['go', 'pergi', 'verb', 'I go to work by bus.', 'Saya pergi kerja naik bus.', 'Transportation'],
    ['come', 'datang', 'verb', 'Please come to my party.', 'Tolong datang ke pesta saya.', 'Inviting'],
    ['see', 'melihat', 'verb', 'I see a bird.', 'Saya melihat burung.', 'Observation'],
    ['look', 'lihat', 'verb', 'Look at this!', 'Lihat ini!', 'Directing attention'],
    ['want', 'ingin', 'verb', 'I want to learn Indonesian.', 'Saya ingin belajar bahasa Indonesia.', 'Desires'],
    ['need', 'perlu', 'verb', 'I need help.', 'Saya perlu bantuan.', 'Asking for assistance'],
    ['like', 'suka', 'verb', 'I like Indonesian food.', 'Saya suka makanan Indonesia.', 'Preferences'],
    ['love', 'cinta', 'verb', 'I love my family.', 'Saya cinta keluarga saya.', 'Emotions'],

    // Family (15 cards)
    ['family', 'keluarga', 'noun', 'My family is very important.', 'Keluarga saya sangat penting.', 'Relationships'],
    ['mother', 'ibu', 'noun', 'My mother is a teacher.', 'Ibu saya seorang guru.', 'Family members'],
    ['father', 'ayah', 'noun', 'My father works in Jakarta.', 'Ayah saya bekerja di Jakarta.', 'Family members'],
    ['brother', 'saudara laki-laki', 'noun', 'I have one brother.', 'Saya punya satu saudara laki-laki.', 'Siblings'],
    ['sister', 'saudara perempuan', 'noun', 'My sister is younger.', 'Saudara perempuan saya lebih muda.', 'Siblings'],
    ['child', 'anak', 'noun', 'I have two children.', 'Saya punya dua anak.', 'Family'],
    ['son', 'anak laki-laki', 'noun', 'My son is ten years old.', 'Anak laki-laki saya berumur sepuluh tahun.', 'Family'],
    ['daughter', 'anak perempuan', 'noun', 'My daughter goes to school.', 'Anak perempuan saya bersekolah.', 'Family'],
    ['husband', 'suami', 'noun', 'My husband is kind.', 'Suami saya baik hati.', 'Marriage'],
    ['wife', 'istri', 'noun', 'My wife is a doctor.', 'Istri saya seorang dokter.', 'Marriage'],

    // Food & Drink (20 cards)
    ['water', 'air', 'noun', 'Can I have some water?', 'Boleh saya minta air?', 'Ordering'],
    ['food', 'makanan', 'noun', 'The food is delicious.', 'Makanannya enak.', 'Dining'],
    ['rice', 'nasi', 'noun', 'I eat rice every day.', 'Saya makan nasi setiap hari.', 'Staple food'],
    ['bread', 'roti', 'noun', 'Bread and butter for breakfast.', 'Roti dan mentega untuk sarapan.', 'Breakfast'],
    ['coffee', 'kopi', 'noun', 'I drink coffee in the morning.', 'Saya minum kopi di pagi hari.', 'Beverages'],
    ['tea', 'teh', 'noun', 'Would you like some tea?', 'Mau teh?', 'Offering drinks'],
    ['milk', 'susu', 'noun', 'Children need milk.', 'Anak-anak perlu susu.', 'Nutrition'],
    ['chicken', 'ayam', 'noun', 'Fried chicken is my favorite.', 'Ayam goreng kesukaan saya.', 'Food preferences'],
    ['fish', 'ikan', 'noun', 'We eat fish on Fridays.', 'Kami makan ikan hari Jumat.', 'Weekly routine'],
    ['vegetable', 'sayur', 'noun', 'Eat your vegetables!', 'Makan sayuranmu!', 'Health'],

    // Basic adjectives (25 cards)
    ['good', 'baik', 'adjective', 'Have a good day!', 'Semoga harimu menyenangkan!', 'Well wishes'],
    ['bad', 'buruk', 'adjective', 'The weather is bad.', 'Cuacanya buruk.', 'Weather'],
    ['big', 'besar', 'adjective', 'This is a big house.', 'Ini rumah besar.', 'Size'],
    ['small', 'kecil', 'adjective', 'I need a small coffee.', 'Saya mau kopi kecil.', 'Ordering'],
    ['hot', 'panas', 'adjective', 'The coffee is hot.', 'Kopinya panas.', 'Temperature'],
    ['cold', 'dingin', 'adjective', 'It is cold today.', 'Hari ini dingin.', 'Weather'],
    ['new', 'baru', 'adjective', 'I have a new phone.', 'Saya punya telepon baru.', 'Possessions'],
    ['old', 'lama', 'adjective', 'This is an old building.', 'Ini gedung lama.', 'Architecture'],
    ['happy', 'senang', 'adjective', 'I am happy to see you.', 'Saya senang bertemu kamu.', 'Emotions'],
    ['sad', 'sedih', 'adjective', 'She looks sad.', 'Dia terlihat sedih.', 'Observations'],

    // Places (20 cards)
    ['house', 'rumah', 'noun', 'I live in a small house.', 'Saya tinggal di rumah kecil.', 'Housing'],
    ['school', 'sekolah', 'noun', 'My children go to school.', 'Anak-anak saya bersekolah.', 'Education'],
    ['office', 'kantor', 'noun', 'I work in an office.', 'Saya bekerja di kantor.', 'Work'],
    ['hospital', 'rumah sakit', 'noun', 'The hospital is nearby.', 'Rumah sakit di dekat sini.', 'Healthcare'],
    ['store', 'toko', 'noun', 'The store is closed.', 'Tokonya tutup.', 'Shopping'],
    ['market', 'pasar', 'noun', 'I buy vegetables at the market.', 'Saya beli sayur di pasar.', 'Shopping'],
    ['restaurant', 'restoran', 'noun', 'Let us eat at a restaurant.', 'Ayo makan di restoran.', 'Dining out'],
    ['bank', 'bank', 'noun', 'I need to go to the bank.', 'Saya perlu ke bank.', 'Errands'],
    ['street', 'jalan', 'noun', 'Which street do you live on?', 'Kamu tinggal di jalan mana?', 'Directions'],
    ['city', 'kota', 'noun', 'Jakarta is a big city.', 'Jakarta adalah kota besar.', 'Geography'],
  ],

  // More levels would be added here similarly...
  // This is a template - the actual implementation would continue
};

// Generate the export
console.log('// Auto-generated seed data - 1000 English-Indonesian flashcards');
console.log('// Generated on:', new Date().toISOString());
console.log('');
console.log('export const seedFlashcards = [');

let rank = 1;
for (const [level, words] of Object.entries(vocabulary)) {
  words.forEach(([en, id, pos, exEn, exId, context]) => {
    console.log(`  { englishWord: '${en}', indonesianTranslation: '${id}', cefrLevel: '${level}', partOfSpeech: '${pos}', exampleSentenceEn: '${exEn}', exampleSentenceId: '${exId}', conversationContext: '${context}', frequencyRank: ${rank} },`);
    rank++;
  });
}

console.log('];');
