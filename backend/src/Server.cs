namespace WebApp;
public static class Server
{
    public static async Task Start()
    {
        var builder = WebApplication.CreateBuilder();
        
        // 添加CORS
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowAll", policy =>
            {
                policy.WithOrigins("http://localhost:5173")
                      .AllowCredentials()
                      .AllowAnyMethod()
                      .AllowAnyHeader();
            });
        });
        
        App = builder.Build();
        App.UseCors("AllowAll");
        
        // 添加中间件
        App.Use(async (context, next) =>
        {
            // 调试日志
            DebugLog.Register(context);
            
            // 会话管理
            SessionTouch.Touch(context);
            
            // ACL检查
            if (!Acl.Allow(context))
            {
                context.Response.StatusCode = 403;
                await context.Response.WriteAsJsonAsync(new { error = "Access denied" });
                return;
            }
            
            await next(context);
        });
        
        // 初始化数据库
        InitializeDatabase();
        
        // 启动服务
        DebugLog.Start();
        ErrorHandler.Start();
        Acl.Start();
        SessionTouch.Start();
        FileServer.Start();
        LoginRoutes.Start();
        RestApi.Start();
        
        // 启动服务器
        var runUrl = "http://localhost:" + Globals.port;
        WebApp.Shared.Log("Server running on:", runUrl);
        WebApp.Shared.Log("With these settings:", Globals);
        
        WebApp.Shared.Log("About to start server with URL:", runUrl);
        
        // Start server manually and keep it running
        try
        {
            WebApp.Shared.Log("Starting server on background thread...");
            
            // Start server in background
            _ = Task.Run(async () =>
            {
                try
                {
                    await App.RunAsync(runUrl);
                }
                catch (Exception ex)
                {
                    WebApp.Shared.Log("Background server error:", ex.Message);
                }
            });
            
            WebApp.Shared.Log("Server started successfully!");
            WebApp.Shared.Log("Waiting forever to keep process alive...");
            
            // Keep the main thread alive forever
            while (true)
            {
                await Task.Delay(30000); // 30秒延迟，但不输出心跳
                // Log("Server heartbeat:", DateTime.Now.ToString()); // 禁用心跳输出
            }
        }
        catch (Exception ex)
        {
            WebApp.Shared.Log("Server startup error:", ex.Message);
            WebApp.Shared.Log("Stack trace:", ex.StackTrace);
        }
    }
    
    // 初始化数据库
    private static void InitializeDatabase()
    {
        try
        {
            // 简单验证数据库连接
            var testQuery = SQLQueryOne("SELECT 1 as test");
            if (testQuery != null)
            {
                WebApp.Shared.Log("Database connection verified");
            }
            
            // 检查users表是否存在
            var usersTableCheck = SQLQuery("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
            WebApp.Shared.Log($"Users table exists: {usersTableCheck.Length > 0}");
            
            if (usersTableCheck.Length > 0)
            {
                // 检查是否有用户
                var userCountQuery = SQLQuery("SELECT COUNT(*) as count FROM users");
                var userCount = userCountQuery[0]?.count ?? 0;
                WebApp.Shared.Log($"Users table count: {userCount}");
            }
            
            // 检查recipes表是否存在以及有多少行
            var tableCheck = SQLQuery("SELECT name FROM sqlite_master WHERE type='table' AND name='recipes'");
            WebApp.Shared.Log($"Recipes table exists: {tableCheck.Length > 0}");
            
            if (tableCheck.Length > 0)
            {
                var countQuery = SQLQuery("SELECT COUNT(*) as count FROM recipes");
                WebApp.Shared.Log($"Recipes table count: {countQuery[0]?.count ?? 0}");
                
                // 显示表结构
                var schemaQuery = SQLQuery("PRAGMA table_info(recipes)");
                WebApp.Shared.Log($"Recipes table schema: {schemaQuery.Length} columns");
                foreach (var column in schemaQuery)
                {
                    WebApp.Shared.Log($"Column: {column.name} ({column.type})");
                }
            }
        }
        catch (Exception ex)
        {
            WebApp.Shared.Log("Database connection error:", ex.Message);
        }
    }
}