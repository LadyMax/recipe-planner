import { useState } from 'react';
import { Card, Badge, Row, Col, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import RecipeRating from './RecipeRating';
import RecipeComments from './RecipeComments';
import FavoriteButton from './FavoriteButton';
import type { Recipe, RecipeComment } from '../types/recipe';

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
  const [rating, setRating] = useState(recipe.rating || 0);

  const handleAddComment = async (content: string) => {
    if (!user) return;

    const newComment: RecipeComment = {
      id: `comment-${Date.now()}`,
      recipeId: recipe.id,
      userId: user.id,
      userName: user.name || user.email,
      content,
      createdAt: new Date().toISOString(),
    };

    setComments(prev => [newComment, ...prev]);
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-start">
        <div>
          <Card.Title className="mb-2">{recipe.name}</Card.Title>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            {recipe.category && <Badge bg="primary">{recipe.category}</Badge>}
            {recipe.tags?.map((tag, index) => (
              <Badge key={index} bg="secondary">
                {tag}
              </Badge>
            ))}
            {recipe.servings && (
              <small className="text-muted">{recipe.servings} servings</small>
            )}
            {recipe.durationMins && (
              <small className="text-muted">{recipe.durationMins} min</small>
            )}
          </div>
        </div>
        <div className="d-flex gap-2">
          <FavoriteButton recipeId={recipe.id} size="sm" />
          {canEdit && (onEdit || onDelete) && (
            <>
              {onEdit && (
                <Button variant="outline-primary" size="sm" onClick={onEdit}>
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
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="mb-1">
                  <strong>{ingredient.name}</strong>
                  {ingredient.amount && (
                    <span className="text-muted"> - {ingredient.amount}</span>
                  )}
                </li>
              ))}
            </ul>
          </Col>
          <Col md={6}>
            <h6>Instructions</h6>
            <div style={{ whiteSpace: 'pre-wrap' }}>{recipe.instructions}</div>
          </Col>
        </Row>

        {recipe.imageUrl && (
          <div className="mt-3">
            <img
              src={recipe.imageUrl}
              alt={recipe.name}
              className="img-fluid rounded"
              style={{ maxHeight: '300px' }}
            />
          </div>
        )}

        <div className="mt-4">
          <h6>Rating</h6>
          <RecipeRating
            recipeId={recipe.id}
            currentRating={rating}
            onRatingChange={handleRatingChange}
          />
        </div>
      </Card.Body>

      <RecipeComments
        recipeId={recipe.id}
        comments={comments}
        onAddComment={handleAddComment}
      />
    </Card>
  );
}
