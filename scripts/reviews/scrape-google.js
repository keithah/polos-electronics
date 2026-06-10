const { chromium } = require('playwright');
const { createReview, dedupeReviews, normalizeText, today, writeJson } = require('./review-utils');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  });
  const reviews = [];

  try {
    const placeId = process.env.GOOGLE_PLACE_ID || '';
    const targets = [
      'https://share.google/D3mexUt7VZzi7gvWZ',
      placeId ? `https://www.google.com/maps/place/?q=place_id:${placeId}` : '',
    ].filter(Boolean);

    for (const targetUrl of targets) {
      try {
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await page.waitForTimeout(2500);

        const extracted = await page.evaluate(() => {
          const out = [];
          const fromDom = Array.from(document.querySelectorAll('[data-review-id], [jslog*="review"], [role="article"]'));
          for (const el of fromDom.slice(0, 30)) {
            const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
            if (text.length < 60) continue;
            const author = el.querySelector('[aria-label*="profile"], .d4r55')?.textContent?.trim() || 'Google Reviewer';
            out.push({ author, text, rating: 5, date: new Date().toISOString().slice(0, 10) });
          }
          return out;
        });

        for (const item of extracted) {
          const text = normalizeText(item.text);
          if (text.length > 60) {
            reviews.push(createReview({
              platform: 'google',
              idPrefix: 'google-scrape',
              author: item.author || 'Google Reviewer',
              rating: item.rating || 5,
              text,
              date: item.date || today(),
              index: reviews.length,
            }));
          }
        }

        if (reviews.length >= 5) break;
      } catch (error) {
        console.error('Google scrape target failed:', targetUrl, error.message);
      }
    }
  } finally {
    await browser.close();
  }

  writeJson(dedupeReviews(reviews));
}

main().catch((error) => {
  console.error('Google scrape failed:', error.message);
  writeJson([]);
  process.exitCode = 1;
});
