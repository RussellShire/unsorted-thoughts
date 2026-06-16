const fs = require('fs');
const cheerio = require('cheerio');
const { log } = require('console');

const GOOGLE_DOC_ID = process.env.GOOGLE_DOC_ID;
const GOOGLE_DRIVE_UNRESTRICTED_API = process.env.GOOGLE_DRIVE_UNRESTRICTED_API;
const JSON_FILE = './content/data.json';

async function sync() {
  try {
    // 1. Fetch metadata first to check for changes
    const metaUrl = `https://www.googleapis.com/drive/v3/files/${GOOGLE_DOC_ID}?fields=name,modifiedTime,lastModifyingUser&key=${GOOGLE_DRIVE_UNRESTRICTED_API}`;
    const metaRes = await fetch(metaUrl);
    if (!metaRes.ok) throw new Error('Failed to fetch metadata');
    const metadata = await metaRes.json();

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
    const exportUrl = `https://www.googleapis.com/drive/v3/files/${GOOGLE_DOC_ID}/export?mimeType=text/html&key=${GOOGLE_DRIVE_UNRESTRICTED_API}`;
    const contentRes = await fetch(exportUrl);
    const htmlString = await contentRes.text();

    console.log(htmlString);

    const thoughts = parseHtmlStringToArray(htmlString);

    // 5. Construct a structured JSON payload
    const updatedCacheData = {
      metadata: {
        lastModified: metadata.modifiedTime,
      },
      content: thoughts,
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

function parseHtmlStringToArray(htmlString) {
    const $ = cheerio.load(htmlString);
    
    // Remove styles
    $('[style]').removeAttr('style');

    const thoughts = [];
    let publishThought = true;

    // Use cheerio's each to iterate
    $('p').each((index, element) => {
        const paragraph = $(element);
        const text = paragraph.text().replace(/\s+/g, ' ').trim();
        const isNewThought = text.includes('#');

        // Logic for line breaks
        if (!text) {
            paragraph.addClass('lineBreak');
        }

        // Split into thoughts
        if (isNewThought && !text.toLowerCase().includes('no publish')) {
            publishThought = true;
            thoughts.push([]);
        }

        if (isNewThought && text.toLowerCase().includes('no publish')) {
            publishThought = false;
        }

        if (publishThought && !isNewThought) {
            // Note: Saving raw HTML is usually better than saving the paragraph object
            thoughts[thoughts.length - 1].push(paragraph[0].outerHTML);
        }

        // Set title
        if (text.charAt(text.length - 1) === ':') {
            paragraph.addClass('title');
        }
    });

    return thoughts;
}

sync();
