function getSavedBill(
userId,
month
){

Logger.log("==============================");
Logger.log("GET SAVED BILL - USER FILE");
Logger.log("==============================");

Logger.log(
"USER ID:"
+ userId
);


const userSpreadsheetId =
getUserSpreadsheetId(
  userId
);


Logger.log(
"DEDICATED FILE ID:"
+ userSpreadsheetId
);


if(!userSpreadsheetId){

return {

  success:false,

  message:
    "User spreadsheet not found."

};

}



const ss =
SpreadsheetApp.openById(
  userSpreadsheetId
);



Logger.log(
"OPENED FILE:"
+ ss.getName()
);



const sheet =
ss.getSheetByName(
"Bill History"
);



if(!sheet){

throw new Error(
  "Bill History sheet not found."
);

}



const data =
sheet
.getDataRange()
.getValues();



if(data.length <= 1){

return {

  success:false,

  message:
    "No bills recorded."

};

}



const headers =
data[0];



const userIndex =
headers.indexOf(
"User ID"
);



const monthIndex =
headers.indexOf(
"Bill Month"
);



if(
userIndex === -1 ||
monthIndex === -1
){

throw new Error(
"Required Bill History columns are missing."
);

}



for(
let i = 1;
i < data.length;
i++
){

const row =
data[i];



const savedUser =
String(
row[userIndex]
)
.trim();



let savedMonth =
row[monthIndex];



if(
savedMonth instanceof Date
){

savedMonth =
Utilities.formatDate(
savedMonth,
Session.getScriptTimeZone(),
"MMMM yyyy"
);

}
else{

savedMonth =
String(savedMonth)
.trim();

}



if(
savedUser ===
String(userId).trim()
&&
savedMonth ===
String(month).trim()
){


const bill = {};



headers.forEach(
function(header,index){

bill[header] =
row[index];

}
);



return {


success:true,


data:{


billId:
bill["Bill ID"] || "",


month:
savedMonth,


actualKwh:
Number(
bill["Actual kWh"]
) || 0,


generation:
Number(
bill["Generation"]
) || 0,


transmission:
Number(
bill["Transmission"]
) || 0,


systemLoss:
Number(
bill["System Loss"]
) || 0,


distribution:
Number(
bill["Distribution"]
) || 0,


seniorCitizen:
Number(
bill["Senior Citizen"]
) || 0,


governmentTaxes:
Number(
bill["Government Taxes"]
) || 0,


universalCharges:
Number(
bill["Universal Charges"]
) || 0,


fitAll:
Number(
bill["FIT-All"]
) || 0,


geaAll:
Number(
bill["GEA-All"]
) || 0,


lifeline:
Number(
bill["Lifeline"]
) || 0,


otherCharges:
Number(
bill["Other Charges"]
) || 0,


actualBill:
Number(
bill["Actual Bill"]
) || 0,


notes:
bill["Notes"] || "",


createdAt:
bill["Created At"] || ""

}


};


}


}



return {

success:false,

message:
"No bill saved for this month."

};


}


function getSavedBillMonths(userId){

Logger.log("==============================");
Logger.log("GET SAVED BILL MONTHS - USER FILE");
Logger.log("==============================");

Logger.log(
"USER ID:"
+ userId
);



const userSpreadsheetId =
getUserSpreadsheetId(
  userId
);



Logger.log(
"DEDICATED FILE ID:"
+ userSpreadsheetId
);



if(!userSpreadsheetId){

  Logger.log(
    "NO USER SPREADSHEET FOUND"
  );

  return [];

}



const ss =
SpreadsheetApp.openById(
  userSpreadsheetId
);



Logger.log(
"OPENED FILE:"
+ ss.getName()
);



const sheet =
ss.getSheetByName(
"Bill History"
);



if(!sheet){

  Logger.log(
    "NO BILL HISTORY SHEET"
  );

  return [];

}



const data =
sheet
.getDataRange()
.getValues();



if(data.length <= 1){

  return [];

}



const headers =
data[0];



const userIndex =
headers.indexOf(
"User ID"
);



const monthIndex =
headers.indexOf(
"Bill Month"
);



const months = [];



for(
let i = 1;
i < data.length;
i++
){


if(
String(
data[i][userIndex]
)
.trim()
===
String(userId).trim()
){


let month =
data[i][monthIndex];



if(
month instanceof Date
){

month =
Utilities.formatDate(
month,
Session.getScriptTimeZone(),
"MMMM yyyy"
);

}
else{

month =
String(month)
.trim();

}



months.push(
month
);


}



}



Logger.log(
"MONTHS RETURNED:"
+ JSON.stringify(months)
);



return months;


}



// =====================================
// GET ALL SAVED ACTUAL BILLS FOR USER
// FROM USER DEDICATED SPREADSHEET
// =====================================
function getActualBills(userId){

  Logger.log(
  "ACTIVE FUNCTION: BILL VIEW GS getActualBills"
);

  Logger.log("==============================");
  Logger.log("GET ACTUAL BILLS - USER FILE");
  Logger.log("==============================");

  Logger.log("USER ID: " + userId);


  try {


    if(!userId){

      Logger.log("NO USER ID");

      return [];

    }



    const userSpreadsheetId =
      getUserSpreadsheetId(
        userId
      );


    Logger.log(
      "DEDICATED SPREADSHEET ID: " +
      userSpreadsheetId
    );



    if(!userSpreadsheetId){

      Logger.log(
        "NO USER SPREADSHEET FOUND"
      );

      return [];

    }



    const ss =
      SpreadsheetApp.openById(
        userSpreadsheetId
      );


    Logger.log(
      "OPENED FILE: " +
      ss.getName()
    );



    const sheet =
      ss.getSheetByName(
        "Bill History"
      );



    if(!sheet){

      Logger.log(
        "NO BILL HISTORY SHEET"
      );

      return [];

    }



    const data =
      sheet
      .getDataRange()
      .getDisplayValues();



    Logger.log(
      "ROWS FOUND: " +
      data.length
    );



    if(data.length <= 1){

      return [];

    }



    const headers =
      data[0];



    Logger.log(
      "HEADERS: " +
      JSON.stringify(headers)
    );



    const bills = [];



    for(
      let i = 1;
      i < data.length;
      i++
    ){


      const row =
        data[i];



      const userIdIndex =
        headers.indexOf(
          "User ID"
        );



      if(
        userIdIndex === -1
      ){

        continue;

      }



      const savedUser =
        String(
          row[userIdIndex]
        )
        .trim();



      if(
        savedUser !==
        String(userId)
        .trim()
      ){

        continue;

      }



      bills.push({

        billId:
          row[
            headers.indexOf(
              "Bill ID"
            )
          ] || "",



        month:
          row[
            headers.indexOf(
              "Bill Month"
            )
          ] || "",



        actualKwh:
          Number(
            row[
              headers.indexOf(
                "Actual kWh"
              )
            ] || 0
          ),



        generation:
          Number(
            row[
              headers.indexOf(
                "Generation"
              )
            ] || 0
          ),



        transmission:
          Number(
            row[
              headers.indexOf(
                "Transmission"
              )
            ] || 0
          ),



        systemLoss:
          Number(
            row[
              headers.indexOf(
                "System Loss"
              )
            ] || 0
          ),



        distribution:
          Number(
            row[
              headers.indexOf(
                "Distribution"
              )
            ] || 0
          ),



        seniorCitizen:
          Number(
            row[
              headers.indexOf(
                "Senior Citizen"
              )
            ] || 0
          ),



        governmentTaxes:
          Number(
            row[
              headers.indexOf(
                "Government Taxes"
              )
            ] || 0
          ),



        universalCharges:
          Number(
            row[
              headers.indexOf(
                "Universal Charges"
              )
            ] || 0
          ),



        fitAll:
          Number(
            row[
              headers.indexOf(
                "FIT-All"
              )
            ] || 0
          ),



        geaAll:
          Number(
            row[
              headers.indexOf(
                "GEA-All"
              )
            ] || 0
          ),



        lifeline:
          Number(
            row[
              headers.indexOf(
                "Lifeline"
              )
            ] || 0
          ),



        otherCharges:
          Number(
            row[
              headers.indexOf(
                "Other Charges"
              )
            ] || 0
          ),



        actualBill:
          Number(
            row[
              headers.indexOf(
                "Actual Bill"
              )
            ] || 0
          ),



        notes:
          row[
            headers.indexOf(
              "Notes"
            )
          ] || "",



        createdAt:
          String(
            row[
              headers.indexOf(
                "Created At"
              )
            ] || ""
          )

      });



    }



    Logger.log(
      "RETURNING BILLS: " +
      bills.length
    );


    Logger.log(
      JSON.stringify(
        bills
      )
    );



    return bills;



  }
  catch(error){


    Logger.log(
      "GET ACTUAL BILLS ERROR: " +
      error.message
    );


    return [];

  }

}




// =====================================
// UPDATE SAVED ACTUAL BILL
// Updates the existing Bill History row
// =====================================
function updateSavedBill(userId, billId, data) {

  Logger.log("==============================");
  Logger.log("UPDATE SAVED BILL");
  Logger.log("==============================");

  Logger.log("USER ID: " + userId);
  Logger.log("BILL ID: " + billId);

  if (!userId) {
    throw new Error("User ID is required.");
  }

  if (!billId) {
    throw new Error("Bill ID is required.");
  }

  const userSpreadsheetId =
    getUserSpreadsheetId(userId);

  if (!userSpreadsheetId) {
    throw new Error(
      "User spreadsheet not found."
    );
  }

  const ss =
    SpreadsheetApp.openById(
      userSpreadsheetId
    );

  const sheet =
    ss.getSheetByName(
      "Bill History"
    );

  if (!sheet) {
    throw new Error(
      "Bill History sheet not found."
    );
  }

  const dataRange =
    sheet
      .getDataRange()
      .getValues();

  if (dataRange.length <= 1) {
    throw new Error(
      "No bills recorded."
    );
  }

  const headers =
    dataRange[0];

  const billIdIndex =
    headers.indexOf("Bill ID");

  const userIdIndex =
    headers.indexOf("User ID");

  if (
    billIdIndex === -1 ||
    userIdIndex === -1
  ) {
    throw new Error(
      "Bill History is missing Bill ID or User ID column."
    );
  }

  let targetRow = -1;

  for (
    let i = 1;
    i < dataRange.length;
    i++
  ) {

    const row =
      dataRange[i];

    const rowBillId =
      String(
        row[billIdIndex]
      ).trim();

    const rowUserId =
      String(
        row[userIdIndex]
      ).trim();

    if (
      rowBillId === String(billId).trim() &&
      rowUserId === String(userId).trim()
    ) {

      targetRow = i + 1;

      break;
    }
  }

  if (targetRow === -1) {
    throw new Error(
      "Bill record not found."
    );
  }

  // -----------------------------------
  // Fields that can be edited
  // -----------------------------------

  const editableFields = {

    "Generation":
      data.generation,

    "Transmission":
      data.transmission,

    "System Loss":
      data.systemLoss,

    "Distribution":
      data.distribution,

    "Senior Citizen":
      data.seniorCitizen,

    "Government Taxes":
      data.governmentTaxes,

    "Universal Charges":
      data.universalCharges,

    "FIT-All":
      data.fitAll,

    "GEA-All":
      data.geaAll,

    "Lifeline":
      data.lifeline,

    "Other Charges":
      data.otherCharges

  };

  // -----------------------------------
  // Update only columns that exist
  // -----------------------------------

  Object.keys(editableFields)
    .forEach(function(field) {

      const columnIndex =
        headers.indexOf(field);

      if (columnIndex === -1) {
        return;
      }

      const value =
        Number(
          editableFields[field]
        ) || 0;

      sheet
        .getRange(
          targetRow,
          columnIndex + 1
        )
        .setValue(value);

    });

  // -----------------------------------
  // Update Actual Bill
  // -----------------------------------

  const actualBillIndex =
    headers.indexOf(
      "Actual Bill"
    );

  if (actualBillIndex !== -1) {

    sheet
      .getRange(
        targetRow,
        actualBillIndex + 1
      )
      .setValue(
        Number(
          data.actualBill
        ) || 0
      );

  }

  // -----------------------------------
  // Update Notes if supplied
  // -----------------------------------

  const notesIndex =
    headers.indexOf(
      "Notes"
    );

  if (
    notesIndex !== -1 &&
    data.notes !== undefined
  ) {

    sheet
      .getRange(
        targetRow,
        notesIndex + 1
      )
      .setValue(
        data.notes
      );

  }

  Logger.log(
    "BILL UPDATED - ROW: " +
    targetRow
  );

  return {
    success: true,
    message: "Bill updated successfully."
  };

}
