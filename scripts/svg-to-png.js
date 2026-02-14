#!/usr/bin/env node
/**
 * Convert SVG to PNG using Puppeteer and Chrome
 * Usage: node scripts/svg-to-png.js
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SVG_PATH = path.join(__dirname, '../static/images/service-area-map.svg');
const PNG_PATH = path.join(__dirname, '../static/images/service-area-map.png');
const WIDTH = 800;

(async () => {
  // Read SVG content
  const svgContent = fs.readFileSync(SVG_PATH, 'utf8');

  // Create HTML wrapper
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; }
    body { display: flex; }
  </style>
</head>
<body>
  ${svgContent}
</body>
</html>`;

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new'
  });

  const page = await browser.newPage();
  await page.setContent(html);

  // Get SVG dimensions from viewBox
  const dimensions = await page.evaluate(() => {
    const svg = document.querySelector('svg');
    const viewBox = svg.getAttribute('viewBox').split(' ').map(Number);
    return { width: viewBox[2], height: viewBox[3] };
  });

  // Calculate proportional height
  const height = Math.round((WIDTH / dimensions.width) * dimensions.height);

  await page.setViewport({ width: WIDTH, height: height });

  // Take screenshot
  const svg = await page.$('svg');
  await svg.screenshot({
    path: PNG_PATH,
    omitBackground: false
  });

  await browser.close();

  const stats = fs.statSync(PNG_PATH);
  console.log(`PNG created: ${PNG_PATH} (${stats.size} bytes)`);
})();
