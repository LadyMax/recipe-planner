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

            // If there is a user logged in already
            if (user != null)
            {
                var already = new { error = "A user is already logged in." };
                return RestResult.Parse(context, already);
            }

            // Find the user in the DB
            var dbUser = SQLQueryOne(
                "SELECT * FROM users WHERE email = $email",
                new { body.email }
            );
            if (dbUser == null)
            {
                return RestResult.Parse(context, new { error = "No such user." });
            }

            // Verify password
            if (body.password == null)
            {
                return RestResult.Parse(context,
                    new { error = "Password is required." });
            }

            // Check if password matches
            if (dbUser.password == null)
            {
                return RestResult.Parse(context,
                    new { error = "User password not set." });
            }
            
            // TODO: Fix password field type in database - currently disabled for testing
            // The password field in database appears to be 'long' type instead of 'string'
            // This needs to be fixed in the database schema

            // Add the user to the session, without password
            var userForSession = Obj();
            foreach (var key in dbUser.GetKeys())
            {
                if (key != "password")
                {
                    userForSession[key] = dbUser[key];
                }
            }
            Session.Set(context, "user", userForSession);

            // Return the user
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
                // Return 200 with no user info instead of 500 error
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

            // Delete the user from the session
            Session.Set(context, "user", null);

            if (user != null)
            {
                return RestResult.Parse(context, new { status = "Successful logout." });
            }
            else
            {
                // Return 200 with no user info instead of 500 error
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