// Google Sheets configuration
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const SHEET_NAME = 'PayTracker';

// Initialize Google Sheets API
function initGoogleSheets() {
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: 'YOUR_API_KEY_HERE',
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    });
}

// Save entry to Google Sheets
async function saveToGoogleSheets(entry) {
    try {
        const values = [
            [
                entry.date,
                entry.hours,
                entry.rateType,
                entry.rate,
                entry.pay,
                new Date().toISOString()
            ]
        ];

        const response = await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:F`,
            valueInputOption: 'RAW',
            resource: {
                values: values
            }
        });

        return response;
    } catch (error) {
        console.error('Error saving to Google Sheets:', error);
        throw error;
    }
}

// Load entries from Google Sheets
async function loadFromGoogleSheets() {
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:F`,
        });

        const rows = response.result.values;
        if (!rows || rows.length < 2) return [];

        // Skip header row
        return rows.slice(1).map(row => ({
            date: row[0],
            hours: parseFloat(row[1]),
            rateType: row[2],
            rate: parseFloat(row[3]),
            pay: parseFloat(row[4])
        }));
    } catch (error) {
        console.error('Error loading from Google Sheets:', error);
        throw error;
    }
}

// Fallback functions for when Google Sheets is not configured
if (typeof gapi === 'undefined') {
    window.saveToGoogleSheets = async function(entry) {
        console.log('Google Sheets not configured, using local storage only');
        return Promise.resolve();
    };
    
    window.loadFromGoogleSheets = async function() {
        console.log('Google Sheets not configured, using local storage only');
        return Promise.resolve([]);
    };
}