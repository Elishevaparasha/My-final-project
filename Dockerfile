FROM node:20-alpine AS frontend
WORKDIR /frontend
COPY C-Main-Frontend/package.json C-Main-Frontend/package-lock.json ./
RUN npm ci
COPY C-Main-Frontend/ ./
RUN npx ng build --configuration production

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY Project ./Project
COPY --from=frontend /frontend/dist/c-main-frontend/browser "./Project/Web Application/wwwroot"
RUN dotnet restore "./Project/Web Application/Server.csproj"
RUN dotnet publish "./Project/Web Application/Server.csproj" -c Release -o /app/out

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080
ENTRYPOINT ["dotnet", "Server.dll"]
