

/* =====================================================
   GLOBAL STATE
   ===================================================== */

const APP = {

  userId:'',
  email:'',
  householdName:'',
  month:'',
  dashboard:null,
  appliances:[],
  actualBills:[]

};


/* =====================================================
   INITIALIZATION
   ===================================================== */

document.addEventListener(
  'DOMContentLoaded',
  function() {

    initializeApp();

    const editButton =
      document.getElementById(
        'editBillButton'
      );

    console.log(
      'EDIT BUTTON FOUND:',
      editButton
    );

    if (editButton) {

      editButton.addEventListener(
        'click',
        function() {

          console.log(
            'EDIT CLICK'
          );

          enableBillEdit();

        }
      );

    }

  }
);



function initializeApp() {

  const now =
    new Date();


  APP.month =
    now.getFullYear() +
    '-' +
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      '0'
    );


  const monthSelector =
  document.getElementById('selectedMonth');

if (monthSelector) {

  monthSelector.innerHTML = '';

  const currentDate = new Date();

  for (let i = 0; i < 12; i++) {

    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - i,
      1
    );

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, '0');

    const option =
      document.createElement('option');

    option.value =
      `${year}-${month}`;

    option.textContent =
      date.toLocaleDateString(
        'en-US',
        {
          month: 'long',
          year: 'numeric'
        }
      );

    monthSelector.appendChild(option);
  }

  monthSelector.value =
    APP.month;
}


  document
    .getElementById(
      'rateMonth'
    )
    .value =
    APP.month;


  document
    .getElementById(
      'billMonth'
    )
    .value =
    APP.month;


  /*
   * ==================================================
   * RESTORE EMAIL / HOUSEHOLD ONLY
   *
   * DO NOT restore the User ID from localStorage.
   *
   * The real User ID must always come from
   * getUserIdByEmail().
   * ==================================================
   */

  const savedEmail =
    localStorage.getItem(
      'electricityTrackerEmail'
    );


  const savedHousehold =
    localStorage.getItem(
      'electricityTrackerHousehold'
    );


  if (savedEmail) {

    document
      .getElementById(
        'userEmail'
      )
      .value =
      savedEmail;


    document
      .getElementById(
        'householdName'
      )
      .value =
      savedHousehold ||
      'My Household';


    /*
     * Clear any old/stale User ID.
     */
    localStorage.removeItem(
      'electricityTrackerUserId'
    );


    APP.userId =
      '';


    APP.email =
      savedEmail;


    APP.householdName =
      savedHousehold ||
      'My Household';

  }

}



/* =====================================================
   HOUSEHOLD SETUP
   ===================================================== */
function startTracker() {

  const email =
    document
      .getElementById(
        'userEmail'
      )
      .value
      .trim()
      .toLowerCase();

  const password =
    document
      .getElementById(
        'userPassword'
      )
      .value
      .trim();


  if (!email) {

    showToast(
      'Please enter your email.'
    );

    return;
  }


  if (!password) {

    showToast(
      'Please enter your password.'
    );

    return;
  }


  if (!isValidEmail(email)) {

    showToast(
      'Please enter a valid email address.'
    );

    return;
  }


  APP.email =
    email;

  APP.password =
    password;


  console.log(
    'Looking up user by email: ' +
    email
  );


  showLoading(
    'Loading your WattWise dashboard...'
  );


  getUserIdByLogin(
    email,
    password
  )

    .then(function(result) {


        if (
          !result ||
          !result.success
        ) {

          console.error(
            'Unable to find user:',
            result
          );

          hideLoading();

          const errorBox =
            document.getElementById(
              "loginError"
            );


          if (errorBox) {

            errorBox.innerText =
              result &&
              result.message
                ? result.message
                : "Invalid email or password.";


            errorBox.classList.add(
              "show"
            );

          }


          return;
        }


        /*
         * ==================================================
         * IMPORTANT
         *
         * Use the REAL User ID from the Users sheet.
         *
         * Example:
         *
         * trexia.olaya@pdax.ph
         *            ↓
         *         USER-006
         * ==================================================
         */

        APP.userId =
          result.userId;

/*
 * ==================================================
 * CREATE USER SPREADSHEET IF MISSING
 * ==================================================
 */

if (
  !result.spreadsheetId
) {

  console.log(
    "No spreadsheet found. Creating household spreadsheet..."
  );


  showLoading(
    "Creating your household spreadsheet..."
  );


  getUserSpreadsheet(APP.userId)

    .then(function(sheetResult){

      console.log(
        "Spreadsheet created:",
        sheetResult
      );


      if(
        !sheetResult ||
        !sheetResult.success
      ){

        showToast(
          sheetResult.message ||
          "Unable to create household spreadsheet."
        );

        hideLoading();

        return;

      }


      console.log(
        "Spreadsheet ID:",
        sheetResult.data.id
      );


      console.log(
        "Spreadsheet URL:",
        sheetResult.data.url
      );


      continueLoadingApp();

      console.log(
        "Continuing app after spreadsheet creation"
      );

      console.log(
        "Current APP.userId:",
        APP.userId
      );

      console.log(
        "Current APP.email:",
        APP.email
      );

    })

  .catch(function(error){

      console.error(
        error
      );

      hideLoading();

      showToast(
        getErrorMessage(error)
      );

    });


  return;

}

        console.log(
          '================================'
        );

        console.log(
          'LOGIN SUCCESS'
        );

        console.log(
          'Email: ' +
          result.email
        );

        console.log(
          'Actual User ID: ' +
          APP.userId
        );

        console.log(
          'Household: ' +
          result.householdName
        );

        console.log(
          'Access Status: ' +
          result.accessStatus
        );

        console.log(
          '================================'
        );


        /*
         * ==================================================
         * SAVE ONLY AFTER USER ID HAS BEEN FOUND
         * ==================================================
         */

        localStorage.setItem(
          'electricityTrackerEmail',
          APP.email
        );

        localStorage.setItem(
          'electricityTrackerHousehold',
          APP.householdName
        );

        localStorage.setItem(
          'electricityTrackerUserId',
          APP.userId
        );


        /*
         * ==================================================
         * NOW LOAD THE APPLICATION
         * ==================================================
         */

        if(
  result.spreadsheetId
){

  continueLoadingApp();

}

      })

      .catch(function(error) {

        hideLoading();

        console.error(
          'User lookup failed:',
          error
        );

        showToast(
          getErrorMessage(error)
        );

      });

}


/* =====================================================
   SHOW DASHBOARD
   ===================================================== */

function showDashboard() {

  document
    .getElementById(
      'setupSection'
    )
    .classList
    .add(
      'hidden'
    );


  document
    .getElementById(
      'dashboardSection'
    )
    .classList
    .remove(
      'hidden'
    );


  document.getElementById('householdGreeting').textContent =
  'WattWise Dashboard';


}

/* =====================================================
   REFRESH DASHBOARD
   ===================================================== */

function refreshDashboard() {

  if (!APP.userId) {
    return;
  }

  const month =
    document.getElementById('selectedMonth').value ||
    APP.month;

  APP.month = month;

  console.log(
    'Refreshing dashboard for:',
    month
  );

  /*
   * Don't block the entire application
   * while dashboard data loads.
   */
  getDashboard(
    APP.userId,
    month
  )

    .then(function(result) {

      console.log(
        'Dashboard data received:',
        result
      );

      if (
        !result ||
        !result.success
      ) {

        showToast(
          result && result.message
            ? result.message
            : 'Unable to load dashboard.'
        );

        return;
      }

      APP.dashboard = result.data;

      /*
       * Render dashboard.
       */
      renderDashboard(result.data);


      /*
       * Re-render appliance table after
       * applianceRanking is available.
       */
      if (
        APP.appliances &&
        APP.appliances.length
      ) {

        renderApplianceTable(
          APP.appliances
        );

      }

      /*
       * Appliance table may have already rendered
       * before dashboard data arrived, so refresh
       * it now that appliance ranking figures exist.
       */
      if (APP.appliances) {

        renderApplianceTable(
          APP.appliances
        );

      }

    })

    .catch(function(error) {

      console.error(
        'Dashboard loading failed:',
        error
      );

      showToast(
        getErrorMessage(error)
      );

    });

}

/* =====================================================
   RENDER DASHBOARD
   ===================================================== */

function renderDashboard(
  data
) {

  if (!data) {
    return;
  }


  /**
   * Summary.
   */
  document
    .getElementById(
      'totalCost'
    )
    .textContent =
    formatPHP(
      data.currentMonth.totalCost
    );


  document
    .getElementById(
      'totalKwh'
    )
    .textContent =
    formatNumber(
      data.currentMonth.totalKwh,
      2
    ) +
    ' kWh';


  document
    .getElementById(
      'electricityRate'
    )
    .textContent =
    formatPHP(
      data.currentMonth.electricityRate
    );

console.log(
  "Electricity rate received:",
  data.currentMonth.electricityRate
);

  /**
   * Highest consumer.
   */
  if (
    data.highestConsumer
  ) {

    document
      .getElementById(
        'highestConsumer'
      )
      .textContent =
      data.highestConsumer
        .applianceName;


    document
      .getElementById(
        'highestConsumerCost'
      )
      .textContent =
      formatPHP(
        data.highestConsumer
          .monthlyCost
      ) +
      ' / month';

  } else {

    document
      .getElementById(
        'highestConsumer'
      )
      .textContent =
      'None yet';


    document
      .getElementById(
        'highestConsumerCost'
      )
      .textContent =
      'Add your appliances';

  }


  /**
   * Month-to-month change.
   */
  renderChange(
    'costChange',
    data.comparison
      .costPercentageChange,
    data.comparison
      .costChange
  );


  renderChange(
    'kwhChange',
    data.comparison
      .kwhPercentageChange,
    data.comparison
      .kwhChange
  );


  /**
   * Ranking.
   */
  renderRanking(
    data.applianceRanking
  );


  /**
   * Categories.
   */
  renderCategories(
    data.categoryBreakdown
  );


  /**
   * Alerts.
   */
  renderAlerts(
    data.alerts
  );


  /**
   * Actual bill.
   */
  renderActualBill(
    data.actualBill
  );


  /**
   * Tip.
   */
  generateEnergyTip(
    data
  );

}


/* =====================================================
   CHANGE DISPLAY
   ===================================================== */

function renderChange(
  elementId,
  percentage,
  difference
) {

  const element =
    document.getElementById(
      elementId
    );


  percentage =
    Number(
      percentage || 0
    );


  difference =
    Number(
      difference || 0
    );


  if (
    Math.abs(
      percentage
    ) < 0.01
  ) {

    element.textContent =
      'No significant change';

    return;

  }


  if (
    percentage > 0
  ) {

    element.textContent =
      '↑ ' +
      formatNumber(
        Math.abs(
          percentage
        ),
        1
      ) +
      '% vs previous month';

    element.style.color =
      '#c45151';

  } else {

    element.textContent =
      '↓ ' +
      formatNumber(
        Math.abs(
          percentage
        ),
        1
      ) +
      '% vs previous month';

    element.style.color =
      '#3b9141';

  }

}


/* =====================================================
   RENDER RANKING
   ===================================================== */

function renderRanking(
  ranking
) {

  const container =
    document.getElementById(
      'applianceRanking'
    );


  container.innerHTML =
    '';


  if (
    !ranking ||
    ranking.length === 0
  ) {

    container.innerHTML =
      '<div class="empty-state">' +
      'Add appliances to see your biggest electricity consumers.' +
      '</div>';

    return;

  }


  const maxCost =
    Math.max.apply(
      null,
      ranking.map(
        function(item) {

          return Number(
            item.monthlyCost || 0
          );

        }
      )
    );


  ranking
    .slice(
      0,
      8
    )
    .forEach(
      function(item, index) {

        const percentage =
          maxCost > 0
            ? (
                Number(
                  item.monthlyCost
                ) /
                maxCost
              ) * 100
            : 0;


        const div =
          document.createElement(
            'div'
          );


        div.className =
          'ranking-item';


        div.innerHTML = `

          <div class="ranking-top">

            <div class="ranking-name">

              ${index + 1}.
              ${escapeHtml(
                item.applianceName
              )}

            </div>

            <div class="ranking-cost">

              ${formatPHP(
                item.monthlyCost
              )}

            </div>

          </div>


          <div class="ranking-meta">

            <span>
              ${formatNumber(
                item.monthlyKwh,
                2
              )} kWh/month
            </span>

            <span>
              ${formatNumber(
                item.percentageContribution,
                1
              )}%
            </span>

          </div>


          <div class="progress-bar">

            <div
              class="progress-fill"
              style="width:${percentage}%">
            </div>

          </div>

        `;


        container.appendChild(
          div
        );

      }
    );

}


/* =====================================================
   RENDER CATEGORIES
   ===================================================== */

function renderCategories(
  categories
) {

  const container =
    document.getElementById(
      'categoryBreakdown'
    );


  container.innerHTML =
    '';


  if (
    !categories ||
    categories.length === 0
  ) {

    container.innerHTML =
      '<div class="empty-state">' +
      'No category data yet.' +
      '</div>';

    return;

  }


  categories.forEach(
    function(item) {

      const div =
        document.createElement(
          'div'
        );


      div.className =
        'category-item';


      div.innerHTML = `

        <div class="category-top">

          <div class="category-name">

            ${escapeHtml(
              item.category
            )}

          </div>

          <div class="category-cost">

            ${formatPHP(
              item.monthlyCost
            )}

          </div>

        </div>


        <div class="ranking-meta">

          <span>
            ${formatNumber(
              item.monthlyKwh,
              2
            )} kWh
          </span>

          <span>
            ${formatNumber(
              item.percentageContribution,
              1
            )}%
          </span>

        </div>


        <div class="progress-bar">

          <div
            class="progress-fill"
            style="width:${Math.min(
              Number(
                item.percentageContribution ||
                0
              ),
              100
            )}%">
          </div>

        </div>

      `;


      container.appendChild(
        div
      );

    }
  );

}


/* =====================================================
   RENDER ALERTS
   ===================================================== */

function renderAlerts(
  alerts
) {

  const container =
    document.getElementById(
      'alertContainer'
    );


  container.innerHTML =
    '';


  if (
    !alerts ||
    alerts.length === 0
  ) {

    container.classList.add(
      'hidden'
    );

    return;

  }


  container.classList.remove(
    'hidden'
  );


  const highest =
    alerts[0];


  container.innerHTML = `

    <div style="
      background:#fff8e8;
      border:1px solid #f2d18b;
      border-radius:10px;
      padding:15px 18px;
      margin-bottom:18px;
    ">

      <strong>
        ⚠️ High electricity consumers
      </strong>

      <div style="
        margin-top:5px;
        font-size:13px;
      ">

        ${escapeHtml(
          highest.applianceName
        )}
        is one of your biggest electricity
        consumers at approximately
        <strong>
          ${formatPHP(
            highest.monthlyCost
          )}
        </strong>
        per month.

      </div>

    </div>

  `;

}




function renderActualBill(actual) {

  const amount =
    document.getElementById(
      'actualBillAmount'
    );

  const message =
    document.getElementById(
      'actualBillMessage'
    );


  if (!amount || !message) {

    console.error(
      'Actual bill dashboard elements not found.'
    );

    return;

  }


  console.log(
    'RENDERING ACTUAL BILL',
    actual
  );


  const estimated =
    APP.dashboard &&
    APP.dashboard.currentMonth
      ? Number(
          APP.dashboard.currentMonth.totalCost || 0
        )
      : 0;


  const actualAmount =
    actual
      ? Number(
          actual.amount || 0
        )
      : 0;



  // No actual bill yet
  if (
    actualAmount <= 0
  ) {

    amount.textContent =
      formatPHP(
        estimated
      );


    message.textContent =
      'Enter your actual electricity bill to compare it with your estimate.';


    return;

  }


console.log("ESTIMATE:", estimated);
console.log("ACTUAL:", actualAmount);
console.log("DISPLAY TEXT:", 
  formatPHP(estimated) + " vs " + formatPHP(actualAmount)
);


  // Show estimate vs actual
  amount.textContent =
    formatPHP(
      estimated
    )
    +
    ' vs '
    +
    formatPHP(
      actualAmount
    );



  // Comparison message
  if (
    estimated < actualAmount
  ) {

    message.textContent =
      'Your estimated bill is lower than your actual electricity bill.';

  }
  else if (
    estimated > actualAmount
  ) {

    message.textContent =
      'Your estimated bill is higher than your actual electricity bill.';

  }
  else {

    message.textContent =
      'Your estimated bill matches your actual electricity bill.';

  }


}




/* =====================================================
   ENERGY TIP
   ===================================================== */

function generateEnergyTip(
  data
) {

  const tip =
    document.getElementById(
      'energyTip'
    );


  if (
    !data ||
    !data.applianceRanking ||
    !data.applianceRanking.length
  ) {

    tip.textContent =
      'Add your appliances to see which ones are using the most electricity.';

    return;

  }


  const top =
    data.applianceRanking[0];


  const name =
    String(
      top.applianceName ||
      ''
    ).toLowerCase();


  if (
    name.indexOf(
      'aircon'
    ) !== -1
    ||
    name.indexOf(
      'air conditioner'
    ) !== -1
  ) {

    tip.textContent =
      'Your aircon is a major contributor. Check your thermostat setting, clean the filters regularly, and use energy-saving settings when possible.';

    return;

  }


  if (
    name.indexOf(
      'refrigerator'
    ) !== -1
    ||
    name.indexOf(
      'fridge'
    ) !== -1
  ) {

    tip.textContent =
      'Your refrigerator runs all day. Keep the door closed as much as possible and make sure the door seal is working properly.';

    return;

  }


  tip.textContent =
    top.applianceName +
    ' is currently your biggest estimated electricity consumer. Consider reviewing its usage hours first.';

}


/* =====================================================
   LOAD APPLIANCES
   ===================================================== */

function loadAppliances() {

  if (!APP.userId) {
    return;
  }


  getAppliances(APP.userId)

    .then(function(result) {

        if (
          !result ||
          !result.success
        ) {

          return;

        }


        APP.appliances =
          result.data || [];


        if (
          !APP.dashboard ||
          !APP.dashboard.applianceRanking
        ) {

          setTimeout(function() {

            renderApplianceTable(
              APP.appliances
            );

          }, 500);

          return;

        }


        renderApplianceTable(
          APP.appliances
        );

    })

    .catch(function(error) {

        console.error(
          error
        );

      });

}


/* =====================================================
   RENDER APPLIANCE TABLE
   ===================================================== */

function renderApplianceTable(
  appliances
) {

  const tbody =
    document.getElementById(
      'applianceTableBody'
    );


  tbody.innerHTML =
    '';


  if (
    !appliances ||
    appliances.length === 0
  ) {

    tbody.innerHTML = `

      <tr>

        <td
          colspan="8"
          class="empty-state">

          No appliances added yet.

        </td>

      </tr>

    `;

    return;

  }


  const calculations =
    APP.dashboard &&
    APP.dashboard.applianceRanking
      ? APP.dashboard.applianceRanking
      : [];

  appliances.forEach(
    function(appliance) {

      const calculation =
        calculations.find(
          function(item) {

            return (
              String(item.applianceId || item.id || '')
                .trim()
                .toLowerCase()
              ===
              String(appliance['Appliance ID'] || '')
                .trim()
                .toLowerCase()
            );

          }
        );


      const row =
        document.createElement(
          'tr'
        );


      row.innerHTML = `

        <td>

          <div class="table-appliance-name">

            ${escapeHtml(
              appliance['Appliance Name'] ||
              ''
            )}

          </div>

          <div class="table-category">

            ${escapeHtml(
              appliance['Brand / Model'] ||
              ''
            )}

          </div>

        </td>


        <td>

          ${escapeHtml(
            appliance['Category'] ||
            ''
          )}

        </td>


        <td>

          ${formatNumber(
            appliance['Wattage'] || 0,
            0
          )}
          W

        </td>


        <td>

          ${formatUsage(
            appliance
          )}

        </td>


        <td>

          ${
            calculation
              ? formatNumber(
                  calculation.monthlyKwh,
                  2
                ) + ' kWh'
              : '—'
          }

        </td>


        <td>

          ${
            calculation
              ? formatPHP(
                  calculation.monthlyCost
                )
              : '—'
          }

        </td>


        <td>

          ${
            calculation
              ? formatNumber(
                  calculation.percentageContribution,
                  1
                ) + '%'
              : '—'
          }

        </td>


        <td>

          <button
            class="action-button"
            title="Edit"
            onclick="editAppliance(
              '${escapeAttribute(
                appliance['Appliance ID']
              )}'
            )">

            <img src="assets/pencil.png" class="appliance-action-icon" alt="Edit">

          </button>


          <button
            class="action-button delete-action"
            title="Delete"
            onclick="deleteApplianceUI(
              '${escapeAttribute(
                appliance['Appliance ID']
              )}'
            )">

            <img src="assets/trash.png" class="appliance-action-icon" alt="Delete">

          </button>

        </td>

      `;


      tbody.appendChild(
        row
      );

    }
  );

}


/* =====================================================
   FORMAT USAGE
   ===================================================== */

function formatUsage(
  appliance
) {

  const usageType =
    appliance['Usage Type'] ||
    '';


  if (
    usageType ===
    'Continuous (24/7)'
  ) {

    return '24/7';

  }


  const hours =
    Number(
      appliance['Hours Per Day'] || 0
    );


  if (
    usageType ===
    'Hours per day'
  ) {

    return (
      formatNumber(
        hours,
        1
      ) +
      ' hrs/day'
    );

  }


  if (
    usageType ===
    'Uses per day'
  ) {

    return (
      Number(
        appliance['Uses Per Day'] || 0
      ) +
      ' uses/day'
    );

  }


  if (
    usageType ===
    'Uses per week'
  ) {

    return (
      Number(
        appliance['Uses Per Week'] || 0
      ) +
      ' uses/week'
    );

  }


  if (
    usageType ===
    'Uses per month'
  ) {

    return (
      Number(
        appliance['Uses Per Month'] || 0
      ) +
      ' uses/month'
    );

  }


  return '—';

}


/* =====================================================
   ADD APPLIANCE MODAL
   ===================================================== */

function openAddApplianceModal() {

  resetApplianceForm();


  document
    .getElementById(
      'applianceModalTitle'
    )
    .textContent =
    'Add Appliance';


  document
    .getElementById(
      'applianceModal'
    )
    .classList
    .remove(
      'hidden'
    );


  updateSpecialFields();

}


/* =====================================================
   EDIT APPLIANCE
   ===================================================== */

function editAppliance(
  applianceId
) {

  const appliance =
    APP.appliances.find(
      function(item) {

        return (
          item['Appliance ID'] ===
          applianceId
        );

      }
    );


  if (!appliance) {

    showToast(
      'Appliance could not be found.'
    );

    return;

  }


  document
    .getElementById(
      'applianceModalTitle'
    )
    .textContent =
    'Edit Appliance';


  document
    .getElementById(
      'applianceId'
    )
    .value =
    appliance['Appliance ID'] || '';


  document
    .getElementById(
      'applianceName'
    )
    .value =
    appliance['Appliance Name'] || '';


  document
    .getElementById(
      'applianceCategory'
    )
    .value =
    appliance['Category'] || '';


  document
    .getElementById(
      'brandModel'
    )
    .value =
    appliance['Brand / Model'] || '';


  document
    .getElementById(
      'wattage'
    )
    .value =
    appliance['Wattage'] || '';


  document
    .getElementById(
      'quantity'
    )
    .value =
    appliance['Quantity'] || 1;


  document
    .getElementById(
      'usageType'
    )
    .value =
    appliance['Usage Type'] ||
    'Hours per day';


  document
    .getElementById(
      'hoursPerDay'
    )
    .value =
    appliance['Hours Per Day'] || 1;


  document
    .getElementById(
      'usesPerDay'
    )
    .value =
    appliance['Uses Per Day'] || 1;


  document
    .getElementById(
      'usesPerWeek'
    )
    .value =
    appliance['Uses Per Week'] || 1;


  document
    .getElementById(
      'usesPerMonth'
    )
    .value =
    appliance['Uses Per Month'] || 1;


  document
    .getElementById(
      'daysPerMonth'
    )
    .value =
    appliance['Days Per Month'] || 30;


  document
    .getElementById(
      'airconHp'
    )
    .value =
    appliance['Aircon HP'] || '';


  document
    .getElementById(
      'airconType'
    )
    .value =
    appliance['Aircon Type'] || '';


  document
    .getElementById(
      'cookingHours'
    )
    .value =
    appliance['Cooking Hours'] || 1;


  document
    .getElementById(
      'warmModeHours'
    )
    .value =
    appliance['Warm Mode Hours'] || 0;


  document
    .getElementById(
      'estimatedKwhPerDay'
    )
    .value =
    appliance['Estimated kWh Per Day'] || '';


  document
    .getElementById(
      'applianceModal'
    )
    .classList
    .remove(
      'hidden'
    );


  updateUsageFields();

  updateSpecialFields();

}


/* =====================================================
   SAVE APPLIANCE
   ===================================================== */

function saveAppliance(
  event
) {

  event.preventDefault();

console.log('APP.userId = ' + APP.userId);

  const data = {

    applianceId:
      document
        .getElementById(
          'applianceId'
        )
        .value,

    userId:
      APP.userId,

    applianceName:
      document
        .getElementById(
          'applianceName'
        )
        .value
        .trim(),

    category:
      document
        .getElementById(
          'applianceCategory'
        )
        .value,

    brandModel:
      document
        .getElementById(
          'brandModel'
        )
        .value
        .trim(),

    wattage:
      Number(
        document
          .getElementById(
            'wattage'
          )
          .value
      ),

    quantity:
      Number(
        document
          .getElementById(
            'quantity'
          )
          .value
      ),

    usageType:
      document
        .getElementById(
          'usageType'
        )
        .value,

    hoursPerDay:
      Number(
        document
          .getElementById(
            'hoursPerDay'
          )
          .value
      ),

    usesPerDay:
      Number(
        document
          .getElementById(
            'usesPerDay'
          )
          .value
      ),

    usesPerWeek:
      Number(
        document
          .getElementById(
            'usesPerWeek'
          )
          .value
      ),

    usesPerMonth:
      Number(
        document
          .getElementById(
            'usesPerMonth'
          )
          .value
      ),

    daysPerMonth:
      Number(
        document
          .getElementById(
            'daysPerMonth'
          )
          .value
      ),

    airconHp:
      Number(
        document
          .getElementById(
            'airconHp'
          )
          .value
      ),

    airconType:
      document
        .getElementById(
          'airconType'
        )
        .value,

    cookingHours:
      Number(
        document
          .getElementById(
            'cookingHours'
          )
          .value
      ),

    warmModeHours:
      Number(
        document
          .getElementById(
            'warmModeHours'
          )
          .value
      ),

    estimatedKwhPerDay:
      Number(
        document
          .getElementById(
            'estimatedKwhPerDay'
          )
          .value
      ) || 0

  };


  /**
   * Client-side validation.
   */
  if (
    !data.applianceName
  ) {

    showFormMessage(
      'applianceFormMessage',
      'Please enter the appliance name.'
    );

    return;

  }


  if (
    !data.category
  ) {

    showFormMessage(
      'applianceFormMessage',
      'Please select a category.'
    );

    return;

  }


  if (
    data.wattage <= 0
  ) {

    showFormMessage(
      'applianceFormMessage',
      'Please enter a wattage greater than zero.'
    );

    return;

  }


  if (
    data.quantity <= 0
  ) {

    showFormMessage(
      'applianceFormMessage',
      'Quantity must be at least 1.'
    );

    return;

  }


  showLoading(
    'Saving appliance...'
  );


  let request;

  if (data.applianceId) {
    request = updateAppliance(data);
  } else {
    request = addAppliance(data);
  }


  request

      .then(function(result) {

          hideLoading();


          if (
            !result ||
            !result.success
          ) {

            showFormMessage(
              'applianceFormMessage',
              result &&
              result.message
                ? result.message
                : 'Unable to save appliance.'
            );

            return;

          }


          hideLoading();


          closeApplianceModal();


          const loadingText =
            document.getElementById("loadingText");

          const loadingOverlay =
            document.getElementById("loadingOverlay");

          if (loadingText) {
            loadingText.textContent =
              data.applianceId
                ? "Appliance updated successfully"
                : "Appliance saved successfully";
          }

          if (loadingOverlay) {
            loadingOverlay.classList.remove("hidden");
          }

          setTimeout(function(){

            if (loadingOverlay) {
              loadingOverlay.classList.add("hidden");
            }

          }, 1500);


          /*
           * Update the table instantly from the
           * saved record instead of waiting on a
           * round trip fetch + fixed delays.
           */
          const savedAppliance =
            result.data;

          if (!APP.appliances) {
            APP.appliances = [];
          }

          const existingIndex =
            APP.appliances.findIndex(
              function(item) {

                return (
                  String(item['Appliance ID'] || '') ===
                  String(savedAppliance['Appliance ID'] || '')
                );

              }
            );

          if (existingIndex === -1) {
            APP.appliances.push(savedAppliance);
          } else {
            APP.appliances[existingIndex] = savedAppliance;
          }

          renderApplianceTable(
            APP.appliances
          );

          /*
           * Refresh dashboard figures in the background;
           * refreshDashboard() re-renders the table again
           * once the appliance ranking data arrives.
           */
          setTimeout(
            function() {
              refreshDashboard();
            },
            500
          );

      })

      .catch(function(error) {

          hideLoading();


          showFormMessage(
            'applianceFormMessage',
            getErrorMessage(
              error
            )
          );

      });

}


/* =====================================================
   DELETE APPLIANCE
   ===================================================== */

function deleteApplianceUI(
  applianceId
) {

  const appliance =
    APP.appliances.find(
      function(item) {

        return (
          item['Appliance ID'] ===
          applianceId
        );

      }
    );


  const name =
    appliance
      ? appliance['Appliance Name']
      : 'this appliance';


  showLoading(
    'Deleting appliance...'
  );


  deleteAppliance(
    applianceId,
    APP.userId
  )

    .then(function(result) {

        hideLoading();


        if (
          !result ||
          !result.success
        ) {

          showToast(
            result &&
            result.message
              ? result.message
              : 'Unable to delete appliance.'
          );

          return;

        }


        const loadingText =
          document.getElementById("loadingText");

        const loadingOverlay =
          document.getElementById("loadingOverlay");

        if (loadingText) {
          loadingText.textContent =
            "Appliance deleted successfully.";
        }

        if (loadingOverlay) {
          loadingOverlay.classList.remove("hidden");
        }

        setTimeout(function(){

          if (loadingOverlay) {
            loadingOverlay.classList.add("hidden");
          }

        }, 1500);

        APP.appliances =
          APP.appliances.filter(
            function(item) {

              return (
                item['Appliance ID'] !==
                applianceId
              );

            }
          );

        renderApplianceTable(
          APP.appliances
        );

        setTimeout(
          function() {
            refreshDashboard();
          },
          500
        );

      })

    .catch(function(error) {

        hideLoading();

        showToast(
          getErrorMessage(
            error
          )
        );

      });

}


/* =====================================================
   RESET APPLIANCE FORM
   ===================================================== */

function resetApplianceForm() {

  document
    .getElementById(
      'applianceForm'
    )
    .reset();


  document
    .getElementById(
      'applianceId'
    )
    .value =
    '';


  document
    .getElementById(
      'quantity'
    )
    .value =
    1;


  document
    .getElementById(
      'hoursPerDay'
    )
    .value =
    1;


  document
    .getElementById(
      'daysPerMonth'
    )
    .value =
    30;


  document
    .getElementById(
      'cookingHours'
    )
    .value =
    1;


  document
    .getElementById(
      'warmModeHours'
    )
    .value =
    0;


  document
    .getElementById(
      'applianceFormMessage'
    )
    .textContent =
    '';


  updateUsageFields();

  updateSpecialFields();

}


/* =====================================================
   USAGE FIELD DISPLAY
   ===================================================== */

function updateUsageFields() {

  const usageType =
    document
      .getElementById(
        'usageType'
      )
      .value;


  hideElement(
    'usesPerDayGroup'
  );

  hideElement(
    'usesPerWeekGroup'
  );

  hideElement(
    'usesPerMonthGroup'
  );


  if (
    usageType ===
    'Uses per day'
  ) {

    showElement(
      'usesPerDayGroup'
    );

  }


  if (
    usageType ===
    'Uses per week'
  ) {

    showElement(
      'usesPerWeekGroup'
    );

  }


  if (
    usageType ===
    'Uses per month'
  ) {

    showElement(
      'usesPerMonthGroup'
    );

  }

}


/* =====================================================
   SPECIAL APPLIANCE FIELDS
   ===================================================== */

function updateSpecialFields() {

  const name =
    document
      .getElementById(
        'applianceName'
      )
      .value
      .toLowerCase();


  hideElement(
    'airconFields'
  );


  hideElement(
    'riceCookerFields'
  );


  if (
    name.indexOf(
      'aircon'
    ) !== -1
    ||
    name.indexOf(
      'air conditioner'
    ) !== -1
  ) {

    showElement(
      'airconFields'
    );

  }


  if (
    name.indexOf(
      'rice cooker'
    ) !== -1
  ) {

    showElement(
      'riceCookerFields'
    );

  }

}


/* =====================================================
   APPLIANCE NAME LISTENER
   ===================================================== */

document.addEventListener(
  'input',
  function(event) {

    if (
      event.target &&
      event.target.id ===
      'applianceName'
    ) {

      updateSpecialFields();

    }

  }
);


/* =====================================================
   CLOSE APPLIANCE MODAL
   ===================================================== */

function closeApplianceModal() {

  document
    .getElementById(
      'applianceModal'
    )
    .classList
    .add(
      'hidden'
    );

}


/* =====================================================
   RATE MODAL
   ===================================================== */

function openRateModal() {

  document
    .getElementById(
      'rateMonth'
    )
    .value =
    APP.month ||
    getCurrentMonthLocal();


  document
    .getElementById(
      'ratePerKwh'
    )
    .value =
    APP.dashboard &&
    APP.dashboard.currentMonth
      ? APP.dashboard.currentMonth
          .electricityRate
      : '';


  document
    .getElementById(
      'rateModal'
    )
    .classList
    .remove(
      'hidden'
    );

}


function closeRateModal() {

  document
    .getElementById(
      'rateModal'
    )
    .classList
    .add(
      'hidden'
    );

}


/* =====================================================
   SAVE RATE
   ===================================================== */

function saveRate(
  event
) {

  event.preventDefault();


  const data = {

    month:
      document
        .getElementById(
          'rateMonth'
        )
        .value,

    ratePerKwh:
      Number(
        document
          .getElementById(
            'ratePerKwh'
          )
          .value
      ),

    provider:
      document
        .getElementById(
          'rateProvider'
        )
        .value
        .trim(),

    notes:
      document
        .getElementById(
          'rateNotes'
        )
        .value
        .trim(),

    status:
      'Active'

  };


  if (
    !data.month
  ) {

    showFormMessage(
      'rateFormMessage',
      'Please select a month.'
    );

    return;

  }


  if (
    data.ratePerKwh <= 0
  ) {

    showFormMessage(
      'rateFormMessage',
      'Please enter a valid electricity rate.'
    );

    return;

  }


  showLoading(
    'Saving electricity rate...'
  );


  addElectricityRate(data)

    .then(function(result) {

        hideLoading();


        if (
          !result ||
          !result.success
        ) {

          showFormMessage(
            'rateFormMessage',
            result &&
            result.message
              ? result.message
              : 'Unable to save rate.'
          );

          return;

        }


        closeRateModal();


        const loadingText =
          document.getElementById(
            'loadingText'
          );

        const loadingOverlay =
          document.getElementById(
            'loadingOverlay'
          );

        if (loadingText) {
          loadingText.textContent =
            'Electricity rate saved successfully';
        }

        if (loadingOverlay) {
          loadingOverlay.classList.remove(
            'hidden'
          );
        }

        setTimeout(function(){

          if (loadingOverlay) {
            loadingOverlay.classList.add(
              'hidden'
            );
          }

        }, 1500);


        refreshDashboard();

      })

    .catch(function(error) {

        hideLoading();


        showFormMessage(
          'rateFormMessage',
          getErrorMessage(
            error
          )
        );

      });

}


/* =====================================================
   ACTUAL BILL MODAL
   ===================================================== */

function openActualBillModal() {

  console.log(
    "OPEN ACTUAL BILL MODAL"
  );


  /*
   * Show loading message immediately
   */
  const loadingBox =
    document.querySelector(
      ".loading-box"
    );

  const loadingText =
    document.getElementById(
      "loadingText"
    );


  if(loadingText){

    loadingText.textContent =
  "Loading current bill...";

  }


  if(loadingBox){

    loadingBox.style.display =
      "flex";

  }


  /*
   * Set current bill month
   */
  document
    .getElementById(
      "billMonth"
    )
    .value =
    APP.month ||
    getCurrentMonthLocal();


  /*
   * Open actual bill modal
   */
  document
    .getElementById(
      "actualBillModal"
    )
    .classList
    .remove(
      "hidden"
    );

}

function closeActualBillModal() {

  document
    .getElementById(
      'actualBillModal'
    )
    .classList
    .add(
      'hidden'
    );

}



/* =====================================================
   VIEW CURRENT BILL MODAL
   ===================================================== */


function openBillModal(){


  console.log(
    "OPEN ACTUAL BILL MODAL"
  );


  /*
   * SAFETY CHECK
   *
   * If APP.userId is missing,
   * rebuild it using the saved email.
   */


  if(!APP.userId){


    const savedEmail =
      localStorage.getItem(
        'electricityTrackerEmail'
      );


    if(!savedEmail){


      showToast(
        "User session expired. Please login again."
      );


      return;


    }



    console.log(
      "Recovering USER ID from email:",
      savedEmail
    );



    getUserIdByEmail(savedEmail)

      .then(function(result){


          console.log(
            "Recovered user:",
            result
          );



          if(
            !result ||
            !result.success
          ){


            showToast(
              "Unable to recover user account."
            );


            return;


          }



          APP.userId =
            result.userId;



          console.log(
            "Recovered USER ID:",
            APP.userId
          );



          loadActualBills();



        })


      .catch(function(error){


          console.error(
            error
          );


        });



    return;


  }



  loadActualBills();


}






function closeBillModal() {

  document
    .getElementById(
      'viewBillModal'
    )
    .classList
    .add(
      'hidden'
    );

}


/* =====================================================
   SAVE ACTUAL BILL
   ===================================================== */


function saveActualBill(event) {

  event.preventDefault();

  const data = {

    userId:
      APP.userId,

    billMonth:
      document.getElementById("billMonth").value,

    actualBill:
      Number(
        document.getElementById("actualBill").value
      ),

    actualKwh:
      Number(
        document.getElementById("actualKwh").value
      ),

    generation:
      Number(
        document.getElementById("generation").value
      ),

    transmission:
      Number(
        document.getElementById("transmission").value
      ),

    systemLoss:
      Number(
        document.getElementById("systemLoss").value
      ),

    distribution:
      Number(
        document.getElementById("distribution").value
      ),

    seniorCitizen:
      Number(
        document.getElementById("seniorCitizen").value
      ),

    governmentTaxes:
      Number(
        document.getElementById("governmentTaxes").value
      ),

    universalCharges:
      Number(
        document.getElementById("universalCharges").value
      ),

    fitAll:
      Number(
        document.getElementById("fitAll").value
      ),

    geaAll:
      Number(
        document.getElementById("geaAll").value
      ),

    lifeline:
      Number(
        document.getElementById("lifeline").value
      ),

    otherCharges:
      Number(
        document.getElementById("otherCharges").value
      ),

    notes:
      document.getElementById("billNotes").value

  };


  console.log(
    "================================="
  );

  console.log(
    "BILL SAVE DIAGNOSTIC"
  );

  console.log(
    "generation input:",
    document.getElementById("generation")?.value
  );

  console.log(
    "transmission input:",
    document.getElementById("transmission")?.value
  );

  console.log(
    "systemLoss input:",
    document.getElementById("systemLoss")?.value
  );

  console.log(
    "distribution input:",
    document.getElementById("distribution")?.value
  );

  console.log(
    "seniorCitizen input:",
    document.getElementById("seniorCitizen")?.value
  );

  console.log(
    "governmentTaxes input:",
    document.getElementById("governmentTaxes")?.value
  );

  console.log(
    "universalCharges input:",
    document.getElementById("universalCharges")?.value
  );

  console.log(
    "fitAll input:",
    document.getElementById("fitAll")?.value
  );

  console.log(
    "geaAll input:",
    document.getElementById("geaAll")?.value
  );

  console.log(
    "lifeline input:",
    document.getElementById("lifeline")?.value
  );

  console.log(
    "otherCharges input:",
    document.getElementById("otherCharges")?.value
  );

  console.log(
    "FINAL DATA SENT:",
    data
  );

  console.log(
    "================================="
  );


  showLoading(
    "Saving actual bill..."
  );


  saveActualBillDirect(data)

    .then(function(response) {

      console.log(
        "Bill saved:",
        response
      );


      if (
        !response ||
        !response.success
      ) {

        hideLoading();

        showToast(
          response &&
          response.message
            ? response.message
            : "Unable to save bill."
        );

        return;

      }


      closeActualBillModal();


      const loadingText =
        document.getElementById(
          'loadingText'
        );

      const loadingOverlay =
        document.getElementById(
          'loadingOverlay'
        );

      if (loadingText) {
        loadingText.textContent =
          "Actual Bill saved successfully";
      }

      setTimeout(function(){

        if (loadingOverlay) {
          loadingOverlay.classList.add(
            'hidden'
          );
        }

      }, 1500);


      refreshDashboard();

    })


    .catch(function(error) {

      console.error(
        "Save bill error:",
        error
      );


      hideLoading();


      showToast(
        getErrorMessage(error)
      );

    });

}


/* =====================================================
   GENERIC UI HELPERS
   ===================================================== */

function showElement(
  id
) {

  document
    .getElementById(
      id
    )
    .classList
    .remove(
      'hidden'
    );

}


function hideElement(
  id
) {

  document
    .getElementById(
      id
    )
    .classList
    .add(
      'hidden'
    );

}


function showLoading(
  text
) {

  document
    .getElementById(
      'loadingText'
    )
    .textContent =
    text ||
    'Loading...';


  document
    .getElementById(
      'loadingOverlay'
    )
    .classList
    .remove(
      'hidden'
    );

}


function hideLoading() {

  document
    .getElementById(
      'loadingOverlay'
    )
    .classList
    .add(
      'hidden'
    );

}


function showToast(
  message
) {

  const toast =
    document.getElementById(
      'toast'
    );


  toast.textContent =
    message;


  toast.classList.add(
    'show'
  );


  setTimeout(
    function() {

      toast.classList.remove(
        'show'
      );

    },
    3000
  );

}


function showFormMessage(
  id,
  message
) {

  const element =
    document.getElementById(
      id
    );


  if (!element) {
    return;
  }


  element.textContent =
    message ||
    '';

}


/* =====================================================
   FORMATTERS
   ===================================================== */

function formatPHP(
  value
) {

  value =
    Number(
      value || 0
    );


  return (
    '₱' +
    value.toLocaleString(
      'en-PH',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    )
  );

}


function formatNumber(
  value,
  decimals
) {

  value =
    Number(
      value || 0
    );


  return value.toLocaleString(
    'en-PH',
    {
      minimumFractionDigits:
        decimals || 0,

      maximumFractionDigits:
        decimals || 0
    }
  );

}


/* =====================================================
   VALIDATION
   ===================================================== */

function isValidEmail(
  email
) {

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(
      email
    );

}


/* =====================================================
   SECURITY / HTML ESCAPING
   ===================================================== */

function escapeHtml(
  value
) {

  return String(
    value || ''
  )
    .replace(
      /&/g,
      '&amp;'
    )
    .replace(
      /</g,
      '&lt;'
    )
    .replace(
      />/g,
      '&gt;'
    )
    .replace(
      /"/g,
      '&quot;'
    )
    .replace(
      /'/g,
      '&#039;'
    );

}


function escapeAttribute(
  value
) {

  return String(
    value || ''
  )
    .replace(
      /'/g,
      "\\'"
    )
    .replace(
      /"/g,
      '&quot;'
    );

}


/* =====================================================
   ERROR HANDLING
   ===================================================== */

function getErrorMessage(
  error
) {

  if (!error) {

    return 'An unknown error occurred.';

  }


  if (
    typeof error ===
    'string'
  ) {

    return error;

  }


  return (
    error.message ||
    'An unexpected error occurred.'
  );

}


/* =====================================================
   LOCAL DATE HELPERS
   ===================================================== */

function getCurrentMonthLocal() {

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




function addBillChargeRow(){

  const container =
  document.getElementById(
    "billChargesContainer"
  );


  const row =
  document.createElement("div");


  row.className =
  "charge-row";


  row.innerHTML = `

    <select class="bill-charge-name">

      <option value="">
        Select Charge
      </option>

      <option value="Generation">
        Generation
      </option>

      <option value="Transmission">
        Transmission
      </option>

      <option value="System Loss">
        System Loss
      </option>

      <option value="Distribution">
        Distribution
      </option>

      <option value="Senior Citizen Discount">
        Senior Citizen Discount
      </option>

      <option value="Government Taxes">
        Government Taxes
      </option>

      <option value="Universal Charges">
        Universal Charges
      </option>

      <option value="FIT-All">
        FIT-All
      </option>

      <option value="GEA-All">
        GEA-All
      </option>

      <option value="Lifeline">
        Lifeline
      </option>

      <option value="Other Charges">
        Other Charges
      </option>

    </select>


    <input
      class="bill-charge-amount"
      type="number"
      step="0.01"
      placeholder="Amount">


    <button
      type="button"
      onclick="this.parentElement.remove()">

      ×

    </button>

  `;


  container.appendChild(row);

}





function toggleOtherCharge(select){

  const row =
    select.parentElement;


  const otherInput =
    row.querySelector(
      ".other-charge-name"
    );


  if(select.value === "Other"){

    otherInput.classList.remove(
      "hidden"
    );

    otherInput.required = true;

  } else {

    otherInput.classList.add(
      "hidden"
    );

    otherInput.required = false;

    otherInput.value = "";

  }

}





function getBillCharges(){

  const charges = [];


  document
    .querySelectorAll(
      ".charge-row"
    )
    .forEach(function(row){


      const name =
        row
        .querySelector(
          ".bill-charge-name"
        )
        .value;


      const amount =
        Number(
          row
          .querySelector(
            ".bill-charge-amount"
          )
          .value
        );


      if(
        name &&
        amount > 0
      ){

        charges.push({

          name:name,

          amount:amount

        });

      }


    });


  return charges;

}






function viewBill(){


  console.log(
    "VIEW BILL BUTTON CLICKED"
  );


  console.log(
    "USER BEFORE OPEN BILL:",
    APP.userId
  );

console.log(
"CALLING LOAD ACTUAL BILLS WITH:",
APP.userId
);

  openBillModal();


}



function populateBillMonths(){


  const dropdown =
    document.getElementById(
      "billMonthDropdown"
    );


  if(!dropdown){

    console.error(
      "billMonthDropdown not found"
    );

    return;

  }



  dropdown.innerHTML = "";



  console.log(
    "POPULATING BILL MONTHS:",
    APP.actualBills
  );



  if(
    !Array.isArray(APP.actualBills) ||
    APP.actualBills.length === 0
  ){


    dropdown.innerHTML =
      `
      <option value="">
        No bills found
      </option>
      `;


    return;

  }



  APP.actualBills.forEach(
    function(bill){


      const option =
        document.createElement(
          "option"
        );


      option.value =
        bill.month;


      option.textContent =
        bill.month;


      dropdown.appendChild(
        option
      );


    }
  );


if(!dropdown.value && dropdown.options.length > 0){

  dropdown.selectedIndex = 0;

}

displaySelectedBill();


}



function displaySelectedBill() {

  const dropdown =
    document.getElementById(
      "billMonthDropdown"
    );

  if (!dropdown) {
    console.error(
      "billMonthDropdown not found"
    );
    return;
  }

  const selectedMonth =
    dropdown.value;

  const bill =
    APP.actualBills.find(
      function(item) {

        return (
          String(item.month).trim()
          ===
          String(selectedMonth).trim()
        );

      }
    );

  console.log(
    "================================="
  );

  console.log(
    "DISPLAYING SELECTED BILL"
  );

  console.log(
    "Selected month:",
    selectedMonth
  );

  console.log(
    "Selected bill:",
    bill
  );

  console.log(
    "================================="
  );


  if (!bill) {

    console.warn(
      "NO BILL FOUND FOR MONTH:",
      selectedMonth
    );

    return;

  }


  // =====================================
  // MONTH
  // =====================================

  const month =
    document.getElementById(
      "billViewMonth"
    );

  if (month) {

    month.textContent =
      bill.month || "—";

  }


  // =====================================
  // ACTUAL CONSUMPTION
  // =====================================

  const kwh =
    document.getElementById(
      "billViewKwh"
    );

  if (kwh) {

    kwh.textContent =
      formatNumber(
        bill.actualKwh,
        2
      ) +
      " kWh";

  }


  // =====================================
  // GENERATION
  // =====================================

  const generation =
    document.getElementById(
      "billViewGeneration"
    );

  if (generation) {

    generation.textContent =
      formatPHP(
        bill.generation
      );

  }


  // =====================================
  // TRANSMISSION
  // =====================================

  const transmission =
    document.getElementById(
      "billViewTransmission"
    );

  if (transmission) {

    transmission.textContent =
      formatPHP(
        bill.transmission
      );

  }


  // =====================================
  // SYSTEM LOSS
  // =====================================

  const systemLoss =
    document.getElementById(
      "billViewSystemLoss"
    );

  if (systemLoss) {

    systemLoss.textContent =
      formatPHP(
        bill.systemLoss
      );

  }


  // =====================================
  // DISTRIBUTION
  // =====================================

  const distribution =
    document.getElementById(
      "billViewDistribution"
    );

  if (distribution) {

    distribution.textContent =
      formatPHP(
        bill.distribution
      );

  }


  // =====================================
  // SENIOR CITIZEN
  // =====================================

  const seniorCitizen =
    document.getElementById(
      "billViewSeniorCitizen"
    );

  if (seniorCitizen) {

    seniorCitizen.textContent =
      formatPHP(
        bill.seniorCitizen
      );

  }


  // =====================================
  // GOVERNMENT TAXES
  // =====================================

  const governmentTaxes =
    document.getElementById(
      "billViewGovernmentTaxes"
    );

  if (governmentTaxes) {

    governmentTaxes.textContent =
      formatPHP(
        bill.governmentTaxes
      );

  }


  // =====================================
  // UNIVERSAL CHARGES
  // =====================================

  const universalCharges =
    document.getElementById(
      "billViewUniversalCharges"
    );

  if (universalCharges) {

    universalCharges.textContent =
      formatPHP(
        bill.universalCharges
      );

  }


  // =====================================
  // FIT-ALL
  // =====================================

  const fitAll =
    document.getElementById(
      "billViewFitAll"
    );

  if (fitAll) {

    fitAll.textContent =
      formatPHP(
        bill.fitAll
      );

  }


  // =====================================
  // GEA-ALL
  // =====================================

  const geaAll =
    document.getElementById(
      "billViewGeaAll"
    );

  if (geaAll) {

    geaAll.textContent =
      formatPHP(
        bill.geaAll
      );

  }


  // =====================================
  // LIFELINE
  // =====================================

  const lifeline =
    document.getElementById(
      "billViewLifeline"
    );

  if (lifeline) {

    lifeline.textContent =
      formatPHP(
        bill.lifeline
      );

  }


  // =====================================
  // OTHER CHARGES
  // =====================================

  const otherCharges =
    document.getElementById(
      "billViewOtherCharges"
    );

  if (otherCharges) {

    otherCharges.textContent =
      formatPHP(
        bill.otherCharges
      );

  }


  // =====================================
  // TOTAL ADDITIONAL CHARGES
  // =====================================

  const totalAdditionalCharges =
    Number(bill.transmission || 0) +
    Number(bill.systemLoss || 0) +
    Number(bill.distribution || 0) +
    Number(bill.seniorCitizen || 0) +
    Number(bill.governmentTaxes || 0) +
    Number(bill.universalCharges || 0) +
    Number(bill.fitAll || 0) +
    Number(bill.geaAll || 0) +
    Number(bill.lifeline || 0) +
    Number(bill.otherCharges || 0);


  const totalElement =
    document.getElementById(
      "billViewTotalAdditionalCharges"
    );

  if (totalElement) {

    totalElement.textContent =
      formatPHP(
        totalAdditionalCharges
      );

  }


  // =====================================
  // TOTAL ACTUAL BILL
  // =====================================

  const amount =
    document.getElementById(
      "billViewAmount"
    );

  if (amount) {

    amount.textContent =
      formatPHP(
        bill.actualBill
      );

  }


  // =====================================
  // RATE
  // =====================================

  const rate =
    document.getElementById(
      "billViewRate"
    );

  if (rate) {

    rate.textContent =
      formatPHP(
        bill.ratePerKwh
      ) +
      " / kWh";

  }


  // =====================================
  // DIFFERENCE VS ESTIMATE - KWH
  // =====================================

  const differenceKwh =
    document.getElementById(
      "billViewDifferenceKwh"
    );

  if (differenceKwh) {

    differenceKwh.textContent =
      formatNumber(
        bill.differenceVsEstimateKwh,
        2
      ) +
      " kWh";

  }


  // =====================================
  // DIFFERENCE VS ESTIMATE - COST
  // =====================================

  const differenceCost =
    document.getElementById(
      "billViewDifferenceCost"
    );

  if (differenceCost) {

    differenceCost.textContent =
      formatPHP(
        bill.differenceVsEstimateCost
      );

  }


  // =====================================
  // NOTES
  // =====================================

  const notes =
    document.getElementById(
      "billViewMessage"
    );

  if (notes) {

    if (bill.notes && bill.notes.trim()) {

      notes.textContent = bill.notes;
      notes.style.display = "block";

    } else {

      notes.textContent = "";
      notes.style.display = "none";

    }

  }


  // =====================================
  // EDIT INPUTS
  // =====================================

  const editValues = {

    editGeneration:
      bill.generation,

    editTransmission:
      bill.transmission,

    editSystemLoss:
      bill.systemLoss,

    editDistribution:
      bill.distribution,

    editSeniorCitizen:
      bill.seniorCitizen,

    editGovernmentTaxes:
      bill.governmentTaxes,

    editUniversalCharges:
      bill.universalCharges,

    editFitAll:
      bill.fitAll,

    editGeaAll:
      bill.geaAll,

    editLifeline:
      bill.lifeline,

    editOtherCharges:
      bill.otherCharges

  };


  Object.keys(editValues)
    .forEach(
      function(id) {

        const input =
          document.getElementById(
            id
          );

        if (input) {

          input.value =
            Number(
              editValues[id] || 0
            );

        }

      }
    );


}


function changeBillMonth(){

  displaySelectedBill();

}





function populateMonthDropdown(){

  const select = document.getElementById("selectedMonth");

  if(!select) return;

  select.innerHTML = "";

  const today = new Date();

  for(let i = 0; i < 12; i++){

    const date = new Date(
      today.getFullYear(),
      today.getMonth() - i,
      1
    );

    const value =
      date.getFullYear() +
      "-" +
      String(date.getMonth()+1).padStart(2,"0");


    const label =
      date.toLocaleString(
        "default",
        {
          month:"long",
          year:"numeric"
        }
      );


    const option =
      document.createElement("option");

    option.value = value;
    option.textContent = label;


    select.appendChild(option);

  }

}




function loadActualBills(){

  console.log(
    "LOADING ACTUAL BILLS"
  );


  /*
   * Get loading overlay
   */
  const loadingOverlay =
    document.querySelector(
      ".loading-overlay"
    );


  /*
   * Get loading text
   */
  const loadingText =
    document.getElementById(
      "loadingText"
    );


  /*
   * Show loading message
   */
  if(loadingText){

    loadingText.textContent =
  "Loading bill history...";

  }


  /*
   * Show loading overlay
   */
  if(loadingOverlay){

    loadingOverlay.classList.remove(
      "hidden"
    );

  }


  /*
   * Check USER ID
   */
  if(!APP.userId){

    console.error(
      "Missing USER ID"
    );


    /*
     * Hide loading overlay
     */
    if(loadingOverlay){

      loadingOverlay.classList.add(
        "hidden"
      );

    }


    return;

  }


  console.log(
    "GETTING BILLS FOR USER:",
    APP.userId
  );


  getActualBills(APP.userId)

    .then(function(bills){


      console.log(
        "ACTUAL BILLS LOADED:",
        bills
      );


      /*
       * Store bills globally
       */
      APP.actualBills =
        Array.isArray(bills)
          ? bills
          : [];


      /*
       * Populate View Bill dropdown
       */
      populateBillMonths();


      /*
       * Open View Bill modal
       */
      const modal =
        document.getElementById(
          "viewBillModal"
        );


      if(!modal){

        console.error(
          "viewBillModal not found"
        );


        /*
         * Hide loading overlay
         */
        if(loadingOverlay){

          loadingOverlay.classList.add(
            "hidden"
          );

        }


        return;

      }


      modal.classList.remove(
        "hidden"
      );


      /*
       * Hide loading overlay
       * after bills finish loading
       */
      if(loadingOverlay){

        loadingOverlay.classList.add(
          "hidden"
        );

      }


    })


    .catch(function(error){


      console.error(
        "FAILED TO LOAD ACTUAL BILLS:",
        error
      );


      /*
       * Hide loading overlay
       * if loading fails
       */
      if(loadingOverlay){

        loadingOverlay.classList.add(
          "hidden"
        );

      }


      showToast(
        getErrorMessage(error)
      );


    });

}



function enableBillEdit(){

  console.log(
    "ENABLE BILL EDIT FIRED"
  );


  const fields = [
    "Generation",
    "Transmission",
    "SystemLoss",
    "Distribution",
    "SeniorCitizen",
    "GovernmentTaxes",
    "UniversalCharges",
    "FitAll",
    "GeaAll",
    "Lifeline",
    "OtherCharges"
  ];


  fields.forEach(
    function(field){

      const input =
        document.getElementById(
          "edit" + field
        );


      const view =
        document.getElementById(
          "billView" + field
        );


      console.log(
        field,
        input,
        input
          ? input.value
          : "NO INPUT"
      );


      if(input){

        /*
         * Only show the input.
         *
         * DO NOT overwrite its value here.
         * displaySelectedBill() already
         * populated the correct value.
         */

        input.style.display =
          "inline-block";

      }


      if(view){

        view.style.display =
          "none";

      }

    }
  );


  const saveButton =
    document.getElementById(
      "saveBillButton"
    );


  if(saveButton){

    saveButton.style.display =
      "inline-block";

  }


  console.log(
    "SAVE BUTTON SHOWED"
  );

}





function saveBillChanges(){

  console.log("SAVE BILL CHANGES FIRED");


  const loadingOverlay =
  document.querySelector(
    ".loading-overlay"
  );

const loadingText =
  document.getElementById(
    "loadingText"
  );

if(loadingText){

  loadingText.textContent =
    "Saving changes...";

}

if(loadingOverlay){

  loadingOverlay.classList.remove(
    "hidden"
  );

}

  const selectedMonth =
    document.getElementById(
      "billMonthDropdown"
    ).value;

  const bill =
    APP.actualBills.find(
      function(item){

        return (
          String(item.month || "").trim() ===
          String(selectedMonth || "").trim()
        );

      }
    );

  console.log(
    "BILL TO UPDATE:",
    bill
  );

  if(!bill){

    showToast(
      "Unable to find the selected bill."
    );

    return;

  }

  const data = {

    generation:
      Number(
        document.getElementById(
          "editGeneration"
        ).value
      ) || 0,

    transmission:
      Number(
        document.getElementById(
          "editTransmission"
        ).value
      ) || 0,

    systemLoss:
      Number(
        document.getElementById(
          "editSystemLoss"
        ).value
      ) || 0,

    distribution:
      Number(
        document.getElementById(
          "editDistribution"
        ).value
      ) || 0,

    seniorCitizen:
      Number(
        document.getElementById(
          "editSeniorCitizen"
        ).value
      ) || 0,

    governmentTaxes:
      Number(
        document.getElementById(
          "editGovernmentTaxes"
        ).value
      ) || 0,

    universalCharges:
      Number(
        document.getElementById(
          "editUniversalCharges"
        ).value
      ) || 0,

    fitAll:
      Number(
        document.getElementById(
          "editFitAll"
        ).value
      ) || 0,

    geaAll:
      Number(
        document.getElementById(
          "editGeaAll"
        ).value
      ) || 0,

    lifeline:
      Number(
        document.getElementById(
          "editLifeline"
        ).value
      ) || 0,

    otherCharges:
      Number(
        document.getElementById(
          "editOtherCharges"
        ).value
      ) || 0,

    actualBill:
      Number(
        bill.actualBill
      ) || 0,

    notes:
      bill.notes || ""

  };

  console.log(
    "UPDATE DATA:",
    data
  );

  updateSavedBill(
    APP.userId,
    bill.billId,
    data
  )

    .then(function(result){

        console.log(
          "UPDATE RESULT:",
          result
        );

        if(
          !result ||
          !result.success
        ){

          showToast(
            result &&
            result.message
              ? result.message
              : "Unable to update bill."
          );

          return;

        }

        // Update the local bill object
        bill.generation =
          data.generation;

        bill.transmission =
          data.transmission;

        bill.systemLoss =
          data.systemLoss;

        bill.distribution =
          data.distribution;

        bill.seniorCitizen =
          data.seniorCitizen;

        bill.governmentTaxes =
          data.governmentTaxes;

        bill.universalCharges =
          data.universalCharges;

        bill.fitAll =
          data.fitAll;

        bill.geaAll =
          data.geaAll;

        bill.lifeline =
          data.lifeline;

        bill.otherCharges =
          data.otherCharges;

        // Refresh the displayed values
        displaySelectedBill();

        // Hide edit fields
        const fields = [
          "Generation",
          "Transmission",
          "SystemLoss",
          "Distribution",
          "SeniorCitizen",
          "GovernmentTaxes",
          "UniversalCharges",
          "FitAll",
          "GeaAll",
          "Lifeline",
          "OtherCharges"
        ];

        fields.forEach(
          function(field){

            const input =
              document.getElementById(
                "edit" + field
              );

            const view =
              document.getElementById(
                "billView" + field
              );

            if(input){
              input.style.display =
                "none";
            }

            if(view){
              view.style.display =
                "inline";
            }

          }
        );

        document.getElementById(
          "saveBillButton"
        ).style.display =
          "none";

        if(loadingText){

          loadingText.textContent =
            "Bill updated successfully";

        }

        setTimeout(function(){

          if(loadingOverlay){

            loadingOverlay.classList.add(
              "hidden"
            );

          }

        }, 1500);

      })

    .catch(function(error){

        if(loadingOverlay){

  loadingOverlay.classList.add(
    "hidden"
  );

}

        console.error(
          "UPDATE BILL ERROR:",
          error
        );

        showToast(
          "Unable to update bill: " +
          (
            error.message ||
            error
          )
        );

      });


}




function continueLoadingApp() {

  console.log('Opening WattWise dashboard...');

  localStorage.setItem(
    'electricityTrackerUserId',
    APP.userId
  );

  /*
   * Show the application immediately.
   */
  hideLoading();

  showDashboard();

  /*
   * Load dashboard data.
   * refreshDashboard() handles the dashboard.
   */
  refreshDashboard();

  /*
   * Load appliance table separately.
   */
  loadAppliances();

}







function showMobileSection(section, button) {

  console.log('================================');
  console.log('SWITCHING MOBILE SECTION');
  console.log('Section:', section);
  console.log('Button:', button);

  // =====================================================
  // HIDE ALL MOBILE SECTIONS
  // =====================================================

  const sections =
    document.querySelectorAll(
      '.mobile-section'
    );

  console.log(
    'Mobile sections found:',
    sections.length
  );

  sections.forEach(
    function(el) {

      el.classList.remove(
        'mobile-section-active'
      );

      el.style.display =
        'none';

    }
  );


  // =====================================================
  // REMOVE ACTIVE NAVIGATION STATE
  // =====================================================

  const navItems =
    document.querySelectorAll(
      '.mobile-nav-item'
    );

  console.log(
    'Navigation items found:',
    navItems.length
  );

  navItems.forEach(
    function(el) {

      el.classList.remove(
        'active'
      );

    }
  );


  // =====================================================
  // FIND SELECTED SECTION
  // =====================================================

  const selectedSection =
    document.getElementById(
      'mobile-' + section
    );

  console.log(
    'Looking for:',
    'mobile-' + section
  );

  console.log(
    'Selected section:',
    selectedSection
  );


  if (!selectedSection) {

    console.error(
      'ERROR: Section not found:',
      'mobile-' + section
    );

    return;

  }


  // =====================================================
  // SHOW SELECTED SECTION
  // =====================================================
selectedSection.classList.add('mobile-section-active');

selectedSection.style.setProperty(
  'display',
  'block',
  'important'
);

console.log(
  'CATEGORY/SECTION DISPLAY AFTER SHOW:',
  selectedSection.id,
  selectedSection.style.display,
  getComputedStyle(selectedSection).display
);

  // =====================================================
  // ACTIVATE NAVIGATION BUTTON
  // =====================================================

  if (button) {

    button.classList.add(
      'active'
    );

  }


  console.log(
    'Section successfully displayed:',
    selectedSection.id
  );


  // =====================================================
  // DASHBOARD
  // =====================================================

  if (
    section === 'dashboard'
  ) {

    console.log(
      'Loading dashboard...'
    );


    if (
      typeof refreshDashboard ===
      'function'
    ) {

      refreshDashboard();

    }

    return;

  }


  // =====================================================
  // RANKING
  //
  // We do NOT call loadApplianceRanking()
  // because you don't have that function.
  //
  // The ranking data already comes from:
  //
  // APP.dashboard.applianceRanking
  // =====================================================

  if (
    section === 'ranking'
  ) {

    console.log(
      'Loading ranking from APP.dashboard...'
    );


    if (
      APP.dashboard &&
      APP.dashboard.applianceRanking
    ) {

      console.log(
        'Ranking data found:',
        APP.dashboard.applianceRanking
      );


      renderRanking(
        APP.dashboard.applianceRanking
      );

    } else {

      console.log(
        'No dashboard ranking data yet.'
      );


      // If dashboard has not loaded yet,
      // load it first.

      if (
        typeof refreshDashboard ===
        'function'
      ) {

        refreshDashboard();

      }

    }

    return;

  }


  // =====================================================
  // CATEGORIES
  //
  // We do NOT call loadCategoryBreakdown()
  // because you don't have that function.
  //
  // The category data already comes from:
  //
  // APP.dashboard.categoryBreakdown
  // =====================================================

  if (
    section === 'categories'
  ) {

    console.log(
      'Loading categories from APP.dashboard...'
    );


    if (
      APP.dashboard &&
      APP.dashboard.categoryBreakdown
    ) {

      console.log(
        'Category data found:',
        APP.dashboard.categoryBreakdown
      );


      renderCategories(
        APP.dashboard.categoryBreakdown
      );

    } else {

      console.log(
        'No dashboard category data yet.'
      );


      // If dashboard has not loaded yet,
      // load it first.

      if (
        typeof refreshDashboard ===
        'function'
      ) {

        refreshDashboard();

      }

    }

    return;

  }


  // =====================================================
  // APPLIANCES
  // =====================================================

  if (
    section === 'appliances'
  ) {

    console.log(
      'Loading appliances...'
    );


    if (
      typeof loadAppliances ===
      'function'
    ) {

      console.log(
        'loadAppliances() FOUND'
      );


      loadAppliances();

    } else {

      console.error(
        'loadAppliances() NOT FOUND'
      );

    }

    return;

  }

}




/*******************************************************
 * PASSWORD RESET UI
 *******************************************************/


function openResetPassword() {

  const modal =
    document.getElementById(
      "resetPasswordModal"
    );

  if (modal) {

    modal.classList.remove(
      "hidden"
    );

  }


  const email =
    document.getElementById(
      "userEmail"
    );


  const resetEmail =
    document.getElementById(
      "resetEmail"
    );


  if (
    email &&
    resetEmail
  ) {

    resetEmail.value =
      email.value;

  }

}



function closeResetPassword() {

  const modal =
    document.getElementById(
      "resetPasswordModal"
    );

  if (modal) {

    modal.classList.add(
      "hidden"
    );

  }

}



async function submitResetPassword() {

  const email =
    document.getElementById(
      "resetEmail"
    )
    .value
    .trim()
    .toLowerCase();


  const code =
    document.getElementById(
      "resetCode"
    )
    .value
    .trim();


  const newPassword =
    document.getElementById(
      "resetNewPassword"
    )
    .value
    .trim();


  const message =
    document.getElementById(
      "resetPasswordMessage"
    );


  const resetButton =
    document.getElementById(
      "resetPasswordButton"
    );


  /*
   * VALIDATE FIELDS FIRST
   */

  if (!email || !code || !newPassword) {

    message.innerText =
      "Please complete all fields.";

    message.classList.add(
      "show"
    );

    return;

  }


  /*
   * SHOW LOADING ON BUTTON
   */

  if (resetButton) {

    resetButton.disabled = true;

    resetButton.innerText =
      "Password is being reset...";

  }


  message.classList.remove("show");
  message.innerText = "";


  try {


    const result =
      await apiCall(
        "resetPassword",
        {
          email: email,
          code: code,
          newPassword: newPassword
        }
      );


    /*
     * RESTORE BUTTON
     */

    if (resetButton) {

      resetButton.disabled = false;

      resetButton.innerText =
        "Reset Password";

    }


    /*
     * SUCCESS
     */

    if (
      result &&
      result.success
    ) {

      message.innerText =
        "Password updated successfully.";

      message.classList.add(
        "show"
      );


      setTimeout(
        function() {

          closeResetPassword();

        },
        2000
      );


    } else {


      /*
       * SERVER ERROR
       */

      message.innerText =
        result.message ||
        "Unable to reset password.";

      message.classList.add(
        "show"
      );

    }


  } catch(error) {


    /*
     * RESTORE BUTTON ON ERROR
     */

    if (resetButton) {

      resetButton.disabled = false;

      resetButton.innerText =
        "Reset Password";

    }


    message.innerText =
      error.message;

    message.classList.add(
      "show"
    );

  }

}


/*******************************************************
 * SEND PASSWORD RESET CODE
 *******************************************************/


async function sendResetCode() {

  const email =
    document.getElementById(
      "resetEmail"
    )
    .value
    .trim()
    .toLowerCase();


  const message =
    document.getElementById(
      "resetPasswordMessage"
    );


  const sendButton =
    document.getElementById(
      "sendResetCodeButton"
    );


  /*
   * VALIDATE EMAIL FIRST
   */

  if (!email) {

    message.innerText =
      "Please enter your email.";

    message.classList.add(
      "show"
    );

    return;

  }


  /*
   * CHANGE BUTTON TEXT
   */

  if (sendButton) {

    sendButton.disabled = true;

    sendButton.innerText =
      "Sending Code to Your Email...";

  }


  message.classList.remove("show");
  message.innerText = "";


  try {

    const result =
      await apiCall(
        "requestPasswordReset",
        {
          email: email
        }
      );


    /*
     * RESTORE BUTTON
     */

    if (sendButton) {

      sendButton.disabled = false;

      sendButton.innerText =
        "Send Reset Code";

    }


    /*
     * SUCCESS
     */

    if (
      result &&
      result.success
    ) {

      message.innerText =
        "Reset code generated. Check your reset code.";

      message.classList.add(
        "show"
      );


      console.log(
        "RESET CODE:",
        result.code
      );


    } else {

      message.innerText =
        result.message ||
        "Unable to generate reset code.";

      message.classList.add(
        "show"
      );

    }


  } catch(error) {


    /*
     * RESTORE BUTTON ON ERROR
     */

    if (sendButton) {

      sendButton.disabled = false;

      sendButton.innerText =
        "Send Reset Code";

    }


    message.innerText =
      error.message;

    message.classList.add(
      "show"
    );

  }

}


/*******************************************************
 * PASSWORD VISIBILITY TOGGLE
 *******************************************************/

function togglePasswordVisibility() {

  const password =
    document.getElementById(
      "userPassword"
    );


  const icon =
    document.getElementById(
      "passwordToggleIcon"
    );


  if (!password || !icon) {
    return;
  }


  if (password.type === "password") {

    password.type = "text";

    icon.src =
      "assets/Open.png";


  } else {

    password.type = "password";

    icon.src =
      "assets/Close.png";

  }

}




/* =====================================================
   REGISTRATION
   ===================================================== */

function openRegister() {

  const modal =
    document.getElementById(
      'registerModal'
    );

  if (!modal) {

    alert(
      'Registration modal not found.'
    );

    return;

  }

  modal.classList.remove(
    'hidden'
  );

}


function closeRegister() {

  const modal =
    document.getElementById(
      'registerModal'
    );

  if (!modal) {
    return;
  }

  modal.classList.add(
    'hidden'
  );

}


function submitRegister(event) {

  if (event) {
    event.preventDefault();
  }


  const name =
    document
      .getElementById(
        'registerName'
      )
      .value
      .trim();


  const email =
    document
      .getElementById(
        'registerEmail'
      )
      .value
      .trim()
      .toLowerCase();


  const password =
    document
      .getElementById(
        'registerPassword'
      )
      .value;


  const householdName =
    document
      .getElementById(
        'registerHousehold'
      )
      .value
      .trim();


  const message =
    document.getElementById(
      'registerMessage'
    );


  if (
    !name ||
    !email ||
    !password ||
    !householdName
  ) {

    if (message) {
      message.textContent =
        'All fields are required.';
    }

    return;
  }


  if (!isValidEmail(email)) {

    if (message) {
      message.textContent =
        'Please enter a valid email address.';
    }

    return;
  }


  if (message) {
    message.textContent =
      'Creating your WattWise account...';
  }


  const buttons =
    document.querySelectorAll(
      '#registerModal button'
    );


  buttons.forEach(
    function(button) {
      button.disabled = true;
    }
  );


  registerUser(
    email,
    password,
    name,
    householdName
  )

    .then(
      function(result) {

        console.log(
          'Registration result:',
          result
        );


        if (
          !result ||
          !result.success
        ) {

          if (message) {
            message.textContent =
              result &&
              result.message
                ? result.message
                : 'Unable to create account.';
          }


          buttons.forEach(
            function(button) {
              button.disabled = false;
            }
          );

          return;
        }


        if (message) {
          message.textContent =
            'Account created successfully! You can now log in.';
        }


        /*
         * Put the newly registered email
         * into the login form.
         */

        const loginEmail =
          document.getElementById(
            'userEmail'
          );


        if (loginEmail) {
          loginEmail.value =
            email;
        }


        /*
         * Clear the registration form.
         */

        document
          .getElementById(
            'registerName'
          )
          .value = '';


        document
          .getElementById(
            'registerEmail'
          )
          .value = '';


        document
          .getElementById(
            'registerPassword'
          )
          .value = '';


        document
          .getElementById(
            'registerHousehold'
          )
          .value = '';


        /*
         * Close registration modal
         * after a short delay.
         */

        setTimeout(
          function() {

            closeRegister();

            if (message) {
              message.textContent = '';
            }


            buttons.forEach(
              function(button) {
                button.disabled = false;
              }
            );

          },
          1200
        );

      }
    )

    .catch(
      function(error) {

        console.error(
          'Registration failed:',
          error
        );


        if (message) {
          message.textContent =
            getErrorMessage(error);
        }


        buttons.forEach(
          function(button) {
            button.disabled = false;
          }
        );

      }
    );

}






function deleteCurrentBill(){

  console.log(
    "DELETE BILL FIRED"
  );


  const dropdown =
    document.getElementById(
      "billMonthDropdown"
    );


  if(!dropdown){

    showToast(
      "Unable to identify the selected bill."
    );

    return;

  }


  const selectedMonth =
    String(
      dropdown.value || ""
    ).trim();


  const bill =
    APP.actualBills.find(
      function(item){

        return (
          String(
            item.month || ""
          ).trim()
          ===
          selectedMonth
        );

      }
    );


  console.log(
    "BILL TO DELETE:",
    bill
  );


  if(!bill){

    showToast(
      "Unable to find the selected bill."
    );

    return;

  }


  if(!bill.billId){

    showToast(
      "Bill ID is missing."
    );

    return;

  }


  const loadingOverlay =
    document.querySelector(
      ".loading-overlay"
    );


  const loadingText =
    document.getElementById(
      "loadingText"
    );


  if(loadingText){

    loadingText.textContent =
      "Deleting bill...";

  }


  if(loadingOverlay){

    loadingOverlay.classList.remove(
      "hidden"
    );

  }


  deleteSavedBill(
    APP.userId,
    bill.billId
  )

  .then(function(result){

    console.log(
      "DELETE RESULT:",
      result
    );


    if(
      !result ||
      !result.success
    ){

      if(loadingOverlay){

        loadingOverlay.classList.add(
          "hidden"
        );

      }


      showToast(
        result &&
        result.message
          ? result.message
          : "Unable to delete bill."
      );

      return;

    }


    if(loadingText){

      loadingText.textContent =
        "Bill deleted successfully";

    }


    APP.actualBills =
      APP.actualBills.filter(
        function(item){

          return (
            String(
              item.billId || ""
            ).trim()
            !==
            String(
              bill.billId
            ).trim()
          );

        }
      );


    populateBillMonths();

    if(loadingOverlay){

      loadingOverlay.classList.add(
        "hidden"
      );

    }


  })

  .catch(function(error){

    console.error(
      "DELETE BILL ERROR:",
      error
    );


    if(loadingOverlay){

      loadingOverlay.classList.add(
        "hidden"
      );

    }


    showToast(
      getErrorMessage(error)
    );

  });

}
