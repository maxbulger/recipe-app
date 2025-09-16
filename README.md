# Recipe Collection App

A full-stack recipe management application built with Next.js, TypeScript, Prisma, and PostgreSQL.

## Features

- 📖 **View all recipes** - Browse your complete recipe collection
- 👁️ **View single recipe** - Detailed view with ingredients, instructions, and metadata
- ➕ **Add new recipes** - Create recipes with ingredients, instructions, images, and tags
- ✏️ **Edit recipes** - Update existing recipes
- 🗑️ **Delete recipes** - Soft delete functionality to preserve data
- 🔍 **Search recipes** - Search by title, description, or tags
- 🏷️ **Tag filtering** - Filter recipes by specific tags
- 📱 **Responsive design** - Works on desktop and mobile

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

1. Install dependencies
```bash
npm install
```

2. Set up environment variables
Create a `.env.local` file and add your database URL:
```
DATABASE_URL="postgresql://username:password@localhost:5432/recipe_app?schema=public"
```

3. Set up the database
```bash
npx prisma migrate dev --name init
npx prisma generate
```

4. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Database Schema

The app uses a single `Recipe` model with the following fields:

- `id` - Unique identifier (CUID)
- `title` - Recipe name (required)
- `description` - Brief description (optional)
- `ingredients` - Array of ingredient strings (required)
- `instructions` - Array of instruction strings (required)
- `prepTime` - Preparation time in minutes (optional)
- `cookTime` - Cooking time in minutes (optional)
- `servings` - Number of servings (optional)
- `difficulty` - easy/medium/hard (optional)
- `tags` - Array of tag strings (optional)
- `imageUrl` - URL to recipe image (optional)
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp
- `deletedAt` - Soft delete timestamp (optional)

## API Routes

- `GET /api/recipes` - List all recipes (supports ?search and ?tag query params)
- `POST /api/recipes` - Create a new recipe
- `GET /api/recipes/[id]` - Get a specific recipe
- `PUT /api/recipes/[id]` - Update a recipe
- `DELETE /api/recipes/[id]` - Soft delete a recipe

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set up a PostgreSQL database (Vercel Postgres recommended)
3. Configure environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_APP_URL` (your production URL)
4. Deploy!

The app is optimized for Vercel deployment with Next.js App Router and serverless API routes.

## Development

### Useful Commands

```bash
# Database
npx prisma studio          # Open Prisma Studio (database GUI)
npx prisma migrate dev     # Run migrations
npx prisma generate        # Generate Prisma client

# Development
npm run dev               # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
```
