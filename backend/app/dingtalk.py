import os
import base64
from typing import Optional, List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Flag to track if DingTalk SDK is available
DINGTALK_AVAILABLE = False

# Try to import DingTalk SDK, but don't fail if it's not available
try:
    from dingtalk import AppClient
    DINGTALK_AVAILABLE = True
except ImportError:
    print("Warning: DingTalk SDK not available. Screenshot sending to DingTalk will be disabled.")
    print("To enable DingTalk integration, install cryptography: poetry add cryptography")


class DingTalkManager:
    def __init__(self):
        """Initialize the DingTalk client with credentials from environment variables"""
        self.app_key = os.getenv("DINGTALK_APP_KEY")
        self.app_secret = os.getenv("DINGTALK_APP_SECRET")
        self.agent_id = os.getenv("DINGTALK_AGENT_ID")
        
        if not all([self.app_key, self.app_secret, self.agent_id]):
            print("Warning: DingTalk credentials not fully configured in .env file")
        
        self.client = None
        if DINGTALK_AVAILABLE and self.app_key and self.app_secret:
            try:
                self.client = AppClient(self.app_key, self.app_secret)
            except Exception as e:
                print(f"Error initializing DingTalk client: {e}")
    
    def send_text_message(self, user_ids: List[str], content: str) -> bool:
        """
        Send a text message to specified users
        
        Args:
            user_ids: List of DingTalk user IDs to send the message to
            content: Text content of the message
            
        Returns:
            Boolean indicating success or failure
        """
        if not DINGTALK_AVAILABLE:
            print("DingTalk SDK not available. Cannot send text message.")
            return False
            
        if not self.client:
            print("DingTalk client not initialized. Check your credentials.")
            return False
        
        try:
            resp = self.client.message.send_to_conversation(
                agent_id=self.agent_id,
                userid_list=",".join(user_ids),
                msg={
                    "msgtype": "text",
                    "text": {"content": content}
                }
            )
            return resp.get("errcode") == 0
        except Exception as e:
            print(f"Error sending text message: {e}")
            return False
    
    def send_image_message(self, user_ids: List[str], image_path: str, title: Optional[str] = None) -> bool:
        """
        Send an image message to specified users
        
        Args:
            user_ids: List of DingTalk user IDs to send the message to
            image_path: Path to the image file
            title: Optional title for the image
            
        Returns:
            Boolean indicating success or failure
        """
        if not DINGTALK_AVAILABLE:
            print("DingTalk SDK not available. Cannot send image message.")
            print(f"Screenshot saved at: {image_path}")
            return False
            
        if not self.client:
            print("DingTalk client not initialized. Check your credentials.")
            print(f"Screenshot saved at: {image_path}")
            return False
        
        try:
            # Read and encode the image
            with open(image_path, "rb") as f:
                image_data = f.read()
            
            # Upload the image to DingTalk media
            media_resp = self.client.media.upload_media("image", image_data)
            if media_resp.get("errcode") != 0:
                print(f"Error uploading media: {media_resp}")
                return False
            
            media_id = media_resp.get("media_id")
            
            # Send the image message
            resp = self.client.message.send_to_conversation(
                agent_id=self.agent_id,
                userid_list=",".join(user_ids),
                msg={
                    "msgtype": "image",
                    "image": {
                        "media_id": media_id
                    }
                }
            )
            
            # If there's a title, send it as a separate text message
            if title and resp.get("errcode") == 0:
                self.send_text_message(user_ids, title)
                
            return resp.get("errcode") == 0
        except Exception as e:
            print(f"Error sending image message: {e}")
            print(f"Screenshot saved at: {image_path}")
            return False
