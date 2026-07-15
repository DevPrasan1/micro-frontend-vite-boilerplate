const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join(__dirname, '..', 'assets', 'Shemaroo-Comedy.csv');
const JSON_OUTPUT_PATH = path.join(__dirname, '..', 'packages', 'shared-utils', 'src', 'yt-videos.json');

function parseCSV(csvText) {
  const records = [];
  let currentRecord = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip next escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRecord.push(currentField);
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n
      }
      currentRecord.push(currentField);
      if (currentRecord.some(f => f.trim() !== '')) {
        records.push(currentRecord);
      }
      currentRecord = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField || currentRecord.length > 0) {
    currentRecord.push(currentField);
    records.push(currentRecord);
  }

  return records;
}

function inferCategory(title, description) {
  const searchStr = `${title} ${description}`.toLowerCase();

  if (searchStr.includes('nana patekar') || searchStr.includes('नाना पाटेकर')) {
    return 'Nana Patekar';
  }
  if (searchStr.includes('johnny lever') || searchStr.includes('johny lever') || searchStr.includes('जॉनी लीवर') || searchStr.includes('छोटाछत्री')) {
    return 'Johnny Lever';
  }
  if (searchStr.includes('rajpal yadav') || searchStr.includes('राजपाल यादव') || searchStr.includes('बाबूराव') || searchStr.includes('baburao') || searchStr.includes('paresh rawal') || searchStr.includes('परेश रावल')) {
    return 'Paresh Rawal';
  }
  if (searchStr.includes('govinda') || searchStr.includes('गोविंदा') || searchStr.includes('kader khan') || searchStr.includes('कादर खान')) {
    return 'Govinda';
  }
  if (searchStr.includes('sanjay mishra') || searchStr.includes('संजय मिश्रा') || searchStr.includes('arshad warsi') || searchStr.includes('अरशद वारसी')) {
    return 'Sanjay Mishra';
  }
  return 'Bollywood Comedy';
}

async function main() {
  console.log('=== Shemaroo CSV to JSON Parser ===');
  console.log(`Reading CSV from: ${CSV_PATH}`);

  try {
    if (!fs.existsSync(CSV_PATH)) {
      throw new Error(`CSV file not found at ${CSV_PATH}`);
    }

    const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
    console.log('Parsing CSV content (this might take a few seconds)...');

    const rows = parseCSV(csvContent);
    console.log(`Found ${rows.length} total rows including header.`);

    if (rows.length < 2) {
      throw new Error('CSV is empty or lacks data rows');
    }

    const headers = rows[0];
    console.log('CSV Headers:', headers);

    const channels = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 13) continue; // Skip incomplete lines

      const channelTitle = row[0];
      const channelUrl = row[1];
      const channelId = row[2];
      const position = parseInt(row[3], 10) || i;
      const videoTitle = row[4];
      const videoUrl = row[5];
      const videoId = row[6];
      const publishDate = row[7];
      const duration = row[8];
      const views = parseInt(row[9].replace(/,/g, ''), 10) || 0;
      const description = row[10];
      const thumbnailUrl = row[11];
      const availabilityStatus = row[12];

      // Infer category from title and description
      const category = inferCategory(videoTitle, description);

      // Default placeholder if thumbnail is missing
      const defaultLogo = 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=600&q=80';

      channels.push({
        // MFE Channel Required Fields
        id: videoId || `video-${i}`,
        name: videoTitle || 'Untitled Video',
        url: videoUrl || '',
        logo: thumbnailUrl || defaultLogo,
        category: category,
        country: 'IN',
        language: 'hi',
        description: description || '',

        // Exact CSV Original Fields (with matching naming or types)
        channelTitle,
        channelUrl,
        channelId,
        position,
        videoTitle,
        videoUrl,
        videoId,
        publishDate,
        duration,
        views,
        thumbnailUrl,
        availabilityStatus
      });
    }

    console.log(`Successfully mapped ${channels.length} videos to JSON.`);

    // Ensure output directory exists
    const dir = path.dirname(JSON_OUTPUT_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(JSON_OUTPUT_PATH, JSON.stringify(channels, null, 2), 'utf-8');
    console.log(`Saved output to: ${JSON_OUTPUT_PATH}`);
  } catch (err) {
    console.error('Error parsing CSV:', err);
  }
}

main();
