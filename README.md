# DJI Sales Dashboard

A real-time dashboard for monitoring DJI product sales across major e-commerce platforms, with automatic screenshot capabilities and DingTalk integration.

## Features

- Real-time display of DJI product sales data from major e-commerce platforms
- Interactive charts and visualizations
- Filtering by platform, product, and time range
- Automatic screenshot functionality
- DingTalk integration for sending screenshots

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Recharts
- **Backend**: FastAPI, Python
- **Integrations**: DingTalk API

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   poetry install
   ```

3. Configure DingTalk credentials in `.env` file:
   ```
   DINGTALK_APP_KEY=your_app_key
   DINGTALK_APP_SECRET=your_app_secret
   DINGTALK_AGENT_ID=your_agent_id
   SCREENSHOT_INTERVAL=3600  # in seconds (default: 1 hour)
   ```

4. Start the backend server:
   ```
   poetry run fastapi dev app/main.py
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure the API URL in `.env` file:
   ```
   VITE_API_URL=http://localhost:8000
   ```

4. Start the frontend development server:
   ```
   npm run dev
   ```

5. Access the dashboard at `http://localhost:5173`

## Usage

1. View sales data across different e-commerce platforms
2. Filter data by platform, product, and time range
3. Configure screenshot settings:
   - Enter DingTalk user IDs (comma-separated)
   - Set the frontend URL
   - Choose between immediate or scheduled screenshots

## Note

This project uses mock data for demonstration purposes. In a production environment, you would replace the mock data with actual web scraping or API integrations with e-commerce platforms.
