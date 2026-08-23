from pathlib import Path

file = Path("styles.css")

content = file.read_text()

start = content.index(".logout-btn {")

end = content.index("}", start) + 1

new_css = """
.logout-btn {

  background: #ffd9e3;

  border: 2px solid #e69ab1;

  color: #6b4535;

  height: 56px;

  min-width: 160px;

  padding: 0 28px;

  border-radius: 30px;

  font-size: 18px;

  font-weight: 600;

  font-family: inherit;

  cursor: pointer;

  box-shadow: 0 4px 10px rgba(230,154,177,0.22);

  transition: all 0.2s ease;

}
"""

content = content[:start] + new_css + content[end:]

file.write_text(content)

print("Logout button refined.")
