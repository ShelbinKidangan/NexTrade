FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

# Copy csproj files and restore
COPY src/NexTrade.Core/NexTrade.Core.csproj NexTrade.Core/
COPY src/NexTrade.Shared/NexTrade.Shared.csproj NexTrade.Shared/
COPY src/NexTrade.Infrastructure/NexTrade.Infrastructure.csproj NexTrade.Infrastructure/
COPY src/NexTrade.ServiceDefaults/NexTrade.ServiceDefaults.csproj NexTrade.ServiceDefaults/
COPY src/NexTrade.Consumers/NexTrade.Consumers.csproj NexTrade.Consumers/
RUN dotnet restore NexTrade.Consumers/NexTrade.Consumers.csproj

# Copy source and build
COPY src/NexTrade.Core/ NexTrade.Core/
COPY src/NexTrade.Shared/ NexTrade.Shared/
COPY src/NexTrade.Infrastructure/ NexTrade.Infrastructure/
COPY src/NexTrade.ServiceDefaults/ NexTrade.ServiceDefaults/
COPY src/NexTrade.Consumers/ NexTrade.Consumers/
RUN dotnet publish NexTrade.Consumers/NexTrade.Consumers.csproj -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "NexTrade.Consumers.dll"]
