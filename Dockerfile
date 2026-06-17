FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 1. העתקת כל הקבצים
COPY . .

# 2. ביצוע Restore ו-Publish באמצעות חיפוש דינמי
RUN dotnet restore **/Web\ Application/*.csproj || dotnet restore **/*.csproj
RUN dotnet publish **/Web\ Application/*.csproj -c Release -o /app/out || dotnet publish **/*.csproj -c Release -o /app/out

# שלב ההרצה
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .
EXPOSE 8080

# התיקון המנצח: כאן שינינו ל-Server.dll!
ENTRYPOINT ["dotnet", "Server.dll"]
