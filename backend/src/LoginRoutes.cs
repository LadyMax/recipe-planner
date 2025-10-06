namespace WebApp;
public static class LoginRoutes
{
    private static Obj GetUser(HttpContext context)
    {
        return Session.Get(context, "user");
    }

    public static void Start()
    {
        App.MapPost("/api/login", (HttpContext context, JsonElement bodyJson) =>
        {
            try
            {
                WebApp.Shared.Log("Login attempt started");
                
                var user = GetUser(context);
                // 使用公共的JSON解析方法
                var body = ParseJsonElement(bodyJson);

                WebApp.Shared.Log($"Login body: email={body["email"]}, password={body["password"]}");

                // If there is a user logged in already
                if (user != null)
                {
                    var already = new { error = "A user is already logged in." };
                    return RestResult.Parse(context, already);
                }

                // Find the user in the DB
                WebApp.Shared.Log($"Searching for user with email: {body["email"]}");
                var dbUser = SQLQueryOne(
                    "SELECT * FROM users WHERE email = $email",
                    new { email = body["email"] }
                );
                
                WebApp.Shared.Log($"Database user found: {dbUser != null}");
                if (dbUser == null)
                {
                    WebApp.Shared.Log("No user found with that email");
                    return RestResult.Parse(context, new { error = "No such user." });
                }

                // Simple password comparison
                if ((string)body["password"] != (string)dbUser.password)
                {
                    WebApp.Shared.Log("Password mismatch");
                    return RestResult.Parse(context,
                        new { error = "Password mismatch." });
                }

                // Add the user to the session, without password
                dbUser.Delete("password");
                Session.Set(context, "user", dbUser);

                WebApp.Shared.Log("Login successful");
                // Return the user
                return RestResult.Parse(context, dbUser!);
            }
            catch (Exception ex)
            {
                WebApp.Shared.Log($"Login error: {ex.Message}");
                WebApp.Shared.Log($"Stack trace: {ex.StackTrace}");
                return RestResult.Parse(context, new { error = $"Login failed: {ex.Message}" });
            }
        });

        App.MapGet("/api/login", (HttpContext context) =>
        {
            var user = GetUser(context);
            return RestResult.Parse(context, user != null ?
                user : new { error = "No user is logged in." });
        });

        App.MapDelete("/api/login", (HttpContext context) =>
        {
            var user = GetUser(context);

            // Delete the user from the session
            Session.Set(context, "user", null);

            return RestResult.Parse(context, user == null ?
                new { error = "No user is logged in." } :
                new { status = "Successful logout." }
            );
        });
    }
}