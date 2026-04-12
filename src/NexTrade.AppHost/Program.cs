var builder = DistributedApplication.CreateBuilder(args);

// Infrastructure
var postgres = builder.AddPostgres("postgres")
    .WithDataVolume("nextrade-postgres-data")
    .WithPgAdmin(c => c.WithHostPort(5051));

var nextradeDb = postgres.AddDatabase("nextrade-db");

var rabbitmq = builder.AddRabbitMQ("rabbitmq")
    .WithManagementPlugin();

var valkey = builder.AddValkey("valkey");

// API
builder.AddProject<Projects.NexTrade_Api>("nextrade-api")
    .WithReference(nextradeDb)
    .WithReference(rabbitmq)
    .WithReference(valkey)
    .WaitFor(nextradeDb)
    .WaitFor(rabbitmq)
    .WaitFor(valkey);

// Consumers
builder.AddProject<Projects.NexTrade_Consumers>("nextrade-consumers")
    .WithReference(nextradeDb)
    .WithReference(rabbitmq)
    .WithReference(valkey)
    .WaitFor(nextradeDb)
    .WaitFor(rabbitmq);

builder.Build().Run();
