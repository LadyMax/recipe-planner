namespace WebApp;
public static class FileServer
{
    public static void Start()
    {
        App.UseStaticFiles();
    }
}