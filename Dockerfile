FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# העתקת כל הקבצים של השרת
COPY . .

# מעבר לתיקייה הפנימית שבה נמצא קוד השרת באמת
WORKDIR "/src/project/Web Application"

# ביצוע הבנייה מתוך התיקייה הנכונה
RUN dotnet restore
RUN dotnet publish -c Release -o /app/out

# שלב ההרצה
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Web Application.dll"]
