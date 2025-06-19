# Auto-Order Frontend

A sleek, modern React TypeScript application for personal purchase tracking and prediction. Features a mobile-first dark mode interface built with React, TypeScript, and Vite.

## Features

- Sleek dark mode UI with modern aesthetics
- Mobile-first responsive design
- Smooth animations with Framer Motion
- Type-safe backend integration
- Shared schema validation with Zod
- CRUD operations for products and orders
- Purchase prediction visualization

## Tech Stack

- **React** with TypeScript for UI
- **Vite** for fast development and builds
- **Framer Motion** for fluid animations
- **Zod** for schema validation
- **CSS Variables** for theming
- **Fetch API** for backend communication

## Getting Started

1. **Install dependencies:**
   ```sh
   pnpm install
   ```

2. **Start development server:**
   ```sh
   pnpm dev
   ```
   The app runs on [http://localhost:5173](http://localhost:5173)

3. **Build for production:**
   ```sh
   pnpm build
   ```

## Project Structure

```
frontend/
  src/
    api/             # Backend API integration
    components/      # Reusable UI components
    styles/          # Theme and global styles
    types/           # TypeScript types & schemas from backend
    App.tsx          # Main application component
    main.tsx         # Application entry point
  package.json
  vite.config.ts
```

## Backend Integration

The frontend integrates with the backend using shared Zod schemas and TypeScript types for consistent data validation and type safety across the stack. All API calls are wrapped in type-safe functions that validate responses at runtime.
