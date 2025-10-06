# !!!!!! not implemented "create acount","add favourite recipes","rating"
# Recipe Management App

一个基于React + TypeScript + .NET的现代化食谱管理应用，支持用户认证、食谱创建、搜索、评分和评论功能。

## 🚀 功能特性

- **用户管理**：用户注册、登录、会话管理
- **食谱管理**：创建、编辑、删除、搜索食谱
- **高级搜索**：按分类、标签、难度、时间等筛选
- **文件操作**：导入/导出食谱数据
- **响应式设计**：支持桌面和移动设备
- **离线支持**：Service Worker缓存
- **现代化UI**：基于Bootstrap 5的美观界面

## 🛠️ 技术栈

### 前端
- **React 19** - 用户界面框架
- **TypeScript** - 类型安全的JavaScript
- **Vite** - 快速构建工具
- **React Router** - 客户端路由
- **Bootstrap 5** - UI组件库
- **React Bootstrap** - React组件封装

### 后端
- **.NET 8** - 服务器框架
- **SQLite** - 轻量级数据库
- **Dyndata** - 动态数据处理

### 开发工具
- **ESLint** - 代码质量检查
- **TypeScript ESLint** - TypeScript代码检查
- **Vitest** - 单元测试框架
- **Testing Library** - React组件测试

## 📁 项目结构

```
example/
├── src/                    # 前端源代码
│   ├── components/         # React组件
│   ├── contexts/          # React Context
│   ├── hooks/             # 自定义Hooks
│   ├── pages/             # 页面组件
│   ├── services/          # API服务
│   ├── types/             # TypeScript类型定义
│   └── utils/             # 工具函数
├── backend/               # 后端源代码
│   ├── src/               # C#源代码
│   ├── db_template/       # 数据库模板
│   └── Properties/        # 项目配置
├── public/                 # 静态资源
├── sass/                  # 样式文件
└── dist/                  # 构建输出
```

## 🚀 快速开始

### 环境要求
- Node.js 18+
- .NET 8 SDK
- Git

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
# 启动开发服务器（前端 + 后端）
npm run dev
```

访问 http://localhost:5173 查看应用

### 构建生产版本
```bash
npm run build
```

### 运行测试
```bash
npm run test
```

## 🔧 配置说明

### 端口配置
- 前端开发服务器：5173
- 后端API服务器：5001
- 生产构建：通过后端服务器提供

### 数据库
- 开发环境：SQLite文件数据库
- 位置：`backend/db_template/_db.sqlite3`
- 自动复制到`backend/_db.sqlite3`

### API代理
开发环境下，前端通过Vite代理访问后端API：
```typescript
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:5001',
    changeOrigin: true,
  }
}
```

## 📚 API文档

### 认证端点
- `POST /api/login` - 用户登录
- `GET /api/login` - 获取当前用户
- `DELETE /api/login` - 用户登出

### 食谱端点
- `GET /api/recipes` - 获取食谱列表
- `POST /api/recipes` - 创建新食谱
- `PUT /api/recipes/{id}` - 更新食谱
- `DELETE /api/recipes/{id}` - 删除食谱

### 查询参数
- `where` - SQL WHERE条件
- `orderby` - 排序字段
- `limit` - 限制数量
- `offset` - 偏移量

## 🎨 组件架构

### BaseModal
统一的模态框组件，提供：
- 标准化的头部、内容、底部结构
- 加载状态管理
- 错误处理
- 可自定义的主题和图标

### FormInput
统一的表单输入组件，支持：
- 图标显示
- 验证状态
- 禁用状态
- 占位符文本

### API Client
统一的HTTP客户端，提供：
- 自动错误处理
- 请求/响应拦截
- 类型安全
- 认证管理

## 🔒 安全特性

- **会话管理**：基于Cookie的安全会话
- **CORS配置**：限制跨域访问
- **输入验证**：前后端双重验证
- **SQL注入防护**：参数化查询

## 🚀 部署

### 生产构建
```bash
npm run build
```


```






