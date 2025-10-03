// Global settings
Globals = Obj(new
{
    debugOn = false,  // OBS! Sätt till false i produktion
    detailedAclDebug = false,
    aclOn = false,
    isSpa = true,
    port = Environment.GetEnvironmentVariable("APP_PORT") ?? (args.Length > 0 ? args[0] : "5001"),
    serverName = "Minimal API Backend",
    frontendPath = Environment.GetEnvironmentVariable("FRONTEND_PATH") ?? (args.Length > 1 ? args[1] : "../dist"),
    dbPath = Environment.GetEnvironmentVariable("DB_PATH") ?? (args.Length > 2 ? args[2] : "./db_template/_db.sqlite3"),
    sessionLifeTimeHours = 2
});

// Keep the application running
await Server.Start();