import React, { useState } from 'react';
import { Card, Form, Row, Col, Button, Badge } from 'react-bootstrap';

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
}

export interface SearchFilters {
  query: string;
  category?: string;
  tags: string[];
  minServings?: number;
  maxServings?: number;
  maxDuration?: number;
  hasImage?: boolean;
}

const CATEGORIES = [
  'Main Course',
  'Soup',
  'Dessert',
  'Beverage',
  'Snack',
  'Other',
];

const COMMON_TAGS = [
  'Simple',
  'Vegetarian',
  'Quick',
  'Healthy',
  'Homestyle',
  'Comfort Food',
  'Light',
  'Rich',
  'Sweet',
  'Spicy',
  'Sour',
  'Aromatic',
];

export default function AdvancedSearch({
  onSearch,
  onClear,
}: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    tags: [],
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
        [field]:
          field === 'query' || field === 'category'
            ? value
            : field === 'minServings' ||
              field === 'maxServings' ||
              field === 'maxDuration'
            ? value === '' || value === '0'
              ? undefined
              : parseInt(value)
            : prev[field],
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

  const handleTagToggle = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({
      query: '',
      tags: [],
    });
    onClear();
  };

  const hasActiveFilters =
    filters.query ||
    filters.category ||
    filters.tags.length > 0 ||
    (filters.minServings && filters.minServings > 0) ||
    (filters.maxServings && filters.maxServings > 0) ||
    (filters.maxDuration && filters.maxDuration > 0) ||
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
          <Row className="mb-3">
            <Col md={6}>
              <div className="search-bar">
                <Form.Control
                  type="text"
                  placeholder="Search anything here..."
                  value={filters.query}
                  onChange={handleInputChange('query')}
                  size="sm"
                />
                <i className="bi bi-search search-icon"></i>
              </div>
            </Col>
            <Col md={6}>
              <div className="d-flex gap-2">
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
              <div className="d-flex justify-content-start">
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
                  {showAdvanced ? 'Collapse' : 'Advanced Search'}
                </Button>
              </div>
            </Col>
          </Row>

          {showAdvanced && (
            <>
              <Row className="mb-3 g-3">
                <Col md={6} lg={4}>
                  <Form.Label className="small">Category</Form.Label>
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
                <Col md={6} lg={4}>
                  <Form.Label className="small">
                    Max Cooking Time (minutes)
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    placeholder="No limit"
                    value={filters.maxDuration || ''}
                    onChange={handleInputChange('maxDuration')}
                    size="sm"
                  />
                </Col>
                <Col md={12} lg={4}>
                  <Form.Label className="small">Servings Range</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="number"
                      min="0"
                      placeholder="Min"
                      value={filters.minServings || ''}
                      onChange={handleInputChange('minServings')}
                      size="sm"
                    />
                    <Form.Control
                      type="number"
                      min="0"
                      placeholder="Max"
                      value={filters.maxServings || ''}
                      onChange={handleInputChange('maxServings')}
                      size="sm"
                    />
                  </div>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col>
                  <Form.Label className="small">Tags</Form.Label>
                  <div className="d-flex flex-wrap gap-1">
                    {COMMON_TAGS.map(tag => (
                      <Badge
                        key={tag}
                        bg={filters.tags.includes(tag) ? 'primary' : 'light'}
                        text={filters.tags.includes(tag) ? 'white' : 'dark'}
                        className="filter-badge filter-tag"
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col>
                  <Form.Check
                    type="checkbox"
                    label="Only show recipes with images"
                    checked={filters.hasImage || false}
                    onChange={handleCheckboxChange('hasImage')}
                    className="small"
                  />
                </Col>
              </Row>
            </>
          )}

          {hasActiveFilters && (
            <div className="mt-3 mb-0">
              <small className="text-muted">Active filters:</small>
              <div className="d-flex flex-wrap gap-1 mt-1">
                {filters.query && (
                  <Badge className="active-filter-badge">
                    Search: {filters.query}
                  </Badge>
                )}
                {filters.category && (
                  <Badge className="active-filter-badge">
                    Category: {filters.category}
                  </Badge>
                )}
                {filters.tags.map(tag => (
                  <Badge key={tag} className="active-filter-badge">
                    {tag}
                  </Badge>
                ))}
                {filters.maxDuration && filters.maxDuration > 0 && (
                  <Badge className="active-filter-badge">
                    ≤{filters.maxDuration}min
                  </Badge>
                )}
                {filters.minServings && filters.minServings > 0 && (
                  <Badge className="active-filter-badge">
                    ≥{filters.minServings}servings
                  </Badge>
                )}
                {filters.maxServings && filters.maxServings > 0 && (
                  <Badge className="active-filter-badge">
                    ≤{filters.maxServings}servings
                  </Badge>
                )}
                {filters.hasImage && (
                  <Badge className="active-filter-badge">
                    With Image
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
