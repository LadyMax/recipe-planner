namespace WebApp;
public static class FileServer
{
    public static void Start()
    {
        // 简化的文件服务 - 提供静态文件
        App.UseStaticFiles();
        
        // SPA支持 - 所有非API请求返回index.html
        App.MapFallback(async context =>
        {
            if (!context.Request.Path.StartsWithSegments("/api"))
            {
                // 使用更可靠的路径解析
                var distPath = Path.Combine(App.Environment.ContentRootPath, "..", "dist", "index.html");
                
                // 如果dist路径不存在，尝试相对路径
                if (!File.Exists(distPath))
                {
                    distPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "dist", "index.html");
                }
                
                if (File.Exists(distPath))
                {
                    context.Response.ContentType = "text/html";
                    await context.Response.SendFileAsync(distPath);
                }
                else
                {
                    context.Response.StatusCode = 404;
                    await context.Response.WriteAsync("File not found");
                }
            }
        });
    }
}
