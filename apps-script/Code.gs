/**
 * Publishes only the rows you tick as "Show on portfolio" as JSON.
 * Private columns are never returned.
 * Deploy: Deploy > New deployment > Web app > Execute as: Me > Access: Anyone.
 */
var SHEET_NAME = 'Portfolio Data';
var SHOW_COLUMN = 'Show on portfolio';
var ORDER_COLUMN = 'Order';
// Private notes and internal ranking columns are never published.
var PRIVATE_COLUMNS = ['Numbers still to add', 'Why it attracts recruiters', 'Recruiter appeal', 'Impact type', SHOW_COLUMN];

function doGet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    return json_({ error: 'Sheet not found: ' + SHEET_NAME });
  }
  var values = sheet.getDataRange().getValues();
  var headers = values.shift().map(function (h) { return String(h).trim(); });
  var showIndex = headers.indexOf(SHOW_COLUMN);
  if (showIndex === -1) {
    return json_({ error: 'Missing column: ' + SHOW_COLUMN });
  }

  var rows = values
    // Works whether the column is a checkbox or the text TRUE.
    .filter(function (row) { return row[showIndex] === true || String(row[showIndex]).trim().toUpperCase() === 'TRUE'; })
    .map(function (row) {
      var item = {};
      headers.forEach(function (header, i) {
        if (header && PRIVATE_COLUMNS.indexOf(header) === -1) {
          item[header] = row[i];
        }
      });
      return item;
    });

  var orderIndex = headers.indexOf(ORDER_COLUMN);
  if (orderIndex !== -1) {
    rows.sort(function (a, b) {
      var x = Number(a[ORDER_COLUMN]) || 9999;
      var y = Number(b[ORDER_COLUMN]) || 9999;
      return x - y;
    });
  }

  return json_({ updated: new Date().toISOString(), items: rows });
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
