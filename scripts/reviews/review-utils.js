function today() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function createReview({ platform, idPrefix, author, rating, text, date, index }) {
  return {
    id: `${idPrefix || platform}-${Date.now()}-${index}`,
    platform,
    author,
    rating,
    text,
    date,
    relativeTime: date,
  };
}

function dedupeReviews(reviews) {
  const seen = new Set();
  return reviews.filter((review) => {
    const key = `${review.author}|${review.text}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function writeJson(value) {
  process.stdout.write(`${JSON.stringify(value)}\n`);
}

module.exports = {
  createReview,
  dedupeReviews,
  normalizeText,
  today,
  writeJson,
};
