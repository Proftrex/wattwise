/*******************************************************
 * HOUSEHOLD ELECTRICITY TRACKER
 * utils.gs
 *
 * Shared helper functions used by the other modules.
 *******************************************************/

/**
 * Generates a unique ID.
 *
 * Example:
 * generateId('APP')
 * → APP-20260808084530-123
 */

function generateId(prefix) {

  const now = new Date();

  const timestamp = Utilities.formatDate(
    now,
    Session.getScriptTimeZone(),
    'yyyyMMddHHmmss'
  );

  const randomNumber = Math.floor(
    100 + Math.random() * 900
  );

  return prefix + '-' + timestamp + '-' + randomNumber;
}


/**
 * Returns the current date/time.
 */
function getNow() {
  return new Date();
}


/**
 * Converts a value into a number safely.
 *
 * Empty or invalid values return 0.
 */
function toNumber(value) {

  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return 0;
  }

  const number = Number(value);

  return isNaN(number) ? 0 : number;
}


/**
 * Converts a value into a positive number.
 *
 * Negative values return 0.
 */
function toPositiveNumber(value) {

  const number = toNumber(value);

  return number < 0 ? 0 : number;
}


/**
 * Rounds a number to a specified number of decimal places.
 */
function roundNumber(value, decimals) {

  const number = toNumber(value);

  const places =
    decimals === undefined
      ? 2
      : decimals;

  const multiplier = Math.pow(10, places);

  return Math.round(
    number * multiplier
  ) / multiplier;
}


/**
 * Formats a number as Philippine Peso.
 *
 * Example:
 * formatPHP(1234.5)
 * → ₱1,234.50
 */
function formatPHP(value) {

  const number = toNumber(value);

  return '₱' + number.toLocaleString(
    'en-PH',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  );
}


/**
 * Formats a number with commas.
 */
function formatNumber(value, decimals) {

  const number = toNumber(value);

  return number.toLocaleString(
    'en-PH',
    {
      minimumFractionDigits:
        decimals === undefined ? 0 : decimals,

      maximumFractionDigits:
        decimals === undefined ? 2 : decimals
    }
  );
}


/**
 * Returns today's date as YYYY-MM-DD.
 */
function getTodayString() {

  return Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    'yyyy-MM-dd'
  );
}


/**
 * Returns the current month as YYYY-MM.
 */
function getCurrentMonth() {

  return Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    'yyyy-MM'
  );
}


/**
 * Converts a date into YYYY-MM.
 */
function formatMonth(date) {

  if (!date) {
    return getCurrentMonth();
  }

  const parsedDate =
    date instanceof Date
      ? date
      : new Date(date);

  if (isNaN(parsedDate.getTime())) {
    return getCurrentMonth();
  }

  return Utilities.formatDate(
    parsedDate,
    Session.getScriptTimeZone(),
    'yyyy-MM'
  );
}


/**
 * Returns a date shifted by a number of months.
 */
function addMonths(date, months) {

  const result =
    date instanceof Date
      ? new Date(date)
      : new Date(date);

  result.setMonth(
    result.getMonth() + months
  );

  return result;
}


/**
 * Returns the previous month.
 */
function getPreviousMonth() {

  const date = new Date();

  date.setMonth(
    date.getMonth() - 1
  );

  return Utilities.formatDate(
    date,
    Session.getScriptTimeZone(),
    'yyyy-MM'
  );
}


/**
 * Returns the next month.
 */
function getNextMonth() {

  const date = new Date();

  date.setMonth(
    date.getMonth() + 1
  );

  return Utilities.formatDate(
    date,
    Session.getScriptTimeZone(),
    'yyyy-MM'
  );
}


/**
 * Safely converts a value to a string.
 */
function toSafeString(value) {

  if (
    value === null ||
    value === undefined
  ) {
    return '';
  }

  return String(value).trim();
}


/**
 * Normalizes an email address.
 */
function normalizeEmail(email) {

  return toSafeString(email)
    .toLowerCase();
}


/**
 * Basic email validation.
 */
function isValidEmail(email) {

  const normalized =
    normalizeEmail(email);

  if (!normalized) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(normalized);
}


/**
 * Ensures a required field exists.
 */
function requireField(
  data,
  fieldName,
  label
) {

  if (!data) {
    throw new Error(
      'Missing data.'
    );
  }

  const value =
    data[fieldName];

  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ''
  ) {

    throw new Error(
      (label || fieldName) +
      ' is required.'
    );
  }

  return value;
}


/**
 * Validates a positive number.
 */
function validatePositiveNumber(
  value,
  label
) {

  const number =
    toNumber(value);

  if (number <= 0) {

    throw new Error(
      (label || 'Value') +
      ' must be greater than 0.'
    );
  }

  return number;
}


/**
 * Validates a non-negative number.
 */
function validateNonNegativeNumber(
  value,
  label
) {

  const number =
    toNumber(value);

  if (number < 0) {

    throw new Error(
      (label || 'Value') +
      ' cannot be negative.'
    );
  }

  return number;
}


/**
 * Returns a column number based on
 * a header name.
 *
 * Useful when sheet columns change.
 */
function getColumnIndex(
  sheet,
  headerName
) {

  const lastColumn =
    sheet.getLastColumn();

  if (lastColumn === 0) {
    return -1;
  }

  const headers =
    sheet
      .getRange(
        1,
        1,
        1,
        lastColumn
      )
      .getValues()[0];

  const target =
    toSafeString(headerName)
      .toLowerCase();

  for (
    let i = 0;
    i < headers.length;
    i++
  ) {

    if (
      toSafeString(headers[i])
        .toLowerCase() === target
    ) {
      return i + 1;
    }
  }

  return -1;
}


/**
 * Returns all rows from a sheet
 * as an array of objects.
 *
 * Example:
 *
 * [
 *   {
 *     "Appliance ID": "APP-001",
 *     "Appliance Name": "Aircon"
 *   }
 * ]
 */

function getSheetRecords(
  sheetName
) {

  const sheet =
    getSheet(sheetName);

  const lastRow =
    sheet.getLastRow();

  const lastColumn =
    sheet.getLastColumn();

  if (
    lastRow < 2 ||
    lastColumn < 1
  ) {
    return [];
  }

  const values =
    sheet
      .getRange(
        1,
        1,
        lastRow,
        lastColumn
      )
      .getValues();

  const headers =
    values[0];

  const records = [];

  for (
    let row = 1;
    row < values.length;
    row++
  ) {

    const record = {};

    for (
      let column = 0;
      column < headers.length;
      column++
    ) {

      record[
        headers[column]
      ] = values[row][column];
    }

    records.push(record);
  }

  return records;
}





/**
 * =====================================================
 * GET USER SHEET RECORDS
 * =====================================================
 *
 * Gets records from a user's household spreadsheet.
 */
function getUserSheetRecords(
  userId,
  sheetName
) {

  const sheet =
    getUserSheet(
      userId,
      sheetName
    );


  const lastRow =
    sheet.getLastRow();


  const lastColumn =
    sheet.getLastColumn();


  if (
    lastRow < 2 ||
    lastColumn < 1
  ) {

    return [];

  }


  const values =
    sheet
      .getRange(
        1,
        1,
        lastRow,
        lastColumn
      )
      .getValues();


  const headers =
    values[0];


  const records = [];


  for (
    let row = 1;
    row < values.length;
    row++
  ) {

    const record = {};


    for (
      let column = 0;
      column < headers.length;
      column++
    ) {

      record[
        headers[column]
      ] =
        values[row][column];

    }


    records.push(record);

  }


  return records;

}






function openUserSpreadsheet(userId) {

  const result =
    getUserSpreadsheet(userId);


  if (!result.success) {

    throw new Error(
      result.message ||
      'Unable to get user spreadsheet.'
    );

  }


  const spreadsheetId =
    result.data.id;


  if (!spreadsheetId) {

    throw new Error(
      'Spreadsheet ID missing for user: ' +
      userId
    );

  }


  return SpreadsheetApp.openById(
    spreadsheetId
  );

}

/**
 * =====================================================
 * OPEN USER SPREADSHEET INTERNAL HELPER
 * =====================================================
 *
 * Opens the household spreadsheet assigned to a user.
 *
 * Used internally by utilities like getUserSheet().
 */
function openUserSpreadsheet_(userId) {

  userId = toSafeString(userId);

  if (!userId) {
    throw new Error(
      'User ID is required.'
    );
  }


  const user =
    getUserById(userId);


  if (!user) {
    throw new Error(
      'User not found: ' + userId
    );
  }


  const spreadsheetId =
    toSafeString(
      user['Spreadsheet ID']
    );


  if (!spreadsheetId) {

    throw new Error(
      'No Spreadsheet ID assigned to user: ' +
      userId
    );

  }


  try {

    return SpreadsheetApp.openById(
      spreadsheetId
    );

  } catch(error) {

    throw new Error(
      'Unable to open household spreadsheet: ' +
      error.message
    );

  }

}



/**
 * =====================================================
 * GET USER SHEET
 * =====================================================
 *
 * Gets a specific sheet from the user's household
 * spreadsheet.
 */
function getUserSheet(
  userId,
  sheetName
) {

 const userSpreadsheet =
openUserSpreadsheet_(
userId
);

  const sheet =
    userSpreadsheet.getSheetByName(
      sheetName
    );

  if (!sheet) {
    throw new Error(
      'Sheet "' +
      sheetName +
      '" does not exist in household spreadsheet.'
    );
  }

  return sheet;
}



/**
 * Finds a record by ID.
 */
function findRecordById(
  sheetName,
  idColumnName,
  id
) {

  const records =
    getSheetRecords(sheetName);

  const target =
    toSafeString(id);

  for (
    let i = 0;
    i < records.length;
    i++
  ) {

    if (
      toSafeString(
        records[i][idColumnName]
      ) === target
    ) {

      return records[i];
    }
  }

  return null;
}


/**
 * Returns the row number of a record
 * based on its ID.
 */
function findRowById(
  sheetName,
  idColumnName,
  id
) {

  const sheet =
    getSheet(sheetName);

  const column =
    getColumnIndex(
      sheet,
      idColumnName
    );

  if (column === -1) {
    return -1;
  }

  const lastRow =
    sheet.getLastRow();

  if (lastRow < 2) {
    return -1;
  }

  const values =
    sheet
      .getRange(
        2,
        column,
        lastRow - 1,
        1
      )
      .getValues();

  const target =
    toSafeString(id);

  for (
    let i = 0;
    i < values.length;
    i++
  ) {

    if (
      toSafeString(values[i][0]) ===
      target
    ) {

      return i + 2;
    }
  }

  return -1;
}


/**
 * Deletes a record by ID.
 */
function deleteRecordById(
  sheetName,
  idColumnName,
  id
) {

  const sheet =
    getSheet(sheetName);

  const row =
    findRowById(
      sheetName,
      idColumnName,
      id
    );

  if (row === -1) {

    throw new Error(
      'Record not found.'
    );
  }

  sheet.deleteRow(row);

  return {
    success: true
  };
}


/**
 * Gets a setting from Settings sheet.
 */
function getSetting(
  settingName,
  fallback
) {

  const sheet =
    getSheet(SHEETS.SETTINGS);

  const lastRow =
    sheet.getLastRow();

  if (lastRow < 2) {
    return fallback;
  }

  const values =
    sheet
      .getRange(
        2,
        1,
        lastRow - 1,
        2
      )
      .getValues();

  const target =
    toSafeString(settingName)
      .toLowerCase();

  for (
    let i = 0;
    i < values.length;
    i++
  ) {

    const name =
      toSafeString(values[i][0])
        .toLowerCase();

    if (name === target) {

      return values[i][1];
    }
  }

  return fallback;
}


/**
 * Updates an existing setting.
 */
function setSetting(
  settingName,
  value
) {

  const sheet =
    getSheet(SHEETS.SETTINGS);

  const lastRow =
    sheet.getLastRow();

  if (lastRow >= 2) {

    const values =
      sheet
        .getRange(
          2,
          1,
          lastRow - 1,
          2
        )
        .getValues();

    const target =
      toSafeString(settingName)
        .toLowerCase();

    for (
      let i = 0;
      i < values.length;
      i++
    ) {

      const name =
        toSafeString(values[i][0])
          .toLowerCase();

      if (name === target) {

        sheet
          .getRange(
            i + 2,
            2
          )
          .setValue(value);

        return true;
      }
    }
  }

  sheet.appendRow([
    settingName,
    value,
    ''
  ]);

  return true;
}


/**
 * Gets the current electricity rate.
 */
function getDefaultElectricityRate() {

  const setting =
    getSetting(
      'DEFAULT_ELECTRICITY_RATE',
      DEFAULT_ELECTRICITY_RATE
    );

  const rate =
    toNumber(setting);

  return rate > 0
    ? rate
    : DEFAULT_ELECTRICITY_RATE;
}


/**
 * Gets the alert kWh threshold.
 */
function getAlertKwhThreshold() {

  return toNumber(
    getSetting(
      'ALERT_KWH_THRESHOLD',
      DEFAULT_ALERT_KWH
    )
  );
}


/**
 * Gets the alert cost threshold.
 */
function getAlertCostThreshold() {

  return toNumber(
    getSetting(
      'ALERT_COST_THRESHOLD',
      DEFAULT_ALERT_COST
    )
  );
}


/**
 * Converts spreadsheet dates into
 * values that can safely be sent
 * to the frontend.
 */
function serializeValue(value) {

  if (
    value instanceof Date
  ) {

    return Utilities.formatDate(
      value,
      Session.getScriptTimeZone(),
      'yyyy-MM-dd HH:mm:ss'
    );
  }

  return value;
}


/**
 * Serializes a record for the frontend.
 */
function serializeRecord(record) {

  const result = {};

  Object.keys(record)
    .forEach(function(key) {

      result[key] =
        serializeValue(
          record[key]
        );
    });

  return result;
}


/**
 * Serializes an array of records.
 */
function serializeRecords(records) {

  return records.map(
    function(record) {
      return serializeRecord(record);
    }
  );
}


/**
 * Safely returns JSON-compatible data.
 */
function safeJsonParse(value, fallback) {

  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return fallback;
  }

  try {

    return JSON.parse(value);

  } catch (error) {

    return fallback;
  }
}


/**
 * Prevents excessively large values.
 */
function clamp(
  value,
  minimum,
  maximum
) {

  const number =
    toNumber(value);

  return Math.min(
    Math.max(
      number,
      minimum
    ),
    maximum
  );
}


/**
 * Returns the number of days
 * in a given month.
 */
function getDaysInMonth(
  year,
  month
) {

  return new Date(
    year,
    month,
    0
  ).getDate();
}


/**
 * Gets the number of days in a
 * YYYY-MM month.
 */
function getDaysInMonthString(
  monthString
) {

  const parts =
    toSafeString(
      monthString
    ).split('-');

  if (parts.length !== 2) {
    return 30;
  }

  const year =
    parseInt(parts[0], 10);

  const month =
    parseInt(parts[1], 10);

  if (
    isNaN(year) ||
    isNaN(month)
  ) {
    return 30;
  }

  return getDaysInMonth(
    year,
    month
  );
}


/**
 * Converts a value to a boolean.
 */
function toBoolean(value) {

  if (
    value === true ||
    value === false
  ) {
    return value;
  }

  const text =
    toSafeString(value)
      .toLowerCase();

  return (
    text === 'true' ||
    text === 'yes' ||
    text === '1'
  );
}


/**
 * Returns a safe status value.
 */
function normalizeStatus(
  status
) {

  const value =
    toSafeString(status);

  if (!value) {
    return 'Active';
  }

  return value;
}


/**
 * Creates a standard success response.
 */
function successResponse(
  data,
  message
) {

  return {
    success: true,
    message:
      message || 'Operation completed successfully.',
    data:
      data === undefined
        ? null
        : data
  };
}


/**
 * Creates a standard error response.
 */
function errorResponse(
  error,
  fallbackMessage
) {

  const message =
    error &&
    error.message
      ? error.message
      : (
          fallbackMessage ||
          'Something went wrong.'
        );

  return {
    success: false,
    message: message,
    data: null
  };
}
