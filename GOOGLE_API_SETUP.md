# Google Places API Setup for Reviews

This document explains how to set up automated Google Reviews fetching for the Polos Electronics website.

## Overview

The site uses GitHub Actions to automatically fetch reviews from your Google Business Profile once per day and update the website.

## Prerequisites

1. A Google Cloud Platform account
2. Access to your Polos Electronics Google Business Profile
3. GitHub repository access (which you already have)

## Step-by-Step Setup

### 1. Get Your Google Place ID

Your Place ID is already in the system: **Check your Google Business Profile**

To find it yourself:
1. Go to https://developers.google.com/maps/documentation/places/web-service/place-id
2. Use the Place ID Finder tool
3. Search for "Polos Electronics Battle Ground WA"
4. Copy the Place ID (starts with "ChIJ...")

### 2. Create a Google Cloud Project

1. Go to https://console.cloud.google.com/
2. Click "Create Project" or select an existing project
3. Name it "Polos Electronics Website" or similar
4. Click "Create"

### 3. Enable the Places API

1. In your Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Places API"
3. Click "Enable"
4. Wait for it to activate (takes ~30 seconds)

### 4. Create an API Key

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the API key immediately (you'll need it in a moment)
4. Click "Edit API Key" to restrict it (IMPORTANT for security)

### 5. Restrict the API Key (Security)

**Application Restrictions:**
- Select "HTTP referrers (web sites)"
- Add: `https://poloselectronics.com/*`
- Add: `https://*.github.io/*` (for testing)

**API Restrictions:**
- Select "Restrict key"
- Select only: "Places API"
- Click "Save"

### 6. Add Secrets to GitHub

1. Go to your GitHub repository: https://github.com/keithah/polos-electronics
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"

Add two secrets:

**Secret 1: GOOGLE_API_KEY**
- Name: `GOOGLE_API_KEY`
- Value: [Paste your API key from step 4]
- Click "Add secret"

**Secret 2: GOOGLE_PLACE_ID**
- Name: `GOOGLE_PLACE_ID`
- Value: [Your Place ID from step 1]
- Click "Add secret"

### 7. Test the Workflow

1. Go to "Actions" tab in your GitHub repository
2. Click on "Fetch Google Reviews" workflow
3. Click "Run workflow" → "Run workflow"
4. Wait ~30 seconds
5. Check if the workflow completed successfully (green checkmark)

If successful, your reviews will be updated in `data/reviews.json` and automatically deployed to the live site!

## How It Works

1. **GitHub Action** runs daily at midnight UTC
2. Fetches latest reviews from Google Places API
3. Saves reviews to `data/reviews.json`
4. Commits changes to the repository
5. Hugo deployment workflow triggers automatically
6. Site rebuilds with updated reviews

## Monitoring

- **Check workflow runs**: GitHub Actions tab
- **View reviews data**: `data/reviews.json` in repository
- **Manual trigger**: Actions → Fetch Google Reviews → Run workflow

## Troubleshooting

### Reviews not updating?
1. Check GitHub Actions tab for errors
2. Verify API key is valid and not expired
3. Ensure Place ID is correct
4. Check that Places API is enabled in Google Cloud

### API quota exceeded?
- Free tier: 25,000 requests/month
- Daily fetch = ~30 requests/month
- Well within free limits

### Invalid Place ID?
- Use the Place ID Finder tool to get the correct ID
- Make sure it matches your Google Business Profile

## Cost

**Free!**
- Google provides 25,000 Places API requests/month for free
- This workflow uses ~30-60 requests/month
- No credit card required unless you exceed limits

## Support

If you encounter issues:
1. Check GitHub Actions logs for error messages
2. Verify all secrets are set correctly
3. Ensure Google Cloud Project billing is enabled (even for free tier)

---

**Last Updated**: October 2025
