namespace WebApp;

public static class DbQuery
{
    // Setup the database connection
    private static SqliteConnection db =
        new SqliteConnection("Data Source=" + Globals.dbPath);

    static DbQuery() 
    { 
        db.Open(); 
        Console.WriteLine($"Database opened: {Globals.dbPath}");
        Console.WriteLine($"Database state: {db.State}");
    }

    // Helper to create an object from the DataReader
    private static dynamic ObjFromReader(SqliteDataReader reader)
    {
        var obj = Obj();
        Console.WriteLine($"ObjFromReader: FieldCount = {reader.FieldCount}");
        
        for (var i = 0; i < reader.FieldCount; i++)
        {
            var key = reader.GetName(i);
            var value = reader.GetValue(i);
            
            Console.WriteLine($"Field {i}: {key} = {value} (Type: {value?.GetType()})");

            // Handle NULL values
            if (value == DBNull.Value)
            {
                obj[key] = null;
            }
            // Handle JSON-prefixed strings
            else if (value is string strValue && strValue.StartsWith("JSON:"))
            {
                try
                {
                    // Remove "JSON:" prefix and parse the JSON using System.Text.Json
                    var jsonString = strValue.Substring(5);
                    obj[key] = JsonSerializer.Deserialize<dynamic>(jsonString);
                }
                catch
                {
                    // If parsing fails, keep the original value
                    obj[key] = strValue;
                }
            }
            else
            {
                // Keep original value type - no automatic conversion
                obj[key] = value;
            }
        }
        
        Console.WriteLine($"ObjFromReader result: {obj}");
        return obj;
    }

    // Run a query - rows are returned as an arry of objects
    public static Arr SQLQuery(
        string sql, object parameters = null, HttpContext context = null
    )
    {
        var paras = parameters == null ? Obj() : Obj(parameters);
        var command = db.CreateCommand();
        command.CommandText = @sql;
        var entries = (Arr)paras.GetEntries();
        entries.ForEach(x => command.Parameters.AddWithValue(x[0], x[1]));
        if (context != null)
        {
            DebugLog.Add(context, new
            {
                sqlQuery = sql.Regplace(@"\s+", " "),
                sqlParams = paras
            });
        }
        var rows = Arr();
        try
        {
            if (sql.StartsWith("SELECT ", true, null))
            {
                var reader = command.ExecuteReader();
                Console.WriteLine($"SQL Query: {sql}");
                Console.WriteLine($"Reader has rows: {reader.HasRows}");
                
                int rowCount = 0;
                while (reader.Read())
                {
                    Console.WriteLine($"Reading row {rowCount}");
                    rows.Push(ObjFromReader(reader));
                    rowCount++;
                }
                Console.WriteLine($"Total rows read: {rowCount}");
            }
            else
            {
                rows.Push(new
                {
                    command = sql.Split(" ")[0].ToUpper(),
                    rowsAffected = command.ExecuteNonQuery()
                });
            }
        }
        catch (Exception err)
        {
            rows.Push(new { error = err.Message.Split("'")[1] });
        }
        return rows;
    }

    // Run a query - only return the first row, as an object
    public static dynamic SQLQueryOne(
        string sql, object parameters = null, HttpContext context = null
    )
    {
        var results = SQLQuery(sql, parameters, context);
        return results.Length > 0 ? results[0] : null;
    }
}