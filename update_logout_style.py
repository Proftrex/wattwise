from pathlib import Path

file = Path("styles.css")

content = file.read_text()

old = """
.logout-btn {
"""

if old not in content:
    raise Exception("logout-btn CSS not found")


start = content.index(".logout-btn {")

end = content.index("}", start) + 1


new = """
.logout-btn {

  background: #f9d6df;

  border: 2px solid #e8aebe;

  color: #6b4535;

  padding: 14px 28px;

  border-radius: 30px;

  font-size: 18px;

  font-weight: 600;

  font-family: inherit;

  cursor: pointer;

  box-shadow: 0 4px 10px rgba(232,174,190,0.25);

  transition: all 0.2s ease;

}


.logout-btn:hover {

  background: #f5c4d2;

  border-color: #d995aa;

}
"""

content = content[:start] + new + content[end:]

file.write_text(content)

print("Logout button style updated.")
