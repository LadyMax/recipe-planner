-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建食谱表
CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    cook_time_min INTEGER,
    difficulty TEXT,
    image_url TEXT,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 创建食材表
CREATE TABLE IF NOT EXISTS ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    amount TEXT,
    unit TEXT,
    position INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- 创建食材分类表
CREATE TABLE IF NOT EXISTS ingredient_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认用户
INSERT OR IGNORE INTO users (id, email, name, password, role) VALUES 
(1, 'admin@example.com', 'Admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
(2, 'user@example.com', 'User', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
(3, 'thomas@example.com', 'Thomas', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');

-- 插入默认食材分类数据
INSERT OR IGNORE INTO ingredient_categories (name, category) VALUES 
('Tomato', 'Vegetables'),
('Onion', 'Vegetables'),
('Garlic', 'Vegetables'),
('Carrot', 'Vegetables'),
('Potato', 'Vegetables'),
('Bell Pepper', 'Vegetables'),
('Cucumber', 'Vegetables'),
('Lettuce', 'Vegetables'),
('Spinach', 'Vegetables'),
('Broccoli', 'Vegetables'),
('Apple', 'Fruits'),
('Banana', 'Fruits'),
('Orange', 'Fruits'),
('Lemon', 'Fruits'),
('Lime', 'Fruits'),
('Strawberry', 'Fruits'),
('Blueberry', 'Fruits'),
('Mango', 'Fruits'),
('Pineapple', 'Fruits'),
('Grape', 'Fruits'),
('Chicken Breast', 'Proteins'),
('Ground Beef', 'Proteins'),
('Pork', 'Proteins'),
('Salmon', 'Proteins'),
('Eggs', 'Proteins'),
('Milk', 'Dairy'),
('Cheese', 'Dairy'),
('Butter', 'Dairy'),
('Yogurt', 'Dairy'),
('Cream', 'Dairy'),
('Rice', 'Grains & Starches'),
('Pasta', 'Grains & Starches'),
('Bread', 'Grains & Starches'),
('Quinoa', 'Grains & Starches'),
('Oats', 'Grains & Starches'),
('Salt', 'Herbs & Spices'),
('Black Pepper', 'Herbs & Spices'),
('Basil', 'Herbs & Spices'),
('Oregano', 'Herbs & Spices'),
('Thyme', 'Herbs & Spices'),
('Olive Oil', 'Oils & Condiments'),
('Vegetable Oil', 'Oils & Condiments'),
('Vinegar', 'Oils & Condiments'),
('Soy Sauce', 'Oils & Condiments'),
('Honey', 'Oils & Condiments');
