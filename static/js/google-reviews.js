/**
 * Google Places API Reviews Integration
 * Fetches real reviews from Google Business Profile
 */

class GoogleReviews {
    constructor(config) {
        this.apiKey = config.apiKey;
        this.placeId = config.placeId;
        this.maxReviews = config.maxReviews || 3;
        this.cacheKey = 'polos_google_reviews';
        this.cacheTime = 24 * 60 * 60 * 1000; // 24 hours
    }

    /**
     * Fetch reviews from Google Places API
     */
    async fetchReviews() {
        // Check cache first
        const cached = this.getCache();
        if (cached) {
            console.log('Using cached reviews');
            return cached;
        }

        try {
            const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${this.placeId}&fields=name,rating,reviews,user_ratings_total&key=${this.apiKey}`;

            // Note: Direct CORS requests to Google Places API won't work from browser
            // Using a proxy approach
            const response = await fetch(`https://cors-anywhere.herokuapp.com/${url}`);

            if (!response.ok) {
                throw new Error('Failed to fetch reviews');
            }

            const data = await response.json();

            if (data.status === 'OK' && data.result.reviews) {
                const reviews = data.result.reviews.slice(0, this.maxReviews);
                this.setCache(reviews);
                return reviews;
            } else {
                throw new Error('No reviews found');
            }
        } catch (error) {
            console.error('Error fetching Google reviews:', error);
            return null;
        }
    }

    /**
     * Get reviews from localStorage cache
     */
    getCache() {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            if (!cached) return null;

            const { reviews, timestamp } = JSON.parse(cached);
            const now = new Date().getTime();

            // Check if cache is still valid
            if (now - timestamp < this.cacheTime) {
                return reviews;
            }

            // Cache expired
            localStorage.removeItem(this.cacheKey);
            return null;
        } catch (error) {
            console.error('Error reading cache:', error);
            return null;
        }
    }

    /**
     * Save reviews to localStorage cache
     */
    setCache(reviews) {
        try {
            const cacheData = {
                reviews: reviews,
                timestamp: new Date().getTime()
            };
            localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
        } catch (error) {
            console.error('Error setting cache:', error);
        }
    }

    /**
     * Render stars as HTML
     */
    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';

        for (let i = 0; i < fullStars; i++) {
            stars += '★';
        }
        if (hasHalfStar) {
            stars += '½';
        }
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '☆';
        }

        return stars;
    }

    /**
     * Format time ago
     */
    timeAgo(timestamp) {
        const seconds = Math.floor((new Date().getTime() / 1000) - timestamp);

        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };

        for (const [key, value] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / value);
            if (interval >= 1) {
                return `${interval} ${key}${interval !== 1 ? 's' : ''} ago`;
            }
        }

        return 'just now';
    }

    /**
     * Render reviews to the page
     */
    renderReviews(reviews, containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Reviews container not found');
            return;
        }

        if (!reviews || reviews.length === 0) {
            console.log('No reviews to display, showing fallback');
            return; // Keep manual reviews as fallback
        }

        // Clear existing content
        container.innerHTML = '';

        reviews.forEach(review => {
            const reviewCard = document.createElement('div');
            reviewCard.className = 'review-card';

            const stars = this.renderStars(review.rating);
            const timeAgo = this.timeAgo(review.time);
            const text = review.text.length > 200
                ? review.text.substring(0, 200) + '...'
                : review.text;

            reviewCard.innerHTML = `
                <div class="review-stars">${stars}</div>
                <p class="review-text">"${text}"</p>
                <p class="review-author">- ${review.author_name}</p>
                <p class="review-time">${timeAgo}</p>
            `;

            container.appendChild(reviewCard);
        });
    }

    /**
     * Initialize and load reviews
     */
    async init(containerId) {
        const reviews = await this.fetchReviews();
        this.renderReviews(reviews, containerId);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Configuration will be set via inline script in HTML
    if (window.GOOGLE_REVIEWS_CONFIG) {
        const reviewsWidget = new GoogleReviews(window.GOOGLE_REVIEWS_CONFIG);
        reviewsWidget.init('google-reviews-container');
    }
});
