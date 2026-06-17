FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 1. העתקת כל הקבצים לפרויקט
COPY . .

# 2. בנייה ופרסום של הפרויקט כולו (כולל wwwroot שיושב בפנים)
RUN dotnet restore **/Web\ Application/*.csproj || dotnet restore **/*.csproj
RUN dotnet publish **/Web\ Application/*.csproj -c Release -o /app/out --no-restore || dotnet publish **/*.csproj -c Release -o /app/out --no-restore

# שלב ההרצה
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .
EXPOSE 8080

ENTRYPOINT ["dotnet", "Server.dll"]