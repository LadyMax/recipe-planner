namespace WebApp;
public static class FavoritesRoutes
{
    private static Obj GetUser(HttpContext context)
    {
        return Session.Get(context, "user");
    }

    public static void Start()
    {
        // Get user's favorites
        App.MapGet("/api/favorites", (HttpContext context) =>
        {
            var user = GetUser(context);
            if (user == null)
            {
                return RestResult.Parse(context, new { error = "User not logged in." });
            }

            var sql = @"
                SELECT f.*, r.title, r.description, r.category, r.cook_time_min, 
                       r.difficulty, r.image_url, r.created_at as recipe_created_at
                FROM favorites f
                JOIN recipes r ON f.recipe_id = r.id
                WHERE f.user_id = $user_id
                ORDER BY f.created_at DESC";

            var favorites = SQLQuery(sql, new { user_id = user["id"] }, context);
            return RestResult.Parse(context, favorites);
        });

        // Add recipe to favorites
        App.MapPost("/api/favorites", (HttpContext context, JsonElement bodyJson) =>
        {
            var user = GetUser(context);
            if (user == null)
            {
                return RestResult.Parse(context, new { error = "User not logged in." });
            }

            var body = JSON.Parse(bodyJson.ToString());
            var recipeId = (int)body.recipe_id;

            // Check if recipe exists
            var recipe = SQLQueryOne("SELECT id FROM recipes WHERE id = $recipe_id", new { recipe_id = recipeId });
            if (recipe == null)
            {
                return RestResult.Parse(context, new { error = "Recipe not found." });
            }

            // Check if already favorited
            var existing = SQLQueryOne(
                "SELECT id FROM favorites WHERE user_id = $user_id AND recipe_id = $recipe_id",
                new { user_id = user["id"], recipe_id = recipeId }
            );

            if (existing != null)
            {
                return RestResult.Parse(context, new { error = "Recipe already in favorites." });
            }

            // Add to favorites
            var sql = "INSERT INTO favorites (user_id, recipe_id) VALUES ($user_id, $recipe_id)";
            var result = SQLQueryOne(sql, new { user_id = user["id"], recipe_id = recipeId }, context);

            if (!result.HasKey("error"))
            {
                result.insertId = SQLQueryOne(
                    "SELECT id AS __insertId FROM favorites ORDER BY id DESC LIMIT 1"
                ).__insertId;
            }

            return RestResult.Parse(context, result);
        });

        // Remove recipe from favorites
        App.MapDelete("/api/favorites/{recipeId}", (HttpContext context, string recipeId) =>
        {
            var user = GetUser(context);
            if (user == null)
            {
                return RestResult.Parse(context, new { error = "User not logged in." });
            }

            var sql = "DELETE FROM favorites WHERE user_id = $user_id AND recipe_id = $recipe_id";
            var result = SQLQueryOne(sql, new { user_id = user["id"], recipe_id = recipeId }, context);

            return RestResult.Parse(context, result);
        });

        // Check if recipe is favorited
        App.MapGet("/api/favorites/{recipeId}", (HttpContext context, string recipeId) =>
        {
            var user = GetUser(context);
            if (user == null)
            {
                return RestResult.Parse(context, new { error = "User not logged in." });
            }

            var favorite = SQLQueryOne(
                "SELECT id FROM favorites WHERE user_id = $user_id AND recipe_id = $recipe_id",
                new { user_id = user["id"], recipe_id = recipeId }
            );

            return RestResult.Parse(context, new { isFavorite = favorite != null });
        });
    }
}
