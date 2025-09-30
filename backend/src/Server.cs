namespace WebApp;
public static class Server
{
    public static void Start()
    {
        var builder = WebApplication.CreateBuilder();
        
        // Add CORS services
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowAll", policy =>
            {
                policy.AllowAnyOrigin()
                      .AllowAnyMethod()
                      .AllowAnyHeader();
            });
        });
        
        App = builder.Build();
        
        // Use CORS
        App.UseCors("AllowAll");
        
        // Initialize database tables
        InitializeDatabase();
        
        Middleware();
        DebugLog.Start();
        Acl.Start();
        ErrorHandler.Start();
        FileServer.Start();
        LoginRoutes.Start();
        RestApi.Start();
        Session.Start();
        // Start the server on port 3001
        var runUrl = "http://localhost:" + Globals.port;
        Log("Server running on:", runUrl);
        Log("With these settings:", Globals);
        App.Run(runUrl);
    }

    // Middleware that changes the server response header,
    // initiates the debug logging for the request,
    // keep sessions alive, stops the route if not acl approved
    // and adds some info for debugging
    public static void Middleware()
    {
        App.Use(async (context, next) =>
        {
            context.Response.Headers.Append("Server", (string)Globals.serverName);
            DebugLog.Register(context);
            Session.Touch(context);
            if (!Acl.Allow(context))
            {
                // Acl says the route is not allowed
                context.Response.StatusCode = 405;
                var error = new { error = "Not allowed." };
                DebugLog.Add(context, error);
                await context.Response.WriteAsJsonAsync(error);
            }
            else { await next(context); }
            // Add some extra info for debugging
            var res = context.Response;
            var contentLength = res.ContentLength;
            contentLength = contentLength == null ? 0 : contentLength;
            var info = Obj(new
            {
                statusCode = res.StatusCode,
                contentType = res.ContentType,
                contentLengthKB =
                    Math.Round((double)contentLength / 10.24) / 100,
                RESPONSE_DONE = Now
            });
            if (info.contentLengthKB == null || info.contentLengthKB == 0)
            {
                info.Delete("contentLengthKB");
            }
            DebugLog.Add(context, info);
        });
    }

    // Initialize database tables by executing SQL files
    private static void InitializeDatabase()
    {
        try
        {
            var sqlFile = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "create_tables.sql");
            if (File.Exists(sqlFile))
            {
                var sqlContent = File.ReadAllText(sqlFile);
                var statements = sqlContent.Split(';', StringSplitOptions.RemoveEmptyEntries);
                
                foreach (var statement in statements)
                {
                    var trimmedStatement = statement.Trim();
                    if (!string.IsNullOrEmpty(trimmedStatement) && !trimmedStatement.StartsWith("--"))
                    {
                        try
                        {
                            SQLQueryOne(trimmedStatement);
                        }
                        catch (Exception ex)
                        {
                            Log("Database initialization warning:", ex.Message);
                        }
                    }
                }
                Log("Database tables initialized successfully");
            }
            else
            {
                Log("SQL file not found:", sqlFile);
            }
        }
        catch (Exception ex)
        {
            Log("Database initialization error:", ex.Message);
        }
    }
}