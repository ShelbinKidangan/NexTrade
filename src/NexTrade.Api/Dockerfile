FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

# Copy csproj files and restore
COPY src/NexTrade.Core/NexTrade.Core.csproj NexTrade.Core/
COPY src/NexTrade.Shared/NexTrade.Shared.csproj NexTrade.Shared/
COPY src/NexTrade.Infrastructure/NexTrade.Infrastructure.csproj NexTrade.Infrastructure/
COPY src/NexTrade.ServiceDefaults/NexTrade.ServiceDefaults.csproj NexTrade.ServiceDefaults/
COPY src/NexTrade.Api/NexTrade.Api.csproj NexTrade.Api/
RUN dotnet restore NexTrade.Api/NexTrade.Api.csproj

# Copy source and build
COPY src/NexTrade.Core/ NexTrade.Core/
COPY src/NexTrade.Shared/ NexTrade.Shared/
COPY src/NexTrade.Infrastructure/ NexTrade.Infrastructure/
COPY src/NexTrade.ServiceDefaults/ NexTrade.ServiceDefaults/
COPY src/NexTrade.Api/ NexTrade.Api/
RUN dotnet publish NexTrade.Api/NexTrade.Api.csproj -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "NexTrade.Api.dll"]
