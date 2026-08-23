from pathlib import Path

file = Path("scripts.js")

content = file.read_text()

old = """    return;

  }

}

"""

new = """    return;

  }


  // No saved session: show login screen

  document
    .getElementById(
      "setupSection"
    )
    .classList
    .remove(
      "hidden"
    );

}

"""

if old not in content:
    raise Exception("InitializeApp ending block not found")

content = content.replace(old, new, 1)

file.write_text(content)

print("Added login display when no session exists.")
