namespace WebApp;
public static class RestQuery
{
    public static dynamic Parse(IQueryCollection query)
    {
        var sql = "";
        var parameters = Obj();

        // Handle WHERE conditions
        var whereConditions = Arr();
        foreach (var key in query.Keys)
        {
            if (key.StartsWith("where_"))
            {
                var field = key.Substring(6);
                var value = query[key];
                whereConditions.Push($"{field} = ${field}");
                parameters[field] = value;
            }
            else if (key == "where")
            {
                // Handle where=field=value format
                var whereValue = query[key].ToString();
                var parts = whereValue.Split('=');
                if (parts.Length == 2)
                {
                    var field = parts[0];
                    var value = parts[1];
                    whereConditions.Push($"{field} = ${field}");
                    parameters[field] = value;
                }
            }
        }

        if (whereConditions.Length > 0)
        {
            sql += " WHERE " + whereConditions.Join(" AND ");
        }

        // Handle ORDER BY
        if (query.ContainsKey("order"))
        {
            var orderField = query["order"].ToString();
            var orderDirection = query.ContainsKey("direction") ? query["direction"].ToString() : "ASC";
            sql += $" ORDER BY {orderField} {orderDirection}";
        }

        // Handle LIMIT
        if (query.ContainsKey("limit"))
        {
            sql += $" LIMIT {query["limit"]}";
        }

        return Obj(new { sql, parameters });
    }
}