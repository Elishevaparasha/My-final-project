FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# העתקת קבצי הפרויקט ובנייה
COPY . .
RUN dotnet restore
RUN dotnet publish -c Release -o /app

# הרצה של השרת
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .
EXPOSE 8080
ENTRYPOINT ["dotnet", "C-Main-Project.dll"]