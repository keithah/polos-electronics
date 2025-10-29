# Google Analytics Setup

This document explains how to set up Google Analytics 4 (GA4) tracking for the Polos Electronics website.

## Prerequisites

- A Google account
- Access to Google Analytics (https://analytics.google.com/)
- Access to the repository's hugo.toml file

## Step-by-Step Setup

### 1. Create a Google Analytics Property

1. Go to https://analytics.google.com/
2. Sign in with your Google account
3. Click **Admin** (gear icon in the bottom left)
4. In the **Account** column, select or create an account
5. In the **Property** column, click **Create Property**
6. Fill in the property details:
   - **Property name**: Polos Electronics
   - **Reporting time zone**: (GMT-08:00) Pacific Time
   - **Currency**: US Dollar ($)
7. Click **Next**
8. Fill in business details:
   - **Industry category**: Construction & Home Services
   - **Business size**: Small (1-10 employees)
9. Select your business objectives (e.g., "Get baseline reports", "Measure customer engagement")
10. Click **Create**
11. Accept the Terms of Service

### 2. Set Up a Web Data Stream

1. Under **Platform**, select **Web**
2. Enter your website details:
   - **Website URL**: https://poloselectronics.com
   - **Stream name**: Polos Electronics Website
3. Click **Create stream**
4. You'll see your **Measurement ID** (format: `G-XXXXXXXXXX`)
5. **Copy this Measurement ID** - you'll need it next

### 3. Add Measurement ID to Your Website

1. Open `hugo.toml` in your repository
2. Find the line with `google_analytics = ""`
3. Add your Measurement ID between the quotes:
   ```toml
   google_analytics = "G-XXXXXXXXXX"
   ```
4. Save the file
5. Commit and push the changes:
   ```bash
   git add hugo.toml
   git commit -m "Add Google Analytics tracking ID"
   git push
   ```

### 4. Verify Installation

1. Wait 2-3 minutes for the site to deploy
2. Visit https://poloselectronics.com
3. In Google Analytics, go to **Reports** → **Realtime**
4. You should see your visit show up within 30 seconds
5. Check that the page path is showing correctly

## What Gets Tracked

Google Analytics will automatically track:

- **Page views**: Which pages visitors view
- **User sessions**: How long visitors stay on your site
- **Traffic sources**: Where visitors come from (Google, direct, social media, etc.)
- **Device types**: Desktop, mobile, tablet
- **Location**: City, state, country of visitors
- **User behavior**: Scroll depth, clicks, conversions
- **Form submissions**: Contact form interactions

## Recommended Initial Setup

### 1. Set Up Enhanced Measurement (Already Enabled by Default)

These events are tracked automatically:
- ✅ Page views
- ✅ Scrolls (90% page scroll)
- ✅ Outbound clicks
- ✅ Site search
- ✅ Video engagement
- ✅ File downloads

### 2. Set Up Conversions

Mark important events as conversions:

1. In GA4, go to **Admin** → **Events**
2. Wait 24 hours for events to populate
3. Mark these events as conversions:
   - `form_submit` - Contact form submissions
   - `click` (for phone number clicks)
   - `generate_lead`

### 3. Configure Demographics and Interests

1. Go to **Admin** → **Data Settings** → **Data Collection**
2. Enable **Google signals data collection**
3. This adds demographic and interest data to reports

### 4. Link to Google Search Console

1. In GA4, go to **Admin** → **Product Links** → **Search Console Links**
2. Click **Link**
3. Select your Search Console property
4. This shows which Google searches lead to your site

## Important Privacy Considerations

The tracking code respects user privacy:
- No personally identifiable information (PII) is collected
- IP addresses are anonymized
- Complies with GDPR and CCPA
- Users can opt out via browser settings or extensions

### Optional: Add Privacy Policy

Consider adding a privacy policy page that mentions:
- Google Analytics usage
- Cookie usage
- How to opt out
- Contact information for privacy questions

## Monitoring and Reports

### Key Reports to Check Weekly

1. **Acquisition** → **Traffic acquisition**: See where visitors come from
2. **Engagement** → **Pages and screens**: Most popular pages
3. **Engagement** → **Conversions**: Track form submissions
4. **Demographics** → **Overview**: Age, gender, interests
5. **Tech** → **Overview**: Devices, browsers, OS

### Set Up Email Reports

1. Go to any report
2. Click **Share report** (icon at top right)
3. Select **Schedule email**
4. Set up weekly or monthly report delivery

## Troubleshooting

### Not seeing data?

1. Check that `google_analytics` in hugo.toml has the correct ID
2. Verify the site has deployed (check GitHub Actions)
3. Clear your browser cache and visit the site
4. Check Google Analytics **Realtime** view (not historical reports)
5. Make sure you're not using an ad blocker

### Data looks incorrect?

1. Verify the Measurement ID is correct
2. Check for duplicate tracking codes
3. Exclude internal traffic (see below)

### Exclude Internal Traffic

1. In GA4, go to **Admin** → **Data Streams** → Your stream
2. Click **Configure tag settings** → **Show more**
3. Click **Define internal traffic**
4. Add your IP address or IP range
5. Mark as internal traffic

## Support

- **Google Analytics Help**: https://support.google.com/analytics
- **GA4 Documentation**: https://developers.google.com/analytics/devguides/collection/ga4

---

**Last Updated**: October 2025
