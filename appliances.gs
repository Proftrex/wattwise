/**
 * ============================================================
 * HOUSEHOLD ELECTRICITY TRACKER
 * appliances.gs
 *
 * Handles appliance CRUD operations, validation,
 * categories, and appliance-specific fields.
 *
 * IMPORTANT:
 * Appliance records are stored in the user's
 * individual spreadsheet, based on the Spreadsheet ID
 * stored in the main Users sheet.
 * ============================================================
 */




/**
 * ============================================================
 * GET USER SHEET
 * ============================================================
 *
 * Gets a specific sheet from the user's spreadsheet.
 */
function getUserSheet(
  userId,
  sheetName
) {

  const spreadsheet =
  openUserSpreadsheet(userId);

  const sheet =
    spreadsheet.getSheetByName(
      sheetName
    );

  if (!sheet) {

    throw new Error(
      'Sheet "' +
      sheetName +
      '" does not exist in the user spreadsheet.'
    );

  }

  return sheet;
}


/**
 * ============================================================
 * GET USER SHEET RECORDS
 * ============================================================
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


/**
 * ============================================================
 * GET APPLIANCE CATEGORIES
 * ============================================================
 */
function getApplianceCategories() {

  try {

    const records =
      getSheetRecords(
        SHEETS.CATEGORIES
      );

    const activeCategories =
      records.filter(
        function(category) {

          return (
            normalizeStatus(
              category['Status']
            ).toLowerCase() ===
            'active'
          );

        }
      );

    return successResponse(
      serializeRecords(
        activeCategories
      ),
      'Categories loaded successfully.'
    );

  } catch (error) {

    return errorResponse(
      error,
      'Unable to load appliance categories.'
    );

  }
}


/**
 * ============================================================
 * GET ALL APPLIANCES
 * ============================================================
 */
function getAppliances(userId) {

  try {

    userId =
      toSafeString(
        userId
      );

    if (!userId) {

      throw new Error(
        'User ID is required.'
      );

    }

    const records =
      getUserSheetRecords(
        userId,
        SHEETS.APPLIANCES
      );

    const userAppliances =
      records.filter(
        function(appliance) {

          return (
            toSafeString(
              appliance['User ID']
            ) === userId
          );

        }
      );

    return successResponse(
      serializeRecords(
        userAppliances
      ),
      'Appliances loaded successfully.'
    );

  } catch (error) {

    return errorResponse(
      error,
      'Unable to load appliances.'
    );

  }
}


/**
 * ============================================================
 * GET ACTIVE APPLIANCES
 * ============================================================
 */
function getActiveAppliances(userId) {

  try {

    userId =
      toSafeString(
        userId
      );

    if (!userId) {

      throw new Error(
        'User ID is required.'
      );

    }

    const records =
      getUserSheetRecords(
        userId,
        SHEETS.APPLIANCES
      );

    const activeAppliances =
      records.filter(
        function(appliance) {

          return (
            toSafeString(
              appliance['User ID']
            ) === userId
            &&
            normalizeStatus(
              appliance['Status']
            ).toLowerCase() ===
            'active'
          );

        }
      );

    return successResponse(
      serializeRecords(
        activeAppliances
      ),
      'Active appliances loaded successfully.'
    );

  } catch (error) {

    return errorResponse(
      error,
      'Unable to load active appliances.'
    );

  }
}


/**
 * ============================================================
 * GET SINGLE APPLIANCE
 * ============================================================
 */
function getAppliance(
  applianceId,
  userId
) {

  try {

    applianceId =
      toSafeString(
        applianceId
      );

    userId =
      toSafeString(
        userId
      );

    if (!applianceId) {

      throw new Error(
        'Appliance ID is required.'
      );

    }

    if (!userId) {

      throw new Error(
        'User ID is required.'
      );

    }

    const records =
      getUserSheetRecords(
        userId,
        SHEETS.APPLIANCES
      );

    for (
      let i = 0;
      i < records.length;
      i++
    ) {

      if (
        toSafeString(
          records[i]['Appliance ID']
        ) === applianceId
      ) {

        return successResponse(
          serializeRecord(
            records[i]
          ),
          'Appliance loaded successfully.'
        );

      }

    }

    throw new Error(
      'Appliance not found.'
    );

  } catch (error) {

    return errorResponse(
      error,
      'Unable to load appliance.'
    );

  }
}


/**
 * ============================================================
 * ADD APPLIANCE
 * ============================================================
 */
function addAppliance(data) {

  try {

    validateApplianceData(
      data
    );

    const userId =
      toSafeString(
        data.userId
      );

    const sheet =
      getUserSheet(
        userId,
        SHEETS.APPLIANCES
      );

    const applianceId =
      generateId(
        'APP'
      );

    const now =
      getNow();

    const normalized =
      normalizeApplianceData(
        data
      );

    const row = [

      applianceId,

      normalized.userId,

      normalized.applianceName,

      normalized.category,

      normalized.brand,

      normalized.model,

      normalized.wattage,

      normalized.quantity,

      normalized.usageType,

      normalized.hoursPerDay,

      normalized.usesPerDay,

      normalized.usesPerWeek,

      normalized.usesPerMonth,

      normalized.daysPerMonth,

      normalized.loadFactor,

      normalized.estimatedKwhPerDay,

      normalized.airconHp,

      normalized.airconType,

      normalized.cookingHours,

      normalized.warmModeHours,

      normalized.notes,

      'Active',

      now,

      now

    ];

    sheet.appendRow(
      row
    );

    const appliance =
      getAppliance(
        applianceId,
        userId
      );

    return successResponse(
      appliance.data,
      'Appliance added successfully.'
    );

  } catch (error) {

    return errorResponse(
      error,
      'Unable to add appliance.'
    );

  }
}


/**
 * ============================================================
 * UPDATE APPLIANCE
 * ============================================================
 */
function updateAppliance(data) {

  try {

    const applianceId =
      toSafeString(
        data &&
        data.applianceId
      );

    const userId =
      toSafeString(
        data &&
        data.userId
      );

    if (!applianceId) {

      throw new Error(
        'Appliance ID is required.'
      );

    }

    if (!userId) {

      throw new Error(
        'User ID is required.'
      );

    }

    const records =
      getUserSheetRecords(
        userId,
        SHEETS.APPLIANCES
      );

    let existing = null;
    let existingRow = -1;

    for (
      let i = 0;
      i < records.length;
      i++
    ) {

      if (
        toSafeString(
          records[i]['Appliance ID']
        ) === applianceId
      ) {

        existing =
          records[i];

        existingRow =
          i + 2;

        break;

      }

    }

    if (!existing) {

      throw new Error(
        'Appliance not found.'
      );

    }

    validateApplianceData(
      data
    );

    const normalized =
      normalizeApplianceData(
        data
      );

    const sheet =
      getUserSheet(
        userId,
        SHEETS.APPLIANCES
      );

    const createdAt =
      existing['Created At'] ||
      getNow();

    const updatedAt =
      getNow();

    const rowData = [

      applianceId,

      normalized.userId,

      normalized.applianceName,

      normalized.category,

      normalized.brand,

      normalized.model,

      normalized.wattage,

      normalized.quantity,

      normalized.usageType,

      normalized.hoursPerDay,

      normalized.usesPerDay,

      normalized.usesPerWeek,

      normalized.usesPerMonth,

      normalized.daysPerMonth,

      normalized.loadFactor,

      normalized.estimatedKwhPerDay,

      normalized.airconHp,

      normalized.airconType,

      normalized.cookingHours,

      normalized.warmModeHours,

      normalized.notes,

      normalizeStatus(
        data.status ||
        existing['Status']
      ),

      createdAt,

      updatedAt

    ];

    sheet
      .getRange(
        existingRow,
        1,
        1,
        rowData.length
      )
      .setValues([
        rowData
      ]);

    const appliance =
      getAppliance(
        applianceId,
        userId
      );

    return successResponse(
      appliance.data,
      'Appliance updated successfully.'
    );

  } catch (error) {

    return errorResponse(
      error,
      'Unable to update appliance.'
    );

  }
}


/**
 * ============================================================
 * DELETE APPLIANCE
 * ============================================================
 */
function deleteAppliance(
  applianceId,
  userId
) {

  try {

    applianceId =
      toSafeString(
        applianceId
      );

    userId =
      toSafeString(
        userId
      );

    if (!applianceId) {

      throw new Error(
        'Appliance ID is required.'
      );

    }

    if (!userId) {

      throw new Error(
        'User ID is required.'
      );

    }

    const sheet =
      getUserSheet(
        userId,
        SHEETS.APPLIANCES
      );

    const records =
      getUserSheetRecords(
        userId,
        SHEETS.APPLIANCES
      );

    for (
      let i = 0;
      i < records.length;
      i++
    ) {

      if (
        toSafeString(
          records[i]['Appliance ID']
        ) === applianceId
      ) {

        sheet.deleteRow(
          i + 2
        );

        return successResponse(
          null,
          'Appliance deleted successfully.'
        );

      }

    }

    throw new Error(
      'Appliance not found.'
    );

  } catch (error) {

    return errorResponse(
      error,
      'Unable to delete appliance.'
    );

  }
}


/**
 * ============================================================
 * DEACTIVATE APPLIANCE
 * ============================================================
 */
function deactivateAppliance(
  applianceId,
  userId
) {

  try {

    applianceId =
      toSafeString(
        applianceId
      );

    userId =
      toSafeString(
        userId
      );

    if (!applianceId) {

      throw new Error(
        'Appliance ID is required.'
      );

    }

    if (!userId) {

      throw new Error(
        'User ID is required.'
      );

    }

    const sheet =
      getUserSheet(
        userId,
        SHEETS.APPLIANCES
      );

    const records =
      getUserSheetRecords(
        userId,
        SHEETS.APPLIANCES
      );

    for (
      let i = 0;
      i < records.length;
      i++
    ) {

      if (
        toSafeString(
          records[i]['Appliance ID']
        ) === applianceId
      ) {

        const row =
          i + 2;

        sheet
          .getRange(
            row,
            22
          )
          .setValue(
            'Inactive'
          );

        sheet
          .getRange(
            row,
            24
          )
          .setValue(
            getNow()
          );

        return successResponse(
          getAppliance(
            applianceId,
            userId
          ).data,
          'Appliance deactivated successfully.'
        );

      }

    }

    throw new Error(
      'Appliance not found.'
    );

  } catch (error) {

    return errorResponse(
      error,
      'Unable to deactivate appliance.'
    );

  }
}


/**
 * ============================================================
 * REACTIVATE APPLIANCE
 * ============================================================
 */
function reactivateAppliance(
  applianceId,
  userId
) {

  try {

    applianceId =
      toSafeString(
        applianceId
      );

    userId =
      toSafeString(
        userId
      );

    if (!applianceId) {

      throw new Error(
        'Appliance ID is required.'
      );

    }

    if (!userId) {

      throw new Error(
        'User ID is required.'
      );

    }

    const sheet =
      getUserSheet(
        userId,
        SHEETS.APPLIANCES
      );

    const records =
      getUserSheetRecords(
        userId,
        SHEETS.APPLIANCES
      );

    for (
      let i = 0;
      i < records.length;
      i++
    ) {

      if (
        toSafeString(
          records[i]['Appliance ID']
        ) === applianceId
      ) {

        const row =
          i + 2;

        sheet
          .getRange(
            row,
            22
          )
          .setValue(
            'Active'
          );

        sheet
          .getRange(
            row,
            24
          )
          .setValue(
            getNow()
          );

        return successResponse(
          getAppliance(
            applianceId,
            userId
          ).data,
          'Appliance reactivated successfully.'
        );

      }

    }

    throw new Error(
      'Appliance not found.'
    );

  } catch (error) {

    return errorResponse(
      error,
      'Unable to reactivate appliance.'
    );

  }
}


/**
 * ============================================================
 * NORMALIZE APPLIANCE DATA
 * ============================================================
 */
function normalizeApplianceData(data) {

  const usageType =
    toSafeString(
      data.usageType
    ) ||
    'Hours per day';

  let loadFactor =
    toNumber(
      data.loadFactor
    );

  if (loadFactor > 1) {
    loadFactor =
      loadFactor / 100;
  }

  if (loadFactor <= 0) {
    loadFactor = 1;
  }

  loadFactor =
    clamp(
      loadFactor,
      0,
      1
    );

  return {

    userId:
      toSafeString(
        data.userId
      ),

    applianceName:
      toSafeString(
        data.applianceName
      ),

    category:
      toSafeString(
        data.category
      ),

    brand:
      toSafeString(
        data.brand
      ),

    model:
      toSafeString(
        data.model
      ),

    wattage:
      toPositiveNumber(
        data.wattage
      ),

    quantity:
      toPositiveNumber(
        data.quantity
      ) || 1,

    usageType:
      usageType,

    hoursPerDay:
      toPositiveNumber(
        data.hoursPerDay
      ),

    usesPerDay:
      toPositiveNumber(
        data.usesPerDay
      ),

    usesPerWeek:
      toPositiveNumber(
        data.usesPerWeek
      ),

    usesPerMonth:
      toPositiveNumber(
        data.usesPerMonth
      ),

    daysPerMonth:
      toPositiveNumber(
        data.daysPerMonth
      ) || 30,

    loadFactor:
      loadFactor,

    estimatedKwhPerDay:
      toPositiveNumber(
        data.estimatedKwhPerDay
      ),

    airconHp:
      toPositiveNumber(
        data.airconHp
      ),

    airconType:
      toSafeString(
        data.airconType
      ),

    cookingHours:
      toPositiveNumber(
        data.cookingHours
      ),

    warmModeHours:
      toPositiveNumber(
        data.warmModeHours
      ),

    notes:
      toSafeString(
        data.notes
      )

  };
}


/**
 * ============================================================
 * VALIDATE APPLIANCE DATA
 * ============================================================
 */



function validateApplianceData(data) {

  if (!data) {
    throw new Error(
      'DEBUG: No appliance data was received.'
    );
  }

  const userId =
    String(data.userId || '').trim();

  if (!userId) {
    throw new Error(
      'DEBUG: Appliance form did NOT send a User ID.'
    );
  }

  const user =
    getUserById(userId);

  if (!user) {
    throw new Error(
      'DEBUG: User ID [' +
      userId +
      '] was received, but it was NOT found in the Users sheet.'
    );
  }

  if (
    normalizeStatus(user['Status']).toLowerCase() !==
    'active'
  ) {
    throw new Error(
      'DEBUG: User ID [' +
      userId +
      '] exists, but its Status is [' +
      user['Status'] +
      '].'
    );
  }

  const applianceName =
    toSafeString(data.applianceName);

  if (!applianceName) {
    throw new Error(
      'Appliance name is required.'
    );
  }

  const category =
    toSafeString(data.category);

  if (!category) {
    throw new Error(
      'Appliance category is required.'
    );
  }

  const wattage =
    toPositiveNumber(data.wattage);

  const estimatedKwh =
    toPositiveNumber(
      data.estimatedKwhPerDay
    );

  if (
    wattage <= 0 &&
    estimatedKwh <= 0
  ) {
    throw new Error(
      'Please enter the appliance wattage or an estimated kWh per day.'
    );
  }

  const quantity =
    toPositiveNumber(data.quantity);

  if (quantity <= 0) {
    throw new Error(
      'Quantity must be greater than 0.'
    );
  }

  const usageType =
    toSafeString(data.usageType);

  if (!usageType) {
    throw new Error(
      'Usage type is required.'
    );
  }

  const allowedUsageTypes = [
    'Continuous (24/7)',
    'Hours per day',
    'Uses per day',
    'Uses per week',
    'Uses per month'
  ];

  if (
    allowedUsageTypes.indexOf(
      usageType
    ) === -1
  ) {
    throw new Error(
      'Invalid usage type.'
    );
  }

  const hoursPerDay =
    toPositiveNumber(
      data.hoursPerDay
    );

  if (
    usageType === 'Hours per day' &&
    (
      hoursPerDay <= 0 ||
      hoursPerDay > 24
    )
  ) {
    throw new Error(
      'Hours per day must be between 0 and 24.'
    );
  }

  const daysPerMonth =
    toPositiveNumber(
      data.daysPerMonth
    );

  if (
    daysPerMonth <= 0 ||
    daysPerMonth > 31
  ) {
    throw new Error(
      'Days used per month must be between 1 and 31.'
    );
  }

  let loadFactor =
    toNumber(data.loadFactor);

  if (loadFactor > 1) {
    loadFactor =
      loadFactor / 100;
  }

  if (
    loadFactor < 0 ||
    loadFactor > 1
  ) {
    throw new Error(
      'Load factor must be between 0% and 100%.'
    );
  }

  return true;
}





/**
 * ============================================================
 * SEARCH APPLIANCES
 * ============================================================
 */
function searchAppliances(
  userId,
  searchTerm
) {

  try {

    userId =
      toSafeString(
        userId
      );

    searchTerm =
      toSafeString(
        searchTerm
      ).toLowerCase();

    if (!userId) {

      throw new Error(
        'User ID is required.'
      );

    }

    const records =
      getUserSheetRecords(
        userId,
        SHEETS.APPLIANCES
      );

    const results =
      records.filter(
        function(appliance) {

          if (
            toSafeString(
              appliance['User ID']
            ) !== userId
          ) {

            return false;

          }

          if (!searchTerm) {
            return true;
          }

          const searchableText = [

            appliance['Appliance Name'],

            appliance['Category'],

            appliance['Brand'],

            appliance['Model']

          ]
            .join(' ')
            .toLowerCase();

          return (
            searchableText.indexOf(
              searchTerm
            ) !== -1
          );

        }
      );

    return successResponse(
      serializeRecords(
        results
      ),
      'Search completed successfully.'
    );

  } catch (error) {

    return errorResponse(
      error,
      'Unable to search appliances.'
    );

  }
}


/**
 * ============================================================
 * GET APPLIANCE COUNT
 * ============================================================
 */
function getApplianceCount(
  userId
) {

  try {

    const result =
      getActiveAppliances(
        userId
      );

    if (!result.success) {
      return result;
    }

    return successResponse(
      result.data.length,
      'Appliance count loaded successfully.'
    );

  } catch (error) {

    return errorResponse(
      error,
      'Unable to count appliances.'
    );

  }
}


/**
 * ============================================================
 * GET APPLIANCES BY CATEGORY
 * ============================================================
 */
function getAppliancesByCategory(
  userId,
  category
) {

  try {

    userId =
      toSafeString(
        userId
      );

    category =
      toSafeString(
        category
      );

    if (!userId) {

      throw new Error(
        'User ID is required.'
      );

    }

    const records =
      getUserSheetRecords(
        userId,
        SHEETS.APPLIANCES
      );

    const results =
      records.filter(
        function(appliance) {

          return (
            toSafeString(
              appliance['User ID']
            ) === userId
            &&
            toSafeString(
              appliance['Category']
            ).toLowerCase() ===
            category.toLowerCase()
          );

        }
      );

    return successResponse(
      serializeRecords(
        results
      ),
      'Appliances loaded successfully.'
    );

  } catch (error) {

    return errorResponse(
      error,
      'Unable to load appliances by category.'
    );

  }
}


/**
 * ============================================================
 * DUPLICATE APPLIANCE
 * ============================================================
 */
function duplicateAppliance(
  applianceId,
  userId
) {

  try {

    applianceId =
      toSafeString(
        applianceId
      );

    userId =
      toSafeString(
        userId
      );

    if (!userId) {

      throw new Error(
        'User ID is required.'
      );

    }

    const records =
      getUserSheetRecords(
        userId,
        SHEETS.APPLIANCES
      );

    let existing = null;

    for (
      let i = 0;
      i < records.length;
      i++
    ) {

      if (
        toSafeString(
          records[i]['Appliance ID']
        ) === applianceId
      ) {

        existing =
          records[i];

        break;

      }

    }

    if (!existing) {

      throw new Error(
        'Appliance not found.'
      );

    }

    const data = {

      userId:
        existing['User ID'],

      applianceName:
        existing['Appliance Name'] +
        ' Copy',

      category:
        existing['Category'],

      brand:
        existing['Brand'],

      model:
        existing['Model'],

      wattage:
        existing['Wattage'],

      quantity:
        existing['Quantity'],

      usageType:
        existing['Usage Type'],

      hoursPerDay:
        existing['Hours Per Day'],

      usesPerDay:
        existing['Uses Per Day'],

      usesPerWeek:
        existing['Uses Per Week'],

      usesPerMonth:
        existing['Uses Per Month'],

      daysPerMonth:
        existing['Days Per Month'],

      loadFactor:
        existing['Load Factor'],

      estimatedKwhPerDay:
        existing['Estimated kWh Per Day'],

      airconHp:
        existing['Aircon HP'],

      airconType:
        existing['Aircon Type'],

      cookingHours:
        existing['Cooking Hours'],

      warmModeHours:
        existing['Warm Mode Hours'],

      notes:
        existing['Notes']

    };

    return addAppliance(
      data
    );

  } catch (error) {

    return errorResponse(
      error,
      'Unable to duplicate appliance.'
    );

  }
}


/**
 * ============================================================
 * TEST APPLIANCE MODULE
 * ============================================================
 */
function testAppliancesModule() {

  try {

    const testEmail =
      'test-appliance@example.com';

    let user =
      getUserByEmail(
        testEmail
      );

    if (!user) {

      const userResult =
        registerUser({

          email:
            testEmail,

          name:
            'Appliance Test User',

          householdName:
            'Appliance Test Home'

        });

      if (!userResult.success) {

        throw new Error(
          userResult.message
        );

      }

      user =
        userResult.data;

    }

    const addResult =
      addAppliance({

        userId:
          user['User ID'],

        applianceName:
          'Test Aircon',

        category:
          'Heavy Appliances',

        brand:
          'Test Brand',

        model:
          'TEST-001',

        wattage:
          1200,

        quantity:
          1,

        usageType:
          'Hours per day',

        hoursPerDay:
          8,

        usesPerDay:
          0,

        usesPerWeek:
          0,

        usesPerMonth:
          0,

        daysPerMonth:
          30,

        loadFactor:
          0.65,

        estimatedKwhPerDay:
          0,

        airconHp:
          1.5,

        airconType:
          'Inverter',

        cookingHours:
          0,

        warmModeHours:
          0,

        notes:
          'Temporary test appliance'

      });

    if (!addResult.success) {

      throw new Error(
        addResult.message
      );

    }

    const appliance =
      addResult.data;

    const getResult =
      getAppliance(
        appliance['Appliance ID'],
        user['User ID']
      );

    if (!getResult.success) {

      throw new Error(
        'Unable to retrieve test appliance.'
      );

    }

    const deleteResult =
      deleteAppliance(
        appliance['Appliance ID'],
        user['User ID']
      );

    if (!deleteResult.success) {

      throw new Error(
        deleteResult.message
      );

    }

    return {

      success: true,

      message:
        'Appliances module test passed.',

      testAppliance:
        appliance

    };

  } catch (error) {

    return {

      success: false,

      message:
        error.message ||
        'Appliances module test failed.'

    };

  }

}
