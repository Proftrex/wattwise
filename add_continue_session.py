from pathlib import Path

file = Path("scripts.js")

content = file.read_text()

old = """          APP.userId =
            result.userId;



          console.log(
            "Recovered USER ID:",
            APP.userId
          );



          loadActualBills();
"""

new = """          APP.userId =
            result.userId;



          console.log(
            "Recovered USER ID:",
            APP.userId
          );


          continueLoadingApp();
"""

if old not in content:
    raise Exception("Recovery block not found")

content = content.replace(old, new)

file.write_text(content)

print("Added dashboard resume after session recovery.")
