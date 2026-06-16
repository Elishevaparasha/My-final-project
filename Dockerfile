FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# העתקת כל הקבצים שנמצאים בתוך C-Main-Project
COPY . ./
RUN dotnet restore

# בניית הפרויקט
RUN dotnet publish -c Release -o out

# שלב ההרצה
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Web Application.dll"]