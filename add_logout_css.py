from pathlib import Path

file = Path("styles.css")

content = file.read_text()

css = """

/* ===============================
   DASHBOARD LOGOUT BUTTON
   =============================== */

.dashboard-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}


.logout-btn {
  border: none;
  background: #fff3df;
  color: #6b4428;
  padding: 9px 18px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
}


.logout-btn:hover {
  opacity: 0.8;
}


@media (max-width: 768px) {

  .dashboard-actions {
    width: 100%;
    align-items: flex-end;
  }


  .logout-btn {
    width: auto;
  }

}

"""

content += css

file.write_text(content)

print("Logout CSS added.")
