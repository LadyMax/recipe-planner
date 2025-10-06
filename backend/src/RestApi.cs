using System.Text.Json;

namespace WebApp;
public static class RestApi
{
    public static void Start()
    {
        // Handle OPTIONS requests for CORS
        App.MapMethods("/api/{table}", new[] { "OPTIONS" }, (HttpContext context, string table) =>
        {
            return Results.Ok();
        });

        App.MapMethods("/api/{table}/{id}", new[] { "OPTIONS" }, (HttpContext context, string table, string id) =>
        {
            return Results.Ok();
        });

        App.MapPost("/api/{table}", (
            HttpContext context, string table, JsonElement bodyJson
        ) =>
        {
            try 
            {
                // 使用公共的JSON解析方法
                var simpleBody = ParseJsonElement(bodyJson);
                
                // 移除 id（如果有的话）
                simpleBody.Delete("id");
                
                var parsed = ReqBodyParse(table, simpleBody);
                var columns = parsed.insertColumns;
                var values = parsed.insertValues;
                var sql = $"INSERT INTO {table}({columns}) VALUES({values})";
                
                var result = SQLQueryOne(sql, parsed.body, context);
                
                // Get the insert ID
                if (!result.HasKey("error"))
                {
                    result.insertId = SQLQueryOne(
                        @$"SELECT id AS __insertId 
                           FROM {table} ORDER BY id DESC LIMIT 1"
                    ).__insertId;
                }
                
                return RestResult.Parse(context, result);
            }
            catch (Exception ex)
            {
                return Results.BadRequest(new { error = $"Create failed: {ex.Message}" });
            }
        });

        App.MapGet("/api/{table}", (
            HttpContext context, string table
        ) =>
        {
            try
            {
                var sql = $"SELECT * FROM {table}";
                var query = RestQuery.Parse(context.Request.Query);
                sql += query.sql;
                var result = SQLQuery(sql, query.parameters, context);
                
                // Log the query and result for debugging
                WebApp.Shared.Log($"Query: {sql}");
                WebApp.Shared.Log($"Result count: {result.Length}");
                
                return RestResult.Parse(context, result);
            }
            catch (Exception ex)
            {
                WebApp.Shared.Log($"Error in GET /api/{table}: {ex.Message}");
                return Results.BadRequest(new { error = $"Query failed: {ex.Message}" });
            }
        });

        App.MapGet("/api/{table}/{id}", (
            HttpContext context, string table, string id
        ) =>
            RestResult.Parse(context, SQLQueryOne(
                $"SELECT * FROM {table} WHERE id = $id",
                ReqBodyParse(table, Obj(new { id })).body,
                context
            ))
        );

        App.MapPut("/api/{table}/{id}", (
            HttpContext context, string table, string id, JsonElement bodyJson
        ) =>
        {
            try
            {
                // 使用公共的JSON解析方法
                var simpleBody = ParseJsonElement(bodyJson);
                
                // 设置ID
                simpleBody["id"] = id;
                
                var parsed = ReqBodyParse(table, simpleBody);
                var update = parsed.update;
                var sql = $"UPDATE {table} SET {update} WHERE id = $id";
                var result = SQLQueryOne(sql, parsed.body, context);
                return RestResult.Parse(context, result);
            }
            catch (Exception ex)
            {
                return Results.BadRequest(new { error = $"Update failed: {ex.Message}" });
            }
        });

        App.MapDelete("/api/{table}/{id}", (
             HttpContext context, string table, string id
        ) =>
            RestResult.Parse(context, SQLQueryOne(
                $"DELETE FROM {table} WHERE id = $id",
                ReqBodyParse(table, Obj(new { id })).body,
                context
            ))
        );
    }
}