/*******************************************************
 * HOUSEHOLD ELECTRICITY TRACKER
 * dashboard.gs
 *
 * Dashboard calculations, summaries, comparisons,
 * rankings, alerts, and dashboard data.
 *******************************************************/


/**
 * =====================================================
 * GET COMPLETE DASHBOARD
 * =====================================================
 *
 * This is the main function the frontend will call.
 *
 * It gathers:
 *
 * - Current month consumption
 * - Previous month consumption
 * - Appliance rankings
 * - Category breakdown
 * - High consumption alerts
 * - Electricity rate
 * - Actual bill
 * - Estimated vs actual comparison
 */


function getDashboard(
  userId,
  month
) {

try {

  userId =
    toSafeString(
      userId
    );


  month =
    normalizeMonth(
      month
    ) || getCurrentMonth();



  if (!userId) {

    throw new Error(
      "User ID is required."
    );

  }



  // ===============================
  // ESTIMATED CURRENT MONTH
  // ===============================

  const current =
    calculateAllAppliances(
      userId,
      month
    );


  if (!current.success) {
    return current;
  }



  // ===============================
  // PREVIOUS MONTH
  // ===============================

  const previousMonth =
    getPreviousMonth(
      month
    );


  const previous =
    calculateAllAppliances(
      userId,
      previousMonth
    );



  let previousKwh = 0;
  let previousCost = 0;



  if (
    previous &&
    previous.success
  ) {

    previousKwh =
      previous.data.totalKwh || 0;


    previousCost =
      previous.data.totalCost || 0;

  }



  // ===============================
  // GET ACTUAL BILL
  // ===============================

  const actualBill =
    getActualBillForMonth(
      userId,
      month
    );



  let actualBillAmount = 0;
  let actualKwh = 0;



  if (
    actualBill &&
    actualBill.success &&
    actualBill.data
  ) {

    actualBillAmount =
      toPositiveNumber(
        actualBill.data.actualBill
      );


    actualKwh =
      toPositiveNumber(
        actualBill.data.actualKwh
      );

  }



 // ===============================
// FINAL VALUES
// ===============================
// Dashboard cards should ALWAYS show
// calculated estimated consumption.
// Actual bill is only used for comparison.

const currentKwh =
current.data.totalKwh;


const currentCost =
current.data.totalCost;




  // ===============================
  // APPLIANCE RANKING
  // ===============================
  // Reuse "current" (already calculated above)
  // instead of recalculating all appliances again.

  const ranking =
    rankAppliances(
      userId,
      month,
      current
    );


  if (!ranking.success) {
    return ranking;
  }



  // ===============================
  // CATEGORY BREAKDOWN
  // ===============================

  const categories =
    getCategoryBreakdown(
      userId,
      month,
      current
    );


  if (!categories.success) {
    return categories;
  }



  // ===============================
  // ALERTS
  // ===============================
  // Reuse the ranking already computed above.

  const alerts =
    getHighConsumptionAppliances(
      userId,
      month,
      ranking
    );


  if (!alerts.success) {
    return alerts;
  }




  // ===============================
  // RATE
  // ===============================

  const rateComparison =
    compareElectricityRates(
      month,
      previousMonth
    );




  // ===============================
  // COMPARISON
  // ===============================

  const kwhChange =
    currentKwh -
    previousKwh;



  const costChange =
    currentCost -
    previousCost;



  const kwhPercentageChange =
    previousKwh > 0
      ? (
          kwhChange /
          previousKwh
        ) * 100
      : 0;



  const costPercentageChange =
    previousCost > 0
      ? (
          costChange /
          previousCost
        ) * 100
      : 0;




  // ===============================
  // ACTUAL VS ESTIMATE
  // ===============================

  const estimatedVsActual =
    getEstimatedVsActualStatus(
      current.data.totalCost,
      actualBillAmount
    );





  // ===============================
  // HIGHEST CONSUMER
  // ===============================

  const highestConsumer =
    ranking.data.length > 0
      ? ranking.data[0]
      : null;





  // ===============================
  // RETURN DASHBOARD
  // ===============================


  return successResponse({

    userId:
      userId,


    month:
      month,


    previousMonth:
      previousMonth,



    currentMonth: {


      totalKwh:
        roundNumber(
          currentKwh,
          2
        ),


      totalCost:
        roundNumber(
          currentCost,
          2
        ),


      averageDailyKwh:
        roundNumber(
          currentKwh / 30,
          2
        ),


      averageDailyCost:
        roundNumber(
          currentCost / 30,
          2
        ),


      electricityRate:
        roundNumber(
          current.data.electricityRate,
          4
        ),


      source:
  "ESTIMATE"

    },




    previousMonthData: {


      totalKwh:
        roundNumber(
          previousKwh,
          2
        ),


      totalCost:
        roundNumber(
          previousCost,
          2
        )

    },




    comparison: {


      kwhChange:
        roundNumber(
          kwhChange,
          2
        ),


      kwhPercentageChange:
        roundNumber(
          kwhPercentageChange,
          2
        ),


      costChange:
        roundNumber(
          costChange,
          2
        ),


      costPercentageChange:
        roundNumber(
          costPercentageChange,
          2
        ),


      direction:
        getChangeDirection(
          costChange
        )

    },




    highestConsumer:
      highestConsumer,



    applianceRanking:
      ranking.data,



    categoryBreakdown:
      categories.data,



    alerts:
      alerts.data,




    // ===============================
    // ACTUAL BILL DATA
    // ===============================

    actualBill: {


      amount:
        roundNumber(
          actualBillAmount,
          2
        ),



      actualKwh:
        roundNumber(
          actualKwh,
          2
        ),



      estimatedAmount:
        roundNumber(
          current.data.totalCost,
          2
        ),



      difference:
        roundNumber(
          current.data.totalCost -
          actualBillAmount,
          2
        ),



      percentageDifference:
        actualBillAmount > 0
          ? roundNumber(
              (
                current.data.totalCost -
                actualBillAmount
              )
              /
              actualBillAmount
              *
              100,
              2
            )
          : 0,



      hasActualBill:
        actualBillAmount > 0,



      status:
        estimatedVsActual.status,



      message:
        estimatedVsActual.message

    },




    rateComparison:
      rateComparison.success
        ? rateComparison.data
        : null


  });


}
catch(error) {


  Logger.log(
    "GET DASHBOARD ERROR: " +
    error.message
  );


  return errorResponse(
    error,
    "Unable to load dashboard."
  );

}

}



/**
 * =====================================================
 * DASHBOARD SUMMARY
 * =====================================================
 *
 * Lightweight version for dashboard cards.
 */
function getDashboardSummary(
  userId,
  month
) {

  try {

    userId =
      toSafeString(
        userId
      );

    month =
      normalizeMonth(
        month
      ) || getCurrentMonth();

    const result =
      calculateAllAppliances(
        userId,
        month
      );

    if (!result.success) {
      return result;
    }

    const ranking =
      rankAppliances(
        userId,
        month
      );

    if (!ranking.success) {
      return ranking;
    }

    const categories =
      getCategoryBreakdown(
        userId,
        month
      );

    if (!categories.success) {
      return categories;
    }

    const alerts =
      getHighConsumptionAppliances(
        userId,
        month
      );

    if (!alerts.success) {
      return alerts;
    }

    const highestConsumer =
      ranking.data.length
        ? ranking.data[0]
        : null;

    return successResponse({

      month:
        month,

      totalKwh:
        result.data.totalKwh,

      totalCost:
        result.data.totalCost,

      electricityRate:
        result.data.electricityRate,

      applianceCount:
        result.data.appliances.length,

      highestConsumer:
        highestConsumer,

      categoryCount:
        categories.data.length,

      alertCount:
        alerts.data.length

    });

  } catch (error) {

    return errorResponse(
      error,
      'Unable to load dashboard summary.'
    );

  }

}


/**
 * =====================================================
 * GET ACTUAL BILL
 * =====================================================
 *
 * Reads the actual electricity bill entered
 * by the household from Bill History.
 *
 */

function getActualBillForMonth(
  userId,
  month
) {

  try {


    userId =
      String(userId || "").trim();


    month =
      String(month || "").trim();



    Logger.log(
      "GET ACTUAL BILL FROM USER FILE"
    );

    Logger.log(
      "USER: " + userId
    );

    Logger.log(
      "MONTH: " + month
    );



    const userSpreadsheetId =
      getUserSpreadsheetId(
        userId
      );



    if (!userSpreadsheetId) {

      return successResponse(
        null,
        "No user spreadsheet found."
      );

    }



    const ss =
      SpreadsheetApp.openById(
        userSpreadsheetId
      );



    Logger.log(
      "OPENED USER FILE: " +
      ss.getName()
    );



    const sheet =
      ss.getSheetByName(
        "Bill History"
      );



    if (!sheet) {

      return successResponse(
        null,
        "No Bill History found."
      );

    }



    const lastRow =
      sheet.getLastRow();



    if(lastRow <= 1){

      return successResponse(
        null,
        "No actual bill recorded."
      );

    }



    /*
    LOAD ALL BILL COLUMNS
    */

    const rows =
      sheet
      .getRange(
        2,
        1,
        lastRow - 1,
        18
      )
      .getValues();



    /*
    SEARCH FROM LATEST BILL
    */

    for(
      let i = rows.length - 1;
      i >= 0;
      i--
    ){


      const row =
        rows[i];



      const rowUser =
        String(
          row[1] || ""
        )
        .trim();



      const rowMonth =
        normalizeMonth(
          row[2]
        );



      Logger.log(
        "CHECK USER=" +
        rowUser +
        " MONTH=" +
        rowMonth
      );



      if(
        rowUser === userId &&
        rowMonth === month
      ){


        Logger.log(
          "FOUND MATCHING BILL ROW"
        );


        Logger.log(
          JSON.stringify(row)
        );



        Logger.log(
          "COLUMN D Actual kWh: " +
          row[3]
        );


        Logger.log(
          "COLUMN P Actual Bill: " +
          row[15]
        );



        return successResponse({

          billId:
            row[0],


          userId:
            row[1],


          month:
            normalizeMonth(
              row[2]
            ),


          actualKwh:
            Number(
              row[3] || 0
            ),


          actualBill:
            Number(
              row[15] || 0
            ),


          generation:
            Number(
              row[4] || 0
            ),


          transmission:
            Number(
              row[5] || 0
            ),


          systemLoss:
            Number(
              row[6] || 0
            ),


          distribution:
            Number(
              row[7] || 0
            ),


          notes:
            row[16] || ""

        });


      }


    }



    Logger.log(
      "NO BILL FOUND"
    );



    return successResponse(
      null,
      "No actual bill recorded."
    );



  }
  catch(error){


    Logger.log(
      "GET ACTUAL BILL ERROR: " +
      error.message
    );


    return errorResponse(
      error,
      "Unable to retrieve actual electricity bill."
    );

  }

}





/**
 * =====================================================
 * SAVE ACTUAL BILL
 * =====================================================
 */
function saveActualBill(
  data
) {

  try {

    if (!data) {

      throw new Error(
        'Bill information is required.'
      );

    }


    const userId =
      toSafeString(
        data.userId
      );

    if (!userId) {

      throw new Error(
        'User ID is required.'
      );

    }


    const month =
      normalizeMonth(
        data.month
      );


    if (!month) {

      throw new Error(
        'Bill month is required.'
      );

    }


    const actualBill =
      toPositiveNumber(
        data.actualBill
      );


    if (
      actualBill <= 0
    ) {

      throw new Error(
        'Actual bill must be greater than zero.'
      );

    }


    /**
     * Create sheet if necessary.
     */
    const userSpreadsheetId =
  getUserSpreadsheetId(
    userId
  );

if (!userSpreadsheetId) {

  throw new Error(
    "User spreadsheet not found."
  );

}


const userSS =
  SpreadsheetApp.openById(
    userSpreadsheetId
  );


let sheet =
  userSS.getSheetByName(
    "Bill History"
  );


if (!sheet) {

  sheet =
    userSS.insertSheet(
      "Bill History"
    );

  sheet.getRange(
    1,
    1,
    1,
    9
  ).setValues([

    [
      "Bill ID",
      "User ID",
      "Month",
      "Actual Bill",
      "Actual kWh",
      "Due Date",
      "Notes",
      "Created At",
      "Updated At"
    ]

  ]);

}


    /**
     * Check if record already exists.
     */
    const records =
      getSheetRecords(
        SHEETS.ACTUAL_BILLS
      );


    const existing =
      records.find(
        function(record) {

          return (
            toSafeString(
              record['User ID']
            ) === userId
            &&
            normalizeMonth(
              record['Month']
            ) === month
          );

        }
      );


    const now =
      getNow();


    /**
     * UPDATE
     */
    if (existing) {

      const row =
        findRowById(
          SHEETS.ACTUAL_BILLS,
          'Bill ID',
          existing['Bill ID']
        );


      if (row === -1) {

        throw new Error(
          'Existing bill record could not be found.'
        );

      }


      sheet
        .getRange(
          row,
          1,
          1,
          9
        )
        .setValues([

          [

            existing['Bill ID'],

            userId,

            month,

            actualBill,

            toPositiveNumber(
              data.actualKwh
            ),

            toSafeString(
              data.dueDate
            ),

            toSafeString(
              data.notes
            ),

            existing['Created At'] ||
              now,

            now

          ]

        ]);


      return successResponse({

        billId:
          existing['Bill ID'],

        month:
          month,

        actualBill:
          actualBill

      }, 'Actual electricity bill updated successfully.');

    }


    /**
     * CREATE
     */
    const billId =
      generateId(
        'BILL'
      );


    sheet.appendRow([

      billId,

      userId,

      month,

      actualBill,

      toPositiveNumber(
        data.actualKwh
      ),

      toSafeString(
        data.dueDate
      ),

      toSafeString(
        data.notes
      ),

      now,

      now

    ]);


    return successResponse({

      billId:
        billId,

      month:
        month,

      actualBill:
        actualBill

    }, 'Actual electricity bill saved successfully.');


  } catch (error) {

    return errorResponse(
      error,
      'Unable to save actual electricity bill.'
    );

  }

}


/**
 * =====================================================
 * CREATE ACTUAL BILLS SHEET
 * =====================================================
 */
function getOrCreateActualBillsSheet() {

  const sheetName =
    SHEETS.ACTUAL_BILLS ||
    'Actual_Bills';


  if (
    sheetExists(
      sheetName
    )
  ) {

    return getSheet(
      sheetName
    );

  }


  const ss =
    getDatabaseSpreadsheet();


  const sheet =
    ss.insertSheet(
      sheetName
    );


  const headers = [

    'Bill ID',

    'User ID',

    'Month',

    'Actual Bill',

    'Actual kWh',

    'Due Date',

    'Notes',

    'Created At',

    'Updated At'

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


  formatHeaderRow(
    sheet
  );


  sheet.setFrozenRows(
    1
  );


  return sheet;

}


/**
 * =====================================================
 * GET MONTH COMPARISON
 * =====================================================
 */
function getMonthComparison(
  userId,
  currentMonth,
  previousMonth
) {

  try {

    currentMonth =
      normalizeMonth(
        currentMonth
      ) || getCurrentMonth();


    previousMonth =
      normalizeMonth(
        previousMonth
      ) ||
      getPreviousMonth(
        currentMonth
      );


    const current =
      calculateAllAppliances(
        userId,
        currentMonth
      );


    if (!current.success) {
      return current;
    }


    const previous =
      calculateAllAppliances(
        userId,
        previousMonth
      );


    let previousKwh =
      0;

    let previousCost =
      0;


    if (
      previous &&
      previous.success
    ) {

      previousKwh =
        previous.data.totalKwh;

      previousCost =
        previous.data.totalCost;

    }


    const currentKwh =
      current.data.totalKwh;

    const currentCost =
      current.data.totalCost;


    const kwhDifference =
      currentKwh -
      previousKwh;


    const costDifference =
      currentCost -
      previousCost;


    return successResponse({

      currentMonth: {

        month:
          currentMonth,

        kwh:
          roundNumber(
            currentKwh,
            2
          ),

        cost:
          roundNumber(
            currentCost,
            2
          )

      },


      previousMonth: {

        month:
          previousMonth,

        kwh:
          roundNumber(
            previousKwh,
            2
          ),

        cost:
          roundNumber(
            previousCost,
            2
          )

      },


      difference: {

        kwh:
          roundNumber(
            kwhDifference,
            2
          ),

        kwhPercentage:
          previousKwh > 0
            ? roundNumber(
                (
                  kwhDifference /
                  previousKwh
                ) * 100,
                2
              )
            : 0,

        cost:
          roundNumber(
            costDifference,
            2
          ),

        costPercentage:
          previousCost > 0
            ? roundNumber(
                (
                  costDifference /
                  previousCost
                ) * 100,
                2
              )
            : 0,

        direction:
          getChangeDirection(
            costDifference
          )

      }

    });

  } catch (error) {

    return errorResponse(
      error,
      'Unable to compare months.'
    );

  }

}


/**
 * =====================================================
 * GET ESTIMATED VS ACTUAL STATUS
 * =====================================================
 */
function getEstimatedVsActualStatus(
  estimated,
  actual
) {

  estimated =
    toPositiveNumber(
      estimated
    );

  actual =
    toPositiveNumber(
      actual
    );


  /**
   * No actual bill yet.
   */
  if (
    actual <= 0
  ) {

    return {

      status:
        'No Actual Bill',

      message:
        'Enter your actual electricity bill to compare it with the estimate.'

    };

  }


  const difference =
    estimated -
    actual;


  const percentage =
    actual > 0
      ? Math.abs(
          difference /
          actual
        ) * 100
      : 0;


  /**
   * Within 5%.
   */
  if (
    percentage <= 5
  ) {

    return {

      status:
        'Very Close',

      message:
        'Your estimated bill is very close to your actual electricity bill.'

    };

  }


  /**
   * Estimate is higher.
   */
  if (
    difference > 0
  ) {

    return {

      status:
        'Estimate Higher',

      message:
        'Your estimated bill is higher than your actual electricity bill.'

    };

  }


  /**
   * Estimate is lower.
   */
  return {

    status:
      'Estimate Lower',

    message:
      'Your estimated bill is lower than your actual electricity bill.'

  };

}


/**
 * =====================================================
 * GET CHANGE DIRECTION
 * =====================================================
 */
function getChangeDirection(
  difference
) {

  difference =
    toNumber(
      difference
    );


  if (
    difference > 0.01
  ) {

    return 'UP';

  }


  if (
    difference < -0.01
  ) {

    return 'DOWN';

  }


  return 'UNCHANGED';

}


/**
 * =====================================================
 * GET DASHBOARD CHART DATA
 * =====================================================
 *
 * Returns clean arrays suitable for Chart.js
 * or another frontend chart library.
 */
function getDashboardChartData(
  userId,
  month
) {

  try {

    const ranking =
      rankAppliances(
        userId,
        month
      );


    if (!ranking.success) {
      return ranking;
    }


    const categories =
      getCategoryBreakdown(
        userId,
        month
      );


    if (!categories.success) {
      return categories;
    }


    const applianceLabels =
      ranking.data.map(
        function(item) {

          return item.applianceName;

        }
      );


    const applianceCosts =
      ranking.data.map(
        function(item) {

          return roundNumber(
            item.monthlyCost,
            2
          );

        }
      );


    const categoryLabels =
      categories.data.map(
        function(item) {

          return item.category;

        }
      );


    const categoryCosts =
      categories.data.map(
        function(item) {

          return roundNumber(
            item.monthlyCost,
            2
          );

        }
      );


    return successResponse({

      applianceChart: {

        labels:
          applianceLabels,

        values:
          applianceCosts

      },


      categoryChart: {

        labels:
          categoryLabels,

        values:
          categoryCosts

      }

    });

  } catch (error) {

    return errorResponse(
      error,
      'Unable to generate dashboard chart data.'
    );

  }

}


/**
 * =====================================================
 * GET TOP APPLIANCES
 * =====================================================
 */
function getTopAppliances(
  userId,
  month,
  limit
) {

  try {

    limit =
      Math.floor(
        toPositiveNumber(
          limit
        ) || 5
      );


    limit =
      clamp(
        limit,
        1,
        20
      );


    const ranking =
      rankAppliances(
        userId,
        month
      );


    if (!ranking.success) {
      return ranking;
    }


    return successResponse(
      ranking.data.slice(
        0,
        limit
      ),
      'Top appliances loaded successfully.'
    );

  } catch (error) {

    return errorResponse(
      error,
      'Unable to load top appliances.'
    );

  }

}


/**
 * =====================================================
 * GET DASHBOARD ALERTS
 * =====================================================
 */
function getDashboardAlerts(
  userId,
  month
) {

  try {

    const result =
      getHighConsumptionAppliances(
        userId,
        month
      );


    if (!result.success) {
      return result;
    }


    return successResponse({

      count:
        result.data.length,

      alerts:
        result.data.map(
          function(item) {

            const alert =
              getApplianceAlertStatus(
                item
              );


            return {

              applianceId:
                item.applianceId,

              applianceName:
                item.applianceName,

              category:
                item.category,

              monthlyKwh:
                item.monthlyKwh,

              monthlyCost:
                item.monthlyCost,

              type:
                alert.type,

              message:
                alert.message

            };

          }
        )

    });

  } catch (error) {

    return errorResponse(
      error,
      'Unable to load dashboard alerts.'
    );

  }

}


/**
 * =====================================================
 * GET HOUSEHOLD HEALTH CHECK
 * =====================================================
 *
 * Gives a simple non-technical interpretation
 * of the household's electricity consumption.
 */
function getHouseholdEnergyHealth(
  userId,
  month
) {

  try {

    const dashboard =
      getDashboard(
        userId,
        month
      );


    if (!dashboard.success) {
      return dashboard;
    }


    const data =
      dashboard.data;


    const totalCost =
      data.currentMonth.totalCost;


    const alerts =
      data.alerts.length;


    let status =
      'GOOD';


    let message =
      'Your estimated electricity consumption looks reasonable.';


    if (
      alerts >= 3
    ) {

      status =
        'HIGH';

      message =
        'Several appliances are contributing significantly to your estimated electricity consumption.';

    } else if (
      alerts >= 1
    ) {

      status =
        'WATCH';

      message =
        'One or more appliances are contributing significantly to your estimated electricity consumption.';

    }


    /**
     * Very high estimated monthly bill.
     *
     * This is not a universal threshold.
     * It is simply an MVP warning.
     */
    if (
      totalCost >= 10000
    ) {

      status =
        'HIGH';

      message =
        'Your estimated monthly electricity cost is high. Review your highest-consuming appliances.';

    }


    return successResponse({

      status:
        status,

      message:
        message,

      estimatedMonthlyCost:
        totalCost,

      alertCount:
        alerts

    });

  } catch (error) {

    return errorResponse(
      error,
      'Unable to determine household energy status.'
    );

  }

}


/**
 * =====================================================
 * TEST DASHBOARD MODULE
 * =====================================================
 */
function testDashboardModule() {

  try {

    /**
     * Test utility functions first.
     */
    const previousMonth =
      getPreviousMonth(
        '2026-01'
      );


    if (
      previousMonth !==
      '2025-12'
    ) {

      throw new Error(
        'Previous month calculation failed.'
      );

    }


    const directionUp =
      getChangeDirection(
        100
      );


    const directionDown =
      getChangeDirection(
        -100
      );


    const directionSame =
      getChangeDirection(
        0
      );


    if (
      directionUp !== 'UP'
      ||
      directionDown !== 'DOWN'
      ||
      directionSame !== 'UNCHANGED'
    ) {

      throw new Error(
        'Change direction test failed.'
      );

    }


    const status =
      getEstimatedVsActualStatus(
        1100,
        1000
      );


    if (
      !status ||
      !status.status
    ) {

      throw new Error(
        'Estimated vs actual test failed.'
      );

    }


    return {

      success: true,

      message:
        'Dashboard module tests passed.',

      previousMonth:
        previousMonth,

      changeDirectionTests: {

        up:
          directionUp,

        down:
          directionDown,

        unchanged:
          directionSame

      },

      estimatedVsActual:
        status

    };

  } catch (error) {

    return {

      success: false,

      message:
        error.message ||
        'Dashboard module test failed.'

    };

  }

}






function testActualBillLookup() {

  const result =
    getActualBillForMonth(
      "USER-006",
      "2026-08"
    );

  Logger.log(
    JSON.stringify(result)
  );

}






function testFullDashboard() {

  const result =
    getDashboard(
      "USER-006",
      "2026-08"
    );


  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

}







function testDashboard(){

  const result = getDashboard(
    "USER-006",
    "2026-08"
  );

  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

}
