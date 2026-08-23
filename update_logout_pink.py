from pathlib import Path

file = Path("styles.css")

content = file.read_text()

start = content.index(".logout-btn {")

end = content.index("}", start) + 1


new_css = """
.logout-btn {

  background: #ffd6e0;

  border: 2px solid #e89aaa;

  color: #6b4535;

  height: 56px;

  padding: 0 28px;

  border-radius: 30px;

  font-size: 18px;

  font-weight: 600;

  font-family: inherit;

  cursor: pointer;

  box-shadow: 0 4px 12px rgba(232,154,170,0.25);

  transition: all 0.2s ease;

}
"""

content = content[:start] + new_css + content[end:]

# replace hover too
content = content.replace(
""".logout-btn:hover {

  background: #f5c4d2;

  border-color: #d995aa;

}""",
""".logout-btn:hover {

  background: #ffc2d1;

  border-color: #d87992;

}"""
)

file.write_text(content)

print("Logout button changed to pink theme.")
