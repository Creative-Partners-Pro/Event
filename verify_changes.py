
from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Create verification directory if it doesn't exist
        os.makedirs("/home/jules/verification", exist_ok=True)

        # Navigate to index.html and take a screenshot
        page.goto("http://localhost:8000/index.html")
        page.screenshot(path="/home/jules/verification/index_with_button.png")

        # Click the new button and wait for navigation
        page.click('a[href="event2.html"]')
        page.wait_for_url("http://localhost:8000/event2.html")

        # Take a screenshot of the event page
        page.screenshot(path="/home/jules/verification/event2_page.png")

        browser.close()

if __name__ == "__main__":
    run()
