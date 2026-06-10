const { chromium } = require('playwright');
const { createReview, dedupeReviews, normalizeText, today, writeJson } = require('./review-utils');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  });
  const reviews = [];

  try {
    await page.goto('https://www.yelp.com/biz/polos-electronics-battle-ground', {
      waitUntil: 'domcontentloaded',
      timeout: 45000,
    });
    await page.waitForTimeout(3000);

    const extracted = await page.evaluate(() => {
      const rows = [];
      const jsonLd = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      let jsonLdParseFailures = 0;

      for (const script of jsonLd) {
        try {
          const data = JSON.parse(script.textContent || '{}');
          const reviews = Array.isArray(data.review) ? data.review : [];
          for (const review of reviews) {
            const rating = Number(review?.reviewRating?.ratingValue || 5);
            rows.push({
              author: review?.author?.name || 'Yelp Reviewer',
              text: review?.reviewBody || '',
              rating,
              date: review?.datePublished || new Date().toISOString().slice(0, 10),
            });
          }
        } catch (_) {
          jsonLdParseFailures += 1;
        }
      }

      if (jsonLdParseFailures > 0 && rows.length === 0) {
        console.warn(`Yelp JSON-LD parse failures: ${jsonLdParseFailures}`);
      }

      const domReviews = Array.from(document.querySelectorAll('[data-testid="review"], .review, article'));
      for (const el of domReviews.slice(0, 40)) {
        const text = (el.querySelector('[lang]')?.textContent || el.textContent || '').replace(/\s+/g, ' ').trim();
        if (text.length < 60) continue;
        const author = el.querySelector('a[href*="/user_details"]')?.textContent?.trim() || 'Yelp Reviewer';
        const ratingLabel = el.querySelector('[aria-label*="star rating"]')?.getAttribute('aria-label') || '';
        const ratingMatch = ratingLabel.match(/([0-9]+(?:\.[0-9]+)?)/);
        const rating = ratingMatch ? Math.round(parseFloat(ratingMatch[1])) : 5;
        rows.push({ author, text, rating, date: new Date().toISOString().slice(0, 10) });
      }

      return rows;
    });

    for (const item of extracted) {
      const text = normalizeText(item.text);
      if (text.length > 40 && (item.rating || 0) >= 4) {
        reviews.push(createReview({
          platform: 'yelp',
          idPrefix: 'yelp-scrape',
          author: item.author || 'Yelp Reviewer',
          rating: item.rating || 5,
          text,
          date: item.date || today(),
          index: reviews.length,
        }));
      }
    }
  } catch (error) {
    console.error('Yelp scrape failed:', error.message);
  } finally {
    await browser.close();
  }

  writeJson(dedupeReviews(reviews));
}

main().catch((error) => {
  console.error('Yelp scrape failed:', error.message);
  writeJson([]);
  process.exitCode = 1;
});
