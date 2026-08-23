from pathlib import Path

file = Path("scripts.js")

content = file.read_text()

old = """    const savedUserId =
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

new = """    if (savedEmail) {

      APP.email =
        savedEmail;


      APP.householdName =
        savedHousehold ||
        'My Household';


      getUserIdByEmail(savedEmail)
        .then(function(result){

          if(
            result &&
            result.success
          ){

            APP.userId =
              result.userId;


            console.log(
              'Session restored:',
              APP.userId
            );


            continueLoadingApp();

          }

        });


      return;

    }
"""

if old not in content:
    raise Exception("Old session block not found")

content = content.replace(old,new)

file.write_text(content)

print("Final session recovery applied.")
