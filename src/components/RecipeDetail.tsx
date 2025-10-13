import { useState } from 'react';
import { Card, Badge, Row, Col, Button } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import RecipeComments from './RecipeComments';
import FavoriteButton from './FavoriteButton';
import type { Recipe, RecipeComment } from '../types/recipe';
import { getMealTypeName } from '../utils/mealTypeUtils';

interface RecipeDetailProps {
  recipe: Recipe;
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
}

export default function RecipeDetail({
  recipe,
  onEdit,
  onDelete,
  canEdit = false,
}: RecipeDetailProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<RecipeComment[]>([]);

  const handleAddComment = async (content: string) => {
    if (!user) return;

    const newComment: RecipeComment = {
      id: Date.now(),
      recipeId: recipe.id,
      userId: user.id,
      userName: user.name || user.email,
      content,
    };

    setComments(prev => [newComment, ...prev]);
  };


  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-start">
        <div>
          <Card.Title className="mb-2">
            {recipe.recipe_name}
          </Card.Title>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            {recipe.category && <Badge bg="primary" title="Recipe Type">{recipe.category}</Badge>}
            {recipe.meal_type_id && (
              <Badge bg="info" title="Meal Type">
                {getMealTypeName(recipe.meal_type_id)}
              </Badge>
            )}
          </div>
        </div>
        <div className="d-flex gap-2">
          <FavoriteButton recipeId={recipe.id} size="sm" />
          {canEdit && (onEdit || onDelete) && (
            <>
              {onEdit && (
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={onEdit}
                  className="recipe-card-edit-btn"
                >
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button variant="outline-danger" size="sm" onClick={onDelete}>
                  Delete
                </Button>
              )}
            </>
          )}
        </div>
      </Card.Header>

      <Card.Body>
        <Row>
          <Col md={6}>
            <h6>Ingredients</h6>
            <ul className="list-unstyled">
              {(recipe.ingredients || []).map((ingredient, index) => (
                <li key={`${ingredient.name}-${index}`} className="mb-1">
                  <strong>{ingredient.name}</strong>
                  {ingredient.amount && (
                    <span className="text-muted"> - {ingredient.amount}</span>
                  )}
                  {ingredient.unit && (
                    <span className="text-muted"> {ingredient.unit}</span>
                  )}
                </li>
              ))}
            </ul>
          </Col>
          <Col md={6}>
            <h6>Description</h6>
            <div className="recipe-description">
              {recipe.description}
            </div>
          </Col>
        </Row>

        {recipe.image_url && (
          <div className="mt-3">
            <img
              src={recipe.image_url}
              alt={recipe.recipe_name}
              className="img-fluid rounded recipe-detail-image"
            />
          </div>
        )}

      </Card.Body>


      <RecipeComments
        recipeId={recipe.id}
        comments={comments}
        onAddComment={handleAddComment}
      />
    </Card>
  );
}
