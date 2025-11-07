# paytracker-2

A web application to track work hours and calculate pay, with Google Sheets integration.

## Features

- Track work hours and pay
- Support for both hourly and daily rates
- Automatic pay calculation
- Monthly filtering and statistics
- Interactive charts
- Google Sheets integration
- Responsive design

## Setup Instructions

### 1. Google Sheets Setup

1. Create a new Google Sheet
2. Name the first sheet "PayTracker"
3. Add these headers in row 1:
   - Date | Hours | Rate Type | Rate | Pay | Timestamp

### 2. Google Sheets API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Sheets API
4. Create credentials (API key)
5. Share your Google Sheet with the service account email

### 3. Configuration

1. Replace in `google-sheets.js`:
   - `YOUR_SPREADSHEET_ID_HERE` with your Google Sheet ID
   - `YOUR_API_KEY_HERE` with your Google API key

### 4. Deployment

You can deploy this on:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting service

## Usage

1. Open `index.html` in a web browser
2. Fill in the work entry form
3. View statistics and charts
4. Filter by month using the dropdown

## File Structure

- `index.html` - Main HTML file
- `style.css` - Styling
- `script.js` - Main application logic
- `google-sheets.js` - Google Sheets integration
- `README.md` - This file

## Browser Compatibility

Works in all modern browsers that support:
- ES6+ JavaScript
- CSS Grid
- Local Storage
- Google Sheets API
