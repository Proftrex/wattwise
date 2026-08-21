/*******************************************************
 * HOUSEHOLD ELECTRICITY TRACKER
 * calculations.gs
 *
 * Handles electricity consumption calculations,
 * monthly estimates, appliance rankings, category
 * breakdowns, and percentage contributions.
 *******************************************************/


/**
 * =====================================================
 * MAIN APPLIANCE CALCULATION
 * =====================================================
 *
 * Calculates the estimated monthly consumption
 * and electricity cost for one appliance.
 */
function calculateAppliance(
  appliance,
  electricityRate
) {

  if (!appliance) {

    throw new Error(
      'Appliance information is required.'
    );
  }

  const rate =
    toPositiveNumber(
      electricityRate
    ) || getDefaultElectricityRate();

  const wattage =
    toPositiveNumber(
      appliance['Wattage']
    );

  const quantity =
    toPositiveNumber(
      appliance['Quantity']
    ) || 1;

  const usageType =
    toSafeString(
      appliance['Usage Type']
    ) || 'Hours per day';

  const daysPerMonth =
    toPositiveNumber(
      appliance['Days Per Month']
    ) || 30;

  const loadFactor =
    normalizeLoadFactor(
      appliance['Load Factor']
    );

  const estimatedKwhPerDay =
    toPositiveNumber(
      appliance['Estimated kWh Per Day']
    );

  /**
   * ---------------------------------------------------
   * CUSTOM DAILY kWh OVERRIDE
   * ---------------------------------------------------
   *
   * If the user knows the appliance's estimated
   * daily consumption, use that instead of wattage.
   */
  if (estimatedKwhPerDay > 0) {

    const monthlyKwh =
      estimatedKwhPerDay *
      daysPerMonth *
      quantity;

    const monthlyCost =
      monthlyKwh *
      rate;

    return {

      applianceId:
        appliance['Appliance ID'],

      applianceName:
        appliance['Appliance Name'],

      category:
        appliance['Category'],

      dailyKwh:
        roundNumber(
          estimatedKwhPerDay *
          quantity,
          4
        ),

      monthlyKwh:
        roundNumber(
          monthlyKwh,
          2
        ),

      electricityRate:
        roundNumber(
          rate,
          4
        ),

      monthlyCost:
        roundNumber(
          monthlyCost,
          2
        ),

      calculationMethod:
        'Estimated kWh/day',

      hoursPerDay:
        0,

      effectiveWattage:
        0

    };
  }


  /**
   * ---------------------------------------------------
   * SPECIAL APPLIANCE CALCULATIONS
   * ---------------------------------------------------
   */

  const applianceName =
    toSafeString(
      appliance['Appliance Name']
    ).toLowerCase();


  /**
   * AIRCON
   */
  if (
    applianceName.indexOf('aircon') !== -1
    ||
    applianceName.indexOf('air conditioner') !== -1
    ||
    toPositiveNumber(
      appliance['Aircon HP']
    ) > 0
  ) {

    return calculateAircon(
      appliance,
      rate
    );
  }


  /**
   * REFRIGERATOR
   */
  if (
    applianceName.indexOf(
      'refrigerator'
    ) !== -1
    ||
    applianceName.indexOf(
      'fridge'
    ) !== -1
  ) {

    return calculateRefrigerator(
      appliance,
      rate
    );
  }


  /**
   * RICE COOKER
   */
  if (
    applianceName.indexOf(
      'rice cooker'
    ) !== -1
  ) {

    return calculateRiceCooker(
      appliance,
      rate
    );
  }


  /**
   * STANDARD APPLIANCE
   */
  return calculateStandardAppliance(
    appliance,
    rate
  );
}


/**
 * =====================================================
 * STANDARD APPLIANCE
 * =====================================================
 *
 * Formula:
 *
 * Watts × Quantity × Hours × Days
 * --------------------------------
 *               1000
 */
function calculateStandardAppliance(
  appliance,
  electricityRate
) {

  const rate =
    toPositiveNumber(
      electricityRate
    ) || getDefaultElectricityRate();

  const wattage =
    toPositiveNumber(
      appliance['Wattage']
    );

  const quantity =
    toPositiveNumber(
      appliance['Quantity']
    ) || 1;

  const daysPerMonth =
    toPositiveNumber(
      appliance['Days Per Month']
    ) || 30;

  const loadFactor =
    normalizeLoadFactor(
      appliance['Load Factor']
    );

  const usage =
    calculateUsageHours(
      appliance
    );

  const effectiveWattage =
    wattage *
    loadFactor;

  const dailyKwh =
    (
      effectiveWattage *
      quantity *
      usage.hoursPerDay
    ) / 1000;

  const monthlyKwh =
    dailyKwh *
    daysPerMonth;

  const monthlyCost =
    monthlyKwh *
    rate;

  return {

    applianceId:
      appliance['Appliance ID'],

    applianceName:
      appliance['Appliance Name'],

    category:
      appliance['Category'],

    dailyKwh:
      roundNumber(
        dailyKwh,
        4
      ),

    monthlyKwh:
      roundNumber(
        monthlyKwh,
        2
      ),

    electricityRate:
      roundNumber(
        rate,
        4
      ),

    monthlyCost:
      roundNumber(
        monthlyCost,
        2
      ),

    calculationMethod:
      'Rated wattage',

    hoursPerDay:
      roundNumber(
        usage.hoursPerDay,
        2
      ),

    effectiveWattage:
      roundNumber(
        effectiveWattage,
        2
      )

  };
}


/**
 * =====================================================
 * AIRCON CALCULATION
 * =====================================================
 *
 * Aircon calculation uses:
 *
 * Rated watts
 * × quantity
 * × hours
 * × days
 * × load factor
 *
 * Inverter aircons can use a lower default
 * load factor than non-inverter units.
 */
function calculateAircon(
  appliance,
  electricityRate
) {

  const rate =
    toPositiveNumber(
      electricityRate
    ) || getDefaultElectricityRate();

  const wattage =
    toPositiveNumber(
      appliance['Wattage']
    );

  const quantity =
    toPositiveNumber(
      appliance['Quantity']
    ) || 1;

  const daysPerMonth =
    toPositiveNumber(
      appliance['Days Per Month']
    ) || 30;

  let loadFactor =
    normalizeLoadFactor(
      appliance['Load Factor']
    );

  const airconType =
    toSafeString(
      appliance['Aircon Type']
    );

  /**
   * If no custom load factor was supplied,
   * use an appliance-type estimate.
   */
  if (
    !appliance['Load Factor'] ||
    toNumber(
      appliance['Load Factor']
    ) <= 0
  ) {

    if (
      airconType.toLowerCase() ===
      'inverter'
    ) {

      loadFactor = 0.65;

    } else {

      loadFactor = 0.85;
    }
  }

  const usage =
    calculateUsageHours(
      appliance
    );

  const effectiveWattage =
    wattage *
    loadFactor;

  const dailyKwh =
    (
      effectiveWattage *
      quantity *
      usage.hoursPerDay
    ) / 1000;

  const monthlyKwh =
    dailyKwh *
    daysPerMonth;

  const monthlyCost =
    monthlyKwh *
    rate;

  return {

    applianceId:
      appliance['Appliance ID'],

    applianceName:
      appliance['Appliance Name'],

    category:
      appliance['Category'],

    dailyKwh:
      roundNumber(
        dailyKwh,
        4
      ),

    monthlyKwh:
      roundNumber(
        monthlyKwh,
        2
      ),

    electricityRate:
      roundNumber(
        rate,
        4
      ),

    monthlyCost:
      roundNumber(
        monthlyCost,
        2
      ),

    calculationMethod:
      'Aircon rated wattage + load factor',

    hoursPerDay:
      roundNumber(
        usage.hoursPerDay,
        2
      ),

    effectiveWattage:
      roundNumber(
        effectiveWattage,
        2
      ),

    airconHp:
      toPositiveNumber(
        appliance['Aircon HP']
      ),

    airconType:
      airconType || 'Unknown',

    loadFactor:
      roundNumber(
        loadFactor,
        4
      )

  };
}


/**
 * =====================================================
 * REFRIGERATOR CALCULATION
 * =====================================================
 *
 * Refrigerators are assumed to be operating
 * continuously.
 *
 * Formula:
 *
 * Watts × 24 × Days × Load Factor
 * --------------------------------
 *               1000
 */
function calculateRefrigerator(
  appliance,
  electricityRate
) {

  const rate =
    toPositiveNumber(
      electricityRate
    ) || getDefaultElectricityRate();

  const wattage =
    toPositiveNumber(
      appliance['Wattage']
    );

  const quantity =
    toPositiveNumber(
      appliance['Quantity']
    ) || 1;

  const daysPerMonth =
    toPositiveNumber(
      appliance['Days Per Month']
    ) || 30;

  let loadFactor =
    normalizeLoadFactor(
      appliance['Load Factor']
    );

  /**
   * Refrigerator default load factor.
   *
   * Refrigerators cycle their compressor,
   * so rated wattage should not normally
   * be treated as running 100% of the time.
   */
  if (
    !appliance['Load Factor'] ||
    toNumber(
      appliance['Load Factor']
    ) <= 0
  ) {

    loadFactor = 0.35;
  }

  const hoursPerDay =
    24;

  const effectiveWattage =
    wattage *
    loadFactor;

  const dailyKwh =
    (
      effectiveWattage *
      quantity *
      hoursPerDay
    ) / 1000;

  const monthlyKwh =
    dailyKwh *
    daysPerMonth;

  const monthlyCost =
    monthlyKwh *
    rate;

  return {

    applianceId:
      appliance['Appliance ID'],

    applianceName:
      appliance['Appliance Name'],

    category:
      appliance['Category'],

    dailyKwh:
      roundNumber(
        dailyKwh,
        4
      ),

    monthlyKwh:
      roundNumber(
        monthlyKwh,
        2
      ),

    electricityRate:
      roundNumber(
        rate,
        4
      ),

    monthlyCost:
      roundNumber(
        monthlyCost,
        2
      ),

    calculationMethod:
      'Refrigerator 24/7 + cycling load factor',

    hoursPerDay:
      hoursPerDay,

    effectiveWattage:
      roundNumber(
        effectiveWattage,
        2
      ),

    loadFactor:
      roundNumber(
        loadFactor,
        4
      )

  };
}


/**
 * =====================================================
 * RICE COOKER CALCULATION
 * =====================================================
 *
 * Rice cooker supports:
 *
 * Cooking hours
 * +
 * Warm-mode hours
 *
 * If cooking/warm hours are provided,
 * they are used instead of the standard
 * usage hours.
 *
 * Since warm mode normally consumes less
 * power, we estimate warm mode at 30%
 * of the rated wattage.
 */
function calculateRiceCooker(
  appliance,
  electricityRate
) {

  const rate =
    toPositiveNumber(
      electricityRate
    ) || getDefaultElectricityRate();

  const wattage =
    toPositiveNumber(
      appliance['Wattage']
    );

  const quantity =
    toPositiveNumber(
      appliance['Quantity']
    ) || 1;

  const daysPerMonth =
    toPositiveNumber(
      appliance['Days Per Month']
    ) || 30;

  const cookingHours =
    toPositiveNumber(
      appliance['Cooking Hours']
    );

  const warmModeHours =
    toPositiveNumber(
      appliance['Warm Mode Hours']
    );

  /**
   * Cooking uses 100% rated wattage.
   */
  const cookingKwhPerDay =
    (
      wattage *
      quantity *
      cookingHours
    ) / 1000;

  /**
   * Warm mode estimated at 30%.
   */
  const warmModeKwhPerDay =
    (
      wattage *
      0.30 *
      quantity *
      warmModeHours
    ) / 1000;

  const dailyKwh =
    cookingKwhPerDay +
    warmModeKwhPerDay;

  const monthlyKwh =
    dailyKwh *
    daysPerMonth;

  const monthlyCost =
    monthlyKwh *
    rate;

  return {

    applianceId:
      appliance['Appliance ID'],

    applianceName:
      appliance['Appliance Name'],

    category:
      appliance['Category'],

    dailyKwh:
      roundNumber(
        dailyKwh,
        4
      ),

    monthlyKwh:
      roundNumber(
        monthlyKwh,
        2
      ),

    electricityRate:
      roundNumber(
        rate,
        4
      ),

    monthlyCost:
      roundNumber(
        monthlyCost,
        2
      ),

    calculationMethod:
      'Rice cooker cooking + warm mode',

    hoursPerDay:
      roundNumber(
        cookingHours +
        warmModeHours,
        2
      ),

    cookingHours:
      cookingHours,

    warmModeHours:
      warmModeHours,

    effectiveWattage:
      wattage

  };
}


/**
 * =====================================================
 * USAGE HOURS CALCULATION
 * =====================================================
 *
 * Converts different usage types into
 * equivalent hours per day.
 */
function calculateUsageHours(
  appliance
) {

  const usageType =
    toSafeString(
      appliance['Usage Type']
    );

  const daysPerMonth =
    toPositiveNumber(
      appliance['Days Per Month']
    ) || 30;

  let hoursPerDay = 0;

  switch (
    usageType
  ) {

    /**
     * 24/7
     */
    case 'Continuous (24/7)':

      hoursPerDay = 24;

      break;


    /**
     * Direct hours/day.
     */
    case 'Hours per day':

      hoursPerDay =
        toPositiveNumber(
          appliance['Hours Per Day']
        );

      break;


    /**
     * Uses per day.
     *
     * We need an assumed duration.
     *
     * For the MVP, this uses the appliance's
     * Hours Per Day value as hours per use.
     */
    case 'Uses per day':

      hoursPerDay =
        toPositiveNumber(
          appliance['Uses Per Day']
        )
        *
        toPositiveNumber(
          appliance['Hours Per Day']
        );

      break;


    /**
     * Uses per week.
     */
    case 'Uses per week':

      hoursPerDay =
        (
          toPositiveNumber(
            appliance['Uses Per Week']
          )
          *
          toPositiveNumber(
            appliance['Hours Per Day']
          )
        ) / 7;

      break;


    /**
     * Uses per month.
     */
    case 'Uses per month':

      hoursPerDay =
        (
          toPositiveNumber(
            appliance['Uses Per Month']
          )
          *
          toPositiveNumber(
            appliance['Hours Per Day']
          )
        ) /
        daysPerMonth;

      break;


    /**
     * Default.
     */
    default:

      hoursPerDay =
        toPositiveNumber(
          appliance['Hours Per Day']
        );

      break;
  }

  /**
   * Prevent impossible usage.
   */
  hoursPerDay =
    clamp(
      hoursPerDay,
      0,
      24
    );

  return {

    hoursPerDay:
      hoursPerDay

  };
}


/**
 * =====================================================
 * NORMALIZE LOAD FACTOR
 * =====================================================
 *
 * Accepts:
 *
 * 0.65
 * or
 * 65
 *
 * and returns:
 *
 * 0.65
 */
function normalizeLoadFactor(
  value
) {

  let loadFactor =
    toNumber(
      value
    );

 if (
!value ||
loadFactor <= 0
) {

return 1;

}

  if (loadFactor > 1) {

    loadFactor =
      loadFactor / 100;
  }

  return clamp(
    loadFactor,
    0,
    1
  );
}


/**
 * =====================================================
 * CALCULATE ALL APPLIANCES
 * =====================================================
 */
function calculateAllAppliances(
  userId,
  month
) {

  try {

    userId =
      toSafeString(
        userId
      );

    month =
      toSafeString(
        month
      ) || getCurrentMonth();

    if (!userId) {

      throw new Error(
        'User ID is required.'
      );
    }

    const applianceResult =
      getActiveAppliances(
        userId
      );

    if (!applianceResult.success) {
      return applianceResult;
    }

    const appliances =
      applianceResult.data;

    const rate =
      getElectricityRateForMonth(
        month
      );

    const calculations = [];

    let totalKwh = 0;

    let totalCost = 0;

    appliances.forEach(
      function(appliance) {

        const calculation =
          calculateAppliance(
            appliance,
            rate
          );

        calculations.push(
          calculation
        );

        totalKwh +=
          calculation.monthlyKwh;

        totalCost +=
          calculation.monthlyCost;

      }
    );

    /**
     * Calculate percentage contribution.
     */
    calculations.forEach(
      function(item) {

        item.percentageContribution =
          totalKwh > 0
            ? roundNumber(
                (
                  item.monthlyKwh /
                  totalKwh
                ) * 100,
                2
              )
            : 0;

      }
    );

    const daysInMonth =
new Date(
  Number(month.split('-')[0]),
  Number(month.split('-')[1]),
  0
)
.getDate();


return successResponse({

  month:
    month,

  electricityRate:
    rate,

  totalKwh:
    roundNumber(
      totalKwh,
      2
    ),

  totalCost:
    roundNumber(
      totalCost,
      2
    ),

  daysInMonth:
    daysInMonth,

  averageDailyKwh:
    roundNumber(
      totalKwh / daysInMonth,
      2
    ),

  averageDailyCost:
    roundNumber(
      totalCost / daysInMonth,
      2
    ),

  appliances:
    calculations

});

  } catch (error) {

    return errorResponse(
      error,
      'Unable to calculate appliance consumption.'
    );
  }
}


/**
 * =====================================================
 * RANK APPLIANCES
 * =====================================================
 *
 * Highest electricity consumers first.
 */
function rankAppliances(
  userId,
  month,
  precalculatedResult
) {

  try {

    /*
     * Reuse an already-computed calculation pass
     * (e.g. from getDashboard) instead of hitting
     * the spreadsheet and recalculating again.
     */
    const result =
      precalculatedResult ||
      calculateAllAppliances(
        userId,
        month
      );

    if (!result.success) {
      return result;
    }

    const appliances =
      result.data.appliances
        .slice();

    appliances.sort(
      function(a, b) {

        return (
          b.monthlyCost -
          a.monthlyCost
        );

      }
    );

    appliances.forEach(
      function(item, index) {

        item.rank =
          index + 1;

      }
    );

    return successResponse(
      appliances,
      'Appliance ranking calculated successfully.'
    );

  } catch (error) {

    return errorResponse(
      error,
      'Unable to rank appliances.'
    );
  }
}


/**
 * =====================================================
 * CATEGORY BREAKDOWN
 * =====================================================
 */
function getCategoryBreakdown(
  userId,
  month,
  precalculatedResult
) {

  try {

    /*
     * Reuse an already-computed calculation pass
     * (e.g. from getDashboard) instead of hitting
     * the spreadsheet and recalculating again.
     */
    const result =
      precalculatedResult ||
      calculateAllAppliances(
        userId,
        month
      );

    if (!result.success) {
      return result;
    }

    const appliances =
      result.data.appliances;

    const categories = {};

    appliances.forEach(
      function(item) {

        const category =
          item.category ||
          'Other Appliances';

        if (
          !categories[category]
        ) {

          categories[category] = {

            category:
              category,

            monthlyKwh:
              0,

            monthlyCost:
              0,

            applianceCount:
              0

          };
        }

        categories[category]
          .monthlyKwh +=
          item.monthlyKwh;

        categories[category]
          .monthlyCost +=
          item.monthlyCost;

        categories[category]
          .applianceCount +=
          1;

      }
    );

    const totalKwh =
      result.data.totalKwh;

    const breakdown =
      Object.keys(
        categories
      ).map(
        function(category) {

          const item =
            categories[category];

          return {

            category:
              item.category,

            monthlyKwh:
              roundNumber(
                item.monthlyKwh,
                2
              ),

            monthlyCost:
              roundNumber(
                item.monthlyCost,
                2
              ),

            applianceCount:
              item.applianceCount,

            percentageContribution:
              totalKwh > 0
                ? roundNumber(
                    (
                      item.monthlyKwh /
                      totalKwh
                    ) * 100,
                    2
                  )
                : 0

          };

        }
      );

    breakdown.sort(
      function(a, b) {

        return (
          b.monthlyCost -
          a.monthlyCost
        );

      }
    );

    return successResponse(
      breakdown,
      'Category breakdown calculated successfully.'
    );

  } catch (error) {

    return errorResponse(
      error,
      'Unable to calculate category breakdown.'
    );
  }
}


/**
 * =====================================================
 * CALCULATE SINGLE APPLIANCE
 * =====================================================
 */
function calculateSingleAppliance(
  applianceId,
  userId,
  month
) {

  try {

    const records =
  getUserSheetRecords(
    userId,
    SHEETS.APPLIANCES
  );

let appliance = null;

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

    appliance =
      records[i];

    break;

  }

}

    if (!appliance) {

      throw new Error(
        'Appliance not found.'
      );
    }

    month =
      toSafeString(
        month
      ) || getCurrentMonth();

    const rate =
      getElectricityRateForMonth(
        month
      );

    const calculation =
      calculateAppliance(
        appliance,
        rate
      );

    return successResponse(
      calculation,
      'Appliance calculation completed.'
    );

  } catch (error) {

    return errorResponse(
      error,
      'Unable to calculate appliance.'
    );
  }
}


/**
 * =====================================================
 * SAVE MONTHLY ESTIMATES
 * =====================================================
 *
 * Saves calculated appliance estimates
 * to Monthly_Estimates.
 */
function saveMonthlyEstimates(
  userId,
  month
) {

  try {

    userId =
      toSafeString(
        userId
      );

    month =
      toSafeString(
        month
      ) || getCurrentMonth();

    if (!userId) {

      throw new Error(
        'User ID is required.'
      );
    }

    const result =
      calculateAllAppliances(
        userId,
        month
      );

    if (!result.success) {
      return result;
    }

    const sheet =
  getUserSheet(
    userId,
    SHEETS.ESTIMATES
  );

    /**
     * Remove previous estimates for
     * this user and month.
     */
    removeMonthlyEstimates(
      userId,
      month
    );

    const now =
      getNow();

    const rows = [];

    result.data.appliances
      .forEach(
        function(item) {

          const alert =
            getApplianceAlertStatus(
              item
            );

          rows.push([

            generateId(
              'EST'
            ),

            userId,

            month,

            item.applianceId,

            item.applianceName,

            item.category,

            item.monthlyKwh,

            item.monthlyCost,

            item.percentageContribution,

            alert.message,

            now

          ]);

        }
      );

    if (rows.length > 0) {

      sheet
        .getRange(
          sheet.getLastRow() + 1,
          1,
          rows.length,
          rows[0].length
        )
        .setValues(
          rows
        );
    }

    return successResponse({

      month:
        month,

      totalKwh:
        result.data.totalKwh,

      totalCost:
        result.data.totalCost,

      savedRecords:
        rows.length

    }, 'Monthly estimates saved successfully.');

  } catch (error) {

    return errorResponse(
      error,
      'Unable to save monthly estimates.'
    );
  }
}


/**
 * =====================================================
 * REMOVE MONTHLY ESTIMATES
 * =====================================================
 */
function removeMonthlyEstimates(
  userId,
  month
) {

 const sheet =
getUserSheet(
  userId,
  SHEETS.ESTIMATES
);

  const lastRow =
    sheet.getLastRow();

  if (lastRow < 2) {
    return;
  }

  const values =
    sheet
      .getRange(
        2,
        1,
        lastRow - 1,
        3
      )
      .getValues();

  /**
   * Delete from bottom to top.
   */
  for (
    let i = values.length - 1;
    i >= 0;
    i--
  ) {

    const rowUserId =
      toSafeString(
        values[i][1]
      );

    const rowMonth =
      toSafeString(
        values[i][2]
      );

    if (
      rowUserId === userId &&
      rowMonth === month
    ) {

      sheet.deleteRow(
        i + 2
      );
    }
  }
}


/**
 * =====================================================
 * GET MONTHLY ESTIMATES
 * =====================================================
 */
function getMonthlyEstimates(
  userId,
  month
) {

  try {

    userId =
      toSafeString(
        userId
      );

    month =
      toSafeString(
        month
      ) || getCurrentMonth();

    if (!userId) {

      throw new Error(
        'User ID is required.'
      );
    }

    const records =
  getUserSheetRecords(
    userId,
    SHEETS.ESTIMATES
  );

    const results =
      records.filter(
        function(record) {

          return (
            toSafeString(
              record['User ID']
            ) === userId
            &&
            toSafeString(
              record['Month']
            ) === month
          );

        }
      );

    return successResponse(
      serializeRecords(
        results
      ),
      'Monthly estimates loaded successfully.'
    );

  } catch (error) {

    return errorResponse(
      error,
      'Unable to load monthly estimates.'
    );
  }
}


/**
 * =====================================================
 * ALERT STATUS
 * =====================================================
 */
function getApplianceAlertStatus(
  calculation
) {

  const kwhThreshold =
    getAlertKwhThreshold();

  const costThreshold =
    getAlertCostThreshold();

  if (
    calculation.monthlyKwh >=
    kwhThreshold
    &&
    calculation.monthlyCost >=
    costThreshold
  ) {

    return {

      alert: true,

      type:
        'High Consumption & High Cost',

      message:
        calculation.applianceName +
        ' is estimated to consume ' +
        formatNumber(
          calculation.monthlyKwh,
          2
        ) +
        ' kWh/month and cost approximately ' +
        formatPHP(
          calculation.monthlyCost
        ) +
        ' per month.'

    };
  }

  if (
    calculation.monthlyKwh >=
    kwhThreshold
  ) {

    return {

      alert: true,

      type:
        'High Consumption',

      message:
        calculation.applianceName +
        ' is estimated to consume ' +
        formatNumber(
          calculation.monthlyKwh,
          2
        ) +
        ' kWh/month.'

    };
  }

  if (
    calculation.monthlyCost >=
    costThreshold
  ) {

    return {

      alert: true,

      type:
        'High Cost',

      message:
        calculation.applianceName +
        ' is estimated to cost approximately ' +
        formatPHP(
          calculation.monthlyCost
        ) +
        ' per month.'

    };
  }

  return {

    alert: false,

    type:
      '',

    message:
      ''

  };
}


/**
 * =====================================================
 * GET HIGH CONSUMPTION APPLIANCES
 * =====================================================
 */
function getHighConsumptionAppliances(
  userId,
  month,
  precalculatedRanking
) {

  try {

    /*
     * Reuse an already-computed ranking
     * (e.g. from getDashboard) instead of
     * recalculating all appliances again.
     */
    const result =
      precalculatedRanking ||
      rankAppliances(
        userId,
        month
      );

    if (!result.success) {
      return result;
    }

    const highConsumption =
      result.data.filter(
        function(item) {

          const alert =
            getApplianceAlertStatus(
              item
            );

          return alert.alert;

        }
      );

    return successResponse(
      highConsumption,
      'High consumption appliances loaded successfully.'
    );

  } catch (error) {

    return errorResponse(
      error,
      'Unable to identify high consumption appliances.'
    );
  }
}


/**
 * =====================================================
 * TEST CALCULATIONS
 * =====================================================
 *
 * Runs basic calculation tests without
 * requiring a spreadsheet record.
 */
function testCalculationsModule() {

  try {

    const testAircon = {

      'Appliance ID':
        'TEST-AIRCON',

      'Appliance Name':
        'Test Aircon',

      'Category':
        'Heavy Appliances',

      'Wattage':
        1200,

      'Quantity':
        1,

      'Usage Type':
        'Hours per day',

      'Hours Per Day':
        8,

      'Days Per Month':
        30,

      'Load Factor':
        0.65,

      'Aircon HP':
        1.5,

      'Aircon Type':
        'Inverter',

      'Estimated kWh Per Day':
        0

    };


    const airconResult =
  calculateAppliance(
    testAircon,
    getDefaultElectricityRate()
  );


    if (
      airconResult.monthlyKwh <= 0
    ) {

      throw new Error(
        'Aircon calculation returned zero.'
      );
    }


    const testStandard = {

      'Appliance ID':
        'TEST-LIGHT',

      'Appliance Name':
        'Test LED Light',

      'Category':
        'Lighting',

      'Wattage':
        10,

      'Quantity':
        5,

      'Usage Type':
        'Hours per day',

      'Hours Per Day':
        5,

      'Days Per Month':
        30,

      'Load Factor':
        1,

      'Estimated kWh Per Day':
        0

    };


    const standardResult =
  calculateAppliance(
    testStandard,
    getDefaultElectricityRate()
  );


    if (
      standardResult.monthlyKwh <= 0
    ) {

      throw new Error(
        'Standard appliance calculation returned zero.'
      );
    }


    return {

      success: true,

      message:
        'Calculations module tests passed.',

      aircon:
        airconResult,

      standard:
        standardResult

    };

  } catch (error) {

    return {

      success: false,

      message:
        error.message ||
        'Calculations module test failed.'

    };

  }
}
