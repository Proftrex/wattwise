/*******************************************************
 * HOUSEHOLD ELECTRICITY TRACKER
 * Code.gs
 *
 * Main entry point and shared configuration.
 *******************************************************/

const APP_NAME = 'Household Electricity Tracker';

/**
 * Google Sheet tab names.
 */
const SHEETS = {
  USERS: 'Users',
  APPLIANCES: 'Appliances',
  CATEGORIES: 'Appliance_Categories',
  RATES: 'Electricity_Rates',
  ESTIMATES: 'Monthly_Estimates',
  BILLS: 'Bill History',
  ALERTS: 'Alerts',
  SETTINGS: 'Settings'
};

/**
 * Default electricity rate.
 */
const DEFAULT_ELECTRICITY_RATE = 0;

/**
 * Default alert thresholds.
 */
const DEFAULT_ALERT_KWH = 100;
const DEFAULT_ALERT_COST = 1000;

/**
 * Web App entry point.
 */
function doGet(e) {

  try {

    const action =
      e.parameter.action;


    let result;


    switch(action) {


      case "getUserIdByEmail":

        result =
          getUserIdByEmail(
            e.parameter.email
          );

        break;


      case "getUserSpreadsheet":

        result =
          getUserSpreadsheet(
            e.parameter.userId
          );

        break;


      case "getDashboard":

        result =
          getDashboard(
            e.parameter.userId,
            e.parameter.month
          );

        break;


      case "getAppliances":

        result =
          getAppliances(
            e.parameter.userId
          );

        break;


      case "addAppliance":

        result =
          addAppliance(
            JSON.parse(
              e.parameter.data
            )
          );

        break;


      case "updateAppliance":

        result =
          updateAppliance(
            JSON.parse(
              e.parameter.data
            )
          );

        break;


      case "deleteAppliance":

        result =
          deleteAppliance(
            e.parameter.applianceId,
            e.parameter.userId
          );

        break;


      case "addElectricityRate":

        result =
          addElectricityRate(
            JSON.parse(
              e.parameter.data
            )
          );

        break;


      case "saveActualBillDirect":

        result =
          saveActualBillDirect(
            JSON.parse(
              e.parameter.data
            )
          );

        break;


      case "getActualBills":

        result =
          getActualBills(
            e.parameter.userId
          );

        break;


      case "updateSavedBill":

        result =
          updateSavedBill(
            e.parameter.userId,
            e.parameter.billId,
            JSON.parse(
              e.parameter.data
            )
          );

        break;


      default:

        result = {
          success:false,
          message:"Unknown action"
        };

    }


    return ContentService
      .createTextOutput(
        JSON.stringify(result)
      )
      .setMimeType(
        ContentService.MimeType.JSON
      );


  } catch(error) {


    return ContentService
      .createTextOutput(
        JSON.stringify({
          success:false,
          message:error.message
        })
      )
      .setMimeType(
        ContentService.MimeType.JSON
      );


  }

}

/**
 * Allows HTML files to include other HTML files.
 *
 * Example:
 * Example: include static frontend files through index.html
 */
function include(filename) {
  return HtmlService
    .createHtmlOutputFromFile(filename)
    .getContent();
}

/**
 * Returns the active spreadsheet.
 */
function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Returns a sheet by name.
 */
function getSheet(sheetName) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    throw new Error(
      'Sheet "' + sheetName + '" does not exist. ' +
      'Please run setupDatabase() first.'
    );
  }

  return sheet;
}

/**
 * Creates the entire database structure.
 *
 * Run this function once after installing the project.
 */
function setupDatabase() {
  const ss = getSpreadsheet();

  createSheetIfMissing_(
    ss,
    SHEETS.USERS,
    [
      'User ID',
      'Email',
      'Name',
      'Household Name',
      'Created At',
      'Status'
    ]
  );

  createSheetIfMissing_(
    ss,
    SHEETS.APPLIANCES,
    [
      'Appliance ID',
      'User ID',
      'Appliance Name',
      'Category',
      'Brand',
      'Model',
      'Wattage',
      'Quantity',
      'Usage Type',
      'Hours Per Day',
      'Uses Per Day',
      'Uses Per Week',
      'Uses Per Month',
      'Days Per Month',
      'Load Factor',
      'Estimated kWh Per Day',
      'Aircon HP',
      'Aircon Type',
      'Cooking Hours',
      'Warm Mode Hours',
      'Notes',
      'Status',
      'Created At',
      'Updated At'
    ]
  );

  createSheetIfMissing_(
    ss,
    SHEETS.CATEGORIES,
    [
      'Category ID',
      'Category Name',
      'Description',
      'Status'
    ]
  );

  createSheetIfMissing_(
    ss,
    SHEETS.RATES,
    [
      'Rate ID',
      'Effective Month',
      'Rate Per kWh',
      'Provider',
      'Notes',
      'Created At'
    ]
  );

  createSheetIfMissing_(
    ss,
    SHEETS.ESTIMATES,
    [
      'Estimate ID',
      'User ID',
      'Month',
      'Appliance ID',
      'Appliance Name',
      'Category',
      'Monthly kWh',
      'Estimated Cost',
      'Percentage Contribution',
      'Alert',
      'Created At'
    ]
  );

  createSheetIfMissing_(
    ss,
    SHEETS.BILLS,
    [
  "Bill ID",
  "User ID",
  "Bill Month",
  "Actual kWh",
  "Generation",
  "Transmission",
  "System Loss",
  "Distribution",
  "Senior Citizen",
  "Government Taxes",
  "Universal Charges",
  "FIT-All",
  "GEA-All",
  "Lifeline",
  "Other Charges",
  "Actual Bill",
  "Notes",
  "Created At"
]
  );

  createSheetIfMissing_(
    ss,
    SHEETS.ALERTS,
    [
      'Alert ID',
      'User ID',
      'Appliance ID',
      'Appliance Name',
      'Month',
      'Monthly kWh',
      'Estimated Cost',
      'Alert Type',
      'Message',
      'Status',
      'Created At'
    ]
  );

  createSheetIfMissing_(
    ss,
    SHEETS.SETTINGS,
    [
      'Setting',
      'Value',
      'Description'
    ]
  );

  setupCategories_();
  setupDefaultSettings_();
  setupDefaultRate_();

  formatDatabaseSheets_();

  return {
    success: true,
    message: 'Household Electricity Tracker database setup completed.'
  };
}

/**
 * Creates a sheet if it does not already exist.
 */
function createSheetIfMissing_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet
      .getRange(1, 1, 1, headers.length)
      .setValues([headers]);

    sheet.setFrozenRows(1);
  }
}

/**
 * Creates default appliance categories.
 */
function setupCategories_() {
  const sheet = getSheet(SHEETS.CATEGORIES);

  if (sheet.getLastRow() > 1) {
    return;
  }

  const categories = [
    [
      'CAT-001',
      'Heavy Appliances',
      'Aircon, refrigerator, water heater, water pump, freezer',
      'Active'
    ],
    [
      'CAT-002',
      'Kitchen Appliances',
      'Rice cooker, microwave, air fryer, induction cooker',
      'Active'
    ],
    [
      'CAT-003',
      'Electronics & Gadgets',
      'Computer, laptop, TV, router, phones and other electronics',
      'Active'
    ],
    [
      'CAT-004',
      'Lighting',
      'LED bulbs, fluorescent lights and other lighting',
      'Active'
    ],
    [
      'CAT-005',
      'Other Appliances',
      'Other household electrical appliances',
      'Active'
    ]
  ];

  sheet
    .getRange(
      2,
      1,
      categories.length,
      categories[0].length
    )
    .setValues(categories);
}

/**
 * Creates default application settings.
 */
function setupDefaultSettings_() {
  const sheet = getSheet(SHEETS.SETTINGS);

  if (sheet.getLastRow() > 1) {
    return;
  }

  const settings = [
    [
      'DEFAULT_ELECTRICITY_RATE',
      DEFAULT_ELECTRICITY_RATE,
      'Default electricity rate per kWh'
    ],
    [
      'ALERT_KWH_THRESHOLD',
      DEFAULT_ALERT_KWH,
      'Alert when an appliance reaches this monthly kWh'
    ],
    [
      'ALERT_COST_THRESHOLD',
      DEFAULT_ALERT_COST,
      'Alert when an appliance reaches this estimated monthly cost'
    ],
    [
      'CURRENCY',
      'PHP',
      'Application currency'
    ],
    [
      'TIMEZONE',
      Session.getScriptTimeZone(),
      'Script timezone'
    ]
  ];

  sheet
    .getRange(
      2,
      1,
      settings.length,
      settings[0].length
    )
    .setValues(settings);
}

/**
 * Creates the default electricity rate.
 */
function setupDefaultRate_() {
  const sheet = getSheet(SHEETS.RATES);

  if (sheet.getLastRow() > 1) {
    return;
  }

  const now = new Date();

  sheet
    .getRange(2, 1, 1, 6)
    .setValues([
      [
        'RATE-001',
        Utilities.formatDate(
          now,
          Session.getScriptTimeZone(),
          'yyyy-MM'
        ),
        DEFAULT_ELECTRICITY_RATE,
        'Default',
        'Initial default electricity rate',
        now
      ]
    ]);
}

/**
 * Applies basic formatting to all database sheets.
 */
function formatDatabaseSheets_() {
  const ss = getSpreadsheet();

  Object.keys(SHEETS).forEach(function(key) {
    const sheetName = SHEETS[key];
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      return;
    }

    const lastColumn = sheet.getLastColumn();

    if (lastColumn > 0) {
      const header = sheet.getRange(
        1,
        1,
        1,
        lastColumn
      );

      header
        .setFontWeight('bold')
        .setBackground('#79d862');

      sheet.setFrozenRows(1);

      for (
        let column = 1;
        column <= lastColumn;
        column++
      ) {
        sheet.autoResizeColumn(column);
      }
    }
  });
}

/**
 * Returns basic application information.
 */
function getAppInfo() {
  return {
    name: APP_NAME,
    version: '1.0.0',
    currency: 'PHP',
    defaultRate: DEFAULT_ELECTRICITY_RATE
  };
}

/**
 * Health check.
 */
function testConnection() {
  return {
    success: true,
    app: APP_NAME,
    timestamp: new Date().toISOString(),
    spreadsheetId: getSpreadsheet().getId()
  };
}





/**
 * =====================================================
 * ELECTRICITY RATE FUNCTIONS
 * =====================================================
 *
 * Gets the default electricity rate from Settings.
 * Falls back to DEFAULT_ELECTRICITY_RATE if needed.
 */
function getDefaultElectricityRate() {

  try {

    const sheet =
      getSheet(SHEETS.SETTINGS);

    const records =
      getSheetRecords(SHEETS.SETTINGS);

    const setting =
      records.find(function(record) {

        return (
          toSafeString(
            record['Setting']
          ) ===
          'DEFAULT_ELECTRICITY_RATE'
        );

      });

    if (setting) {

      const rate =
        toPositiveNumber(
          setting['Value']
        );

      if (rate > 0) {
        return rate;
      }

    }

  } catch (error) {

    console.log(
      'Unable to read default electricity rate: ' +
      error.message
    );

  }

  return DEFAULT_ELECTRICITY_RATE;
}


/**
 * =====================================================
 * GET ELECTRICITY RATE FOR MONTH
 * =====================================================
 *
 * Looks for a rate in Electricity_Rates
 * matching the requested month.
 *
 * If no rate exists for that month,
 * the default rate from Settings is used.
 */
function getElectricityRateForMonth(month) {

  month =
    toSafeString(
      month
    ) || getCurrentMonth();

  try {

    const records =
      getSheetRecords(
        SHEETS.RATES
      );

    /**
     * Find the most recent matching
     * rate for the requested month.
     */
    const matchingRates =
      records.filter(
        function(record) {

          return (
            toSafeString(
              record['Effective Month']
            ) === month
          );

        }
      );

    if (
      matchingRates.length > 0
    ) {

      const latestRate =
        matchingRates[
          matchingRates.length - 1
        ];

      const rate =
        toPositiveNumber(
          latestRate['Rate Per kWh']
        );

      if (rate > 0) {

        return rate;

      }

    }

  } catch (error) {

    console.log(
      'Unable to read electricity rate for ' +
      month +
      ': ' +
      error.message
    );

  }

  /**
   * No monthly rate found.
   * Use the Settings default.
   */
  return getDefaultElectricityRate();
}


/**
 * =====================================================
 * GET ELECTRICITY RATE DETAILS
 * =====================================================
 *
 * Returns the rate together with its provider
 * and source for frontend display.
 */
function getElectricityRateDetails(month) {

  month =
    toSafeString(
      month
    ) || getCurrentMonth();

  try {

    const records =
      getSheetRecords(
        SHEETS.RATES
      );

    const matchingRates =
      records.filter(
        function(record) {

          return (
            toSafeString(
              record['Effective Month']
            ) === month
          );

        }
      );

    if (
      matchingRates.length > 0
    ) {

      const record =
        matchingRates[
          matchingRates.length - 1
        ];

      const rate =
        toPositiveNumber(
          record['Rate Per kWh']
        );

      if (rate > 0) {

        return {

          success: true,

          month:
            month,

          rate:
            rate,

          provider:
            toSafeString(
              record['Provider']
            ) || 'Default',

          source:
            'Electricity_Rates'

        };

      }

    }

  } catch (error) {

    console.log(
      'Unable to get electricity rate details: ' +
      error.message
    );

  }

  const defaultRate =
    getDefaultElectricityRate();

  return {

    success: true,

    month:
      month,

    rate:
      defaultRate,

    provider:
      'Default',

    source:
      'Settings'

  };

}









function sheetExists(sheetName){

  const ss =
    SpreadsheetApp
    .getActiveSpreadsheet();


  return ss
    .getSheetByName(sheetName) !== null;

}



function getDatabaseSpreadsheet(){

  return SpreadsheetApp
    .getActiveSpreadsheet();

}






function formatHeaderRow(sheet){

  const lastColumn = sheet.getLastColumn();

  if (lastColumn === 0) {
    return;
  }


  const headerRange =
    sheet.getRange(
      1,
      1,
      1,
      lastColumn
    );


  headerRange
    .setFontWeight("bold")
    .setBackground("#79d862")
    .setHorizontalAlignment("center");


  sheet
    .setFrozenRows(1);

}



/****************************************************
 * ACTUAL BILLS
 ****************************************************/







/*******************************************************
 * ACTUAL BILL SYSTEM
 *******************************************************/

/**
 * Returns the Bill History sheet.
 *
 * Uses the existing SHEETS.BILLS = "Bill History"
 *
 * Creates the sheet automatically if it does not exist.
 */





function getBillHistorySheet() {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const sheetName =
    'Bill History';

  let sheet =
    ss.getSheetByName(sheetName);

  if (!sheet) {

    sheet =
      ss.insertSheet(sheetName);

    const headers = [
      'Bill ID',
      'User ID',
      'Bill Month',
      'Meter Start',
      'Meter End',
      'Actual kWh',
      'Actual Bill',
      'Rate Per kWh',
      'Difference vs Estimate kWh',
      'Difference vs Estimate Cost',
      'Notes',
      'Created At'
    ];

    sheet
      .getRange(
        1,
        1,
        1,
        headers.length
      )
      .setValues([
        headers
      ]);

    formatHeaderRow(sheet);
  }

  return sheet;
}








function saveActualBill(data){

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const sheet =
    ss.getSheetByName("Bills");


  if(!sheet){
    throw new Error("Bills sheet not found.");
  }


  const billId =
    "BILL-" + new Date().getTime();


  const row = [

    billId,

    data.userId || "",

    data.billMonth || "",

    Number(data.actualKwh || 0),

    Number(data.generation || 0),

    Number(data.transmission || 0),

    Number(data.systemLoss || 0),

    Number(data.distribution || 0),

    Number(data.seniorCitizen || 0),

    Number(data.governmentTaxes || 0),

    Number(data.universalCharges || 0),

    Number(data.fitAll || 0),

    Number(data.geaAll || 0),

    Number(data.lifeline || 0),

    Number(data.otherCharges || 0),


    Number(data.actualBill || 0),


    data.notes || "",


    new Date()

  ];


  sheet.appendRow(row);



  return {

    success:true,

    message:"Actual bill saved successfully.",

    billId:billId

  };

}









function saveActualBillDirect(data){

  try {


    const userId =
      String(data.userId || "").trim();


    if(!userId){

      throw new Error(
        "User ID required."
      );

    }



    const spreadsheetId =
      getUserSpreadsheetId(userId);



    if(!spreadsheetId){

      throw new Error(
        "No user spreadsheet found for " + userId
      );

    }



    const ss =
      SpreadsheetApp.openById(
        spreadsheetId
      );



    let sheet =
      ss.getSheetByName(
        "Bill History"
      );



    if(!sheet){

      sheet =
        ss.insertSheet(
          "Bill History"
        );


      sheet.appendRow([

        "Bill ID",
        "User ID",
        "Bill Month",
        "Actual kWh",
        "Generation",
        "Transmission",
        "System Loss",
        "Distribution",
        "Senior Citizen",
        "Government Taxes",
        "Universal Charges",
        "FIT-All",
        "GEA-All",
        "Lifeline",
        "Other Charges",
        "Actual Bill",
        "Notes",
        "Created At"

      ]);

    }



    const billId =
      "BILL-" +
      new Date().getTime();



    sheet.appendRow([


      billId,


      userId,


      data.billMonth || "",


      Number(
        data.actualKwh || 0
      ),


      Number(
        data.generation || 0
      ),


      Number(
        data.transmission || 0
      ),


      Number(
        data.systemLoss || 0
      ),


      Number(
        data.distribution || 0
      ),


      Number(
        data.seniorCitizen || 0
      ),


      Number(
        data.governmentTaxes || 0
      ),


      Number(
        data.universalCharges || 0
      ),


      Number(
        data.fitAll || 0
      ),


      Number(
        data.geaAll || 0
      ),


      Number(
        data.lifeline || 0
      ),


      Number(
        data.otherCharges || 0
      ),


      Number(
        data.actualBill || 0
      ),


      data.notes || "",


      new Date()

    ]);



    SpreadsheetApp.flush();



    return {

      success:true,

      billId:billId,

      message:
        "Actual bill saved successfully."

    };


  }
  catch(error){


    Logger.log(
      "SAVE BILL ERROR: " +
      error.message
    );


    return {

      success:false,

      message:
        error.message

    };


  }

}








function getVersionTest(){

  return {
    version: "ACTUAL BILL FIX V2",
    time: new Date().toISOString()
  };

}






