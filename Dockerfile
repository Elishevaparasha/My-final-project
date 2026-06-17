FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 1. העתקת כל הקבצים
COPY . .

# 2. ביצוע Restore ו-Publish
RUN dotnet restore **/Web\ Application/*.csproj || dotnet restore **/*.csproj
RUN dotnet publish **/Web\ Application/*.csproj -c Release -o /app/out || dotnet publish **/*.csproj -c Release -o /app/out

# התיקון המנצח: העתקה פיזית של תיקיית wwwroot לתוך תיקיית הפלט הסופית!
RUN cp -r "Web Application/wwwroot/browser/"* /app/out/wwwroot/ || cp -r wwwroot/browser/* /app/out/wwwroot/ || echo "No browser folder found"
# שלב ההרצה
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .
EXPOSE 8080

ENTRYPOINT ["dotnet", "Server.dll"]