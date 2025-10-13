namespace WebApp;
public static class ErrorHandler
{
    public static void Start()
    {
        App.UseExceptionHandler(errorApp =>
        {
            errorApp.Run(async context =>
            {
                context.Response.StatusCode = 500;
                context.Response.ContentType = "application/json";
                
                var error = new { error = "Internal server error" };
                await context.Response.WriteAsJsonAsync(error);
            });
        });
    }
}