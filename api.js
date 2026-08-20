const API_URL = "https://script.google.com/macros/s/AKfycbwimpUP9aFkwJUcc_CwGuIB1h8jDCrr6coBtuvsjqUn9dWHCoobUDq1VAunsGPJgPwJ-Q/exec";


async function apiCall(action, data = {}) {

  const params = new URLSearchParams();

  params.append(
    "action",
    action
  );


  Object.keys(data).forEach(
    function(key) {

      const value = data[key];


      if (key === "data") {

        params.append(
          "data",
          JSON.stringify(value)
        );

        return;

      }


      if (
        value !== null &&
        typeof value === "object"
      ) {

        params.append(
          key,
          JSON.stringify(value)
        );

      } else {

        params.append(
          key,
          value == null
            ? ""
            : String(value)
        );

      }

    }
  );


  const url =
    API_URL +
    "?" +
    params.toString();


  console.log(
    "API ACTION:",
    action
  );

  console.log(
    "API DATA:",
    data
  );

  console.log(
    "API URL:",
    url
  );


  const response =
    await fetch(url);


  const text =
    await response.text();


  console.log(
    "API RESPONSE:",
    text
  );


  if (!text) {

    throw new Error(
      "Empty response from server."
    );

  }


  return JSON.parse(text);

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


// REGISTRATION

async function registerUser(
  email,
  password,
  name,
  householdName
) {

  return await apiCall(
    "registerUser",
    {
      email: email,
      password: password,
      name: name,
      householdName: householdName
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
    {
      data: data
    }
  );

}


async function updateAppliance(data) {

  return await apiCall(
    "updateAppliance",
    {
      data: data
    }
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
    {
      data: data
    }
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
    {
      data: data
    }
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



async function deleteSavedBill(userId, billId) {

  return await apiCall(
    "deleteSavedBill",
    {
      userId: userId,
      billId: billId
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



// =========================
// PASSWORD RESET
// =========================


async function requestPasswordReset(email) {

  return await apiCall(
    "requestPasswordReset",
    {
      email: email
    }
  );

}



async function resetPassword(
  email,
  code,
  newPassword
) {

  return await apiCall(
    "resetPassword",
    {
      email: email,
      code: code,
      newPassword: newPassword
    }
  );

}

