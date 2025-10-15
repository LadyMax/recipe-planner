import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import FavoriteButton from './FavoriteButton';
import type { Recipe } from '../types/recipe.ts';
import { getMealTypeName } from '../utils/mealTypeUtils';

type Props = {
  recipes: Recipe[];
  onEdit?: (recipe: Recipe) => void;
  onRequestDelete?: (recipe: Recipe) => void;
  canEdit?: boolean;
  showTitle?: boolean;
};

export default function RecipeList({
  recipes,
  onEdit,
  onRequestDelete,
  canEdit = false,
  showTitle = true,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState('');

  // Get all unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(recipes.map(r => r.category).filter(Boolean))];
    return uniqueCategories.sort();
  }, [recipes]);

  // Filter recipes
  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const matchesCategory = !selectedCategory || recipe.category === selectedCategory;
      return matchesCategory;
    });
  }, [recipes, selectedCategory]);

  if (recipes.length === 0) return <p className="no-recipes-text">No recipes yet. Add one!</p>;

  console.log(
    'RecipeList rendering with recipes:',
    recipes.length
  );

  return (
    <div>
      {/* Category tags */}
      <div className="category-tags">
        <a href="#" className={`category-tag ${selectedCategory === '' ? 'active' : ''}`} 
           onClick={(e) => { e.preventDefault(); setSelectedCategory(''); }}>
          All
        </a>
        {categories.map(category => (
          <a key={category} href="#" 
             className={`category-tag ${selectedCategory === category ? 'active' : ''}`}
             onClick={(e) => { e.preventDefault(); setSelectedCategory(category || ''); }}>
            {category}
          </a>
        ))}
      </div>

      {/* Section header */}
      {showTitle && (
        <div className="section-header">
          <h2 className="section-title">Popular Recipes</h2>
        </div>
      )}

      {/* Show filtered results count */}
      {filteredRecipes.length !== recipes.length && (
        <div className="mb-3">
          <small className="text-muted">
            Showing {filteredRecipes.length} / {recipes.length} recipes
          </small>
        </div>
      )}

      {/* Recipe list */}
      <div className="row recipe-cards-container">
        {filteredRecipes.map((r) => {
          if (!r.id) {
            console.warn('Recipe missing ID:', r);
            console.warn('Full recipe object:', JSON.stringify(r, null, 2));
            return null;
          }
          return (
            <div
              key={`recipe-${r.id}`}
              className="col-12 col-md-6 col-lg-4 mb-4 recipe-card-animated"
            >
              <div className="card recipe-card h-100 fade-in position-relative">
                <div
                  className="position-absolute top-0 end-0 m-2 recipe-card-actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FavoriteButton recipeId={r.id} size="sm" />
                </div>
              {r.image_url ? (
                <img
                  src={r.image_url}
                  className="card-img-top recipe-card-image"
                  alt={r.recipe_name}
                />
              ) : (
                <div className="recipe-card-placeholder">
                  <i className="bi bi-image text-muted" style={{fontSize: '3rem'}}></i>
                  <p className="text-muted mt-2 mb-0 small">No image</p>
                </div>
              )}
              <div className="card-body d-flex flex-column">
                <div className="mb-2 d-flex gap-2">
                  {r.category && (
                    <span className="category-badge" title="Recipe Type">{r.category}</span>
                  )}
                  {r.meal_type_id && (
                    <span className="meal-type-badge" title="Meal Type">
                      {getMealTypeName(r.meal_type_id)}
                    </span>
                  )}
                </div>

                <h5 className="card-title recipe-card-title">
                  {r.recipe_name}
                </h5>

                <p className="card-text flex-grow-1">
                  {(r.description || '').substring(0, 80)}
                  {(r.description || '').length > 80 &&
                    '...'}
                </p>


                <div className="mt-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="d-flex">
                    {canEdit && onEdit && (
                      <button
                        className="btn btn-outline-primary btn-sm me-2 recipe-card-edit-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onEdit(r);
                        }}
                      >
                        Edit
                      </button>
                    )}
                    {canEdit && onRequestDelete && (
                      <button
                        className="btn btn-outline-danger btn-sm recipe-card-delete-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onRequestDelete(r);
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <Link
                to={`/recipes/${r.id}`}
                className="text-decoration-none text-inherit position-absolute top-0 start-0 w-100 h-100 recipe-card-link"
              >
                <div className="recipe-card-link-overlay" />
              </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
