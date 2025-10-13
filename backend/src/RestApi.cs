namespace WebApp;
using Microsoft.AspNetCore.Http;
using System.IO;
public static class RestApi
{
    public static void Start()
    {
        App.MapPost("/api/{table}", (
            HttpContext context, string table, JsonElement bodyJson
        ) =>
        {
            var body = JSON.Parse(bodyJson.ToString());
            body.Delete("id");
            var parsed = ReqBodyParse(table, body);
            var columns = parsed.insertColumns;
            var values = parsed.insertValues;
            var sql = $"INSERT INTO {table}({columns}) VALUES({values})";
            var result = SQLQueryOne(sql, parsed.body, context);
            if (!result.HasKey("error"))
            {
                // Get the insert id and add to our result
                result.insertId = SQLQueryOne(
                    @$"SELECT id AS __insertId 
                       FROM {table} ORDER BY id DESC LIMIT 1"
                ).__insertId;
            }
            return RestResult.Parse(context, result);
        });

        App.MapGet("/api/{table}", (
            HttpContext context, string table
        ) =>
        {
            var sql = $"SELECT * FROM {table}";
            var query = RestQuery.Parse(context.Request.Query);
            sql += query.sql;
            return RestResult.Parse(context, SQLQuery(sql, query.parameters, context));
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
            var body = JSON.Parse(bodyJson.ToString());
            body.id = id;
            var parsed = ReqBodyParse(table, body);
            var update = parsed.update;
            var sql = $"UPDATE {table} SET {update} WHERE id = $id";
            var result = SQLQueryOne(sql, parsed.body, context);
            return RestResult.Parse(context, result);
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

        // Upload a file
        App.MapPost("/api/upload/", async (
            HttpContext context, IWebHostEnvironment env
        ) =>
        {
            // Parse the incoming form-data request
            var form = await context.Request.ReadFormAsync();

            // Accept uploaded file with field name "image"
            var file = form.Files["image"];


            if (file == null || file.Length == 0)
                return Results.BadRequest(new { error = "No file uploaded" });

            var fileName = file.FileName;

            //Build uploads folder path inside wwwroot if it doeesnt exist
            var uploadsFolder = Path.Combine(env.WebRootPath, "uploads");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var filePath = Path.Combine(uploadsFolder, fileName);

            // Saves the uploaded file to disk
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return Results.Ok(new { fileName });
        });

        // Deletes a file
        App.MapDelete("/api/upload/{filename}", (string filename, IWebHostEnvironment env
             ) =>
        {
            var uploadsFolder = Path.Combine(env.WebRootPath, "uploads");
            var filePath = Path.Combine(uploadsFolder, filename);

            if (!File.Exists(filePath))
            {
                return Results.NotFound(new { error = "File not found" });
            }

            try
            {
                File.Delete(filePath);
                return Results.Ok();
            }
            catch (Exception)
            {
                return Results.Problem("Error deleting file");
            }
        });   
    }    
}