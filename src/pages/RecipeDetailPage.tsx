import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Button, Alert, Spinner, Modal } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useRecipes } from '../hooks/useRecipes';
import RecipeDetail from '../components/RecipeDetail';
import RecipeFormModal from '../components/RecipeFormModal';
import type { Recipe } from '../types/recipe';

const RecipeDetailPage: React.FC & {
  route?: { path: string; index?: number; menuLabel?: string };
} = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { recipes, loading, error, upsert, remove } = useRecipes();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Recipe | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Recipe | null>(null);

  useEffect(() => {
    if (id && recipes.length > 0) {
      const foundRecipe = recipes.find(r => r.id === parseInt(id));
      if (foundRecipe) {
        setRecipe(foundRecipe);
      } else {
        setRecipe(null);
      }
    }
  }, [id, recipes]);

  const handleEdit = () => {
    if (recipe) {
      setEditing(recipe);
      setShowForm(true);
    }
  };

  const handleDelete = () => {
    if (recipe) {
      setConfirmTarget(recipe);
    }
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div
          className="d-flex justify-content-center align-items-center recipe-detail-loading"
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
          <Link to="/recipes">
            <Button variant="primary">
              Back to Recipes
            </Button>
          </Link>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Link to="/recipes">
          <Button variant="outline-secondary">
            ← Back to Recipes
          </Button>
        </Link>
        {isAuthenticated && (
          <div className="d-flex gap-2">
            <Button 
              variant="outline-primary" 
              onClick={handleEdit}
              className="recipe-detail-edit-button-page"
            >
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

      <RecipeFormModal
        show={showForm}
        initial={editing}
        onSubmit={async (r) => {
          try {
            await upsert(r);
            setShowForm(false);
            setEditing(null);
          } catch (error) {
            console.error('Failed to update recipe:', error);
            setShowForm(false);
          }
        }}
        onClose={() => {
          setShowForm(false);
          setEditing(null);
        }}
      />

      <Modal
        show={!!confirmTarget}
        onHide={() => setConfirmTarget(null)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete recipe</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Delete <strong>{confirmTarget?.title}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmTarget(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              if (confirmTarget) {
                await remove(confirmTarget.id);
                setConfirmTarget(null);
                navigate('/recipes');
              }
            }}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

RecipeDetailPage.route = {
  path: '/recipes/:id',
};

export default RecipeDetailPage;
