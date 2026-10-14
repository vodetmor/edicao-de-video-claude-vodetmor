import P from 'pinterest-mcp-server/pinterest-scraper.js';
import fs from 'fs';
const s = new P(); s.getChromePath = () => process.env.CHROME || '/opt/pw-browsers/chromium';
const out = {};
for (const q of process.argv.slice(2)) { try { out[q] = (await s.search(q, 14, true)).map(r => r.image_url); } catch (e) { out[q] = []; } }
fs.writeFileSync('res.json', JSON.stringify(out, null, 1));
