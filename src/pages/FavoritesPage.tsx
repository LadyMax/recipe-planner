import React, { useMemo } from 'react';
import { Container, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useRecipes } from '../hooks/useRecipes';
import { useFavorites } from '../hooks/useFavorites';
import RecipeList from '../components/RecipeList';

const FavoritesPage: React.FC & {
  route?: { path: string; index?: number; menuLabel?: string };
} = () => {
  const { isAuthenticated } = useAuth();
  const { recipes, loading, error } = useRecipes();
  const { favorites } = useFavorites();

  const favoriteRecipes = useMemo(() => {
    return recipes.filter(recipe => favorites.includes(recipe.id));
  }, [recipes, favorites]);

  if (!isAuthenticated) {
    return (
      <Container className="py-4">
        <Alert variant="info">
          <Alert.Heading>Login Required</Alert.Heading>
          <p>Please log in to view your favorite recipes.</p>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="py-4">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: '200px' }}
        >
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
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

  return (
    <Container className="py-4">
      <div className="fade-in">
        <Row className="mb-4">
          <Col>
            <h2>
              <i className="bi bi-heart-fill text-danger me-2"></i>
              My Favorite Recipes
            </h2>
            <p className="text-muted">
              {favoriteRecipes.length}{' '}
              {favoriteRecipes.length === 1 ? 'recipe' : 'recipes'} in your
              favorites
            </p>
          </Col>
        </Row>

        {favoriteRecipes.length === 0 ? (
          <Alert variant="secondary">
            <Alert.Heading>No Favorites Yet</Alert.Heading>
            <p>
              You haven't added any recipes to your favorites yet. Browse
              recipes and click the heart icon to add them to your favorites!
            </p>
          </Alert>
        ) : (
          <RecipeList recipes={favoriteRecipes} canEdit={isAuthenticated} />
        )}
      </div>
    </Container>
  );
};

FavoritesPage.route = {
  path: '/favorites',
  menuLabel: 'Favorites',
  index: 2,
};

export default FavoritesPage;
