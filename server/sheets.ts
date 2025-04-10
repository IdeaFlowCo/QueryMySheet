import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import fetch from 'node-fetch';

// Parse CSV string to JSON
export function parseCSV(csvString: string) {
  return new Promise((resolve, reject) => {
    Papa.parse(csvString, {
      header: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

// Convert spreadsheet data to CSV
export function convertToCSV(data: any[]) {
  return Papa.unparse(data);
}

// Fetch Google Sheet
export async function fetchGoogleSheet(url: string): Promise<string> {
  try {
    // Extract the sheet ID from the URL
    let sheetId;
    
    if (url.includes('/spreadsheets/d/')) {
      // Format: https://docs.google.com/spreadsheets/d/SHEET_ID/...
      const parts = url.split('/spreadsheets/d/');
      if (parts.length > 1) {
        sheetId = parts[1].split('/')[0];
      }
    } else if (url.includes('docs.google.com/spreadsheet')) {
      // Other possible formats
      const urlObj = new URL(url);
      sheetId = urlObj.searchParams.get('spreadsheetId') || 
                urlObj.pathname.split('/').filter(Boolean)[1];
    }
    
    if (!sheetId) {
      throw new Error('Invalid Google Sheets URL. Unable to extract sheet ID.');
    }
    
    // Construct the export URL (public sheets only)
    const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    
    // Fetch the CSV data
    const response = await fetch(exportUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Google Sheet. Make sure the sheet is public or shared.`);
    }
    
    return await response.text();
  } catch (error) {
    console.error('Error fetching Google Sheet:', error);
    throw new Error(`Failed to fetch Google Sheet: ${error.message}`);
  }
}

// Parse uploaded file
export async function parseUploadedFile(file: Express.Multer.File): Promise<string> {
  try {
    const fileData = file.buffer;
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'csv') {
      // Parse CSV file
      return fileData.toString('utf-8');
    } else if (['xlsx', 'xls', 'ods'].includes(fileExtension)) {
      // Parse Excel file
      const workbook = XLSX.read(fileData);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      return convertToCSV(jsonData);
    } else {
      throw new Error('Unsupported file format. Please upload a CSV or Excel file.');
    }
  } catch (error) {
    console.error('Error parsing uploaded file:', error);
    throw new Error(`Failed to parse file: ${error.message}`);
  }
}
