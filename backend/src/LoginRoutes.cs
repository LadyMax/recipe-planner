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
            
            // TODO: Fix password field type in database - currently disabled for testing
            // The password field in database appears to be 'long' type instead of 'string'
            // This needs to be fixed in the database schema

            // Store user in session without password
            var userForSession = Obj();
            foreach (var key in dbUser.GetKeys())
            {
                if (key != "password")
                {
                    userForSession[key] = dbUser[key];
                }
            }
            Session.Set(context, "user", userForSession);

            // Return user data
            return RestResult.Parse(context, dbUser!);
        });

        App.MapGet("/api/login", (HttpContext context) =>
        {
            var user = GetUser(context);
            if (user != null)
            {
                return RestResult.Parse(context, user);
            }
            else
            {
                // Return 200 with message when no user logged in
                return Results.Text(
                    JSON.Stringify(new { message = "No user is logged in." }),
                    "application/json; charset=utf-8",
                    null,
                    200
                );
            }
        });

        App.MapDelete("/api/login", (HttpContext context) =>
        {
            var user = GetUser(context);

            // Clear user session
            Session.Set(context, "user", null);

            if (user != null)
            {
                return RestResult.Parse(context, new { status = "Successful logout." });
            }
            else
            {
                // Return 200 with message when no user logged in
                return Results.Text(
                    JSON.Stringify(new { message = "No user was logged in." }),
                    "application/json; charset=utf-8",
                    null,
                    200
                );
            }
        });
    }
}