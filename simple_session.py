from pathlib import Path

file = Path("scripts.js")

content = file.read_text()

old = """    /*
     * Clear any old/stale User ID.
     */
    localStorage.removeItem(
      'electricityTrackerUserId'
    );


    APP.userId =
      '';
"""

new = """    const savedUserId =
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

if old not in content:
    raise Exception("Old block not found")

content = content.replace(old,new)

file.write_text(content)

print("Simple session login added.")
