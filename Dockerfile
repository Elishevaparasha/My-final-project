FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# העתקת קובץ הפרויקט וביצוע Restore (חיפוש דינמי עוקף תיקיות)
COPY **/*.csproj ./
RUN dotnet restore

# העתקת שאר הקבצים ובנייה
COPY . .
RUN dotnet publish -c Release -o /app/out

# שלב ההרצה
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Web Application.dll"]
