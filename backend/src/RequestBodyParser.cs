namespace WebApp;
public static class RequestBodyParser
{
    public static dynamic ReqBodyParse(string table, Obj body)
    {
        // Always remove "role" for users table
        var keys = body.GetKeys().Filter(key => table != "users" || key != "role");
        // Keep original values - no automatic type conversion
        var cleaned = Obj();
        body.GetKeys().ForEach(key
            => cleaned[key] = body[key]);
        // Keep password as plain text (no encryption)
        // Return parts to use when building the SQL query + the cleaned body
        return Obj(new
        {
            insertColumns = keys.Join(","),
            insertValues = "$" + keys.Join(",$"),
            update = keys.Filter(key => key != "id").Map(key => $"{key}=${key}").Join(","),
            body = cleaned
        });
    }
}