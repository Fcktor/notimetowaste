const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const OUT_DIR = path.join(__dirname, '../reference/retool');

async function captureRetoolUI() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  console.log('Navegando al login de Retool...');
  await page.goto('https://login.retool.com/auth/login');
  await page.waitForLoadState('networkidle');

  await page.fill('input[name="email"]', process.env.RETOOL_EMAIL);
  await page.fill('input[name="password"]', process.env.RETOOL_PASSWORD);
  await page.click('button[type="submit"]');

  await page.waitForURL(url => !url.toString().includes('/auth/login'), { timeout: 20000 });
  await page.waitForLoadState('networkidle');
  console.log('Login exitoso. URL:', page.url());

  await page.screenshot({ path: path.join(OUT_DIR, '01-dashboard.png'), fullPage: false });
  console.log('Screenshot 01-dashboard.png guardado');

  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT_DIR, '02-full.png'), fullPage: true });
  console.log('Screenshot 02-full.png guardado');

  await browser.close();
  console.log(`\nDone. Screenshots en: ${OUT_DIR}`);
}

captureRetoolUI().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
