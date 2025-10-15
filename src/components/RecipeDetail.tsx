import { useState } from 'react';
import { Card, Badge, Row, Col } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import RecipeComments from './RecipeComments';
import FavoriteButton from './FavoriteButton';
import type { Recipe, RecipeComment } from '../types/recipe';
import { getMealTypeName } from '../utils/mealTypeUtils';

interface RecipeDetailProps {
  recipe: Recipe;
}

export default function RecipeDetail({
  recipe,
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
    <Card className="mb-4 recipe-detail-card">
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
        </div>
      </Card.Header>

      <Card.Body>
        <Row className="align-items-start">
          {/* 图片在左边 */}
          <Col lg={6} className="mb-4 mb-lg-0">
            <div className="recipe-image-container">
              {recipe.image_url ? (
                <img
                  src={recipe.image_url}
                  alt={recipe.recipe_name}
                  className="img-fluid rounded recipe-detail-image"
                />
              ) : (
                <div className="recipe-image-placeholder">
                  <i className="bi bi-image text-muted" style={{fontSize: '4rem'}}></i>
                  <p className="text-muted mt-2 mb-0">No image available</p>
                </div>
              )}
            </div>
          </Col>
          
          {/* 内容在右边 */}
          <Col lg={6}>
            <div className="recipe-content">
              {/* Ingredients */}
              <div className="mb-4">
                <h6 className="recipe-section-title">
                  <i className="bi bi-list-ul me-2"></i>
                  Ingredients
                </h6>
                <div className="recipe-ingredients">
                  <ul className="list-unstyled">
                    {(recipe.ingredients || []).map((ingredient, index) => (
                      <li key={`${ingredient.name}-${index}`} className="ingredient-item">
                        <span className="ingredient-name">{ingredient.name}</span>
                        {(ingredient.amount || ingredient.unit) && (
                          <span className="ingredient-amount">
                            {ingredient.amount && ` - ${ingredient.amount}`}
                            {ingredient.unit && ` ${ingredient.unit}`}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <h6 className="recipe-section-title">
                  <i className="bi bi-card-text me-2"></i>
                  Description
                </h6>
                <div className="recipe-description">
                  {recipe.description}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card.Body>


      <RecipeComments
        recipeId={recipe.id}
        comments={comments}
        onAddComment={handleAddComment}
      />
    </Card>
  );
}
