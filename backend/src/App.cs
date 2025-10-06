// 简化的全局设置
Globals = Obj(new
{
    port = "5001",
    serverName = "Simple Backend",
    dbPath = "./db_template/_db.sqlite3"
});

// 启动服务器
await Server.Start();