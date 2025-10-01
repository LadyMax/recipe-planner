import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import FavoriteButton from './FavoriteButton';
import type { Recipe } from '../types/recipe.ts';

type Props = {
  recipes: Recipe[];
  onEdit?: (recipe: Recipe) => void;
  onRequestDelete?: (recipe: Recipe) => void;
  canEdit?: boolean;
};

export default function RecipeList({
  recipes,
  onEdit,
  onRequestDelete,
  canEdit = false,
}: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Get all unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(recipes.map(r => r.category).filter(Boolean))];
    return uniqueCategories.sort();
  }, [recipes]);

  // Filter recipes
  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           recipe.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || recipe.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [recipes, searchTerm, selectedCategory]);

  if (recipes.length === 0) return <p>No recipes yet. Add one!</p>;

  console.log(
    'RecipeList rendering with recipes:',
    recipes.map(r => r.title)
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
             onClick={(e) => { e.preventDefault(); setSelectedCategory(category); }}>
            {category}
          </a>
        ))}
      </div>

      {/* Section header */}
      <div className="section-header">
        <h2 className="section-title">Popular Recipes</h2>
        <a href="#" className="view-all-link">View All</a>
      </div>

      {/* Show filtered results count */}
      {filteredRecipes.length !== recipes.length && (
        <div className="mb-3">
          <small className="text-muted">
            Showing {filteredRecipes.length} / {recipes.length} recipes
          </small>
        </div>
      )}

      {/* Recipe list */}
      <div className="row">
        {filteredRecipes.map((r, index) => {
        console.log(
          `Rendering recipe ${index}: ${
            r.title
          } (ID: ${r.id})`
        );
        return (
          <div
            key={r.id}
            className="col-12 col-md-6 col-lg-4 mb-4"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <Link
              to={`/recipes/${r.id}`}
              className="text-decoration-none"
              style={{ color: 'inherit' }}
            >
              <div className="card recipe-card h-100 fade-in position-relative">
              <div
                className="position-absolute top-0 end-0 m-2"
                style={{ zIndex: 10 }}
              >
                <FavoriteButton recipeId={r.id} size="sm" />
              </div>
              {(r.image_url || r.imageUrl) && (
                <img
                  src={r.image_url || r.imageUrl}
                  className="card-img-top"
                  alt={r.title}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
              )}
              <div className="card-body d-flex flex-column">
                <div className="mb-2">
                  {r.category && (
                    <span className="category-badge">{r.category}</span>
                  )}
                </div>

                <h5 className="card-title" style={{ color: '#5a7d0c' }}>
                  {r.title}
                </h5>

                <p className="card-text flex-grow-1">
                  {(r.description || r.instructions || '').substring(0, 80)}
                  {(r.description || r.instructions || '').length > 80 &&
                    '...'}
                </p>

                <div className="recipe-meta">
                  <div className="recipe-rating">
                    <span className="stars">★★★★★</span>
                    <span className="rating-text">4.8</span>
                  </div>
                  <div className="recipe-time">
                    <i className="bi bi-clock"></i>
                    {r.cook_time_min || r.durationMins || 30} min
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="d-flex">
                    {canEdit && onEdit && (
                      <button
                        className="btn btn-outline-primary btn-sm me-2"
                        onClick={() => onEdit(r)}
                        style={{
                          flex: 1,
                          position: 'static',
                          width: 'auto',
                          bottom: 'auto',
                          backgroundColor: 'transparent',
                          borderColor: '#5a7d0c',
                          color: '#5a7d0c',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#6b950e';
                          e.currentTarget.style.borderColor = '#6b950e';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.borderColor = '#5a7d0c';
                          e.currentTarget.style.color = '#5a7d0c';
                        }}
                      >
                        Edit
                      </button>
                    )}
                    {canEdit && onRequestDelete && (
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => onRequestDelete(r)}
                        style={{
                          flex: 1,
                          position: 'static',
                          width: 'auto',
                          bottom: 'auto',
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
              </div>
            </Link>
          </div>
        );
      })}
      </div>
    </div>
  );
}
