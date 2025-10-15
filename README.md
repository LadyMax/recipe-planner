# Recipe Master

A recipe management app with React frontend and .NET backend.

## Features

- Add/edit/delete recipes
- Search recipes
- User login
- Mobile and desktop support

## Limitations

- No user registration (only login with existing accounts)
- Frontend styling only (no backend validation)
- Demo data only

## Setup

Need Node.js 18+ and .NET 8.

```bash
npm install
npm run dev
```

Go to http://localhost:5173

## Demo Accounts

| Email | Password | Role | Permissions |
|-------|----------|------|-------------|
| thomas@nodehill.com | 12345678 | Admin | Full access to all features |
| olle@nodehill.com | 12345678 | User | Can view and create recipes |
| maria@nodehill.com | 12345678 | User | Can view and create recipes |

## API

- GET /api/recipes - list recipes
- POST /api/recipes - create recipe
- PUT /api/recipes/{id} - update recipe
- DELETE /api/recipes/{id} - delete recipe
- POST /api/login - login
- GET /api/login - current user
- DELETE /api/login - logout

## Tech

Frontend: React 19, TypeScript, Vite, Bootstrap 5
Backend: .NET 8, SQLite