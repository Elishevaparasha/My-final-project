# אתר הרב אייל אונגר

אתר תוכן דינמי המציג סרטונים ומאמרים בנושאי פסיכולוגיה יהודית, זוגיות ופיתוח אישי.

---

## מבנה הפרויקט

```
C-Main-Project/
├── C-Main-Frontend/        # Angular 19 — צד לקוח
└── Project/
    ├── Dal layer/          # גישה לנתונים (Entity Framework Core + PostgreSQL)
    ├── Bl layer/           # לוגיקה עסקית
    └── Web Application/    # ASP.NET Core Web API
```

---

## טכנולוגיות

| שכבה | טכנולוגיה |
|------|-----------|
| Frontend | Angular 19, TypeScript, SCSS |
| Backend | ASP.NET Core, C# |
| Database | PostgreSQL |
| ORM | Entity Framework Core |
| Auth | JWT Bearer Tokens |
| Email | SendGrid |

---

## הרצת הפרויקט

### דרישות מקדימות
- Node.js 18+
- .NET 8 SDK
- PostgreSQL

### 1. הגדרת Backend

העתק את קובץ ההגדרות לדוגמה:
```
Project/Web Application/appsettings.example.json → appsettings.json
```

מלא את הפרטים:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=<host>;Database=<db>;Username=<user>;Password=<pass>;Port=5432"
  },
  "JwtSecretKey": "<מפתח-סודי-ארוך>",
  "Email": {
    "ApiKey": "<sendgrid-api-key>",
    "FromEmail": "<שולח-מאומת@domain.com>",
    "FromName": "אתר המרצה",
    "FrontendUrl": "http://localhost:4200"
  }
}
```

### הגדרת SendGrid (חובה לשליחת מיילים אמיתיים)
1. הירשמי ב-[SendGrid](https://app.sendgrid.com) (דרך Twilio).
2. **Settings → API Keys → Create API Key** עם הרשאת *Mail Send* — העתיקי את המפתח (מתחיל ב-`SG.`).
3. **Settings → Sender Authentication** — אמתי כתובת שולח (Single Sender) או דומיין.
4. שימי את המפתח ואת כתובת השולח המאומתת ב-`Project/Web Application/appsettings.json` תחת `Email:ApiKey` ו-`Email:FromEmail`.
5. הפעילי מחדש את השרת (`dotnet run`).

הרץ את השרת:
```bash
cd "Project/Web Application"
dotnet run --no-restore??
```

השרת יעלה על `https://localhost:7245`

### 2. הרצת Frontend

```bash
cd C-Main-Frontend
npm install
npm start
ng serve --port 4200 --configuration development --disable-host-check
```

האתר יעלה על `http://localhost:4200`

**או** — לחץ פעמיים על הקובץ `הרץ-אתר.cmd`

---

## פיצ'רים עיקריים

- **דף בית** — תיאור הרב עם תמונה, תחומי מומחיות וכפתורי יצירת קשר
- **סרטונים** — צפייה בסרטוני YouTube משובצים עם מגבלת 30 שעות חודשיות למשתמש חינמי
- **כתבות** — מאמרים עם תמיכה בהקראה קולית בעברית
- **חיפוש** — חיפוש גלובלי בכל התוכן (סרטונים + כתבות)
- **מנוי פרימיום** — צפייה ללא הגבלה תמורת 10 ₪ לחודש
- **פרופיל** — מעקב אחר זמן צפייה חודשי, שינוי סיסמה
- **אדמין** — ניהול משתמשים, הוספת/עריכת תוכן

---

## משתמש אדמין ברירת מחדל

| שדה | ערך |
|-----|-----|
| אימייל | `shifi@admin.com` |
| סיסמה | `admin123` |

---

## API Endpoints עיקריים

### משתמשים — `/api/User`
| Method | Route | תיאור |
|--------|-------|-------|
| POST | `/register` | הרשמה |
| POST | `/login` | התחברות |
| GET | `/{id}` | קבלת משתמש |
| PUT | `/watch-time/{id}` | עדכון זמן צפייה |
| GET | `/can-watch/{id}` | בדיקת הרשאת צפייה |
| PUT | `/subscription/{id}` | עדכון מנוי |

### תוכן — `/api/content`
| Method | Route | תיאור |
|--------|-------|-------|
| GET | `/` | כל התוכן |
| GET | `/{id}` | תוכן לפי מזהה |
| GET | `/search?keyword=` | חיפוש |
| POST | `/` | הוספת תוכן (אדמין) |
| PUT | `/{id}` | עדכון תוכן (אדמין) |
| DELETE | `/{id}` | מחיקת תוכן (אדמין) |

---

## יצירת קשר עם הרב

- **ייעוץ אישי:** [e0541234567@gmail.com](mailto:e0541234567@gmail.com?subject=בקשה לייעוץ אישי)
- **הזמנת הרצאה:** [e0541234567@gmail.com](mailto:e0541234567@gmail.com?subject=הזמנת הרצאה)
