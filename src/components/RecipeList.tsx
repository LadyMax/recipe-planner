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
      {/* Search and filter controls */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Search Recipes</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter recipe name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Category Filter</Form.Label>
            <Form.Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

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
                <h5 className="card-title">
                  <Link
                    to={`/recipes/${r.id}`}
                    className="text-decoration-none"
                  >
                    {r.title}
                  </Link>
                </h5>

                <div className="mb-2">
                  {r.category && (
                    <span className="badge bg-primary me-1">{r.category}</span>
                  )}
                  {r.tags?.slice(0, 3).map((tag, index) => (
                    <span key={index} className="badge bg-secondary me-1">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mb-2">
                  {r.servings && (
                    <small className="text-muted me-3">
                      <i className="bi bi-people"></i> {r.servings} servings
                    </small>
                  )}
                  {(r.cook_time_min || r.durationMins) && (
                    <small className="text-muted">
                      <i className="bi bi-clock"></i>{' '}
                      {r.cook_time_min || r.durationMins} min
                    </small>
                  )}
                </div>

                <p className="card-text flex-grow-1">
                  <strong>Description:</strong>{' '}
                  {(r.description || r.instructions || '').substring(0, 100)}
                  {(r.description || r.instructions || '').length > 100 &&
                    '...'}
                </p>

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
          </div>
        );
      })}
      </div>
    </div>
  );
}
