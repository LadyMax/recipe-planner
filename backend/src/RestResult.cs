namespace WebApp;
public static class RestResult
{
    private static dynamic RowModifier(dynamic row)
    {
        // Try, because not all rows might be objects
        // and otherwise this fails...
        try
        {
            // If null then change the result to error Not Found
            row ??= Obj(new { error = "Not found." });
            // Delete fields named "password"
            row.Delete("password");
            // JSON.parse all fields named "data" using System.Text.Json
            if (row.HasKey("data"))
            {
                try
                {
                    row.data = JsonSerializer.Deserialize<dynamic>(row.data);
                }
                catch
                {
                    // If parsing fails, keep as string
                }
            }
        }
        catch (Exception) { }
        return row;
    }

    public static IResult Parse(HttpContext context, dynamic result)
    {
        int statusCode = 200;

        if (result is Arr arr)
        {
            result = arr.Map(x => RowModifier(x));
        }
        else
        {
            dynamic r = result == null ? null : Obj(result);
            // 500 = Internal Server Error
            // 404 = Not found
            // 200 = OK
            statusCode =
                result == null ? 404 :
                r.HasKey("error") ? 500 :
                r.HasKey("rowsAffected") && r.rowsAffected == 0 ? 404 :
                200;

            result = RowModifier(r);
        }
        if (statusCode != 200) { DebugLog.Add(context, result); }
        return Results.Text(
          JsonSerializer.Serialize(result),
          "application/json; charset=utf-8",
          null,
          statusCode
        );
    }
}