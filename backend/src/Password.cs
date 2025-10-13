namespace WebApp;
static class Password
{
    private static int Cost = 10;

    public static string Encrypt(string password)
    {
        return BCrypt.Net.BCrypt.EnhancedHashPassword(password, workFactor: Cost);
    }

    public static bool Verify(string password, string encrypted)
    {
        return BCrypt.Net.BCrypt.EnhancedVerify(password, encrypted);
    }
}
