FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY Project ./Project
RUN dotnet restore "./Project/Web Application/Server.csproj"
RUN dotnet publish "./Project/Web Application/Server.csproj" -c Release -o /app/out

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "dotnet Server.dll --urls http://0.0.0.0:${PORT:-8080}"]
