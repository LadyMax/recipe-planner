import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col, Dropdown } from 'react-bootstrap';
import type { Ingredient, Recipe } from '../types/recipe.ts';
import { uuid } from '../utils/ids.ts';

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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: uuid(), name: '', amount: '' },
  ]);
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [servings, setServings] = useState<number | undefined>(undefined);
  const [cookTimeMin, setCookTimeMin] = useState<number | undefined>(undefined);
  const [difficulty, setDifficulty] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [customIngredients, setCustomIngredients] = useState<string[]>([]);
  const [newCustomIngredient, setNewCustomIngredient] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [focusedField, setFocusedField] = useState<string>('');

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

  // Common ingredients by category
  const INGREDIENT_CATEGORIES = {
    Vegetables: [
      'Tomato',
      'Onion',
      'Garlic',
      'Carrot',
      'Potato',
      'Bell Pepper',
      'Cucumber',
      'Lettuce',
      'Spinach',
      'Broccoli',
      'Cauliflower',
      'Mushroom',
      'Zucchini',
      'Eggplant',
      'Celery',
      'Cabbage',
      'Corn',
      'Green Beans',
      'Peas',
    ],
    Fruits: [
      'Apple',
      'Banana',
      'Orange',
      'Lemon',
      'Lime',
      'Strawberry',
      'Blueberry',
      'Raspberry',
      'Mango',
      'Pineapple',
      'Grape',
      'Peach',
      'Pear',
      'Cherry',
      'Kiwi',
      'Avocado',
      'Coconut',
      'Pomegranate',
    ],
    Proteins: [
      'Chicken Breast',
      'Ground Beef',
      'Pork',
      'Salmon',
      'Tuna',
      'Shrimp',
      'Eggs',
      'Tofu',
      'Beans',
      'Lentils',
      'Chickpeas',
      'Turkey',
      'Lamb',
      'Bacon',
      'Ham',
      'Sausage',
      'Fish',
      'Crab',
      'Lobster',
    ],
    Dairy: [
      'Milk',
      'Cheese',
      'Butter',
      'Yogurt',
      'Cream',
      'Sour Cream',
      'Cottage Cheese',
      'Mozzarella',
      'Cheddar',
      'Parmesan',
      'Ricotta',
      'Feta',
      'Goat Cheese',
    ],
    'Grains & Starches': [
      'Rice',
      'Pasta',
      'Bread',
      'Quinoa',
      'Oats',
      'Barley',
      'Couscous',
      'Noodles',
      'Flour',
      'Cornmeal',
      'Breadcrumbs',
      'Crackers',
      'Tortilla',
    ],
    'Herbs & Spices': [
      'Salt',
      'Black Pepper',
      'Basil',
      'Oregano',
      'Thyme',
      'Rosemary',
      'Parsley',
      'Cilantro',
      'Ginger',
      'Cumin',
      'Paprika',
      'Cinnamon',
      'Nutmeg',
      'Bay Leaves',
      'Red Pepper Flakes',
      'Garlic Powder',
      'Onion Powder',
      'Chili Powder',
    ],
    'Oils & Condiments': [
      'Olive Oil',
      'Vegetable Oil',
      'Sesame Oil',
      'Vinegar',
      'Soy Sauce',
      'Worcestershire Sauce',
      'Ketchup',
      'Mustard',
      'Mayonnaise',
      'Hot Sauce',
      'Honey',
      'Maple Syrup',
      'Sugar',
      'Brown Sugar',
    ],
    'Nuts & Seeds': [
      'Almonds',
      'Walnuts',
      'Pecans',
      'Cashews',
      'Pistachios',
      'Sunflower Seeds',
      'Pumpkin Seeds',
      'Sesame Seeds',
      'Chia Seeds',
      'Flax Seeds',
      'Peanuts',
    ],
  };


  useEffect(() => {
    if (initial) {
      setTitle(initial.title ?? '');
      setDescription(initial.description ?? initial.instructions ?? '');
      setIngredients(
        initial.ingredients?.length
          ? initial.ingredients
          : [{ id: uuid(), name: '', amount: '' }]
      );
      setCategory(initial.category ?? '');
      setTags(initial.tags?.join(', ') ?? '');
      setServings(initial.servings);
      setCookTimeMin(initial.cook_time_min ?? initial.durationMins);
      setDifficulty(initial.difficulty ?? '');
      setImageUrl(initial.image_url ?? initial.imageUrl ?? '');
    } else {
      setTitle('');
      setDescription('');
      setIngredients([{ id: uuid(), name: '', amount: '', unit: '' }]);
      setCategory('');
      setTags('');
      setServings(undefined);
      setCookTimeMin(undefined);
      setDifficulty('');
      setImageUrl('');
      setImageFile(null);
      setImagePreview('');
    }
  }, [initial, show]);

  const addIngredient = () => {
    const newIngredient = { id: uuid(), name: '', amount: '', unit: '' };
    setIngredients(prev => [...prev, newIngredient]);
  };

  const updateIngredient = (
    id: number,
    field: keyof Ingredient,
    value: string
  ) =>
    setIngredients(prev =>
      prev.map(i => (i.id === id ? { ...i, [field]: value } : i))
    );

  const removeIngredient = (id: number) =>
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

  const selectIngredient = (ingredientName: string, ingredientId: number) => {
    updateIngredient(ingredientId, 'name', ingredientName);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedCategory = category.trim();
    if (!trimmedTitle || !trimmedCategory) return;

    // Validate ingredients - all fields are required
    const invalidIngredients = ingredients.filter(i => 
      !i.name.trim() || (i.amount !== '0' && !i.amount?.trim()) || !i.unit?.trim()
    );
    
    if (invalidIngredients.length > 0) {
      alert('Please fill in all ingredient fields (name, amount, and unit)');
      return;
    }

    const clean = ingredients
      .filter(i => i.name.trim())
      .map(i => ({ ...i, amount: i.amount === '0' ? '0' : (i.amount?.trim() || undefined) }));

    // Create recipe object containing only database fields
    const recipe: Recipe = {
      id: initial?.id ?? Date.now(),
      user_id: 3, // Hardcoded to use Thomas account
      title: trimmedTitle,
      description: description.trim(),
      category: trimmedCategory,
      cook_time_min: cookTimeMin !== undefined ? cookTimeMin : 1,
      difficulty: difficulty || 'Easy',
      image_url: hasLocalFile ? imagePreview : imageUrl.trim() || undefined,
      created_at: initial?.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Keep compatibility fields
      ingredients: clean,
      instructions: description.trim(),
      tags: tags.trim()
        ? tags
            .split(',')
            .map(t => t.trim())
            .filter(t => t)
        : undefined,
      servings: servings || undefined,
      durationMins: cookTimeMin || undefined,
      imageUrl: imagePreview || imageUrl.trim() || undefined,
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
            <Form.Label>Title *</Form.Label>
            <Form.Control
              className={getFieldClassName('title', title, true)}
              placeholder="E.g. Tomato Pasta"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onFocus={() => setFocusedField('title')}
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
                       {Object.entries(INGREDIENT_CATEGORIES).map(
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
                                   key={item}
                                   onClick={() => selectIngredient(item, i.id)}
                                   className="dropdown-item-custom"
                                >
                                  {item}
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
                              onClick={() => selectIngredient(item, i.id)}
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
                  value={i.amount === '0' ? '' : (i.amount ?? '')}
                  onChange={e => {
                    const value = e.target.value;
                    updateIngredient(i.id, 'amount', value === '' ? '0' : value);
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
            <Col md={4}>
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
                  <option value="Soup">Soup</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Beverage">Beverage</option>
                  <option value="Snack">Snack</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Difficulty *</Form.Label>
                <Form.Select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                  onFocus={() => setFocusedField('difficulty')}
                  onBlur={() => setFocusedField('')}
                  className={getFieldClassName('difficulty', difficulty, true)}
                  required
                >
                  <option value="">-- Select Difficulty --</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Tags</Form.Label>
                <Form.Control
                  placeholder="Separate with commas, e.g.: Simple,Vegetarian,Quick"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  onFocus={() => setFocusedField('tags')}
                  onBlur={() => setFocusedField('')}
                  className={getFieldClassName('tags', tags)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Servings</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  placeholder="How many servings"
                  value={servings !== undefined ? servings : ''}
                  onChange={e =>
                    setServings(
                      e.target.value !== '' ? parseInt(e.target.value) : undefined
                    )
                  }
                  onFocus={() => setFocusedField('servings')}
                  onBlur={() => setFocusedField('')}
                  className={getFieldClassName('servings', servings)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Cooking Time (minutes) *</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  placeholder="Cooking time"
                  value={cookTimeMin !== undefined ? cookTimeMin : ''}
                  onChange={e =>
                    setCookTimeMin(
                      e.target.value !== '' ? parseInt(e.target.value) : undefined
                    )
                  }
                  onFocus={() => setFocusedField('cookTime')}
                  onBlur={() => setFocusedField('')}
                  className={getFieldClassName('cookTime', cookTimeMin, true)}
                  required
                />
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
                style={{ flex: 1 }}
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
