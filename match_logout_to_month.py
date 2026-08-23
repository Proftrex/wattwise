from pathlib import Path

file = Path("styles.css")

content = file.read_text()

start = content.index(".logout-btn {")

end = content.index("}", start) + 1

new_css = """
.logout-btn {

  background: #ffd6e5;

  border: 3px solid #e98eac;

  color: #6b4535;

  height: 70px;

  width: 250px;

  padding: 0;

  border-radius: 35px;

  font-size: 22px;

  font-weight: 600;

  font-family: inherit;

  cursor: pointer;

  display: flex;

  align-items: center;

  justify-content: center;

  box-shadow: 0 4px 10px rgba(233,142,172,0.18);

  transition: all 0.2s ease;

}
"""

content = content[:start] + new_css + content[end:]

file.write_text(content)

print("Logout matched to Month selector size.")
