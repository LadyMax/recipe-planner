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
            
            // Verify password matches database value
            // Process different password data types from database
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
            
            // Use simple password comparison for plain text passwords
            if (storedPassword != (string)body.password)
            {
                return RestResult.Parse(context,
                    new { error = "Password mismatch." });
            }

            // Store user data in session (excluding sensitive password)
            dbUser.Delete("password");
            Session.Set(context, "user", dbUser);

            // Send user data back to client
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

            // Clear user session data
            Session.Set(context, "user", null);

            return RestResult.Parse(context, user == null ?
                new { error = "No user is logged in." } :
                new { status = "Successful logout." }
            );
        });
    }
}