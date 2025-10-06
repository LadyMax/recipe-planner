namespace WebApp;
public static class Shared
{
    // A global object to store settings in
    private static Obj _globals = Obj();

    public static dynamic Globals
    {
        get { return _globals; }
        set { _globals = value; }
    }

    // A setter/getter for the WebApp
    // (created by Server.cs)
    private static WebApplication _app;

    public static WebApplication App
    {
        get { return _app!; }
        set { _app = value; }
    }

    // Now - time now as unix timestamp in milliseconds
    public static long Now
    {
        get
        {
            DateTimeOffset dto = new DateTimeOffset(DateTime.UtcNow);
            return dto.ToUnixTimeMilliseconds();
        }
    }

    public static string FilePath(params string[] parts)
    {
        // 更灵活的路径解析
        var currentDir = Environment.CurrentDirectory;
        
        // 尝试找到项目根目录
        var projectRoot = currentDir;
        var searchDirs = new[] { "Backend", "backend", "example" };
        
        foreach (var searchDir in searchDirs)
        {
            var index = currentDir.LastIndexOf(searchDir, StringComparison.OrdinalIgnoreCase);
            if (index >= 0)
            {
                projectRoot = currentDir.Substring(0, index + searchDir.Length);
                break;
            }
        }
        
        // 构建完整路径
        var path = projectRoot;
        foreach (var part in parts)
        {
            path = Path.Combine(path, part);
        }
        
        return path;
    }

    // Simple logging method
    public static void Log(params object[] args)
    {
        var message = string.Join(" ", args.Select(arg => arg?.ToString() ?? "null"));
        Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] {message}");
    }

    // 公共的JSON解析方法，避免重复代码
    public static Obj ParseJsonElement(JsonElement jsonElement)
    {
        var obj = Obj();
        foreach (var prop in jsonElement.EnumerateObject())
        {
            // 只处理基本类型字段，跳过复杂对象
            if (prop.Value.ValueKind == JsonValueKind.String)
                obj[prop.Name] = prop.Value.ToString().Trim('"');
            else if (prop.Value.ValueKind == JsonValueKind.Number)
                obj[prop.Name] = prop.Value.GetDecimal();
            else if (prop.Value.ValueKind == JsonValueKind.True)
                obj[prop.Name] = true;
            else if (prop.Value.ValueKind == JsonValueKind.False)
                obj[prop.Name] = false;
            else if (prop.Value.ValueKind == JsonValueKind.Null)
                obj[prop.Name] = null;
            // 跳过复杂对象数组（如ingredients）
        }
        return obj;
    }
}