namespace WebApp;
public static class DebugLog
{
    private static readonly Obj memory = new();

    public static void Start()
    {
        // 简化的调试日志 - 只在需要时启用
    }

    public static void Register(HttpContext context)
    {
        // 简化的请求注册
        var id = Guid.NewGuid().ToString();
        context.Items["id"] = id;
    }

    public static void Add(HttpContext context, object info)
    {
        // 简化的日志添加 - 可以输出到控制台
        WebApp.Shared.Log(info);
    }
}
