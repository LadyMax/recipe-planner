# 部署指南

## 项目结构
```
projekt-root/
├── dist/           (React 构建文件)
├── backend/
│   ├── src/       (后端源代码)
│   ├── bin/       (编译后的代码)
│   └── _db.sqlite3 (数据库)
├── publish/       (发布的后端文件)
└── src/           (React/前端源代码)
```

## 部署步骤

### 1. 构建项目
```bash
# 构建前端
npm run build

# 发布后端
dotnet publish backend -c Release -o ./publish
```

### 2. 上传到服务器

#### 方法A: 使用SCP
```bash
# 复制后端文件
scp -r publish/* user@din-server:/var/www/myapp/backend/

# 复制前端文件
scp -r dist user@din-server:/var/www/myapp/dist/

# 复制数据库
scp backend/_db.sqlite3 user@din-server:/var/www/myapp/backend/
```

#### 方法B: 使用Git
```bash
# 在服务器上
cd /var/www
sudo git clone https://github.com/ditt-repo/myapp.git
cd myapp

# 安装依赖并构建
npm install
npm run build

# 发布后端
dotnet publish backend -c Release -o backend/publish
```

### 3. 设置权限
```bash
# 设置文件权限
sudo chown -R www-data:www-data /var/www/myapp
sudo chmod -R 755 /var/www/myapp/dist
sudo chmod 664 /var/www/myapp/backend/_db.sqlite3
sudo chmod 755 /var/www/myapp/backend
```

### 4. 创建systemd服务
```bash
# 复制服务文件
sudo cp myapp.service /etc/systemd/system/

# 启用并启动服务
sudo systemctl enable myapp
sudo systemctl start myapp

# 检查状态
sudo systemctl status myapp
```

### 5. 配置Nginx
```bash
# 复制配置文件
sudo cp nginx-config /etc/nginx/sites-available/myapp

# 启用站点
sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重新加载Nginx
sudo systemctl reload nginx
```

## 环境变量

后端使用以下环境变量：
- `APP_PORT`: 应用端口 (默认: 5000)
- `FRONTEND_PATH`: 前端文件路径 (默认: ../../dist)
- `DB_PATH`: 数据库文件路径 (默认: ../_db.sqlite3)
- `ASPNETCORE_ENVIRONMENT`: 环境 (Production)

## 故障排除

### 查看日志
```bash
sudo journalctl -u myapp -f
```

### 检查文件
```bash
# 检查前端文件
ls -la /var/www/myapp/dist

# 检查数据库
ls -la /var/www/myapp/backend/_db.sqlite3
```

### 重启服务
```bash
sudo systemctl restart myapp
sudo systemctl restart nginx
```

## 重要提醒

1. **构建前端**: 确保运行 `npm run build` 生成 `dist` 文件夹
2. **安全设置**: 生产环境中 `debugOn = false`
3. **数据库**: 确保复制现有的数据库文件到服务器
4. **权限**: 正确设置文件和目录权限
5. **端口**: 确保防火墙允许相应端口访问

## 默认用户

数据库包含以下默认用户：
- admin@example.com / password
- user@example.com / password  
- thomas@example.com / password
