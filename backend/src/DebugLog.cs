namespace WebApp;
public static class DebugLog
{
    private static Dictionary<string, Arr> _logs = new Dictionary<string, Arr>();

    public static void Register(HttpContext context)
    {
        var requestId = context.TraceIdentifier;
        _logs[requestId] = Arr();
    }

    public static void Add(HttpContext context, dynamic data)
    {
        var requestId = context.TraceIdentifier;
        if (_logs.ContainsKey(requestId))
        {
            _logs[requestId].Push(data);
        }
    }

    public static void Start()
    {
        // Initialize debug logging
    }
}