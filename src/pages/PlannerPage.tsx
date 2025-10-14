import React, { useMemo, useState, useEffect } from 'react';
import {
  Button,
  Container,
  Form,
  Modal,
  Row,
  Col,
  Alert,
} from 'react-bootstrap';
import RecipeFormModal from '../components/RecipeFormModal.tsx';
import RecipeList from '../components/RecipeList.tsx';
import AdvancedSearch, {
  type SearchFilters,
} from '../components/AdvancedSearch.tsx';
import type { Recipe } from '../types/recipe.ts';
import { useRecipes } from '../hooks/useRecipes.ts';


type SortKey = 'newest-first' | 'name-asc' | 'name-desc' | 'ingr-count';

const PlannerPage: React.FC & {
  route?: { path: string; index?: number; menuLabel?: string };
} = () => {
  const {
    recipes,
    loading,
    error,
    upsert,
    remove,
    refresh,
  } = useRecipes();
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
  });
  const [sort, setSort] = useState<SortKey>('newest-first');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Recipe | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Recipe | null>(null);

  // Refresh recipes when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refresh]);




  const filtered = useMemo(() => {
    let list = recipes;

    // Apply search filters
    if (searchFilters.query) {
      const query = searchFilters.query.toLowerCase();
      list = list.filter(
        r =>
          (r.recipe_name || '').toLowerCase().includes(query) ||
          (r.ingredients || []).some(i => i.name.toLowerCase().includes(query)) ||
          (r.description || '').toLowerCase().includes(query)
      );
    }

    if (searchFilters.category) {
      list = list.filter(r => r.category === searchFilters.category);
    }

    if (searchFilters.mealType) {
      list = list.filter(r => r.meal_type_id?.toString() === searchFilters.mealType);
    }






    if (searchFilters.hasImage) {
      list = list.filter(r => r.image_url);
    }

    // Apply sorting
    switch (sort) {
      case 'newest-first':
        // Keep original order (newest first, as they are added to the beginning of the array)
        break;
      case 'name-asc':
        list = [...list].sort((a, b) => (a.recipe_name || '').localeCompare(b.recipe_name || ''));
        break;
      case 'name-desc':
        list = [...list].sort((a, b) => (b.recipe_name || '').localeCompare(a.recipe_name || ''));
        break;
      case 'ingr-count':
        list = [...list].sort(
          (a, b) => (b.ingredients || []).length - (a.ingredients || []).length
        );
        break;
    }
    return list;
  }, [recipes, searchFilters, sort]);

  return (
    <Container className="pt-1 pb-4">
      <div className="fade-in">
        <AdvancedSearch
          onSearch={setSearchFilters}
          onClear={() => setSearchFilters({ query: '' })}
        />

        <Row className="align-items-end g-2 mb-3">
          <Col md={6}>
            <Button
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
              className="btn-primary"
            >
              <i className="bi bi-plus-circle me-2"></i>
              Create New Recipe
            </Button>
          </Col>
          <Col md={6} className="d-flex align-items-end justify-content-end gap-2">
            <Form.Label className="small mb-0">Sort by</Form.Label>
            <Form.Select
              value={sort}
              onChange={e => setSort(e.target.value as SortKey)}
              size="sm"
              style={{ maxWidth: '200px' }}
            >
              <option value="newest-first">Newest First</option>
              <option value="name-asc">Name (A → Z)</option>
              <option value="name-desc">Name (Z → A)</option>
              <option value="ingr-count">Ingredients (Most → Least)</option>
            </Form.Select>
          </Col>
        </Row>

        {error ? (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        ) : null}
        {loading ? <div>Loading…</div> : null}
        {!loading && filtered.length === 0 ? (
          <Alert variant="secondary" className="no-recipes-alert">No recipes.</Alert>
        ) : null}

        <RecipeList
          recipes={filtered}
          onEdit={r => {
            setEditing(r);
            setShowForm(true);
          }}
          onRequestDelete={r => setConfirmTarget(r)}
          canEdit={true}
        />

        <RecipeFormModal
          show={showForm}
          initial={editing}
          onSubmit={async r => {
            try {
              await upsert(r);
              setShowForm(false);
            } catch (error) {
              console.error('Failed to add recipe to list:', error);
              // Close form even if upsert fails, since recipe was already created in database
              setShowForm(false);
            }
          }}
          onClose={() => setShowForm(false)}
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
            Delete <strong>{confirmTarget?.recipe_name}</strong>?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setConfirmTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                if (confirmTarget) await remove(confirmTarget.id);
                setConfirmTarget(null);
              }}
            >
              Delete
            </Button>
          </Modal.Footer>
        </Modal>

      </div>
    </Container>
  );
};

(PlannerPage as React.ComponentType & { route?: { path: string; menuLabel: string } }).route = {
  path: '/recipes',
  menuLabel: 'Recipes',
};

export default PlannerPage;
