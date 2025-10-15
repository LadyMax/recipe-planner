namespace WebApp;
public static class LoginRoutes
{
    private static Obj GetUser(HttpContext context)
    {
        return Session.Get(context, "user");
    }

    private static Obj ParseJsonElement(JsonElement element)
    {
        return JSON.Parse(element.ToString());
    }

    public static void Start()
    {
        App.MapPost("/api/login", (HttpContext context, JsonElement bodyJson) =>
        {
            var user = GetUser(context);
            var body = JSON.Parse(bodyJson.ToString());

            // Check if user already logged in
            if (user != null)
            {
                var already = new { error = "A user is already logged in." };
                return RestResult.Parse(context, already);
            }

            // Query user from database
            var dbUser = SQLQueryOne(
                "SELECT * FROM users WHERE email = $email",
                new { body.email }
            );
            if (dbUser == null)
            {
                return RestResult.Parse(context, new { error = "No such user." });
            }

            // Validate password input
            if (body.password == null)
            {
                return RestResult.Parse(context,
                    new { error = "Password is required." });
            }

            // Validate user password exists
            if (dbUser.password == null)
            {
                return RestResult.Parse(context,
                    new { error = "User password not set." });
            }
            
            // If the password doesn't match
            // Handle different data types for password field
            string storedPassword;
            if (dbUser.password is string strPassword)
            {
                storedPassword = strPassword;
            }
            else if (dbUser.password != null)
            {
                storedPassword = dbUser.password.ToString();
            }
            else
            {
                storedPassword = "";
            }
            
            // For now, use simple password comparison for testing
            // TODO: Implement proper BCrypt verification
            if (storedPassword != (string)body.password)
            {
                return RestResult.Parse(context,
                    new { error = "Password mismatch." });
            }

            // Add the user to the session, without password
            dbUser.Delete("password");
            Session.Set(context, "user", dbUser);

            // Return the user
            return RestResult.Parse(context, dbUser!);
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