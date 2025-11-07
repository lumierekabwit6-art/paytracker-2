const CONFIG = {
    SPREADSHEET_ID: '1yp9iX28R9FypmAEH4YEOoLRAtu-9kLy9ZrO0mayW6rI',
    API_KEY: 'AIzaSyBX96y-wl7md2ivc-nDzZnpWK5mW-G19ic', // Replace with your Google API Key
    SHEET_NAME: 'PayTracker'
};

if (!CONFIG.SPREADSHEET_ID || CONFIG.SPREADSHEET_ID.includes('YOUR_')) {
    console.warn('Google Sheets not configured. Using local storage only.');
}