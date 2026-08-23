from pathlib import Path

file = Path("scripts.js")

content = file.read_text()

old = """        APP.userId =
          result.userId;
"""

new = """        APP.userId =
          result.userId;


        localStorage.setItem(
          "wattwiseSession",
          JSON.stringify({
            userId: APP.userId,
            email: APP.email,
            householdName: APP.householdName
          })
        );
"""

if old not in content:
    raise Exception("Login success block not found")

content = content.replace(old, new, 1)

file.write_text(content)

print("Saved WattWise session after login.")
