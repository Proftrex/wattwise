from pathlib import Path

file = Path("scripts.js")

content = file.read_text()

old = """    const savedUserId =
      localStorage.getItem(
        'electricityTrackerUserId'
      );


    if(savedUserId){

      APP.userId =
        savedUserId;


      APP.email =
        savedEmail;


      APP.householdName =
        savedHousehold ||
        'My Household';


      showDashboard();

      refreshDashboard();

      loadAppliances();

      return;

    }
"""

new = """    const savedUserId =
      localStorage.getItem(
        'electricityTrackerUserId'
      );


    if (
      savedUserId &&
      savedEmail
    ) {

      APP.userId =
        savedUserId;


      APP.email =
        savedEmail;


      APP.householdName =
        savedHousehold ||
        'My Household';


      console.log(
        'Restoring WattWise session:',
        APP.userId
      );


      continueLoadingApp();


      return;

    }
"""

if old not in content:
    raise Exception("Current session block not found")

content = content.replace(old, new)

file.write_text(content)

print("Session restore updated.")
