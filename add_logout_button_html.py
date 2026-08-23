from pathlib import Path

file = Path("index.html")

content = file.read_text()

old = """  <div class="month-selector">

    <label for="selectedMonth">
      Month
    </label>

    <select
      id="selectedMonth"
      onchange="refreshDashboard()">
    </select>

  </div>
"""

new = """  <div class="dashboard-actions">

    <button
      onclick="logout()"
      class="logout-btn">
      🚪 Logout
    </button>


    <div class="month-selector">

      <label for="selectedMonth">
        Month
      </label>

      <select
        id="selectedMonth"
        onchange="refreshDashboard()">
      </select>

    </div>

  </div>
"""

if old not in content:
    raise Exception("Month selector block not found")

content = content.replace(old, new, 1)

file.write_text(content)

print("Logout button added to dashboard header.")
