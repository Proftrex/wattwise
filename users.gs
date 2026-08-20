const USER_COLUMNS = {
  USER_ID: 1,
  EMAIL: 2,
  NAME: 3,
  HOUSEHOLD_NAME: 4,
  CREATED_AT: 5,
  STATUS: 6,
  ACCESS_STATUS: 7,
  SPREADSHEET_ID: 8,
  SPREADSHEET_URL: 9,
  LAST_LOGIN: 10,
  UPDATED_AT: 11
};

const USER_ACCESS_ALLOWED = 'ALLOWED';

const USER_ACCESS_BLOCKED = 'BLOCKED';





/**
 * ============================================================
 * GET USER BY ID
 * ============================================================
 */
/**
 * ============================================================
 * GET USER BY ID
 * ============================================================
 *
 * Looks for the user in the Users sheet.
 * Handles extra spaces and different data types.
 * ============================================================
 */




/**
 * ============================================================
 * GET USER BY ID
 * ============================================================
 *
 * Supports:
 *
 * 1. Actual User ID
 *    USER-005
 *
 * 2. Generated frontend User ID
 *    USER-trexiaamable-gmail-com
 *
 * If the generated ID is received, the function converts it
 * back to the user's email and finds the actual User ID.
 * ============================================================
 */
function getUserById(userId) {

  const users =
    getSheetRecords(
      SHEETS.USERS
    );

  const targetUserId =
    toSafeString(
      userId
    );

  if (!targetUserId) {
    return null;
  }


  /**
   * ==========================================================
   * STEP 1
   * Look for the actual User ID first.
   * ==========================================================
   */
  for (
    let i = 0;
    i < users.length;
    i++
  ) {

    const currentUserId =
      toSafeString(
        users[i]['User ID']
      );

    if (
      currentUserId ===
      targetUserId
    ) {

      return users[i];

    }

  }


  /**
   * ==========================================================
   * STEP 2
   * If the ID starts with USER- and looks like:
   *
   * USER-trexiaamable-gmail-com
   *
   * convert it back to:
   *
   * trexiaamable@gmail.com
   * ==========================================================
   */
  if (
    targetUserId.indexOf('USER-') === 0
  ) {

    const generatedPart =
      targetUserId.substring(
        5
      );

    /**
     * Convert the generated email format back
     * into a searchable email.
     *
     * Example:
     *
     * trexiaamable-gmail-com
     *
     * becomes:
     *
     * trexiaamable@gmail.com
     */
    const lastDash =
      generatedPart.lastIndexOf('-');

    if (
      lastDash !== -1
    ) {

      const domainPart =
        generatedPart.substring(
          lastDash + 1
        );

      const beforeDomain =
        generatedPart.substring(
          0,
          lastDash
        );

      const domainDash =
        beforeDomain.lastIndexOf('-');

      if (
        domainDash !== -1
      ) {

        const email =
          beforeDomain.substring(
            0,
            domainDash
          )
          +
          '@'
          +
          beforeDomain.substring(
            domainDash + 1
          )
          +
          '.'
          +
          domainPart;


        /**
         * ======================================================
         * STEP 3
         * Search the Users sheet by Email.
         * ======================================================
         */
        for (
          let i = 0;
          i < users.length;
          i++
        ) {

          const currentEmail =
            toSafeString(
              users[i]['Email']
            ).toLowerCase();

          if (
            currentEmail ===
            email.toLowerCase()
          ) {

            return users[i];

          }

        }

      }

    }

  }


  /**
   * ==========================================================
   * USER NOT FOUND
   * ==========================================================
   */
  return null;
}





/**
 * Hash password using SHA-256
 * Stores only the hash, never the password.
 */
function hashPassword(password) {

  const raw =
    toSafeString(password);

  if (!raw) {
    return '';
  }


  const bytes =
    Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      raw,
      Utilities.Charset.UTF_8
    );


  return bytes
    .map(function(byte){

      return (
        ('0' + (byte & 0xFF).toString(16))
        .slice(-2)
      );

    })
    .join('');

}




function getUserIdByLogin(email, password) {

  try {

    const targetEmail =
      toSafeString(email).toLowerCase();


    const passwordHash =
      hashPassword(password);


    const users =
      getSheetRecords(
        SHEETS.USERS
      );


    for (
      let i = 0;
      i < users.length;
      i++
    ) {


      const currentEmail =
        toSafeString(
          users[i]['Email']
        ).toLowerCase();


      const storedHash =
        toSafeString(
          users[i]['Password Hash']
        );


      if (
        currentEmail === targetEmail &&
        storedHash === passwordHash
      ) {


        return {

          success:true,

          userId:
            toSafeString(
              users[i]['User ID']
            ),

          email:
            currentEmail,

          name:
            toSafeString(
              users[i]['Name']
            ),

          householdName:
            toSafeString(
              users[i]['Household Name']
            ),

          accessStatus:
            toSafeString(
              users[i]['Access Status']
            ),

          spreadsheetId:
            toSafeString(
              users[i]['Spreadsheet ID']
            ),

          spreadsheetUrl:
            toSafeString(
              users[i]['Spreadsheet URL']
            )

        };

      }

    }


    return {

      success:false,

      message:
        'Invalid email or password.'

    };


  } catch(error) {


    return {

      success:false,

      message:
        error.message

    };

  }

}


function getUserIdByEmail(email) {

try {

  const targetEmail =
    toSafeString(email).toLowerCase();


  if (!targetEmail) {

    throw new Error(
      'Email address is required.'
    );

  }


  const users =
    getSheetRecords(
      SHEETS.USERS
    );


  for (
    let i = 0;
    i < users.length;
    i++
  ) {


    const currentEmail =
      toSafeString(
        users[i]['Email']
      ).toLowerCase();


    if (
      currentEmail ===
      targetEmail
    ) {


      return {

        success: true,


        userId:
          toSafeString(
            users[i]['User ID']
          ),


        email:
          currentEmail,


        name:
          toSafeString(
            users[i]['Name']
          ),


        householdName:
          toSafeString(
            users[i]['Household Name']
          ),


        accessStatus:
          toSafeString(
            users[i]['Access Status']
          ),


        spreadsheetId:
          toSafeString(
            users[i]['Spreadsheet ID']
          ),


        spreadsheetUrl:
          toSafeString(
            users[i]['Spreadsheet URL']
          )

      };


    }


  }


  return {

    success: false,

    userId: null,

    message:
      'No user was found for email: ' +
      email

  };


} catch (error) {


  console.error(
    'getUserIdByEmail ERROR:'
  );


  console.error(
    error.message
  );


  return {

    success: false,

    userId: null,

    message:
      error.message

  };


}

}






function createUserSpreadsheet(userId) {

  try {

    const user = getUserById(userId);

    if (!user) {
      throw new Error('User not found.');
    }

    // Prevent duplicate spreadsheets
    const existingId = toSafeString(
      user['Spreadsheet ID']
    );

    if (existingId) {

      try {

        const existingSpreadsheet =
          SpreadsheetApp.openById(
            existingId
          );

        return {
          id: existingSpreadsheet.getId(),
          name: existingSpreadsheet.getName(),
          url: existingSpreadsheet.getUrl(),
          created: false,
          shared: false
        };

      } catch (error) {

        console.warn(
          'Existing spreadsheet could not be opened. Creating a replacement: ' +
          error.message
        );

      }

    }

    const householdName =
      toSafeString(
        user['Household Name']
      ) || 'Household';

    const spreadsheetName =
      'Electricity Tracker - ' +
      householdName;

    // Create the dedicated spreadsheet
    const newSpreadsheet =
      SpreadsheetApp.create(
        spreadsheetName
      );

    // Build the household spreadsheet structure
    setupDedicatedSpreadsheet_(
      newSpreadsheet
    );

    // Move spreadsheet into the Users Sheets folder
    const TARGET_FOLDER_ID =
      '1_2X6nKmzFzkoleWaLPpmD7kIaFsmihss';

    try {

      const file =
        DriveApp.getFileById(
          newSpreadsheet.getId()
        );

      const targetFolder =
        DriveApp.getFolderById(
          TARGET_FOLDER_ID
        );

      targetFolder.addFile(file);

      console.log(
        'Spreadsheet moved to Users Sheets folder.'
      );

    } catch (folderError) {

      console.warn(
        'Unable to move spreadsheet to Users Sheets folder: ' +
        folderError.message
      );

    }

    // Find the user in the main Users sheet
    const row =
      findRowById(
        SHEETS.USERS,
        'User ID',
        userId
      );

    if (row === -1) {

      throw new Error(
        'User record not found while saving spreadsheet information.'
      );

    }

    const mainSheet =
      getSheet(
        SHEETS.USERS
      );

    // Save Spreadsheet ID
    mainSheet
      .getRange(
        row,
        USER_COLUMNS.SPREADSHEET_ID
      )
      .setValue(
        newSpreadsheet.getId()
      );

    // Save Spreadsheet URL
    mainSheet
      .getRange(
        row,
        USER_COLUMNS.SPREADSHEET_URL
      )
      .setValue(
        newSpreadsheet.getUrl()
      );

    // Update timestamp
    mainSheet
      .getRange(
        row,
        USER_COLUMNS.UPDATED_AT
      )
      .setValue(
        getNow()
      );

    SpreadsheetApp.flush();

    console.log(
      'Dedicated spreadsheet created successfully.'
    );

    console.log(
      'Spreadsheet ID: ' +
      newSpreadsheet.getId()
    );

    console.log(
      'Spreadsheet URL: ' +
      newSpreadsheet.getUrl()
    );

    return {

      id:
        newSpreadsheet.getId(),

      name:
        newSpreadsheet.getName(),

      url:
        newSpreadsheet.getUrl(),

      created:
        true,

      shared:
        false

    };

  } catch (error) {

    throw new Error(
      'Unable to create household spreadsheet: ' +
      error.message
    );

  }

}





/*******************************************************
 * DEDICATED SPREADSHEET DATABASE
 *******************************************************/

/**
 * Creates the required sheets inside a
 * dedicated household spreadsheet.
 *
 * This mirrors the main database structure.
 */
function setupDedicatedSpreadsheet_(
  spreadsheet
) {

  /**
   * Remove default Sheet1 if present.
   */
  const defaultSheet =
    spreadsheet.getSheetByName(
      'Sheet1'
    );

  if (
    defaultSheet &&
    spreadsheet.getSheets().length === 1
  ) {

    defaultSheet.setName(
      SHEETS.APPLIANCES
    );
  }

  /**
   * Users.
   */
  createDedicatedSheet_(
    spreadsheet,
    SHEETS.USERS,
    [
      'User ID',
      'Email',
      'Password Hash',
      'Name',
      'Household Name',
      'Created At',
      'Status',
      'Access Status',
      'Spreadsheet ID',
      'Spreadsheet URL',
      'Last Login',
      'Updated At'
    ]
  );

  /**
   * Appliances.
   */
  createDedicatedSheet_(
    spreadsheet,
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

  /**
   * Categories.
   */
  createDedicatedSheet_(
    spreadsheet,
    SHEETS.CATEGORIES,
    [
      'Category ID',
      'Category Name',
      'Description',
      'Status'
    ]
  );

  /**
   * Electricity rates.
   */
  createDedicatedSheet_(
    spreadsheet,
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

  /**
   * Monthly estimates.
   */
  createDedicatedSheet_(
    spreadsheet,
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

  /**
   * Bill history.
   */
  createDedicatedSheet_(
    spreadsheet,
    SHEETS.BILLS,
    [
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
    ]
  );

  /**
   * Alerts.
   */
  createDedicatedSheet_(
    spreadsheet,
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

  /**
   * Settings.
   */
  createDedicatedSheet_(
    spreadsheet,
    SHEETS.SETTINGS,
    [
      'Setting',
      'Value',
      'Description'
    ]
  );


  /**
   * Password Resets.
   */
  createDedicatedSheet_(
    spreadsheet,
    SHEETS.PASSWORD_RESETS,
    [
      'Reset ID',
      'Email',
      'Reset Code',
      'Created At',
      'Expiry',
      'Used',
      'Status'
    ]
  );

  /**
   * Populate categories.
   */
  setupDedicatedCategories_(
    spreadsheet
  );

  /**
   * Populate default settings.
   */
  setupDedicatedSettings_(
    spreadsheet
  );

  /**
   * Populate default electricity rate.
   */
  setupDedicatedRate_(
    spreadsheet
  );

  /**
   * Format sheets.
   */
  formatDedicatedSpreadsheet_(
    spreadsheet
  );

  return true;
}


/**
 * Creates a sheet inside a dedicated spreadsheet.
 */
function createDedicatedSheet_(
  spreadsheet,
  sheetName,
  headers
) {

  let sheet =
    spreadsheet.getSheetByName(
      sheetName
    );

  /**
   * If the default Sheet1 was renamed
   * to Appliances, do not recreate it.
   */
  if (!sheet) {

    sheet =
      spreadsheet.insertSheet(
        sheetName
      );
  }

  if (
    sheet.getLastRow() === 0
  ) {

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

  } else {

    /**
     * Check if headers exist.
     */
    const existingHeaders =
      sheet
        .getRange(
          1,
          1,
          1,
          Math.max(
            sheet.getLastColumn(),
            headers.length
          )
        )
        .getValues()[0];

    let needsHeaders =
      true;

    for (
      let i = 0;
      i < headers.length;
      i++
    ) {

      if (
        existingHeaders[i] !==
        headers[i]
      ) {

        needsHeaders =
          false;

        break;
      }
    }

    if (
      !needsHeaders &&
      sheet.getLastRow() === 1
    ) {

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
    }
  }

  sheet.setFrozenRows(1);

  return sheet;
}


/*******************************************************
 * DEDICATED CATEGORIES
 *******************************************************/

function setupDedicatedCategories_(
  spreadsheet
) {

  const sheet =
    spreadsheet.getSheetByName(
      SHEETS.CATEGORIES
    );

  if (
    sheet.getLastRow() > 1
  ) {

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
    .setValues(
      categories
    );
}


/*******************************************************
 * DEDICATED SETTINGS
 *******************************************************/

function setupDedicatedSettings_(
  spreadsheet
) {

  const sheet =
    spreadsheet.getSheetByName(
      SHEETS.SETTINGS
    );

  if (
    sheet.getLastRow() > 1
  ) {

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
    .setValues(
      settings
    );
}


/*******************************************************
 * DEDICATED ELECTRICITY RATE
 *******************************************************/

function setupDedicatedRate_(
  spreadsheet
) {

  const sheet =
    spreadsheet.getSheetByName(
      SHEETS.RATES
    );

  if (
    sheet.getLastRow() > 1
  ) {

    return;
  }

  const now =
    new Date();

  sheet
    .getRange(
      2,
      1,
      1,
      6
    )
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


/*******************************************************
 * DEDICATED SPREADSHEET FORMATTING
 *******************************************************/

function formatDedicatedSpreadsheet_(
  spreadsheet
) {

  const sheetNames = [
    SHEETS.USERS,
    SHEETS.APPLIANCES,
    SHEETS.CATEGORIES,
    SHEETS.RATES,
    SHEETS.ESTIMATES,
    SHEETS.BILLS,
    SHEETS.ALERTS,
    SHEETS.SETTINGS
  ];

  sheetNames.forEach(
    function(sheetName) {

      const sheet =
        spreadsheet.getSheetByName(
          sheetName
        );

      if (!sheet) {
        return;
      }

      const lastColumn =
        sheet.getLastColumn();

      if (
        lastColumn > 0
      ) {

        sheet
          .getRange(
            1,
            1,
            1,
            lastColumn
          )
          .setFontWeight(
            'bold'
          )
          .setBackground(
            '#79d862'
          );

        sheet.setFrozenRows(
          1
        );

        for (
          let column = 1;
          column <= lastColumn;
          column++
        ) {

          sheet.autoResizeColumn(
            column
          );
        }
      }

    }
  );
}


/*******************************************************
 * USER SPREADSHEET INFORMATION
 *******************************************************/

/**
 * Returns information about the user's
 * dedicated spreadsheet.
 */
function getUserSpreadsheetInfo_(
  user
) {

  if (!user) {

    return null;
  }

  const spreadsheetId =
    toSafeString(
      user['Spreadsheet ID']
    );

  if (!spreadsheetId) {

    return null;
  }

  try {

    const spreadsheet =
      SpreadsheetApp.openById(
        spreadsheetId
      );

    return {

      id:
        spreadsheet.getId(),

      name:
        spreadsheet.getName(),

      url:
        spreadsheet.getUrl(),

      created:
        false

    };

  } catch (error) {

    return null;
  }
}


/**
 * Public function for retrieving the
 * household spreadsheet.
 */



function getUserSpreadsheet(userId) {

  try {

    const user =
      getUserById(
        userId
      );

    if (!user) {

      throw new Error(
        'User not found.'
      );

    }

    const info =
      getUserSpreadsheetInfo_(
        user
      );

    if (info) {

      return {
        success: true,
        data: info,
        message: 'Household spreadsheet found.'
      };

    }

    const created =
      createUserSpreadsheet(
        userId
      );

    return {
      success: true,
      data: created,
      message: 'Household spreadsheet created.'
    };

  } catch (error) {

    console.error(
      'getUserSpreadsheet ERROR:'
    );

    console.error(
      error.message
    );

    console.error(
      error.stack
    );

    return {
      success: false,
      data: null,
      message:
        'Unable to load household spreadsheet: ' +
        error.message
    };

  }

}





/*******************************************************
 * LAST LOGIN
 *******************************************************/

function updateLastLogin_(
  userId
) {

  try {

    const row =
      findRowById(
        SHEETS.USERS,
        'User ID',
        userId
      );

    if (
      row === -1
    ) {

      return false;
    }

    const sheet =
      getSheet(
        SHEETS.USERS
      );

    const now =
      getNow();

    sheet
      .getRange(
        row,
        USER_COLUMNS.LAST_LOGIN
      )
      .setValue(
        now
      );

    sheet
      .getRange(
        row,
        USER_COLUMNS.UPDATED_AT
      )
      .setValue(
        now
      );

    return true;

  } catch (error) {

    console.warn(
      'Unable to update last login: ' +
      error.message
    );

    return false;
  }
}


/*******************************************************
 * HOUSEHOLD SUMMARY
 *******************************************************/

function getUserSummary(
  userId
) {

  try {

    const user =
  getUserById(userId);

if (!user) {

  throw new Error(
    'Household profile not found. ' +
    'The appliance form sent User ID: [' +
    userId +
    ']. ' +
    'Please check that this exact value exists in the Users sheet under the "User ID" column.'
  );

}

    const applianceRecords =
      getSheetRecords(
        SHEETS.APPLIANCES
      );

    const userAppliances =
      applianceRecords.filter(
        function(appliance) {

          return (
            toSafeString(
              appliance['User ID']
            ) ===
            toSafeString(
              userId
            )
          );

        }
      );

    const activeAppliances =
      userAppliances.filter(
        function(appliance) {

          return (
            normalizeStatus(
              appliance['Status']
            ).toLowerCase() ===
            'active'
          );

        }
      );

    return successResponse({

      user:
        user,

      totalAppliances:
        userAppliances.length,

      activeAppliances:
        activeAppliances.length,

      inactiveAppliances:
        userAppliances.length -
        activeAppliances.length,

      spreadsheet:
        getUserSpreadsheetInfo_(
          user
        )

    });

  } catch (error) {

    return errorResponse(
      error,
      'Unable to load household summary.'
    );
  }
}


/*******************************************************
 * ADMIN: CREATE MISSING USER SPREADSHEETS
 *******************************************************/

/**
 * Creates dedicated spreadsheets for all
 * ALLOWED users who do not have one yet.
 *
 * Useful after migrating an existing Users sheet.
 */
function createMissingUserSpreadsheets() {

  try {

    ensureUserAccessColumns();

    const users =
      getSheetRecords(
        SHEETS.USERS
      );

    let created =
      0;

    let skipped =
      0;

    const results = [];

    users.forEach(
      function(user) {

        const accessStatus =
          toSafeString(
            user['Access Status']
          ).toUpperCase();

        if (
          accessStatus !==
          USER_ACCESS_ALLOWED
        ) {

          skipped++;

          return;
        }

        const existingSpreadsheet =
          toSafeString(
            user['Spreadsheet ID']
          );

        if (
          existingSpreadsheet
        ) {

          skipped++;

          return;
        }

        try {

          const result =
            createUserSpreadsheet(
              user['User ID']
            );

          created++;

          results.push({
            email:
              user['Email'],

            success:
              true,

            spreadsheet:
              result
          });

        } catch (error) {

          results.push({
            email:
              user['Email'],

            success:
              false,

            message:
              error.message
          });

        }

      }
    );

    return {
      success: true,
      created: created,
      skipped: skipped,
      results: results,
      message:
        'Missing household spreadsheets processed.'
    };

  } catch (error) {

    return errorResponse(
      error,
      'Unable to create missing household spreadsheets.'
    );
  }
}

function ensureUserAccessColumns() {

  const sheet =
    getSheet(
      SHEETS.USERS
    );

  const requiredHeaders = [
    'User ID',
    'Email',
    'Name',
    'Household Name',
    'Created At',
    'Status',
    'Access Status',
    'Spreadsheet ID',
    'Spreadsheet URL',
    'Last Login',
    'Updated At'
  ];

  const currentLastColumn =
    sheet.getLastColumn();

  // If the sheet is completely empty
  if (currentLastColumn === 0) {

    sheet
      .getRange(
        1,
        1,
        1,
        requiredHeaders.length
      )
      .setValues([
        requiredHeaders
      ]);

    sheet.setFrozenRows(1);

    return true;
  }

  const currentHeaders =
    sheet
      .getRange(
        1,
        1,
        1,
        currentLastColumn
      )
      .getValues()[0];

  for (
    let i = 0;
    i < requiredHeaders.length;
    i++
  ) {

    const expectedHeader =
      requiredHeaders[i];

    const existingHeader =
      currentHeaders[i];

    if (
      toSafeString(
        existingHeader
      ) !==
      expectedHeader
    ) {

      sheet
        .getRange(
          1,
          i + 1
        )
        .setValue(
          expectedHeader
        );
    }
  }

  sheet.setFrozenRows(1);

  return true;
}



/*******************************************************
 * TEST FUNCTIONS
 *******************************************************/

/**
 * Tests the access-control system.
 *
 * This does NOT create a test user.
 */
function testUserAccessModule() {

  try {

    ensureUserAccessColumns();

    return {
      success: true,

      message:
        'User access module is working.',

      usersSheet:
        SHEETS.USERS,

      accessColumn:
        USER_COLUMNS.ACCESS_STATUS,

      allowedValue:
        USER_ACCESS_ALLOWED,

      blockedValue:
        USER_ACCESS_BLOCKED
    };

  } catch (error) {

    return {
      success: false,
      message:
        error.message
    };
  }
}


/**
 * Tests dedicated spreadsheet creation
 * using an existing ALLOWED user.
 *
 * Run this only after adding an email
 * to Users and setting Access Status
 * to ALLOWED.
 */

function testCreateUserSpreadsheet() {

  try {

    ensureUserAccessColumns();

    const users =
      getSheetRecords(
        SHEETS.USERS
      );

    let testUser = null;

    for (
      let i = 0;
      i < users.length;
      i++
    ) {

      const accessStatus =
        toSafeString(
          users[i]['Access Status']
        ).toUpperCase();

      const spreadsheetId =
        toSafeString(
          users[i]['Spreadsheet ID']
        );

      if (
        accessStatus ===
        USER_ACCESS_ALLOWED &&
        !spreadsheetId
      ) {

        testUser =
          users[i];

        break;
      }

    }

    if (!testUser) {

      console.log(
        'ERROR: No ALLOWED user without a Spreadsheet ID was found.'
      );

      return {

        success: false,

        message:
          'No ALLOWED user without a Spreadsheet ID was found. Add a new ALLOWED user and leave Spreadsheet ID blank.'

      };

    }

    console.log(
      'Testing NEW user: ' +
      testUser['Email']
    );

    console.log(
      'User ID: ' +
      testUser['User ID']
    );

    console.log(
      'Household Name: ' +
      testUser['Household Name']
    );

    console.log(
      'Access Status: ' +
      testUser['Access Status']
    );

    console.log(
      'Existing Spreadsheet ID: ' +
      toSafeString(
        testUser['Spreadsheet ID']
      )
    );

    console.log(
      'Main Users Sheet: ' +
      SHEETS.USERS
    );

    console.log(
      'Starting createUserSpreadsheet...'
    );

    const result =
      createUserSpreadsheet(
        testUser['User ID']
      );

    console.log(
      'createUserSpreadsheet result:'
    );

    console.log(
      JSON.stringify(
        result
      )
    );

    const updatedUser =
      getUserById(
        testUser['User ID']
      );

    console.log(
      'Updated user record:'
    );

    console.log(
      JSON.stringify(
        updatedUser
      )
    );

    return {

      success: true,

      message:
        'New user dedicated spreadsheet test completed.',

      user:
        updatedUser,

      spreadsheet:
        result

    };

  } catch (error) {

    console.error(
      'TEST ERROR:'
    );

    console.error(
      error.message
    );

    console.error(
      error.stack
    );

    return {

      success: false,

      message:
        error.message,

      stack:
        error.stack

    };

  }

}



function debugUsersSheet() {

  try {

    ensureUserAccessColumns();

    const users =
      getSheetRecords(
        SHEETS.USERS
      );

    console.log(
      'TOTAL USERS FOUND: ' +
      users.length
    );

    users.forEach(
      function(user, index) {

        console.log(
          'USER #' + (index + 1)
        );

        console.log(
          'User ID: [' +
          toSafeString(user['User ID']) +
          ']'
        );

        console.log(
          'Email: [' +
          toSafeString(user['Email']) +
          ']'
        );

        console.log(
          'Name: [' +
          toSafeString(user['Name']) +
          ']'
        );

        console.log(
          'Access Status: [' +
          toSafeString(user['Access Status']) +
          ']'
        );

        console.log(
          'Spreadsheet ID: [' +
          toSafeString(user['Spreadsheet ID']) +
          ']'
        );

        console.log(
          '-----------------------------'
        );

      }
    );

    return {
      success: true,
      usersFound: users.length
    };

  } catch (error) {

    console.error(
      'DEBUG ERROR:'
    );

    console.error(
      error.message
    );

    console.error(
      error.stack
    );

    return {
      success: false,
      message: error.message
    };

  }

}





function testShareUserSpreadsheet() {

  const userId = 'USER-006';

  console.log(
    'Testing share for User ID: ' +
    userId
  );

  const result =
    shareUserSpreadsheet(
      userId
    );

  console.log(
    'Share result:'
  );

  console.log(
    JSON.stringify(
      result
    )
  );

}








function testMoveUser004Spreadsheet() {

  try {

    const spreadsheetId =
      '1m60UT9M_16IvmXnuldbDHgPhe7o_Z6PvLrzHY4uN-ns';

    const folderId =
      '1_2X6nKmzFzkoleWaLPpmD7kIaFsmihss';

    const spreadsheetFile =
      DriveApp.getFileById(
        spreadsheetId
      );

    const targetFolder =
      DriveApp.getFolderById(
        folderId
      );

    console.log(
      'Spreadsheet before move: ' +
      spreadsheetFile.getName()
    );

    console.log(
      'Target folder: ' +
      targetFolder.getName()
    );

    spreadsheetFile.moveTo(
      targetFolder
    );

    console.log(
      'Spreadsheet moved successfully.'
    );

    console.log(
      'Spreadsheet ID: ' +
      spreadsheetId
    );

    console.log(
      'Target folder ID: ' +
      folderId
    );

  } catch (error) {

    console.error(
      'MOVE ERROR:'
    );

    console.error(
      error.message
    );

    console.error(
      error.stack
    );

  }

}





function shareUserSpreadsheet(userId) {

  try {

    const sheet =
      getSheet(
        SHEETS.USERS
      );

    if (!sheet) {
      throw new Error(
        'Users sheet not found.'
      );
    }

    const data =
      sheet.getDataRange().getValues();

    if (data.length < 2) {
      throw new Error(
        'No users found in the Users sheet.'
      );
    }

    const headers =
      data[0];

    const userIdColumn =
      headers.indexOf('User ID');

    const emailColumn =
      headers.indexOf('Email');

    const spreadsheetIdColumn =
      headers.indexOf('Spreadsheet ID');

    if (userIdColumn === -1) {
      throw new Error(
        'User ID column not found.'
      );
    }

    if (emailColumn === -1) {
      throw new Error(
        'Email column not found.'
      );
    }

    if (spreadsheetIdColumn === -1) {
      throw new Error(
        'Spreadsheet ID column not found.'
      );
    }

    let userRow = null;

    for (
      let i = 1;
      i < data.length;
      i++
    ) {

      const currentUserId =
        String(
          data[i][userIdColumn] || ''
        ).trim();

      if (
        currentUserId ===
        String(userId).trim()
      ) {

        userRow =
          data[i];

        break;
      }
    }

    if (!userRow) {

      throw new Error(
        'User ID not found in Users sheet: ' +
        userId
      );

    }

    const email =
      String(
        userRow[emailColumn] || ''
      ).trim();

    const spreadsheetId =
      String(
        userRow[spreadsheetIdColumn] || ''
      ).trim();

    console.log(
      'User ID: ' +
      userId
    );

    console.log(
      'Email: ' +
      email
    );

    console.log(
      'Spreadsheet ID: ' +
      spreadsheetId
    );

    if (!email) {

      throw new Error(
        'User email is blank.'
      );

    }

    if (!spreadsheetId) {

      throw new Error(
        'User does not have a dedicated spreadsheet yet.'
      );

    }

    /**
     * Confirm spreadsheet exists.
     */
    const spreadsheet =
      SpreadsheetApp.openById(
        spreadsheetId
      );

    console.log(
      'Spreadsheet opened: ' +
      spreadsheet.getName()
    );

    /**
     * Check existing permissions first.
     */
    const permissions =
      Drive.Permissions.list(
        spreadsheetId
      );

    const existingPermissions =
      permissions.permissions || [];

    let alreadyShared = false;

    for (
      let i = 0;
      i < existingPermissions.length;
      i++
    ) {

      const permission =
        existingPermissions[i];

      if (
        permission.emailAddress &&
        permission.emailAddress.toLowerCase() ===
        email.toLowerCase()
      ) {

        alreadyShared = true;

        console.log(
          'User already has access.'
        );

        break;
      }
    }

    /**
     * Create editor permission if needed.
     */
    if (!alreadyShared) {

      const permission = {
        type: 'user',
        role: 'writer',
        emailAddress: email
      };

      Drive.Permissions.create(
        permission,
        spreadsheetId,
        {
          sendNotificationEmail: true
        }
      );

      console.log(
        'Drive API permission created successfully.'
      );

    }

    return {

      success: true,

      userId:
        userId,

      email:
        email,

      spreadsheetId:
        spreadsheetId,

      spreadsheetUrl:
        spreadsheet.getUrl(),

      alreadyShared:
        alreadyShared,

      message:
        alreadyShared
          ? 'User already has access.'
          : 'Spreadsheet successfully shared with ' + email

    };

  } catch (error) {

    console.error(
      'Unable to share user spreadsheet:'
    );

    console.error(
      error.message
    );

    console.error(
      error.stack
    );

    return {

      success: false,

      message:
        error.message

    };

  }

}






function testCurrentEnvironment() {

  console.log('========== CURRENT ENVIRONMENT ==========');

  // Current executing Google account
  try {
    console.log(
      'Active user email: ' +
      Session.getActiveUser().getEmail()
    );
  } catch (error) {
    console.log(
      'Active user email: ERROR - ' +
      error.message
    );
  }

  // Effective account running the script
  try {
    console.log(
      'Effective user email: ' +
      Session.getEffectiveUser().getEmail()
    );
  } catch (error) {
    console.log(
      'Effective user email: ERROR - ' +
      error.message
    );
  }

  // Current spreadsheet
  try {

    const spreadsheet =
      SpreadsheetApp.getActiveSpreadsheet();

    if (spreadsheet) {

      console.log(
        'Active spreadsheet name: ' +
        spreadsheet.getName()
      );

      console.log(
        'Active spreadsheet ID: ' +
        spreadsheet.getId()
      );

      console.log(
        'Active spreadsheet URL: ' +
        spreadsheet.getUrl()
      );

    } else {

      console.log(
        'Active spreadsheet: NONE'
      );

    }

  } catch (error) {

    console.log(
      'Active spreadsheet ERROR: ' +
      error.message
    );

  }

  // Script timezone
  console.log(
    'Script timezone: ' +
    Session.getScriptTimeZone()
  );

  console.log(
    '========================================'
  );

}




function testGetUserSpreadsheet() {

  const userId = 'USER-005';

  console.log(
    '========== TEST getUserSpreadsheet =========='
  );

  const result =
    getUserSpreadsheet(
      userId
    );

  console.log(
    'RESULT TYPE:'
  );

  console.log(
    typeof result
  );

  console.log(
    'RESULT:'
  );

  console.log(
    result
  );

  console.log(
    'JSON RESULT:'
  );

  console.log(
    JSON.stringify(
      result
    )
  );

  if (
    result &&
    typeof result === 'object'
  ) {

    console.log(
      'RESULT KEYS:'
    );

    console.log(
      Object.keys(
        result
      )
    );

  }

  console.log(
    '============================================'
  );

}



function testCompleteUserFlow() {

  try {

    const userId = 'USER-006';

    console.log(
      '========== COMPLETE USER FLOW =========='
    );

    // STEP 1 — Find user
    const user =
      getUserById(userId);

    if (!user) {
      throw new Error(
        'User was not found.'
      );
    }

    console.log(
      'STEP 1 OK — User found'
    );

    console.log(
      'User ID: ' +
      user['User ID']
    );

    console.log(
      'Email: ' +
      user['Email']
    );

    console.log(
      'Access Status: ' +
      user['Access Status']
    );


    // STEP 2 — Check access
    const accessStatus =
      toSafeString(
        user['Access Status']
      ).toUpperCase();

    if (
      accessStatus !==
      USER_ACCESS_ALLOWED
    ) {

      throw new Error(
        'User access is not ALLOWED.'
      );

    }

    console.log(
      'STEP 2 OK — User is ALLOWED'
    );


    // STEP 3 — Get spreadsheet info
    const spreadsheetInfo =
      getUserSpreadsheetInfo_(
        user
      );

    if (!spreadsheetInfo) {

      throw new Error(
        'User does not have a valid dedicated spreadsheet.'
      );

    }

    console.log(
      'STEP 3 OK — Spreadsheet found'
    );

    console.log(
      'Spreadsheet ID: ' +
      spreadsheetInfo.id
    );

    console.log(
      'Spreadsheet Name: ' +
      spreadsheetInfo.name
    );

    console.log(
      'Spreadsheet URL: ' +
      spreadsheetInfo.url
    );


    // STEP 4 — Open spreadsheet
    const spreadsheet =
      SpreadsheetApp.openById(
        spreadsheetInfo.id
      );

    console.log(
      'STEP 4 OK — Spreadsheet opened'
    );


    // STEP 5 — List sheets
    const sheets =
      spreadsheet
        .getSheets()
        .map(
          function(sheet) {
            return sheet.getName();
          }
        );

    console.log(
      'STEP 5 OK — Sheets found'
    );

    console.log(
      JSON.stringify(
        sheets
      )
    );


    console.log(
      '========================================'
    );

    return {

      success: true,

      user: {
        id:
          user['User ID'],

        email:
          user['Email'],

        name:
          user['Name'],

        household:
          user['Household Name'],

        accessStatus:
          user['Access Status']
      },

      spreadsheet: {

        id:
          spreadsheet.getId(),

        name:
          spreadsheet.getName(),

        url:
          spreadsheet.getUrl(),

        sheets:
          sheets

      },

      message:
        'Complete user-to-household-spreadsheet flow is working.'

    };


  } catch (error) {

    console.error(
      'COMPLETE USER FLOW ERROR:'
    );

    console.error(
      error.message
    );

    console.error(
      error.stack
    );

    return {

      success: false,

      message:
        error.message,

      stack:
        error.stack

    };

  }

}



function testGetUserIdByEmail() {

  const result =
    getUserIdByEmail(
      'trexia.olaya@pdax.ph'
    );

  console.log(
    JSON.stringify(result)
  );

  return result;
}





function getUserSpreadsheetId(userId) {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const sheet =
    ss.getSheetByName("Users");


  if (!sheet) {
    throw new Error("Users sheet not found.");
  }


  const data =
    sheet.getDataRange().getValues();


  const headers =
    data[0];


  const userIdCol =
    headers.indexOf("User ID");


  const spreadsheetIdCol =
    headers.indexOf("Spreadsheet ID");


  if (
    userIdCol === -1 ||
    spreadsheetIdCol === -1
  ) {

    throw new Error(
      "Users sheet missing Spreadsheet ID column."
    );

  }


  for (
    let i = 1;
    i < data.length;
    i++
  ) {

    if (
      String(data[i][userIdCol]).trim()
      ===
      String(userId).trim()
    ) {

      return String(
        data[i][spreadsheetIdCol]
      ).trim();

    }

  }


  return "";
}


/**
 * One-time password setup
 * Run manually from Apps Script editor.
 */
function setUserPassword(email, password) {

  const sheet =
    SpreadsheetApp
      .getActive()
      .getSheetByName(
        SHEETS.USERS
      );


  const data =
    sheet
      .getDataRange()
      .getValues();


  const headers =
    data[0];


  const emailCol =
    headers.indexOf("Email");


  const passwordCol =
    headers.indexOf("Password Hash");


  if (
    passwordCol === -1
  ) {

    throw new Error(
      "Password Hash column not found."
    );

  }


  for (
    let i = 1;
    i < data.length;
    i++
  ) {


    if (
      String(data[i][emailCol])
        .toLowerCase()
        ===
      email.toLowerCase()
    ) {


      sheet
        .getRange(
          i + 1,
          passwordCol + 1
        )
        .setValue(
          hashPassword(password)
        );


      return {
        success:true,
        message:
          "Password updated."
      };

    }

  }


  return {
    success:false,
    message:
      "Email not found."
  };

}



/*******************************************************
 * PASSWORD RESET SYSTEM
 *******************************************************/


function requestPasswordReset(email) {

  const users =
    getSheetRecords(
      SHEETS.USERS
    );


  const user =
    users.find(function(row){

      return (
        toSafeString(row.Email)
        .toLowerCase()
        ===
        email.toLowerCase()
      );

    });


  if (!user) {

    return {
      success:false,
      message:"Email account not found."
    };

  }


  const sheet =
    getSheet(
      SHEETS.PASSWORD_RESETS
    );


  const code =
    Math.floor(
      100000 +
      Math.random() * 900000
    )
    .toString();


  const now =
    new Date();


  const expiry =
    new Date(
      now.getTime() + (10 * 60 * 1000)
    );


  const resetId =
    "RESET-" + Date.now();


  sheet.appendRow([

    resetId,

    email,

    code,

    now,

    expiry,

    false,

    "ACTIVE"

  ]);


  return {

    success:true,

    message:
      "Reset code generated.",

    code:code

  };

}



function resetPassword(
  email,
  code,
  newPassword
) {


  const sheet =
    getSheet(
      SHEETS.PASSWORD_RESETS
    );


  const data =
    sheet
      .getDataRange()
      .getValues();



  for(
    let i = 1;
    i < data.length;
    i++
  ) {


    const rowEmail =
      toSafeString(
        data[i][1]
      )
      .toLowerCase();


    const rowCode =
      toSafeString(
        data[i][2]
      );


    const used =
      data[i][5];


    if(
      rowEmail === email.toLowerCase()
      &&
      rowCode === code
      &&
      used !== true
    ) {


      const expiry =
        new Date(
          data[i][4]
        );


      if(
        new Date() > expiry
      ) {

        return {

          success:false,

          message:
          "Reset code expired."

        };

      }



      setUserPassword(
        email,
        newPassword
      );



      sheet
        .getRange(
          i + 1,
          6
        )
        .setValue(
          true
        );


      sheet
        .getRange(
          i + 1,
          7
        )
        .setValue(
          "COMPLETED"
        );



      return {

        success:true,

        message:
        "Password updated successfully."

      };


    }

  }



  return {

    success:false,

    message:
    "Invalid reset code."

  };


}

