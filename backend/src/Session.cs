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
            context.Response.Cookies.Append("session", cookieValue);
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
        // 简化的会话启动 - 不需要特殊逻辑
    }

    public static dynamic Get(HttpContext context, string key)
    {
        var session = GetRawSession(context);
        // Convert the data from JSON using System.Text.Json
        try
        {
            var data = JsonSerializer.Deserialize<dynamic>(session.data);
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
        dynamic data;
        try
        {
            data = JsonSerializer.Deserialize<dynamic>(session.data);
        }
        catch
        {
            data = Obj();
        }
        // Set the property in data
        data[key] = value;
        // Save to DB, with the data converted to JSON
        SQLQuery(
            @"UPDATE sessions 
              SET modified = DATETIME('now'), data = $data
              WHERE id = $id",
            new
            {
                session.id,
                data = JsonSerializer.Serialize(data)
            }
       );
    }
}