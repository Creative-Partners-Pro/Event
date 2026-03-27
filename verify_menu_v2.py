import asyncio
from playwright.async_api import async_playwright
import os

async def verify_menu():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        # Create a context with a mobile viewport
        context = await browser.new_context(
            viewport={'width': 390, 'height': 844},
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
        )
        page = await context.new_page()

        # Go to menu.html. We assume the server is running on 3000
        try:
            await page.goto("http://localhost:3000/menu.html")
        except Exception as e:
            print(f"Failed to connect to server: {e}")
            await browser.close()
            return

        # Wait for items to load
        await page.wait_for_selector(".menu-item")

        # 1. Test Cocktail (Bar item)
        # Click the first menu item (Neon Spritz)
        await page.click(".menu-item:has-text('Neon Spritz')")
        await page.wait_for_selector("#product-modal:not(.hidden)")
        await asyncio.sleep(1) # Wait for transition

        # Take screenshot of cocktail modal
        os.makedirs("verification/screenshots", exist_ok=True)
        await page.screenshot(path="verification/screenshots/cocktail_modal_final.png")

        # Verify labels for Bar item
        strength_label = await page.inner_text("#label-strength")
        strength_val = await page.inner_text("#val-strength")
        print(f"Bar item - Strength label: {strength_label}, Value: {strength_val}")

        # Close modal by clicking overlay (more reliable than the 'X' which might be obscured)
        await page.click("#modal-overlay", position={'x': 10, 'y': 10})
        await page.wait_for_selector("#product-modal.hidden")

        # 2. Test Food item
        # Switch to Food
        await page.click("#food-button")
        await page.wait_for_selector(".menu-item:has-text('Ассорти пхали')")

        # Click a food item
        await page.click(".menu-item:has-text('Ассорти пхали')")
        await page.wait_for_selector("#product-modal:not(.hidden)")
        await asyncio.sleep(1) # Wait for transition

        # Take screenshot of food modal
        await page.screenshot(path="verification/screenshots/food_modal_final.png")

        # Verify labels for Food item
        calories_label = await page.inner_text("#label-strength")
        calories_val = await page.inner_text("#val-strength")
        print(f"Food item - Label: {calories_label}, Value: {calories_val}")

        # Close modal
        await page.click("#modal-overlay", position={'x': 10, 'y': 10})

        # 3. Test Localization (Switch to RU if not default)
        # Assuming we can switch language via localStorage or UI if available
        # The current app seems to default to 'en' unless changed.
        # Let's try to set lang to 'ru' and reload
        await page.evaluate("localStorage.setItem('lang', 'ru')")
        await page.reload()
        await page.wait_for_selector(".menu-item")

        await page.click(".menu-item:has-text('Neon Spritz')")
        await page.wait_for_selector("#product-modal:not(.hidden)")
        await asyncio.sleep(1)

        await page.screenshot(path="verification/screenshots/cocktail_modal_ru_final.png")

        ru_strength_label = await page.inner_text("#label-strength")
        ru_ingredients_label = await page.inner_text("#label-ingredients")
        print(f"RU Bar item - Strength label: {ru_strength_label}, Ingredients label: {ru_ingredients_label}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_menu())
