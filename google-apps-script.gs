/**
 * RBRYP Group — Form submissions → Google Sheet
 *
 * SETUP:
 * 1. Create a new Google Sheet (sheets.new). Name it e.g. "RBRYP Website Submissions".
 * 2. Extensions → Apps Script. Delete any starter code, paste this whole file in.
 * 3. Click Deploy → New deployment.
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Click Deploy, authorize the permissions it asks for (it's your own script/sheet).
 * 5. Copy the "Web app URL" it gives you (ends in /exec).
 * 6. Paste that URL into js/main.js where it says GOOGLE_SHEET_WEBHOOK_URL.
 *
 * If you ever edit this file after deploying, you must redeploy for the change
 * to take effect: Deploy → Manage deployments → pencil icon → Version: New
 * version → Deploy. Just saving the file does NOT update the live URL.
 *
 * Submissions are routed to different tabs in the same spreadsheet depending
 * on which form was submitted:
 *   - contactForm  → "Contact" tab
 *   - careerForm   → "Careers" tab
 *   - partnerForm  → "Investors" tab
 *   - bpForm (every brand page's enquiry form) → "Enquiries" tab
 * Each tab is created automatically the first time a submission for it comes
 * in, and columns are created automatically the first time a new field name
 * is seen, so nothing needs to be pre-configured.
 */

var SHEET_NAMES = {
  contactForm: 'Contact',
  careerForm: 'Careers',
  partnerForm: 'Investors',
  bpForm: 'Enquiries',
};

function doPost(e) {
  var params = e.parameter || {};

  var business = params['_business'] || '';
  var formType = params['_formType'] || '';
  var pageUrl = params['_pageUrl'] || '';

  var sheetName = SHEET_NAMES[formType] || 'Enquiries';
  var sheet = getOrCreateSheet(sheetName);

  var fixedCols = ['Timestamp', 'Business', 'Form Type', 'Page URL'];
  var incomingKeys = Object.keys(params).filter(function (k) {
    return k.indexOf('_') !== 0; // skip our internal _business/_formType/_pageUrl keys
  });

  var headerRange = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1));
  var headers = sheet.getLastColumn() > 0 ? headerRange.getValues()[0] : [];

  if (headers.length === 0) {
    headers = fixedCols.slice();
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }

  // Add any new field columns we haven't seen before.
  incomingKeys.forEach(function (key) {
    if (headers.indexOf(key) === -1) {
      headers.push(key);
      sheet.getRange(1, headers.length).setValue(key).setFontWeight('bold');
    }
  });

  var row = headers.map(function (col) {
    if (col === 'Timestamp') return new Date();
    if (col === 'Business') return business;
    if (col === 'Form Type') return formType;
    if (col === 'Page URL') return pageUrl;
    return params[col] != null ? params[col] : '';
  });

  sheet.appendRow(row);

  return ContentService.createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}
