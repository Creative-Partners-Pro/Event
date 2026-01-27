from playwright.sync_api import sync_playwright, expect
import os

def run(playwright):
    browser = playwright.chromium.launch()
    context = browser.new_context()
    page = context.new_page()

    try:
        # Verify index.html
        page.goto("http://localhost:8000/index.html")

        # Check for the new button
        next_event_button = page.locator('a[href="event2.html"]')
        expect(next_event_button).to_be_visible()
        expect(next_event_button).to_have_text("Следующее мероприятие")

        # Take a screenshot of index.html
        index_screenshot_path = "/home/jules/verification/index_with_button.png"
        page.screenshot(path=index_screenshot_path)
        print(f"Screenshot of index.html saved to {index_screenshot_path}")

        # Click the button and go to event2.html
        next_event_button.click()
        page.wait_for_url("http://localhost:8000/event2.html")

        # Verify event2.html
        expect(page).to_have_title("Следующее Мероприятие - Drunk Owl")

        # Take a screenshot of event2.html
        event2_screenshot_path = "/home/jules/verification/event2_page.png"
        page.screenshot(path=event2_screenshot_path)
        print(f"Screenshot of event2.html saved to {event2_screenshot_path}")

    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
