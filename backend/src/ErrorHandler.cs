namespace WebApp;
public static class ErrorHandler
{
    public static void Start()
    {
        // 简化的错误处理
        App.UseExceptionHandler(exceptionApp =>
        {
            exceptionApp.Run(async context =>
            {
                var feature = context.Features.Get<IExceptionHandlerPathFeature>();
                var error = new { error = feature?.Error?.Message ?? "Unknown error" };
                context.Response.StatusCode = 500;
                await context.Response.WriteAsJsonAsync(error);
            });
        });
    }
}
