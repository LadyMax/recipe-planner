import React, { useState } from 'react';
import { Card, Form, Row, Col, Button, Badge } from 'react-bootstrap';

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
}

export interface SearchFilters {
  query: string;
  category?: string;
  mealType?: string;
  hasImage?: boolean;
}

const CATEGORIES = [
  'Main Course',
  'Side Dish',
  'Soup',
  'Dessert',
  'Beverage',
  'Snack',
  'Appetizer',
  'Salad',
  'Other',
];

const MEAL_TYPES = [
  { value: '1', label: 'Breakfast' },
  { value: '2', label: 'Lunch' },
  { value: '3', label: 'Dinner' },
  { value: '4', label: 'Snack' },
  { value: '5', label: 'Dessert' },
];

export default function AdvancedSearch({
  onSearch,
  onClear,
}: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInputChange =
    (field: keyof SearchFilters) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const value = e.target.value;
      setFilters(prev => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleCheckboxChange =
    (field: keyof SearchFilters) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilters(prev => ({
        ...prev,
        [field]: e.target.checked,
      }));
    };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({
      query: '',
    });
    onClear();
  };

  const hasActiveFilters =
    filters.query ||
    filters.category ||
    filters.mealType ||
    filters.hasImage;

  return (
    <Card className="mb-4 shadow-sm advanced-search-card">
      <Card.Header className="advanced-search-header">
        <h5 className="mb-0">
          <i className="bi bi-search me-2"></i>
          Search Recipes
        </h5>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3 align-items-center">
            <Col md={7}>
              <div className="search-bar">
                <Form.Control
                  type="text"
                  placeholder="Search recipes by name, ingredients, or description..."
                  value={filters.query}
                  onChange={handleInputChange('query')}
                  className="search-input"
                />
                <i className="bi bi-search search-icon"></i>
              </div>
            </Col>
            <Col md={5}>
              <div className="d-flex gap-2 justify-content-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="search-button"
                >
                  <i className="bi bi-search me-1"></i>
                  Search
                </Button>
                {hasActiveFilters && (
                  <Button
                    type="button"
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleClear}
                    className="clear-button"
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Clear
                  </Button>
                )}
              </div>
            </Col>
          </Row>
          
          <Row className="mb-0">
            <Col>
              <div className="d-flex justify-content-center">
                <Button
                  type="button"
                  variant="outline-primary"
                  size="sm"
                  className="advanced-search-toggle-button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  <i
                    className={`bi bi-chevron-${showAdvanced ? 'up' : 'down'} me-1`}
                  ></i>
                  {showAdvanced ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
                </Button>
              </div>
            </Col>
          </Row>

          {showAdvanced && (
            <div className="advanced-filters-section mt-3">
              <Row className="g-3">
                <Col md={6} lg={3}>
                  <Form.Label className="small fw-semibold">Category</Form.Label>
                  <Form.Select
                    value={filters.category || ''}
                    onChange={handleInputChange('category')}
                    size="sm"
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={6} lg={3}>
                  <Form.Label className="small fw-semibold">Meal Type</Form.Label>
                  <Form.Select
                    value={filters.mealType || ''}
                    onChange={handleInputChange('mealType')}
                    size="sm"
                  >
                    <option value="">All Meal Types</option>
                    {MEAL_TYPES.map(meal => (
                      <option key={meal.value} value={meal.value}>
                        {meal.label}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={6} lg={3} className="d-flex align-items-end">
                  <Form.Check
                    type="checkbox"
                    label="With Images Only"
                    checked={filters.hasImage || false}
                    onChange={handleCheckboxChange('hasImage')}
                    className="small checkbox-with-image-label"
                  />
                </Col>
              </Row>
            </div>
          )}

          {hasActiveFilters && (
            <div className="active-filters-display mt-3">
              <small className="text-muted fw-semibold">Active filters:</small>
              <div className="d-flex flex-wrap gap-1 mt-1">
                {filters.query && (
                  <Badge className="active-filter-badge">
                    <i className="bi bi-search me-1"></i>
                    {filters.query}
                  </Badge>
                )}
                {filters.category && (
                  <Badge className="active-filter-badge">
                    <i className="bi bi-tag me-1"></i>
                    {filters.category}
                  </Badge>
                )}
                {filters.mealType && (
                  <Badge className="active-filter-badge">
                    <i className="bi bi-clock me-1"></i>
                    {MEAL_TYPES.find(m => m.value === filters.mealType)?.label}
                  </Badge>
                )}
                {filters.hasImage && (
                  <Badge className="active-filter-badge">
                    <i className="bi bi-image me-1"></i>
                    With Images
                  </Badge>
                )}
              </div>
            </div>
          )}
        </Form>
      </Card.Body>
    </Card>
  );
}
