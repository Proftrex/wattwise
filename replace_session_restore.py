from pathlib import Path

file = Path("scripts.js")

content = file.read_text()

start = content.index(
"""  /*
   * ==================================================
   * RESTORE EMAIL / HOUSEHOLD ONLY"""
)

end = content.index(
"""    APP.email =
      savedEmail;""",
start
)

replacement = """  /*
   * ==================================================
   * RESTORE WATTWISE SESSION
   *
   * Keep user logged in until logout.
   * ==================================================
   */

  const savedSession =
    localStorage.getItem(
      "wattwiseSession"
    );


  if(savedSession){

    const session =
      JSON.parse(savedSession);


    APP.userId =
      session.userId;


    APP.email =
      session.email;


    APP.householdName =
      session.householdName ||
      "My Household";


    console.log(
      "Restored WattWise session:",
      APP.userId
    );


    continueLoadingApp();


    return;

  }


"""

content = content[:start] + replacement + content[end:]

file.write_text(content)

print("Persistent session restore added.")
