FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 1. העתקת כל התיקיות והקבצים לפלטפורמת הבנייה
COPY . .

# 2. מעבר לתיקייה המדויקת - עם P גדולה ורווח בשם התיקייה
WORKDIR "/src/Project/Web Application"

# 3. ביצוע ה-Restore וה-Publish מתוך התיקייה הנכונה
RUN dotnet restore
RUN dotnet publish -c Release -o /app/out

# שלב ההרצה
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Web Application.dll"]
