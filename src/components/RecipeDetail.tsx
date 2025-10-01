import { useState } from 'react';
import { Card, Badge, Row, Col, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
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

  const handleAddComment = async (content: string) => {
    if (!user) return;

    const newComment: RecipeComment = {
      id: Date.now(),
      recipeId: recipe.id,
      userId: user.id,
      userName: user.name || user.email,
      content,
      createdAt: new Date().toISOString(),
    };

    setComments(prev => [newComment, ...prev]);
  };


  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-start">
        <div>
          <Card.Title className="mb-2">
            {recipe.title}
          </Card.Title>
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
            {(recipe.cook_time_min || recipe.durationMins) && (
              <small className="text-muted">
                {recipe.cook_time_min || recipe.durationMins} min
              </small>
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
                  style={{
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
            <h6>Description</h6>
            <div style={{ whiteSpace: 'pre-wrap' }}>
              {recipe.description || recipe.instructions}
            </div>
          </Col>
        </Row>

        {(recipe.image_url || recipe.imageUrl) && (
          <div className="mt-3">
            <img
              src={recipe.image_url || recipe.imageUrl}
              alt={recipe.title}
              className="img-fluid rounded"
              style={{ maxHeight: '300px' }}
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
