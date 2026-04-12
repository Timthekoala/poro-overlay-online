/**
 * Run this script locally whenever a new Riftbound set is released:
 *   node fetch-cards.js
 *
 * It fetches all cards from the Riftcodex API and saves them to
 * public/cards.json, which is committed to the repo and served as
 * a static file — no API calls needed at runtime.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

function fetchPage(page) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.riftcodex.com',
            path: `/cards?page=${page}`,
            headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
        };
        https.get(options, (res) => {
            let raw = '';
            res.on('data', chunk => raw += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(raw)); }
                catch (e) { reject(new Error(`Parse error on page ${page}: ${raw.slice(0, 100)}`)); }
            });
        }).on('error', reject);
    });
}

async function main() {
    console.log('Fetching cards from Riftcodex API...');
    const all = [];
    let page = 1, totalPages = 1;

    while (page <= totalPages) {
        process.stdout.write(`  Page ${page}/${totalPages}...\r`);
        const data = await fetchPage(page);
        if (data.items && data.items.length) all.push(...data.items);
        totalPages = data.pages || 1;
        page++;
    }

    const outPath = path.join(__dirname, 'public', 'cards.json');
    fs.writeFileSync(outPath, JSON.stringify(all));
    console.log(`\nDone! ${all.length} cards saved to public/cards.json`);
}

main().catch(e => {
    console.error('Failed:', e.message);
    process.exit(1);
});
