namespace WebApp;
public static class Acl
{
    public static bool Allow(HttpContext context)
    {
        // Allow all requests for now
        // In a real application, you would implement proper access control here
        return true;
    }

    public static void Start()
    {
        // Initialize ACL
    }
}