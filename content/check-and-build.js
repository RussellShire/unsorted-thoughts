const fs = require('fs');

const GOOGLE_DOC_ID = process.env.GOOGLE_DOC_ID;
const GOOGLE_DRIVE_UNRESTRICTED_API = process.env.GOOGLE_DRIVE_UNRESTRICTED_API;
const JSON_FILE = './content/data.json';

async function sync() {
  try {

    const metaUrl = `https://www.googleapis.com/drive/v3/files/${GOOGLE_DOC_ID}?fields=modifiedTime,name,lastModifyingUser&key=${GOOGLE_DRIVE_API_KEY}`;
    const metaRes = await fetch(metaUrl);

    if (!metaRes.ok) {
        const errorData = await metaRes.text(); // Capture the detailed error message
        console.error(`Google API request failed! Status: ${metaRes.status}`);
        console.error(`Response details: ${errorData}`);
        throw new Error('Failed to fetch metadata');
    }
    // // 1. Fetch metadata first to check for changes
    // const metaUrl = `https://www.googleapis.com/drive/v3/files/${GOOGLE_DOC_ID}?fields=name,modifiedTime,lastModifyingUser&key=${GOOGLE_DRIVE_API_KEY}`;
    // const metaRes = await fetch(metaUrl);
    // if (!metaRes.ok) throw new Error('Failed to fetch metadata');
    // const metadata = await metaRes.json();

    // 2. Read existing local JSON cache if it exists
    let localCache = null;
    if (fs.existsSync(JSON_FILE)) {
      localCache = JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8'));
    }

    // 3. Compare timestamps. If they match, abort to save GitHub Actions runner minutes!
    if (localCache && localCache.metadata.modifiedTime === metadata.modifiedTime) {
      console.log('No changes detected in Google Doc. Skipping update.');
      return;
    }

    // 4. If timestamps differ, grab the content
    console.log('New changes detected! Fetching fresh content...');
    const exportUrl = `https://www.googleapis.com/drive/v3/files/${GOOGLE_DOC_ID}/export?mimeType=text/plain&key=${GOOGLE_DRIVE_API_KEY}`;
    const contentRes = await fetch(exportUrl);
    const textContent = await contentRes.text();

    // 5. Construct a structured JSON payload
    const updatedCacheData = {
      metadata: {
        lastModified: metadata.modifiedTime,
      },
      content: textContent,
      lastSyncedAt: new Date().toISOString()
    };

    // 6. Write the JSON file to disk (prettified with 2 spaces for readability in your repo)
    fs.writeFileSync(JSON_FILE, JSON.stringify(updatedCacheData, null, 2), 'utf-8');
    console.log('JSON cache successfully updated.');

  } catch (error) {
    console.error('Error syncing document:', error);
    process.exit(1);
  }
}

sync();
