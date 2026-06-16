FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 1. העתקת כל הפרויקט למערכת הבנייה
COPY . .

# 2. ניווט בנתיב המלא והמדויק לפי התיקיות ב-GitHub
WORKDIR "/src/C-Main-Project/Project/Web Application"

# 3. בניית השרת
RUN dotnet restore
RUN dotnet publish -c Release -o /app/out

# שלב ההרצה
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Web Application.dll"]
