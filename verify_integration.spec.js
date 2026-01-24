const { test, expect } = require('@playwright/test');

test.describe('Menu Integration Test', () => {
  test('should navigate to menu.html when menu button is clicked', async ({ page }) => {
    // 1. Открыть главную страницу
    await page.goto('http://localhost:8000/index.html');

    // 2. Найти и кликнуть на кнопку меню
    const menuButton = page.locator('#menu-btn');
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    // 3. Проверить, что произошел переход на menu.html
    await page.waitForURL('**/menu.html');
    expect(page.url()).toContain('menu.html');

    // 4. Проверить, что динамический контент загрузился
    // Ищем "Neon Spritz" именно в карусели популярных товаров.
    const popularCarousel = page.locator('#popular-now-carousel');
    const popularItemName = popularCarousel.locator('h4:has-text("Pizza Margarita")');
    await expect(popularItemName).toBeVisible();

    // 5. Сделать скриншот для визуальной проверки
    await page.waitForTimeout(1000); // Даем время на анимации
    await page.screenshot({ path: 'test-results/dynamic_menu.png', fullPage: true });
  });
});
