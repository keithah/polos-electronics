const { chromium } = require('playwright');
const { createReview, normalizeText, today, writeJson } = require('./review-utils');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const reviews = [];

  try {
    await page.goto('https://www.homeadvisor.com/rated.PolosElectronicsInc.7529229.html', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    await page.waitForSelector('[data-testid="review-card"], .review-card, .pro-review', {
      timeout: 10000,
    }).catch(() => console.error('Review selector not found, page may have different structure'));

    const reviewElements = await page.$$('[data-testid="review-card"], .review-card, .pro-review, .review-item');

    for (const el of reviewElements.slice(0, 10)) {
      try {
        const [author, rating, rawText, date] = await Promise.all([
          el.$eval('[class*="author"], [class*="name"], .reviewer-name', e => e.textContent?.trim()).catch(() => 'HomeAdvisor User'),
          el.$eval('[class*="rating"], [class*="stars"]', e => {
            const stars = e.querySelectorAll('[class*="filled"], .star-filled, [data-filled="true"]').length;
            return stars || parseInt(e.getAttribute('data-rating') || e.textContent?.match(/(\d)/)?.[1] || '5', 10);
          }).catch(() => 5),
          el.$eval('[class*="text"], [class*="content"], .review-text, .review-content', e => e.textContent?.trim()).catch(() => ''),
          el.$eval('[class*="date"], time', e => e.textContent?.trim() || e.getAttribute('datetime')).catch(() => today()),
        ]);
        const parsedRating = parseInt(rating, 10);
        const text = normalizeText(rawText);

        if (text && parsedRating >= 4) {
          reviews.push(createReview({
            platform: 'homeadvisor',
            author,
            rating: parsedRating,
            text,
            date,
            index: reviews.length,
          }));
        }
      } catch (error) {
        console.error('Error extracting HomeAdvisor review:', error.message);
      }
    }
  } catch (error) {
    console.error('HomeAdvisor scrape error:', error.message);
  } finally {
    await browser.close();
  }

  writeJson(reviews);
}

main().catch((error) => {
  console.error('HomeAdvisor scrape failed:', error.message);
  writeJson([]);
  process.exitCode = 1;
});
