const fs = require('fs');
const path = require('path');

// Target file to save active channels
const OUTPUT_PATH = path.join(__dirname, '..', 'packages', 'shared-utils', 'src', 'active-channels.json');

// Concurrency limit for stream checks
const CONCURRENCY = 20;
// Test limit (first N channels to test from database)
const TEST_LIMIT = 3000;
// Request timeout in milliseconds
const TIMEOUT_MS = 10000;

async function checkStream(url) {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    clearTimeout(id);
    return response.ok;
  } catch (err) {
    return false;
  }
}

async function main() {
  console.log('=== IPTV Stream Verifier ===');
  console.log(`Fetching streams from IPTV-org...`);

  try {
    const streamsRes = await fetch('https://iptv-org.github.io/api/streams.json');
    if (!streamsRes.ok) throw new Error('Failed to fetch streams');
    const streams = await streamsRes.json();

    // Filter streams that have valid channels
    const candidateStreams = streams
      .filter(s => s.channel && s.url && s.url.startsWith('http'))
    // .slice(0, TEST_LIMIT);

    console.log(`Found ${streams.length} total streams. Testing the first ${candidateStreams.length} candidates...`);

    const activeChannels = [];
    let processedCount = 0;

    const saveProgress = (channelsList) => {
      const finalActiveList = Array.from(new Set(channelsList));
      const dir = path.dirname(OUTPUT_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(finalActiveList, null, 2));
    };

    // Process in chunks of CONCURRENCY
    for (let i = 0; i < candidateStreams.length; i += CONCURRENCY) {
      const chunk = candidateStreams.slice(i, i + CONCURRENCY);

      const results = await Promise.all(
        chunk.map(async (s) => {
          const ok = await checkStream(s.url);
          processedCount++;
          if (processedCount % 20 === 0 || processedCount === candidateStreams.length) {
            console.log(`Progress: ${processedCount}/${candidateStreams.length} tested...`);
          }
          return { channelId: s.channel, ok };
        })
      );

      results.forEach(res => {
        if (res.ok) {
          activeChannels.push(res.channelId);
        }
      });

      // Auto-save progress after every 500 streams checked
      if (processedCount % 500 === 0) {
        console.log(`\nAuto-saving progress after ${processedCount} streams...`);
        saveProgress(activeChannels);
      }
    }

    console.log(`\nVerification complete!`);
    console.log(`Active channels found: ${activeChannels.length} out of ${candidateStreams.length} tested.`);

    saveProgress(activeChannels);
    console.log(`Saved active channel list to: ${OUTPUT_PATH}\n`);
  } catch (err) {
    console.error('Error verifying streams:', err);
  }
}

main();
