import { Link } from 'react-router-dom';
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
  if (recipes.length === 0) return <p>No recipes yet. Add one!</p>;

  console.log(
    'RecipeList rendering with recipes:',
    recipes.map(r => r.name)
  );

  return (
    <div className="row">
      {recipes.map((r, index) => {
        console.log(`Rendering recipe ${index}: ${r.name} (ID: ${r.id})`);
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
              {r.imageUrl && (
                <img
                  src={r.imageUrl}
                  className="card-img-top"
                  alt={r.name}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
              )}
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">
                  <Link
                    to={`/recipes/${r.id}`}
                    className="text-decoration-none"
                  >
                    {r.name}
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
                  {r.durationMins && (
                    <small className="text-muted">
                      <i className="bi bi-clock"></i> {r.durationMins} min
                    </small>
                  )}
                </div>

                <p className="card-text flex-grow-1">
                  <strong>Ingredients:</strong>{' '}
                  {r.ingredients
                    .slice(0, 3)
                    .map(i => i.name)
                    .join(', ')}
                  {r.ingredients.length > 3 &&
                    ` and ${r.ingredients.length - 3} more`}
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
  );
}
