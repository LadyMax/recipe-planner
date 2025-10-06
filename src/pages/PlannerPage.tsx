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
import { useAuth } from '../contexts/AuthContext';
import RecipeFormModal from '../components/RecipeFormModal.tsx';
import RecipeList from '../components/RecipeList.tsx';
import AdvancedSearch, {
  type SearchFilters,
} from '../components/AdvancedSearch.tsx';
import type { Recipe } from '../types/recipe.ts';
import { useRecipes } from '../hooks/useRecipes.ts';
import { downloadJson as downloadJsonFile, uploadJson as uploadJsonFile } from '../utils/fileUtils';
import { uuid } from '../utils/ids';

const STARTER: Recipe[] = [
  {
    id: 1,
    title: 'Tomato Pasta',
    ingredients: [
      { id: 1, name: 'Pasta', amount: '200g' },
      { id: 2, name: 'Tomato sauce', amount: '150ml' },
      { id: 3, name: 'Olive oil', amount: '1 tbsp' },
    ],
    instructions: 'Boil pasta. Heat sauce with oil. Mix and serve.',
  },
  {
    id: 2,
    title: 'Chicken Salad',
    ingredients: [
      { id: 4, name: 'Chicken breast', amount: '200g' },
      { id: 5, name: 'Lettuce', amount: '1 head' },
      { id: 6, name: 'Vinaigrette', amount: '2 tbsp' },
    ],
    instructions: 'Cook chicken. Chop lettuce. Toss with vinaigrette.',
  },
];

type SortKey = 'newest-first' | 'name-asc' | 'name-desc' | 'ingr-count';

const PlannerPage: React.FC & {
  route?: { path: string; index?: number; menuLabel?: string };
} = () => {
  const { isAuthenticated } = useAuth();
  const {
    recipes,
    loading,
    error,
    setError,
    upsert,
    remove,
    importMany,
    exportAll,
    refresh,
  } = useRecipes();
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    tags: [],
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

  async function seedStarter() {
    const current = recipes?.length ?? 0;
    if (current === 0) await importMany(STARTER);
  }

  function downloadJson() {
    downloadJsonFile(exportAll(), 'recipes.json');
  }
  function uploadJson(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    uploadJsonFile<Recipe[]>(file, 
      async (data: Recipe[]) => {
        const fixed = data.map((r: Recipe) => ({
          ...r,
          id: r.id || uuid(),
          ingredients: (r.ingredients || []).map((i: any) => ({
            ...i,
            id: i.id || uuid(),
          })),
        }));
        await importMany(fixed);
      },
      (error: string) => {
        setError?.(error);
      }
    );
    
    (e.target as HTMLInputElement).value = '';
  }

  const filtered = useMemo(() => {
    let list = recipes;

    // Apply search filters
    if (searchFilters.query) {
      const query = searchFilters.query.toLowerCase();
      list = list.filter(
        r =>
          (r.title || '').toLowerCase().includes(query) ||
          (r.ingredients || []).some(i => i.name.toLowerCase().includes(query)) ||
          (r.instructions || '').toLowerCase().includes(query)
      );
    }

    if (searchFilters.category) {
      list = list.filter(r => r.category === searchFilters.category);
    }

    if (searchFilters.tags.length > 0) {
      list = list.filter(
        r => r.tags && searchFilters.tags.some(tag => r.tags!.includes(tag))
      );
    }

    if (searchFilters.minServings) {
      list = list.filter(
        r => r.servings && r.servings >= searchFilters.minServings!
      );
    }

    if (searchFilters.maxServings) {
      list = list.filter(
        r => r.servings && r.servings <= searchFilters.maxServings!
      );
    }

    if (searchFilters.maxDuration) {
      list = list.filter(
        r => r.durationMins && r.durationMins <= searchFilters.maxDuration!
      );
    }

    if (searchFilters.hasImage) {
      list = list.filter(r => r.imageUrl);
    }

    // Apply sorting
    switch (sort) {
      case 'newest-first':
        // Keep original order (newest first, as they are added to the beginning of the array)
        break;
      case 'name-asc':
        list = [...list].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'name-desc':
        list = [...list].sort((a, b) => (b.title || '').localeCompare(a.title || ''));
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
          onClear={() => setSearchFilters({ query: '', tags: [] })}
        />

        <Row className="align-items-end g-2 mb-3">
          <Col md={8}>
            <Form.Label className="small">Sort by</Form.Label>
            <Form.Select
              value={sort}
              onChange={e => setSort(e.target.value as SortKey)}
              size="sm"
            >
              <option value="newest-first">Newest First</option>
              <option value="name-asc">Name (A → Z)</option>
              <option value="name-desc">Name (Z → A)</option>
              <option value="ingr-count">Ingredients (Most → Least)</option>
            </Form.Select>
          </Col>
          <Col
            md={4}
            className="text-md-end d-flex gap-2 justify-content-end mt-2 mt-md-0"
          >
            {isAuthenticated && (
              <>
                <Button
                  variant="outline-secondary"
                  onClick={downloadJson}
                  size="sm"
                >
                  <i className="bi bi-download me-1"></i>
                  Export
                </Button>
                <Button as="label" variant="outline-secondary" size="sm">
                  <i className="bi bi-upload me-1"></i>
                  Import
                  <input
                    type="file"
                    accept="application/json"
                    hidden
                    onChange={uploadJson}
                  />
                </Button>
                <Button
                  onClick={() => {
                    setEditing(null);
                    setShowForm(true);
                  }}
                  size="sm"
                  className="load-starter-data-button"
                >
                  <i className="bi bi-plus-circle me-1"></i>
                  New
                </Button>
              </>
            )}
          </Col>
        </Row>

        {error ? (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        ) : null}
        {loading ? <div>Loading…</div> : null}
        {!loading && filtered.length === 0 ? (
          <Alert variant="secondary">No recipes.</Alert>
        ) : null}

        <RecipeList
          recipes={filtered}
          onEdit={
            isAuthenticated
              ? r => {
                  setEditing(r);
                  setShowForm(true);
                }
              : undefined
          }
          onRequestDelete={
            isAuthenticated ? r => setConfirmTarget(r) : undefined
          }
          canEdit={isAuthenticated}
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
            Delete <strong>{confirmTarget?.title}</strong>?
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

        <div className="mt-4">
          <Button 
            variant="link" 
            onClick={seedStarter}
            className="load-starter-data-text"
          >
            Load starter data
          </Button>
        </div>
      </div>
    </Container>
  );
};

(PlannerPage as React.ComponentType & { route?: { path: string; menuLabel: string } }).route = {
  path: '/recipes',
  menuLabel: 'Recipes',
};

export default PlannerPage;
