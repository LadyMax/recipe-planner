import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useRecipes } from '../hooks/useRecipes';
import RecipeDetail from '../components/RecipeDetail';
import type { Recipe } from '../types/recipe';

const RecipeDetailPage: React.FC & {
  route?: { path: string; index?: number; menuLabel?: string };
} = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { recipes, loading, error } = useRecipes();
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    if (id && recipes.length > 0) {
      const foundRecipe = recipes.find(r => r.id === id);
      if (foundRecipe) {
        setRecipe(foundRecipe);
      } else {
        setRecipe(null);
      }
    }
  }, [id, recipes]);

  const handleEdit = () => {
    // Navigate to edit mode - could be a modal or separate page
    // For now, we'll go back to recipes page
    navigate('/recipes');
  };

  const handleDelete = async () => {
    if (
      recipe &&
      window.confirm(`Are you sure you want to delete "${recipe.name}"?`)
    ) {
      // Delete logic would go here
      navigate('/recipes');
    }
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: '200px' }}
        >
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!recipe) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          <Alert.Heading>Recipe Not Found</Alert.Heading>
          <p>
            The recipe you're looking for doesn't exist or has been removed.
          </p>
          <Button as={Link} to="/recipes" variant="primary">
            Back to Recipes
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button as={Link} to="/recipes" variant="outline-secondary">
          ← Back to Recipes
        </Button>
        {isAuthenticated && (
          <div className="d-flex gap-2">
            <Button variant="outline-primary" onClick={handleEdit}>
              Edit Recipe
            </Button>
            <Button variant="outline-danger" onClick={handleDelete}>
              Delete Recipe
            </Button>
          </div>
        )}
      </div>

      <RecipeDetail
        recipe={recipe}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canEdit={isAuthenticated}
      />
    </Container>
  );
};

RecipeDetailPage.route = {
  path: '/recipes/:id',
};

export default RecipeDetailPage;
