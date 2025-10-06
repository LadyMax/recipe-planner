namespace WebApp;
public static class Acl
{
    public static void Start()
    {
        // 简化的ACL - 允许所有请求
        // 可以根据需要添加更复杂的权限控制
    }
    
    public static bool Allow(HttpContext context)
    {
        // 简化的权限检查 - 默认允许所有请求
        return true;
    }
    
    public static bool Allow(HttpContext context, string method, string path)
    {
        // 简化的权限检查 - 默认允许所有请求
        return true;
    }
}
