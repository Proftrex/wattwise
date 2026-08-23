from pathlib import Path

file = Path("scripts.js")

content = file.read_text()

old = """


    APP.email =
      savedEmail;


    APP.householdName =
      savedHousehold ||
      'My Household';

  }

}

"""

new = """

}

"""

if old not in content:
    raise Exception("Old leftover session block not found")

content = content.replace(old, new, 1)

file.write_text(content)

print("Removed old session leftovers.")
