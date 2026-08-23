from pathlib import Path

file = Path("index.html")

content = file.read_text()

old = """id="setupSection"
      class="setup-card">"""

new = """id="setupSection"
      class="setup-card hidden">"""

if old not in content:
    raise Exception("setupSection block not found")

content = content.replace(old, new, 1)

file.write_text(content)

print("Hidden login screen during session check.")
