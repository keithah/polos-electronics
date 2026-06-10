const { chromium } = require('playwright');
const { createReview, normalizeText, today, writeJson } = require('./review-utils');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const reviews = [];

  try {
    await page.goto('https://nextdoor.com/pages/polos-electronics-battle-ground-wa/', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    await page.waitForTimeout(3000);

    const reviewElements = await page.$$('[class*="recommendation"], [class*="review"], [class*="testimonial"]');

    for (const el of reviewElements.slice(0, 10)) {
      try {
        const [author, rawText, date] = await Promise.all([
          el.$eval('[class*="author"], [class*="name"]', e => e.textContent?.trim()).catch(() => 'Neighbor'),
          el.$eval('[class*="text"], [class*="content"], [class*="body"]', e => e.textContent?.trim()).catch(() => ''),
          el.$eval('[class*="date"], time', e => e.textContent?.trim() || e.getAttribute('datetime')).catch(() => today()),
        ]);
        const text = normalizeText(rawText);

        if (text) {
          reviews.push(createReview({
            platform: 'nextdoor',
            author,
            rating: null,
            text,
            date,
            index: reviews.length,
          }));
        }
      } catch (error) {
        console.error('Error extracting Nextdoor review:', error.message);
      }
    }
  } catch (error) {
    console.error('Nextdoor scrape error:', error.message);
  } finally {
    await browser.close();
  }

  writeJson(reviews);
}

main().catch((error) => {
  console.error('Nextdoor scrape failed:', error.message);
  writeJson([]);
  process.exitCode = 1;
});
