namespace WebApp;
public static class SessionTouch
{
    public static void Start()
    {
        // SessionTouch不需要特殊的启动逻辑
        // Touch方法会在中间件中调用
    }
    
    public static void Touch(HttpContext context)
    {
        // 简化的会话管理 - 保持会话活跃
        var session = Session.GetRawSession(context);
        if (session != null)
        {
            // 更新会话时间
            SQLQuery(
                "UPDATE sessions SET modified = DATETIME('now') WHERE id = $id",
                new { id = session.id }
            );
        }
    }
}
