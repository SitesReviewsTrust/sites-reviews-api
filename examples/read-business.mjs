#!/usr/bin/env node
// read-business.mjs — read a business's rating & reviews from Sites.Reviews
//
// HOW IT WORKS
//   This demonstrates the schema.org JSON-LD alternative to the JSON API. Every
//   business page at https://sites.reviews/businesses/{domain} embeds JSON-LD; this
//   script fetches that page, finds the Organization block that carries an
//   aggregateRating, and prints the rating, review count and recent reviews.
//
//   For most integrations the live JSON API is simpler — see ../docs/api-reference.md
//   and the check.sh / check.mjs / check.py examples in this folder.
//
// USAGE
//   node examples/read-business.mjs <domain>
//   node examples/read-business.mjs 1ps.ru
//
// No dependencies — Node 18+ (uses the built-in global fetch).

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
  'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

/** Pull every <script type="application/ld+json"> payload out of an HTML string. */
function extractJsonLd(html) {
  const blocks = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      blocks.push(JSON.parse(m[1].trim()));
    } catch {
      /* skip malformed block */
    }
  }
  return blocks;
}

/** Find the Organization node that actually has an aggregateRating. */
function findBusinessNode(blocks) {
  const flat = [];
  for (const b of blocks) {
    if (Array.isArray(b)) flat.push(...b);
    else if (b && Array.isArray(b['@graph'])) flat.push(...b['@graph']);
    else flat.push(b);
  }
  return flat.find((n) => n && n.aggregateRating);
}

async function main() {
  const domain = (process.argv[2] || '').trim().toLowerCase();
  if (!domain) {
    console.error('Usage: node read-business.mjs <domain>   e.g. 1ps.ru');
    process.exit(1);
  }

  const url = `https://sites.reviews/businesses/${encodeURIComponent(domain)}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) {
    console.error(`HTTP ${res.status} for ${url}`);
    process.exit(1);
  }

  const node = findBusinessNode(extractJsonLd(await res.text()));
  if (!node) {
    console.error(`No business / aggregateRating data found for "${domain}".`);
    process.exit(1);
  }

  const agg = node.aggregateRating || {};
  const reviews = Array.isArray(node.review) ? node.review : [];

  console.log(`Business : ${node.name || domain}`);
  console.log(`URL      : ${node.url || url}`);
  console.log(`Rating   : ${agg.ratingValue} / ${agg.bestRating ?? 5}`);
  console.log(`Reviews  : ${agg.reviewCount}`);
  console.log('');
  console.log(`Recent reviews (${reviews.length} shown):`);
  for (const r of reviews) {
    const author = r.author?.name || 'Anonymous';
    const stars = r.reviewRating?.ratingValue ?? '?';
    const date = r.datePublished || '';
    const title = r.name ? ` — ${r.name}` : '';
    console.log(`  • [${stars}★ ${date}] ${author}${title}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
