const API_URL = "https://script.google.com/macros/s/AKfycbwimpUP9aFkwJUcc_CwGuIB1h8jDCrr6coBtuvsjqUn9dWHCoobUDq1VAunsGPJgPwJ-Q/exec";


async function apiCall(action, data = {}) {

  const params = new URLSearchParams();

  params.append(
    "action",
    action
  );


  Object.keys(data).forEach(
    function(key){

      if(
        typeof data[key] === "object"
      ){

        params.append(
          key,
          JSON.stringify(data[key])
        );

      } else {

        params.append(
          key,
          data[key]
        );

      }

    }
  );


  const response = await fetch(
    API_URL + "?" + params.toString()
  );


  return await response.json();

}


// USER

async function getUserIdByEmail(email) {

  return await apiCall(
    "getUserIdByEmail",
    {
      email: email
    }
  );

}


async function getUserIdByLogin(email, password) {

  return await apiCall(
    "getUserIdByLogin",
    {
      email: email,
      password: password
    }
  );

}


// DASHBOARD

async function getDashboard(userId, month) {

  return await apiCall(
    "getDashboard",
    {
      userId: userId,
      month: month
    }
  );

}


// APPLIANCES

async function getAppliances(userId) {

  return await apiCall(
    "getAppliances",
    {
      userId: userId
    }
  );

}


async function addAppliance(data) {

  return await apiCall(
    "addAppliance",
    data
  );

}


async function updateAppliance(data) {

  return await apiCall(
    "updateAppliance",
    data
  );

}


async function deleteAppliance(applianceId, userId) {

  return await apiCall(
    "deleteAppliance",
    {
      applianceId: applianceId,
      userId: userId
    }
  );

}


// BILLS

async function saveActualBillDirect(data) {

  return await apiCall(
    "saveActualBillDirect",
    data
  );

}


async function getUserSpreadsheet(userId) {

  return await apiCall(
    "getUserSpreadsheet",
    {
      userId: userId
    }
  );

}



async function addElectricityRate(data) {

  return await apiCall(
    "addElectricityRate",
    data
  );

}



async function getActualBills(userId) {

  return await apiCall(
    "getActualBills",
    {
      userId: userId
    }
  );

}



async function updateSavedBill(userId, billId, data) {

  return await apiCall(
    "updateSavedBill",
    {
      userId: userId,
      billId: billId,
      data: JSON.stringify(data)
    }
  );

}

