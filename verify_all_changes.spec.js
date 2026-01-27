// verify_all_changes.spec.js
const { test, expect, chromium } = require('@playwright/test');
const path = require('path');

async function runVerification() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the menu page.
    await page.goto('http://localhost:8000/menu.html');
    await page.waitForSelector('#reviews-modal-trigger');

    // --- VERIFY MODAL ---
    await page.locator('#reviews-modal-trigger').click();
    const reviewsModal = page.locator('#reviews-modal');
    await expect(reviewsModal).toBeVisible();
    await page.locator('.rating-owl[data-value="4"]').click();
    await page.locator('.tip-button[data-tip="3"]').click();

    // Screenshot 1: Modal window
    const modalScreenshotPath = path.join('/home/jules/verification', 'modal_verification.png');
    await page.screenshot({ path: modalScreenshotPath, fullPage: true });
    console.log(`Screenshot saved to ${modalScreenshotPath}`);

    await page.locator('#reviews-modal-close-button').click();
    await expect(reviewsModal).toBeHidden();

    // --- VERIFY FOOD MENU ---
    await page.locator('#food-button').click();
    await page.waitForSelector('#categories-grid .category-tile[data-category="SOUPS"]', { timeout: 5000 });
    const soupsCategoryTile = page.locator('.category-tile[data-category="SOUPS"]');
    await soupsCategoryTile.click();
    await page.waitForSelector('#selected-category-grid .menu-item');

    // Screenshot 2: Food menu with soups
    const menuScreenshotPath = path.join('/home/jules/verification', 'menu_verification.png');
    await page.screenshot({ path: menuScreenshotPath, fullPage: true });
    console.log(`Screenshot saved to ${menuScreenshotPath}`);


  } finally {
    await browser.close();
  }
}

runVerification();
