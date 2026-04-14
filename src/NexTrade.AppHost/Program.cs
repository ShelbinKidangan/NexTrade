var builder = DistributedApplication.CreateBuilder(args);

// Infrastructure
// pgvector/pgvector:pg17 — the plain postgres image lacks the vector extension our
// CatalogItem.Embedding and BusinessProfile.Embedding columns require.
// Password is a stable user secret so the data volume stays usable across runs —
// otherwise Aspire generates a new password each run and auth fails against the
// existing volume.
var postgresPassword = builder.AddParameter("postgres-password", secret: true);

var postgres = builder.AddPostgres("postgres", password: postgresPassword)
    .WithImage("pgvector/pgvector", "pg17")
    .WithDataVolume("nextrade-postgres-data")
    .WithPgAdmin(c => c.WithHostPort(5051));

var nextradeDb = postgres.AddDatabase("nextrade-db");

var rabbitmq = builder.AddRabbitMQ("rabbitmq")
    .WithManagementPlugin();

var valkey = builder.AddValkey("valkey");

// API — reconfigure the "http" endpoint that Aspire auto-creates from the
// Api's launchSettings applicationUrl so Kestrel binds directly to 5000 with
// no Aspire proxy. This way the Next.js UI at http://localhost:3000 always
// reaches http://localhost:5000 without chasing a new dynamic port each run.
builder.AddProject<Projects.NexTrade_Api>("nextrade-api")
    .WithEndpoint("http", e =>
    {
        e.Port = 5000;
        e.TargetPort = 5000;
        e.IsProxied = false;
    })
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
