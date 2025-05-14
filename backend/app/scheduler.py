import os
import time
import threading
from datetime import datetime
from dotenv import load_dotenv
from apscheduler.schedulers.background import BackgroundScheduler
from app.screenshot import ScreenshotManager
from app.dingtalk import DingTalkManager

load_dotenv()

SCREENSHOT_INTERVAL = int(os.getenv("SCREENSHOT_INTERVAL", 3600))


class SchedulerManager:
    def __init__(self):
        """Initialize the scheduler manager"""
        self.scheduler = BackgroundScheduler()
        self.screenshot_manager = ScreenshotManager()
        self.dingtalk_manager = DingTalkManager()
        self.frontend_url = None
        self.user_ids = []
        
    def set_frontend_url(self, url):
        """Set the frontend URL to screenshot"""
        self.frontend_url = url
        
    def set_user_ids(self, user_ids):
        """Set the DingTalk user IDs to send screenshots to"""
        self.user_ids = user_ids
        
    def take_and_send_screenshot(self):
        """Take a screenshot of the dashboard and send it via DingTalk"""
        if not self.frontend_url:
            print("Frontend URL not set. Cannot take screenshot.")
            return
            
        try:
            print(f"Taking screenshot of {self.frontend_url}")
            screenshot_path = self.screenshot_manager.take_screenshot(
                self.frontend_url, 
                element_id="dashboard-container",  # ID of the dashboard container in frontend
                wait_time=10  # Wait 10 seconds for charts to load
            )
            
            if self.user_ids:
                timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                title = f"DJI Sales Dashboard Screenshot ({timestamp})"
                success = self.dingtalk_manager.send_image_message(
                    self.user_ids, 
                    screenshot_path, 
                    title
                )
                if success:
                    print(f"Successfully sent screenshot to DingTalk users: {self.user_ids}")
                else:
                    print("Failed to send screenshot to DingTalk")
            else:
                print("No DingTalk user IDs set. Screenshot taken but not sent.")
                
        except Exception as e:
            print(f"Error taking or sending screenshot: {e}")
            
    def start(self):
        """Start the scheduler"""
        if not self.scheduler.running:
            self.scheduler.add_job(
                self.take_and_send_screenshot,
                'interval',
                seconds=SCREENSHOT_INTERVAL,
                id='screenshot_job'
            )
            self.scheduler.start()
            print(f"Scheduler started. Taking screenshots every {SCREENSHOT_INTERVAL} seconds.")
            
    def stop(self):
        """Stop the scheduler"""
        if self.scheduler.running:
            self.scheduler.shutdown()
            print("Scheduler stopped.")
            
    def take_screenshot_now(self):
        """Manually trigger a screenshot"""
        self.take_and_send_screenshot()
        return True


scheduler_instance = SchedulerManager()
