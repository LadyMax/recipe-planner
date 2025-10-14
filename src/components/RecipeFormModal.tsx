import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col, Dropdown } from 'react-bootstrap';
import type { Ingredient, Recipe } from '../types/recipe.ts';
import { uuid } from '../utils/ids.ts';
import { useAuth } from '../hooks/useAuth';
import { getMealTypeOptions } from '../utils/mealTypeUtils';

type Props = {
  show: boolean;
  initial?: Recipe | null;
  onSubmit: (recipe: Recipe) => void;
  onClose: () => void;
};

const RecipeFormModal: React.FC<Props> = ({
  show,
  initial = null,
  onSubmit,
  onClose,
}) => {
  const { user } = useAuth();
  const [recipeName, setRecipeName] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: uuid(), name: '', amount: 0 },
  ]);
  const [category, setCategory] = useState('');
  const [mealType, setMealType] = useState<string>('');
  const [imageUrl, setImageUrl] = useState('');
  const [customIngredients, setCustomIngredients] = useState<string[]>([]);
  const [newCustomIngredient, setNewCustomIngredient] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [focusedField, setFocusedField] = useState<string>('');
  const [ingredientCategories, setIngredientCategories] = useState<{[key: string]: {id: number, name: string}[]}>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Check if there is a local file upload
  const hasLocalFile = imageFile !== null;

  // Helper function to check if a field is completed
  const isFieldCompleted = (value: string | number | undefined, required: boolean = false) => {
    if (required) {
      return value !== undefined && value !== '' && String(value).trim() !== '';
    }
    return value !== undefined && value !== '' && String(value).trim() !== '';
  };

  // Helper function to get field class name
  const getFieldClassName = (fieldName: string, value: string | number | undefined, required: boolean = false) => {
    const baseClass = 'form-control';
    const isCompleted = isFieldCompleted(value, required);
    const isFocused = focusedField === fieldName;
    
    if (isCompleted && !isFocused) {
      return `${baseClass} field-completed`;
    }
    return baseClass;
  };

  // Common measurement units
  const MEASUREMENT_UNITS = [
    'g',
    'kg',
    'ml',
    'l',
    'cup',
    'tbsp',
    'tsp',
    'oz',
    'lb',
    'piece',
    'slice',
    'clove',
    'bunch',
    'pinch',
    'dash',
  ];



        // Load ingredient categories from database
        useEffect(() => {
          const loadIngredientCategories = async () => {
            try {
              const response = await fetch('/api/ingredient_categories');
              if (response.ok) {
                const data = await response.json();
                const categories: {[key: string]: {id: number, name: string}[]} = {};
                
                data.forEach((item: {id: number; name: string; category: string}) => {
                  if (!categories[item.category]) {
                    categories[item.category] = [];
                  }
                  categories[item.category].push({id: item.id, name: item.name});
                });
                
                setIngredientCategories(categories);
              }
            } catch (error) {
              console.warn('Failed to load ingredient categories:', error);
            }
          };
          
          loadIngredientCategories();
        }, []);

  useEffect(() => {
    if (initial) {
      setRecipeName(initial.recipe_name ?? '');
      setDescription(initial.description ?? '');
      setIngredients(
        initial.ingredients?.length
          ? initial.ingredients
          : [{ id: uuid(), name: '', amount: 0 }]
      );
      setCategory(initial.category ?? '');
      setMealType(initial.meal_type_id?.toString() ?? '');
      setImageUrl(initial.image_url ?? '');
    } else {
      setRecipeName('');
      setDescription('');
      setIngredients([{ id: uuid(), name: '', amount: 0, unit: '' }]);
      setCategory('');
      setMealType('');
      setImageUrl('');
      setImageFile(null);
      setImagePreview('');
    }
  }, [initial, show]);

  const addIngredient = () => {
    const newIngredient = { id: uuid(), name: '', amount: 0, unit: '' };
    setIngredients(prev => [...prev, newIngredient]);
  };

  const updateIngredient = (
    id: number | string,
    field: keyof Ingredient,
    value: string | number
  ) =>
    setIngredients(prev =>
      prev.map(i => (i.id === id ? { ...i, [field]: value } : i))
    );

  const removeIngredient = (id: number | string) =>
    setIngredients(prev => prev.filter(i => i.id !== id));

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const selectIngredient = (ingredientId: number, ingredientName: string, currentIngredientId: number | string) => {
    // Find the ingredient by its current ID and update it
    setIngredients(prev => prev.map(ing => 
      ing.id === currentIngredientId 
        ? { ...ing, name: ingredientName, id: ingredientId }
        : ing
    ));
  };


  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB.');
        return;
      }

      setImageFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = e => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Clear URL input when file is selected
      setImageUrl('');
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const addCustomIngredient = () => {
    const trimmed = newCustomIngredient.trim();
    if (trimmed && !customIngredients.includes(trimmed)) {
      setCustomIngredients(prev => [...prev, trimmed]);
      setNewCustomIngredient('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedRecipeName = recipeName.trim();
    const trimmedCategory = category.trim();
    if (!trimmedRecipeName || !trimmedCategory || !mealType) return;

    // Validate ingredients - all fields are required
    const invalidIngredients = ingredients.filter(i => 
      !i.name?.trim() || (i.amount !== 0 && !i.amount) || !i.unit?.trim()
    );
    
    if (invalidIngredients.length > 0) {
      alert('Please fill in all ingredient fields (name, amount, and unit)');
      return;
    }

    const clean = ingredients
      .filter(i => i.name?.trim())
      .map(i => ({ 
        ...i, 
        amount: i.amount || 0
      }));

    // Create simple recipe object for API call - only database fields
    const recipeForApi = {
      created_by: user?.id || 3, // Use default user ID 3 (Thomas)
      recipe_name: trimmedRecipeName,
      description: description.trim() || undefined,
      category: trimmedCategory,
      meal_type_id: mealType ? parseInt(mealType) : undefined,
      image_url: hasLocalFile ? imagePreview : imageUrl.trim() || undefined,
    };

    // Create full recipe object with all fields for component compatibility
    const recipe: Recipe = {
      id: initial?.id ?? Date.now(),
      ...recipeForApi,
      // Keep compatibility fields for ingredient handling
      ingredients: clean,
    };

    onSubmit(recipe);
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{initial ? 'Edit Recipe' : 'New Recipe'}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Recipe Name *</Form.Label>
            <Form.Control
              className={getFieldClassName('recipeName', recipeName, true)}
              placeholder="E.g. Tomato Pasta"
              value={recipeName}
              onChange={e => setRecipeName(e.target.value)}
              onFocus={() => setFocusedField('recipeName')}
              onBlur={() => setFocusedField('')}
              required
            />
          </Form.Group>

          <Form.Label>Ingredients *</Form.Label>
          <div className="ingredients-list">
            {ingredients.map((i, index) => (
              <Row key={`ingredient-${i.id}-${index}`} className="g-2 align-items-center mb-2">
              <Col sm={5}>
                <div className="position-relative">
                  <Dropdown>
                    <Dropdown.Toggle
                      as={Form.Control}
                      variant="outline-primary"
                      placeholder="Select ingredient *"
                      value={i.name}
                      readOnly
                      required
                      className={`dropdown-toggle-custom ${getFieldClassName(`ingredient-name-${i.id}`, i.name, true)}`}
                      onFocus={() => setFocusedField(`ingredient-name-${i.id}`)}
                      onBlur={() => setFocusedField('')}
                    />
                     <Dropdown.Menu className="dropdown-menu-custom">
                       {Object.entries(ingredientCategories).map(
                         ([category, items]) => (
                          <React.Fragment key={category}>
                            <Dropdown.Header
                              className="dropdown-header-custom"
                              onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleCategory(category);
                              }}
                            >
                              <span>{category}</span>
                              <span className="dropdown-arrow">
                                {expandedCategories.has(category) ? '▼' : '▶'}
                              </span>
                            </Dropdown.Header>
                             {expandedCategories.has(category) &&
                               items.map(item => (
                                 <Dropdown.Item
                                   key={item.id}
                                   onClick={() => selectIngredient(item.id, item.name, i.id)}
                                   className="dropdown-item-custom"
                                >
                                  {item.name}
                                </Dropdown.Item>
                              ))}
                          </React.Fragment>
                        )
                      )}
                      {customIngredients.length > 0 && (
                        <>
                          <Dropdown.Divider className="dropdown-divider-custom" />
                          <Dropdown.Header className="dropdown-header-custom-section">
                            Custom
                          </Dropdown.Header>
                          {customIngredients.map(item => (
                            <Dropdown.Item
                              key={item}
                                   onClick={() => selectIngredient(0, item, i.id)}
                              className="dropdown-item-custom-section"
                            >
                              {item}
                            </Dropdown.Item>
                          ))}
                        </>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </Col>
              <Col sm={3}>
                <Form.Control
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Amount *"
                  value={i.amount === 0 ? '' : (i.amount ?? '')}
                  onChange={e => {
                    const value = e.target.value;
                    updateIngredient(i.id, 'amount', value === '' ? 0 : parseInt(value) || 0);
                  }}
                  onFocus={() => setFocusedField(`ingredient-amount-${i.id}`)}
                  onBlur={() => setFocusedField('')}
                  className={getFieldClassName(`ingredient-amount-${i.id}`, i.amount, true)}
                  required
                />
              </Col>
              <Col sm={3}>
                 <Form.Select
                   value={i.unit ?? ''}
                   onChange={e => updateIngredient(i.id, 'unit', e.target.value)}
                   onFocus={() => setFocusedField(`ingredient-unit-${i.id}`)}
                   onBlur={() => setFocusedField('')}
                   className={getFieldClassName(`ingredient-unit-${i.id}`, i.unit, true)}
                   required
                 >
                   <option value="">-- Select Unit --</option>
                   {MEASUREMENT_UNITS.map(unit => (
                     <option key={unit} value={unit}>
                       {unit}
                     </option>
                   ))}
                 </Form.Select>
              </Col>
              <Col sm={1} className="text-end">
                <Button
                  variant="outline-secondary"
                  onClick={() => removeIngredient(i.id)}
                  aria-label="Remove ingredient"
                >
                  ✕
                </Button>
              </Col>
            </Row>
            ))}
          </div>

          <div className="mb-3">
            <Button
              variant="outline-primary"
              type="button"
              onClick={addIngredient}
            >
              + Add ingredient
            </Button>
            <div className="mt-2">
              <div className="d-flex gap-2">
                <Form.Control
                  placeholder="Add custom ingredient to list"
                  value={newCustomIngredient}
                  onChange={e => setNewCustomIngredient(e.target.value)}
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomIngredient();
                    }
                  }}
                />
                <Button
                  variant="outline-success"
                  onClick={addCustomIngredient}
                  disabled={!newCustomIngredient.trim()}
                >
                  Add
                </Button>
              </div>
              <small className="text-muted">
                Type ingredient name and click Add to add to the list
              </small>
            </div>
          </div>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Category *</Form.Label>
                <Form.Select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  onFocus={() => setFocusedField('category')}
                  onBlur={() => setFocusedField('')}
                  className={getFieldClassName('category', category, true)}
                  required
                >
                  <option value="">-- Select Category --</option>
                  <option value="Main Course">Main Course</option>
                  <option value="Appetizer">Appetizer</option>
                  <option value="Salad">Salad</option>
                  <option value="Soup">Soup</option>
                  <option value="Side Dish">Side Dish</option>
                  <option value="Beverage">Beverage</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Meal Type *</Form.Label>
                <Form.Select
                  value={mealType}
                  onChange={e => setMealType(e.target.value)}
                  onFocus={() => setFocusedField('mealType')}
                  onBlur={() => setFocusedField('')}
                  className={getFieldClassName('mealType', mealType, true)}
                  required
                >
                  <option value="">Select meal type</option>
                  {getMealTypeOptions().map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Recipe Image</Form.Label>

            {/* Image Preview */}
            {(imagePreview || imageUrl) && (
              <div className="mb-3">
                       <img
                         src={imagePreview || imageUrl}
                         alt="Recipe preview"
                         className="image-preview"
                       />
                <div className="mt-2">
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={clearImage}
                  >
                    Remove Image
                  </Button>
                </div>
              </div>
            )}

            {/* Upload Options */}
            <div className="d-flex gap-2 mb-2">
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="file-input-flex"
              />
              <span className="text-muted align-self-center">or</span>
            </div>

            <Form.Control
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={e => {
                setImageUrl(e.target.value);
                // Clear file when URL is entered
                if (e.target.value) {
                  setImageFile(null);
                  setImagePreview('');
                }
              }}
              onFocus={() => setFocusedField('imageUrl')}
              onBlur={() => setFocusedField('')}
              className={getFieldClassName('imageUrl', imageUrl)}
            />

            <Form.Text className="text-muted">
              Upload an image file (max 5MB) or enter an image URL
            </Form.Text>
          </Form.Group>

          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              placeholder="Detailed cooking instructions..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              onFocus={() => setFocusedField('description')}
              onBlur={() => setFocusedField('')}
              className={getFieldClassName('description', description)}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{initial ? 'Save' : 'Create'}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default RecipeFormModal;
