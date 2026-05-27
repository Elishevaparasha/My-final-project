# C-Main-Frontend

פרונט Angular לפרויקט **C-Main-Project** (ASP.NET API).

## מבנה

```
c# project/
├── C-Main-Project/     ← Backend (API)
└── C-Main-Frontend/    ← Frontend (Angular)
```

## הרצה

1. הפעילי את ה-API (בתיקיית `C-Main-Project`):
   ```powershell
   cd "C-Main-Project\Project\Web Application"
   dotnet run --launch-profile http
   ```
   השרת אמור לרוץ על `http://localhost:5117`.

2. הפעילי את Angular (**חשוב – נתיב בלי `#`**):
   ```powershell
   cd "C:\Users\Yeshiva\Desktop\dev-csharp\C-Main-Frontend"
   npm start
   ```
   או מתוך `C-Main-Frontend`: `npm start` (מפנה אוטומטית ל-`dev-csharp`).

   האתר: `http://localhost:4200` — בקשות ל-`/api` מועברות לשרת דרך `proxy.conf.json`.

   **אל תריצי** מ-`c# project\...` ישירות — גורם לדף לבן (באג Vite).

## פיצ'רים

- התחברות / הרשמה / אימות מייל / איפוס סיסמה
- רשימת תוכן, חיפוש, צפייה בפריט
- פרופיל ושינוי סיסמה (משתמש מחובר)
- ניהול משתמשים ותוכן (מנהל)
- JWT ב-`localStorage` + interceptor

## הערה חשובה על הבקאנד

ב-`Program.cs` של הבקאנד יש סימני מיזוג (`<<<<<<<`) שלא נפתרו. עד שמתקנים — ייתכן שה-API לא יעלה. אחרי תיקון, מומלץ להוסיף CORS אם מריצים בלי proxy.
