import React, { useMemo } from 'react';
import { Container, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
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
          className="d-flex justify-content-center align-items-center recipe-detail-loading"
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
            <div className="d-flex align-items-center mb-2">
              <i className="bi bi-heart-fill text-danger me-2"></i>
              <h2 className="section-title mb-0">My Favorite Recipes</h2>
            </div>
            <p className="text-muted ms-4">
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
          <RecipeList recipes={favoriteRecipes} showTitle={false} />
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
