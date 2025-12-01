Phase 12 – Group Test Mode (Final Specification)
Goal

Whole class gets exactly the same questions using one 7-digit code
Students see only their own score
Teacher can open results forever, on any device, even new computer
No login, no PIN, no keys to lose, zero backend

High-Level Flow

Teacher creates test → enters email once → gets code 7482915
App saves "7482915 belongs to teacher@school.nz" in Google Sheet
Students open mathx.nz/?group=7482915 → same test → submit
Teacher opens mathx.nz/results?group=7482915 → instantly sees full leaderboard + every wrong answer
Works forever because app looks up teacher email from Google Sheet

Google Sheets (create once)
Sheet 1 – GroupScores
Tab: Scores
Headers row 1 (exact):
Timestamp
groupCode
studentName
score
totalQuestions
percent
startTime
endTime
durationSec
ipAddress
wrongQuestions
Sheet 2 – GroupRegistry
Tab: Registry
Headers row 1 (exact):
groupCode
teacherEmail
created
testTitle
year
mode
totalQuestions
Apps Script – GroupScores
jsfunction doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Scores");
  sheet.appendRow([
    new Date(),
    e.parameter.groupCode || "",
    e.parameter.studentName || "Anonymous",
    Number(e.parameter.score || 0),
    Number(e.parameter.totalQuestions || 0),
    Number(e.parameter.percent || 0),
    e.parameter.startTime || "",
    e.parameter.endTime || "",
    Number(e.parameter.durationSec || 0),
    e.parameter.ipAddress || "",
    e.parameter.wrongQuestions || ""
  ]);
  return ContentService.createTextOutput("OK");
}
Apps Script – GroupRegistry
jsfunction doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Registry");
  sheet.appendRow([
    e.parameter.groupCode,
    e.parameter.teacherEmail,
    new Date(),
    e.parameter.testTitle || "",
    e.parameter.year || "",
    e.parameter.mode || "",
    e.parameter.totalQuestions || ""
  ]);
  return ContentService.createTextOutput("OK");
}

function doGet() {
  const data = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Registry").getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1).map(r => {
    const o = {};
    headers.forEach((h,i) => o[h] = r[i]);
    return o;
  });
  return ContentService.createTextOutput(JSON.stringify(rows))
         .setMimeType(ContentService.MimeType.JSON);
}
Deploy both as Web App → "Anyone" → copy URLs
Config (src/config.js)
jsexport const REGISTRY_URL = "https://script.google.com/macros/s/.../exec"; // GroupRegistry
export const SCORES_URL   = "https://script.google.com/macros/s/.../exec"; // GroupScores
Data Sent – Teacher Creates Test (POST to REGISTRY_URL)
json{
  "groupCode": "7482915",
  "teacherEmail": "jane@school.nz",
  "testTitle": "Year 7 End-of-Year",
  "year": "7",
  "mode": "full",
  "totalQuestions": "50"
}
Data Sent – Student Finishes (POST to SCORES_URL)
json{
  "groupCode": "7482915",
  "studentName": "Alex Chen",
  "score": "44",
  "totalQuestions": "50",
  "percent": "88",
  "startTime": "2025-12-01T10:15:30",
  "endTime": "2025-12-01T10:48:22",
  "durationSec": "1972",
  "ipAddress": "118.92.134.21",
  "wrongQuestions": "[{\"qid\":\"mult-7-15\",\"topic\":\"Multiplication\",\"studentAnswer\":\"96\",\"correctAnswer\":\"105\"},{\"qid\":\"div-7-22\",\"topic\":\"Division\",\"studentAnswer\":\"7\",\"correctAnswer\":\"8\"}]"
}
```

## Final Links Shown to Teacher
```
Group Code: 7482915

Student link (share with class):
https://mathx.nz/?group=7482915

Teacher results link – BOOKMARK THIS:
https://mathx.nz/results?group=7482915
Teacher opens the /results link anytime → app auto-unlocks using registry → shows full leaderboard + every wrong question per student.
Students only ever get the short link → never see leaderboard.