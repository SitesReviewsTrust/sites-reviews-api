#!/usr/bin/env node
//
// check.mjs — look up a domain's trust score and top reviews on the
//             Sites.Reviews Public API (https://sites.reviews/api/public/v1).
//
// Usage:
//   node check.mjs <domain>
//   node check.mjs 1ps.ru
//
// No dependencies — Node 18+ (uses the built-in global fetch).
// No API key needed — the API is public and read-only.

const API = 'https://sites.reviews/api/public/v1';

// Send a browser-like User-Agent: bare client UAs can be challenged at the edge.
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
  'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

async function getJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!res.ok && res.status !== 404) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return { status: res.status, body: await res.json() };
}

async function main() {
  const raw = (process.argv[2] || '').trim();
  if (!raw) {
    console.error('Usage: node check.mjs <domain>   e.g. node check.mjs 1ps.ru');
    process.exit(1);
  }
  // Normalize: strip scheme / path, lowercase.
  const domain = raw.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();

  // 1) Quick trust-score check.
  const { body: check } = await getJson(`${API}/check?domain=${encodeURIComponent(domain)}`);

  if (check.found === false) {
    console.log(`"${domain}" is not in the Sites.Reviews catalog yet.`);
    console.log(`Submit it: ${check.submit_url}`);
    return;
  }

  console.log(`Business     : ${check.name}`);
  console.log(`Website      : ${check.website}`);
  console.log(`Trust score  : ${check.trust_score}/10  (${check.avg_ratings}/5 avg)`);
  console.log(`Reviews      : ${check.total_reviews}`);
  console.log(`Verified     : ${check.is_verified ? 'yes' : 'no'}`);
  console.log(`Sites.Reviews: ${check.url}`);

  // 2) Top reviews.
  const { body: reviews } = await getJson(
    `${API}/reviews/${encodeURIComponent(domain)}?per_page=3`,
  );

  console.log('\nTop reviews:');
  for (const r of reviews.reviews || []) {
    console.log(`  [${r.stars}*] ${r.title || '(no title)'}`);
    let text = (r.body_en || r.body || '').trim().replace(/\s+/g, ' ');
    if (text.length > 160) text = text.slice(0, 157) + '...';
    if (text) console.log(`        ${text}`);
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
