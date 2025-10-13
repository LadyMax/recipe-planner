# Recipe Master

Recipe management app with React frontend and .NET backend.

## Features

- Add/edit/delete recipes
- Search recipes
- User login
- Works on mobile and desktop

## Setup

Need Node.js 18+ and .NET 8.

```bash
npm install
npm run dev
```

Go to http://localhost:5173

## Build

```bash
npm run build
```

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

## Notes

Uses SQLite for data. Has demo mode that works without login. Backend runs on port 5001, frontend on 5173.