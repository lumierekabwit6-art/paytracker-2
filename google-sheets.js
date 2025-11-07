// Updated google-sheets.js with better error handling
const SPREADSHEET_ID = '1yp9iX28R9FypmAEH4YEOoLRAtu-9kLy9ZrO0mayW6rI';
const API_KEY = 'AIzaSyBX96y-wl7md2ivc-nDzZnpWK5mW-G19ic';
const SHEET_NAME = 'PayTracker';

// Load Google API client
let gapiLoaded = false;

function loadGAPI() {
    return new Promise((resolve, reject) => {
        if (typeof gapi === 'undefined') {
            reject(new Error('Google API not loaded'));
            return;
        }

        gapi.load('client', () => {
            gapi.client.init({
                apiKey: API_KEY,
                discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
            }).then(() => {
                gapiLoaded = true;
                resolve();
            }).catch(reject);
        });
    });
}

// Initialize when document loads
document.addEventListener('DOMContentLoaded', function() {
    loadGAPI().catch(error => {
        console.warn('Google Sheets API not available:', error.message);
    });
});

// Save entry to Google Sheets
async function saveToGoogleSheets(entry) {
    if (!gapiLoaded) {
        throw new Error('Google API not initialized');
    }

    try {
        const timestamp = new Date().toISOString();
        const values = [
            [
                entry.date,
                entry.hours.toString(),
                entry.rateType,
                entry.rate.toString(),
                entry.pay.toString(),
                timestamp
            ]
        ];

        const response = await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:F`,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: values
            }
        });

        console.log('Entry saved to Google Sheets:', response);
        return response;

    } catch (error) {
        console.error('Error saving to Google Sheets:', error);
        throw new Error(`Failed to save to Google Sheets: ${error.message}`);
    }
}

// Load entries from Google Sheets
async function loadFromGoogleSheets() {
    if (!gapiLoaded) {
        throw new Error('Google API not initialized');
    }

    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:F`,
        });

        const rows = response.result.values;
        
        if (!rows || rows.length <= 1) {
            return []; // No data or only headers
        }

        // Convert rows to entries (skip header row)
        return rows.slice(1).map((row, index) => {
            try {
                return {
                    id: index,
                    date: row[0] || '',
                    hours: parseFloat(row[1]) || 0,
                    rateType: row[2] || 'hourly',
                    rate: parseFloat(row[3]) || 0,
                    pay: parseFloat(row[4]) || 0,
                    timestamp: row[5] || ''
                };
            } catch (parseError) {
                console.warn('Error parsing row:', row, parseError);
                return null;
            }
        }).filter(entry => entry !== null);

    } catch (error) {
        console.error('Error loading from Google Sheets:', error);
        throw new Error(`Failed to load from Google Sheets: ${error.message}`);
    }
}

// Test connection
async function testGoogleSheetsConnection() {
    try {
        await loadGAPI();
        console.log('Google Sheets API connected successfully');
        return true;
    } catch (error) {
        console.warn('Google Sheets connection failed:', error);
        return false;
    }
}

// Enhanced fallback functions
window.saveToGoogleSheets = async function(entry) {
    try {
        return await saveToGoogleSheets(entry);
    } catch (error) {
        console.warn('Google Sheets save failed, using local storage only:', error.message);
        // The main app will handle local storage fallback
        throw error; // Re-throw so main app knows it failed
    }
};

window.loadFromGoogleSheets = async function() {
    try {
        return await loadFromGoogleSheets();
    } catch (error) {
        console.warn('Google Sheets load failed, using local storage:', error.message);
        return []; // Return empty array to trigger local storage fallback
    }
};

