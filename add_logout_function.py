from pathlib import Path

file = Path("scripts.js")

content = file.read_text()

if "function logout()" in content:
    print("Logout function already exists.")
    exit()

content += """

/* =====================================================
   LOGOUT
   ===================================================== */

function logout() {

  console.log("Logging out WattWise user...");

  localStorage.removeItem(
    "wattwiseSession"
  );

  localStorage.removeItem(
    "electricityTrackerUserId"
  );

  localStorage.removeItem(
    "electricityTrackerEmail"
  );

  localStorage.removeItem(
    "electricityTrackerHousehold"
  );


  APP.userId = "";
  APP.email = "";
  APP.householdName = "";


  document
    .getElementById(
      "dashboardSection"
    )
    .classList
    .add(
      "hidden"
    );


  document
    .getElementById(
      "setupSection"
    )
    .classList
    .remove(
      "hidden"
    );


  showToast(
    "Logged out successfully."
  );

}

"""

file.write_text(content)

print("Logout function added.")
