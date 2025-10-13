namespace WebApp;

public static partial class Session
{
    public static dynamic GetRawSession(HttpContext context)
    {
        // If the session is already cached in context.Items
        // (if we call this method more than once per request)
        var inContext = context.Items["session"];
        if (inContext != null) { return inContext; }

        // Get the cookie value if we have a session cookie
        // - otherwise create a session cookie
        context.Request.Cookies.TryGetValue("session", out string cookieValue);
        if (cookieValue == null)
        {
            cookieValue = Guid.NewGuid().ToString();
            context.Response.Cookies.Append("session", cookieValue, new CookieOptions
            {
                HttpOnly = true,
                Secure = false, // Set to true in production with HTTPS
                SameSite = SameSiteMode.Lax,
                Expires = DateTimeOffset.UtcNow.AddHours(2)
            });
        }

        // Get the session data from the database if it stored there
        // otherwise store it in the database
        var session = SQLQueryOne(
          "SELECT * FROM sessions WHERE id = $id",
          new { id = cookieValue }
        );
        if (session == null)
        {
            SQLQuery(
                "INSERT INTO sessions(id) VALUES($id)",
                new { id = cookieValue }
            );
            session = Obj(new { id = cookieValue, data = "{}" });
        }

        // Cache the session in context.Items
        context.Items["session"] = session;
        return session;
    }

    public static void Start()
    {
        // Simplified session startup - no special logic needed
    }


    public static Obj Get(HttpContext context, string key)
    {
        var session = GetRawSession(context);
        // Convert the data from JSON using Dyndata
        try
        {
            var data = JSON.Parse(session.data);
            return data[key];
        }
        catch
        {
            return null;
        }
    }

    public static void Set(HttpContext context, string key, object value)
    {
        var session = GetRawSession(context);
        // Parse existing data using System.Text.Json
        Obj data;
        try
        {
            data = JSON.Parse(session.data);
        }
        catch
        {
            data = Obj();
        }
        // Set the property in data
        data[key] = value;
        // Save to DB, with the data converted to JSON
        var jsonData = System.Text.Json.JsonSerializer.Serialize(data);
        SQLQuery(
            @"UPDATE sessions 
              SET modified = DATETIME('now'), data = $data
              WHERE id = $id",
            new
            {
                session.id,
                data = jsonData
            }
       );
    }
}