/*******************************************************
 * HOUSEHOLD ELECTRICITY TRACKER
 * rates.gs
 *
 * Handles electricity rates, monthly rate history,
 * rate CRUD, validation, and rate lookup.
 *******************************************************/


/**
 * =====================================================
 * DEFAULT ELECTRICITY RATE
 * =====================================================
 *
 * This is only a fallback value.
 *
 * The actual household calculation will use the
 * rate saved in the Electricity_Rates sheet whenever
 * one is available.
 *
 * The value is expressed in Philippine pesos/kWh.
 */


function getDefaultElectricityRate() {

  return getSetting(
    'DEFAULT_ELECTRICITY_RATE'
  );

}


/**
 * =====================================================
 * GET ELECTRICITY RATE FOR MONTH
 * =====================================================
 *
 * Returns the active electricity rate for a specific
 * month.
 *
 * Example:
 *
 * getElectricityRateForMonth('2026-08')
 *
 * Returns:
 *
 * The rate configured for that month in the
 * Electricity_Rates sheet, or the
 * DEFAULT_ELECTRICITY_RATE from the Settings sheet
 * when no applicable rate exists.
 */



function getElectricityRateForMonth(month) {

  console.log(
    "Checking electricity rate for month:",
    month
  );


  const rateSheet =
    getRateSheet();


  const data =
    rateSheet
      .getDataRange()
      .getValues();


  console.log(
    "Rate sheet data:"
  );

  console.log(
    JSON.stringify(data)
  );


  const headers =
    data.shift();


  console.log(
    "Headers:"
  );

  console.log(
    JSON.stringify(headers)
  );


  const monthIndex =
    headers.indexOf(
      "Effective Month"
    );


  const rateIndex =
    headers.indexOf(
      "Rate Per kWh"
    );


  const createdIndex =
    headers.indexOf(
      "Created At"
    );

if (
  monthIndex === -1 ||
  rateIndex === -1 ||
  createdIndex === -1
) {

  throw new Error(
    "Electricity_Rates sheet headers are incorrect."
  );

}

  let latestRate =
    null;


  let latestDate =
    null;



  for (
    let row of data
  ) {


    console.log(
      "Checking row:"
    );

    console.log(
      JSON.stringify(row)
    );



    const rowMonth =
  normalizeMonth(
    row[monthIndex]
  );


console.log(
  "Comparing months:",
  rowMonth,
  "vs",
  month
);


if (
  rowMonth === month
) {


      const createdAt =
        new Date(
          row[createdIndex]
        );



      const rate =
        Number(
          row[rateIndex]
        );



      if (
        !latestDate ||
        createdAt > latestDate
      ) {


        latestDate =
          createdAt;


        latestRate =
          rate;


      }


    }


  }



  if (
    latestRate !== null
  ) {


    console.log(
      "LATEST RATE FOUND:",
      latestRate
    );


    return latestRate;


  }



  /*
   * =====================================================
   * FALLBACK TO SETTINGS
   * =====================================================
   */


  const settingRate =
    getSetting(
      "DEFAULT_ELECTRICITY_RATE",
      DEFAULT_ELECTRICITY_RATE
    );



  console.log(
    "SETTING FALLBACK:",
    settingRate
  );



  return Number(
    settingRate
  );


}





/**
 * =====================================================
 * GET CURRENT ELECTRICITY RATE
 * =====================================================
 */
function getCurrentElectricityRate() {

  return getElectricityRateForMonth(
    getCurrentMonth()
  );

}


/**
 * =====================================================
 * GET ALL ELECTRICITY RATES
 * =====================================================
 */
function getElectricityRates() {

  try {

    const records =
      getSheetRecords(
        SHEETS.RATES
      );

    records.sort(
      function(a, b) {

        return (
          normalizeMonth(
            b['Month']
          ).localeCompare(
            normalizeMonth(
              a['Month']
            )
          )
        );

      }
    );

    return successResponse(
      serializeRecords(
        records
      ),
      'Electricity rates loaded successfully.'
    );

  } catch (error) {

    return errorResponse(
      error,
      'Unable to load electricity rates.'
    );

  }

}


/**
 * =====================================================
 * GET ELECTRICITY RATE RECORD
 * =====================================================
 */
function getElectricityRateRecord(
  month
) {

  try {

    month =
      normalizeMonth(
        month
      );

    const records =
      getSheetRecords(
        SHEETS.RATES
      );

    const record =
      records.find(
        function(item) {

          return (
            normalizeMonth(
              item['Month']
            ) === month
          );

        }
      );

    if (!record) {

      return successResponse(
        null,
        'No electricity rate was found for this month.'
      );

    }

    return successResponse(
      serializeRecord(
        record
      ),
      'Electricity rate loaded successfully.'
    );

  } catch (error) {

    return errorResponse(
      error,
      'Unable to load electricity rate.'
    );

  }

}


/**
 * =====================================================
 * ADD ELECTRICITY RATE
 * =====================================================
 */
function addElectricityRate(
  data
) {

  try {

    validateElectricityRate(
      data
    );

    const month =
      normalizeMonth(
        data.month
      );

    const existing =
      findRateByMonth(
        month
      );

    if (existing) {

      throw new Error(
        'An electricity rate already exists for ' +
        month +
        '. Use update instead.'
      );

    }

    const sheet =
      getSheet(
        SHEETS.RATES
      );

    const now =
      getNow();

    const rateId =
      generateId(
        'RATE'
      );

    const rate =
      toPositiveNumber(
        data.ratePerKwh
      );

    const provider =
      toSafeString(
        data.provider
      );

    const notes =
      toSafeString(
        data.notes
      );

    const status =
      normalizeStatus(
        data.status ||
        'Active'
      );

    sheet.appendRow([

      rateId,

      month,

      rate,

      provider,

      notes,

      status,

      now,

      now

    ]);

    const record =
      findRecordById(
        SHEETS.RATES,
        'Rate ID',
        rateId
      );

    return successResponse(
      serializeRecord(
        record
      ),
      'Electricity rate added successfully.'
    );

  } catch (error) {

    return errorResponse(
      error,
      'Unable to add electricity rate.'
    );

  }

}


/**
 * =====================================================
 * UPDATE ELECTRICITY RATE
 * =====================================================
 */
function updateElectricityRate(
  data
) {

  try {

    const rateId =
      toSafeString(
        data.rateId
      );

    if (!rateId) {

      throw new Error(
        'Rate ID is required.'
      );

    }

    validateElectricityRate(
      data
    );

    const existing =
      findRecordById(
        SHEETS.RATES,
        'Rate ID',
        rateId
      );

    if (!existing) {

      throw new Error(
        'Electricity rate record was not found.'
      );

    }

    const month =
      normalizeMonth(
        data.month
      );

    /**
     * Prevent two records from using
     * the same month.
     */
    const records =
      getSheetRecords(
        SHEETS.RATES
      );

    const duplicate =
      records.find(
        function(record) {

          return (
            toSafeString(
              record['Rate ID']
            ) !== rateId
            &&
            normalizeMonth(
              record['Month']
            ) === month
          );

        }
      );

    if (duplicate) {

      throw new Error(
        'Another electricity rate already exists for ' +
        month +
        '.'
      );

    }

    const row =
      findRowById(
        SHEETS.RATES,
        'Rate ID',
        rateId
      );

    if (row === -1) {

      throw new Error(
        'Electricity rate row was not found.'
      );

    }

    const sheet =
      getSheet(
        SHEETS.RATES
      );

    const updatedAt =
      getNow();

    sheet
      .getRange(
        row,
        1,
        1,
        8
      )
      .setValues([

        [

          rateId,

          month,

          toPositiveNumber(
            data.ratePerKwh
          ),

          toSafeString(
            data.provider
          ),

          toSafeString(
            data.notes
          ),

          normalizeStatus(
            data.status ||
            existing['Status']
          ),

          existing['Created At'] ||
          updatedAt,

          updatedAt

        ]

      ]);

    const updated =
      findRecordById(
        SHEETS.RATES,
        'Rate ID',
        rateId
      );

    return successResponse(
      serializeRecord(
        updated
      ),
      'Electricity rate updated successfully.'
    );

  } catch (error) {

    return errorResponse(
      error,
      'Unable to update electricity rate.'
    );

  }

}


/**
 * =====================================================
 * DELETE ELECTRICITY RATE
 * =====================================================
 */
function deleteElectricityRate(
  rateId
) {

  try {

    rateId =
      toSafeString(
        rateId
      );

    if (!rateId) {

      throw new Error(
        'Rate ID is required.'
      );

    }

    const existing =
      findRecordById(
        SHEETS.RATES,
        'Rate ID',
        rateId
      );

    if (!existing) {

      throw new Error(
        'Electricity rate was not found.'
      );

    }

    deleteRecordById(
      SHEETS.RATES,
      'Rate ID',
      rateId
    );

    return successResponse(
      null,
      'Electricity rate deleted successfully.'
    );

  } catch (error) {

    return errorResponse(
      error,
      'Unable to delete electricity rate.'
    );

  }

}


/**
 * =====================================================
 * DEACTIVATE ELECTRICITY RATE
 * =====================================================
 */
function deactivateElectricityRate(
  rateId
) {

  try {

    rateId =
      toSafeString(
        rateId
      );

    const row =
      findRowById(
        SHEETS.RATES,
        'Rate ID',
        rateId
      );

    if (row === -1) {

      throw new Error(
        'Electricity rate was not found.'
      );

    }

    const sheet =
      getSheet(
        SHEETS.RATES
      );

    /**
     * Status column = 6.
     */
    sheet
      .getRange(
        row,
        6
      )
      .setValue(
        'Inactive'
      );

    /**
     * Updated At = column 8.
     */
    sheet
      .getRange(
        row,
        8
      )
      .setValue(
        getNow()
      );

    return successResponse(
      getElectricityRateRecord(
        normalizeMonth(
          findRecordById(
            SHEETS.RATES,
            'Rate ID',
            rateId
          )['Month']
        )
      ).data,
      'Electricity rate deactivated successfully.'
    );

  } catch (error) {

    return errorResponse(
      error,
      'Unable to deactivate electricity rate.'
    );

  }

}


/**
 * =====================================================
 * REACTIVATE ELECTRICITY RATE
 * =====================================================
 */
function reactivateElectricityRate(
  rateId
) {

  try {

    rateId =
      toSafeString(
        rateId
      );

    const row =
      findRowById(
        SHEETS.RATES,
        'Rate ID',
        rateId
      );

    if (row === -1) {

      throw new Error(
        'Electricity rate was not found.'
      );

    }

    const sheet =
      getSheet(
        SHEETS.RATES
      );

    /**
     * Status column = 6.
     */
    sheet
      .getRange(
        row,
        6
      )
      .setValue(
        'Active'
      );

    /**
     * Updated At = column 8.
     */
    sheet
      .getRange(
        row,
        8
      )
      .setValue(
        getNow()
      );

    const record =
      findRecordById(
        SHEETS.RATES,
        'Rate ID',
        rateId
      );

    return successResponse(
      serializeRecord(
        record
      ),
      'Electricity rate reactivated successfully.'
    );

  } catch (error) {

    return errorResponse(
      error,
      'Unable to reactivate electricity rate.'
    );

  }

}


/**
 * =====================================================
 * FIND RATE BY MONTH
 * =====================================================
 */
function findRateByMonth(
  month
) {

  month =
    normalizeMonth(
      month
    );

  const records =
    getSheetRecords(
      SHEETS.RATES
    );

  return records.find(
    function(record) {

      return (
        normalizeMonth(
          record['Month']
        ) === month
      );

    }
  ) || null;

}


/**
 * =====================================================
 * VALIDATE ELECTRICITY RATE
 * =====================================================
 */
function validateElectricityRate(
  data
) {

  if (!data) {

    throw new Error(
      'Electricity rate information is required.'
    );

  }

  const month =
    normalizeMonth(
      data.month
    );

  if (!month) {

    throw new Error(
      'Month is required.'
    );

  }

  /**
   * Month must use YYYY-MM.
   */
  if (
    !/^\d{4}-\d{2}$/.test(
      month
    )
  ) {

    throw new Error(
      'Month must use YYYY-MM format.'
    );

  }

  const monthNumber =
    Number(
      month.substring(5, 7)
    );

  if (
    monthNumber < 1 ||
    monthNumber > 12
  ) {

    throw new Error(
      'Invalid month.'
    );

  }

  const rate =
    toPositiveNumber(
      data.ratePerKwh
    );

  if (rate <= 0) {

    throw new Error(
      'Electricity rate must be greater than zero.'
    );

  }

  /**
   * Protect against accidental extreme
   * values caused by input mistakes.
   */
  if (rate > 1000) {

    throw new Error(
      'Electricity rate appears unusually high. Please check the value.'
    );

  }

  return true;

}


/**
 * =====================================================
 * NORMALIZE MONTH
 * =====================================================
 *
 * Accepts:
 *
 * 2026-08
 * 2026/08
 * August 2026
 * Date objects
 *
 * and attempts to return:
 *
 * YYYY-MM
 */
function normalizeMonth(
  value
) {

  if (
    value instanceof Date
  ) {

    if (
      isNaN(
        value.getTime()
      )
    ) {

      return '';
    }

    return (
      value.getFullYear() +
      '-' +
      String(
        value.getMonth() + 1
      ).padStart(
        2,
        '0'
      )
    );

  }

  let text =
    toSafeString(
      value
    );

  if (!text) {
    return '';
  }

  /**
   * YYYY/MM
   */
  text =
    text.replace(
      '/',
      '-'
    );

  /**
   * Already YYYY-MM.
   */
  if (
    /^\d{4}-\d{2}$/.test(
      text
    )
  ) {

    return text;

  }

  /**
   * Attempt to parse a date string.
   */
  const parsed =
    new Date(
      text
    );

  if (
    !isNaN(
      parsed.getTime()
    )
  ) {

    return (
      parsed.getFullYear() +
      '-' +
      String(
        parsed.getMonth() + 1
      ).padStart(
        2,
        '0'
      )
    );

  }

  return text;

}


/**
 * =====================================================
 * GET CURRENT MONTH
 * =====================================================
 */
function getCurrentMonth() {

  const now =
    new Date();

  return (
    now.getFullYear() +
    '-' +
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      '0'
    )
  );

}


/**
 * =====================================================
 * GET PREVIOUS MONTH
 * =====================================================
 */
function getPreviousMonth(
  month
) {

  month =
    normalizeMonth(
      month
    ) ||
    getCurrentMonth();

  const parts =
    month.split(
      '-'
    );

  let year =
    Number(
      parts[0]
    );

  let monthNumber =
    Number(
      parts[1]
    );

  monthNumber--;

  if (
    monthNumber < 1
  ) {

    monthNumber = 12;

    year--;

  }

  return (
    year +
    '-' +
    String(
      monthNumber
    ).padStart(
      2,
      '0'
    )
  );

}


/**
 * =====================================================
 * SETUP DEFAULT ELECTRICITY RATE
 * =====================================================
 *
 * Creates the current month's default rate
 * if no rate exists yet.
 */
function setupDefaultElectricityRate() {

  try {

    const currentMonth =
      getCurrentMonth();

    const existing =
      findRateByMonth(
        currentMonth
      );

    if (existing) {

      return successResponse(
        serializeRecord(
          existing
        ),
        'A rate already exists for the current month.'
      );

    }

    return addElectricityRate({

      month:
        currentMonth,

      ratePerKwh:
        getDefaultElectricityRate(),

      provider:
        'Default',

      notes:
        'Initial default rate. Replace with the household electricity provider rate.',

      status:
        'Active'

    });

  } catch (error) {

    return errorResponse(
      error,
      'Unable to create default electricity rate.'
    );

  }

}


/**
 * =====================================================
 * GET RATE HISTORY
 * =====================================================
 */
function getRateHistory(
  months
) {

  try {

    const numberOfMonths =
      toPositiveNumber(
        months
      ) || 12;

    const records =
      getSheetRecords(
        SHEETS.RATES
      );

    records.sort(
      function(a, b) {

        return (
          normalizeMonth(
            b['Month']
          ).localeCompare(
            normalizeMonth(
              a['Month']
            )
          )
        );

      }
    );

    return successResponse(
      serializeRecords(
        records.slice(
          0,
          numberOfMonths
        )
      ),
      'Electricity rate history loaded successfully.'
    );

  } catch (error) {

    return errorResponse(
      error,
      'Unable to load electricity rate history.'
    );

  }

}


/**
 * =====================================================
 * COMPARE TWO MONTHLY RATES
 * =====================================================
 */
function compareElectricityRates(
  currentMonth,
  previousMonth
) {

  try {

    currentMonth =
      normalizeMonth(
        currentMonth
      ) ||
      getCurrentMonth();

    previousMonth =
      normalizeMonth(
        previousMonth
      ) ||
      getPreviousMonth(
        currentMonth
      );

    const currentRate =
      getElectricityRateForMonth(
        currentMonth
      );

    const previousRate =
      getElectricityRateForMonth(
        previousMonth
      );

    const difference =
      currentRate -
      previousRate;

    const percentageChange =
      previousRate > 0
        ? (
            difference /
            previousRate
          ) * 100
        : 0;

    return successResponse({

      currentMonth:
        currentMonth,

      currentRate:
        roundNumber(
          currentRate,
          4
        ),

      previousMonth:
        previousMonth,

      previousRate:
        roundNumber(
          previousRate,
          4
        ),

      difference:
        roundNumber(
          difference,
          4
        ),

      percentageChange:
        roundNumber(
          percentageChange,
          2
        )

    }, 'Electricity rates compared successfully.');

  } catch (error) {

    return errorResponse(
      error,
      'Unable to compare electricity rates.'
    );

  }

}


/**
 * =====================================================
 * TEST RATES MODULE
 * =====================================================
 */
function testRatesModule() {

  try {

    const testMonth =
      '2099-12';

    /**
     * Remove an existing test rate first.
     */
    const existing =
      findRateByMonth(
        testMonth
      );

    if (existing) {

      deleteElectricityRate(
        existing['Rate ID']
      );

    }

    /**
     * Add test rate.
     */
    const addResult =
      addElectricityRate({

        month:
          testMonth,

        ratePerKwh:
          12.34,

        provider:
          'Test Provider',

        notes:
          'Temporary test record',

        status:
          'Active'

      });

    if (
      !addResult.success
    ) {

      throw new Error(
        addResult.message
      );

    }

    /**
     * Confirm lookup.
     */
    const rate =
      getElectricityRateForMonth(
        testMonth
      );

    if (
      Math.abs(
        rate - 12.34
      ) > 0.001
    ) {

      throw new Error(
        'Electricity rate lookup returned an unexpected value.'
      );

    }

    /**
     * Update test rate.
     */
    const updateResult =
      updateElectricityRate({

        rateId:
          addResult.data['Rate ID'],

        month:
          testMonth,

        ratePerKwh:
          13.45,

        provider:
          'Updated Test Provider',

        notes:
          'Updated temporary test record',

        status:
          'Active'

      });

    if (
      !updateResult.success
    ) {

      throw new Error(
        updateResult.message
      );

    }

    /**
     * Confirm updated rate.
     */
    const updatedRate =
      getElectricityRateForMonth(
        testMonth
      );

    if (
      Math.abs(
        updatedRate - 13.45
      ) > 0.001
    ) {

      throw new Error(
        'Updated electricity rate was not retrieved correctly.'
      );

    }

    /**
     * Delete test record.
     */
    const deleteResult =
      deleteElectricityRate(
        addResult.data['Rate ID']
      );

    if (
      !deleteResult.success
    ) {

      throw new Error(
        deleteResult.message
      );

    }

    return {

      success: true,

      message:
        'Rates module tests passed.'

    };

  } catch (error) {

    return {

      success: false,

      message:
        error.message ||
        'Rates module test failed.'

    };

  }

}


function getRateSheet() {

  return getSheet(
    SHEETS.RATES
  );

}


function testElectricityRateFallback() {

  const result =
    getElectricityRateForMonth(
      "2099-12"
    );

  console.log(
    "Fallback Rate Result:",
    result
  );

}






/**
 * =====================================================
 * TEST: GET ELECTRICITY RATE FOR CURRENT MONTH
 * =====================================================
 */
function testElectricityRateCurrentMonth() {

  const month =
    getCurrentMonth();

  console.log(
    "Testing month:",
    month
  );


  const rate =
    getElectricityRateForMonth(
      month
    );


  console.log(
    "Returned Rate:",
    rate
  );

}



/**
 * =====================================================
 * TEST: GET ELECTRICITY RATE FOR SPECIFIC MONTH
 * =====================================================
 */
function testElectricityRateSpecificMonth() {


  const testMonth =
    "2026-08";


  console.log(
    "Testing month:",
    testMonth
  );


  const rate =
    getElectricityRateForMonth(
      testMonth
    );


  console.log(
    "Returned Rate:",
    rate
  );


}



/**
 * =====================================================
 * TEST: FALLBACK TO SETTINGS
 * =====================================================
 */
function testElectricityRateFallback() {


  const fakeMonth =
    "2099-12";


  console.log(
    "Testing fallback month:",
    fakeMonth
  );


  const rate =
    getElectricityRateForMonth(
      fakeMonth
    );


  console.log(
    "Fallback Rate Result:",
    rate
  );


}



/**
 * =====================================================
 * TEST: LATEST RATE WHEN MULTIPLE SAME MONTH
 * =====================================================
 */
function testLatestElectricityRate() {


  const month =
    "2026-08";


  console.log(
    "Testing latest rate selection for:",
    month
  );


  const rate =
    getElectricityRateForMonth(
      month
    );


  console.log(
    "Latest Rate Selected:",
    rate
  );


}



function testElectricityRateLatest() {

  const testMonth = "2026-08";

  console.log(
    "Testing latest rate selection for:",
    testMonth
  );

  const rate =
    getElectricityRateForMonth(
      testMonth
    );

  console.log(
    "Latest Rate Selected:",
    rate
  );

}
