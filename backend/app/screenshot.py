import os
import time
from datetime import datetime
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from PIL import Image


class ScreenshotManager:
    def __init__(self, save_dir="screenshots"):
        """Initialize the screenshot manager with a directory to save screenshots"""
        self.save_dir = save_dir
        Path(save_dir).mkdir(parents=True, exist_ok=True)
        
    def setup_driver(self):
        """Set up a headless Chrome browser for taking screenshots"""
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--window-size=1920,1080")
        
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        return driver
    
    def take_screenshot(self, url, element_id=None, wait_time=5):
        """
        Take a screenshot of a webpage or a specific element
        
        Args:
            url: URL of the webpage to screenshot
            element_id: ID of the element to screenshot (if None, captures full page)
            wait_time: Time to wait for the page to load in seconds
            
        Returns:
            Path to the saved screenshot
        """
        driver = self.setup_driver()
        try:
            driver.get(url)
            time.sleep(wait_time)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"screenshot_{timestamp}.png"
            filepath = os.path.join(self.save_dir, filename)
            
            if element_id:
                element = driver.find_element("id", element_id)
                element.screenshot(filepath)
            else:
                driver.save_screenshot(filepath)
                
            self._optimize_image(filepath)
            
            return filepath
        finally:
            driver.quit()
    
    def _optimize_image(self, filepath):
        """Optimize the image for better quality and smaller size"""
        try:
            img = Image.open(filepath)
            img.save(filepath, optimize=True, quality=85)
        except Exception as e:
            print(f"Error optimizing image: {e}")
