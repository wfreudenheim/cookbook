# Cozy Recipe App 🍳

A beautiful, minimalist recipe management app with AI-powered recipe parsing. Built for personal use with public viewing and authenticated editing.

## Features

### 🌐 Public Viewing
- Anyone can browse and view all recipes
- Search recipes by title, ingredients, or tags
- Filter by meal type, cuisine, and protein
- Responsive design works on all devices
- Clean, minimalist UI inspired by Are.na

### 🔐 Authenticated Editing
- Simple email/password authentication
- Add recipes manually or via AI parsing
- Edit and update existing recipes
- Tag recipes for easy filtering
- Generate grocery lists from multiple recipes

### 🤖 AI-Powered Features
- **Recipe Parsing**: Paste recipe text or URLs and Claude AI extracts structured data
- **Smart Suggestions**: Automatic tag suggestions based on recipe content
- **Grocery Organization**: AI helps clean up and organize grocery lists

### 📱 Modern Stack
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **AI**: Anthropic Claude API
- **Hosting**: Vercel (serverless functions + CDN)

## Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Anthropic API key (for recipe parsing)
- Vercel account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd cookbook
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the `cookbook` directory:
   ```env
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Set up Supabase database**
   
   Run this SQL in your Supabase SQL Editor:
   ```sql
   -- Create recipes table
   CREATE TABLE recipes (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     title TEXT NOT NULL,
     source_url TEXT,
     source_type TEXT,
     ingredients JSONB NOT NULL,
     instructions TEXT[] NOT NULL,
     servings INTEGER DEFAULT 4,
     prep_time INTEGER,
     cook_time INTEGER,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     created_by UUID REFERENCES auth.users(id)
   );

   -- Create recipe_tags table
   CREATE TABLE recipe_tags (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
     tag_name TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
   ALTER TABLE recipe_tags ENABLE ROW LEVEL SECURITY;

   -- Public read, authenticated write policies
   CREATE POLICY "Anyone can view recipes" ON recipes
     FOR SELECT USING (true);

   CREATE POLICY "Authenticated users can insert recipes" ON recipes
     FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

   CREATE POLICY "Authenticated users can update their recipes" ON recipes
     FOR UPDATE USING (auth.uid() = created_by);

   CREATE POLICY "Authenticated users can delete their recipes" ON recipes
     FOR DELETE USING (auth.uid() = created_by);

   CREATE POLICY "Anyone can view recipe tags" ON recipe_tags
     FOR SELECT USING (true);

   CREATE POLICY "Authenticated users can manage recipe tags" ON recipe_tags
     FOR ALL USING (
       recipe_id IN (
         SELECT id FROM recipes WHERE created_by = auth.uid()
       )
     );
   ```

5. **Create a user in Supabase**
   - Go to Authentication → Users
   - Click "Add user"
   - Enter email and password
   - **Important**: Check "Auto Confirm User"

6. **Run development server**
   ```bash
   npm run dev
   ```

### Deployment to Vercel

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Set Root Directory to `cookbook`
   - Framework Preset: Vite

3. **Add environment variables in Vercel**
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `ANTHROPIC_API_KEY`: Your Anthropic API key (for recipe parsing)

4. **Deploy**
   - Vercel will automatically deploy on every push to main
   - API functions in `/api` directory are deployed as serverless functions

## Project Structure

```
cookbook/
├── api/                      # Vercel serverless functions
│   └── parse-recipe.js       # Claude AI recipe parsing endpoint
├── src/
│   ├── components/           # React components
│   │   ├── AddRecipe.tsx     # Recipe creation form
│   │   ├── Header.tsx        # Navigation and filters
│   │   ├── Login.tsx         # Authentication
│   │   ├── RecipeCard.tsx    # Recipe grid item
│   │   ├── RecipeDetail.tsx  # Full recipe view
│   │   ├── TagFilter.tsx     # Tag filtering UI
│   │   └── GroceryList.tsx   # Grocery list generator
│   ├── context/              # React context providers
│   │   ├── AuthContext.tsx   # Authentication state
│   │   └── GroceryContext.tsx # Grocery list state
│   ├── hooks/                # Custom React hooks
│   │   ├── useRecipes.ts     # Recipe CRUD operations
│   │   └── useSupabase.ts    # Supabase client wrapper
│   ├── types/                # TypeScript type definitions
│   │   ├── recipe.ts         # Recipe types
│   │   ├── grocery.ts        # Grocery types
│   │   └── database.ts       # Supabase types
│   ├── utils/                # Utility functions
│   │   ├── claudeParser.ts   # Recipe parsing logic
│   │   └── groceryUtils.ts   # Grocery list logic
│   └── lib/
│       └── supabase.ts       # Supabase client config
├── public/                   # Static assets
└── package.json
```

## Architecture

### Security Model
- **Public Read**: Anyone can view recipes without authentication
- **Authenticated Write**: Only logged-in users can add/edit/delete recipes
- **Row Level Security**: Users can only edit their own recipes
- **API Keys**: Stored securely in environment variables

### Database Schema
- `recipes`: Main recipe data with ingredients and instructions
- `recipe_tags`: Many-to-many relationship for recipe tags
- Additional tables for photos and notes (planned)

### API Functions
- `/api/parse-recipe`: Serverless function that uses Claude AI to parse recipe text

## Usage

### Adding Recipes

**Manual Entry:**
1. Sign in
2. Click "Add Recipe"
3. Fill in title, ingredients, instructions, and tags
4. Save

**AI Parsing:**
1. Sign in
2. Click "Add Recipe"
3. Paste recipe text or URL in the text area
4. Click "Parse with AI"
5. Review and edit the parsed data
6. Save

### Filtering Recipes
- Use the search bar to find recipes by title or ingredients
- Click tag filters to show only recipes with those tags
- Multiple tags in the same category use OR logic
- Tags across categories use AND logic

### Grocery Lists
1. Click the checkbox on recipe cards to add to grocery list
2. Click "Grocery List" in the header
3. View combined ingredients organized by store section
4. Copy to clipboard for shopping

## Customization

### Color Scheme
The app uses a minimal color palette defined in `tailwind.config.js`:
- Background: Warm off-white
- Text: Soft black and grays
- Accent: Warm orange/red for highlights

### Tag Categories
Edit tag categories in `src/components/TagFilter.tsx`:
```typescript
const categories: TagCategory[] = [
  { name: 'Meal Type', tags: ['breakfast', 'lunch', 'dinner', 'dessert', 'snack'] },
  { name: 'Cuisine', tags: ['asian', 'italian', 'mexican', 'american', 'other'] },
  { name: 'Protein', tags: ['chicken', 'beef', 'pork', 'fish', 'vegetarian'] }
];
```

## Roadmap

- [ ] Photo upload for recipes
- [ ] Personal notes on recipes
- [ ] Recipe ratings and favorites
- [ ] Print-friendly recipe view
- [ ] Recipe sharing via URL
- [ ] Import from popular recipe sites
- [ ] Meal planning calendar
- [ ] Pantry staples management

## Tech Details

### Why This Stack?
- **Vite**: Lightning-fast dev server and builds
- **React + TypeScript**: Type-safe component development
- **Tailwind CSS**: Rapid styling without leaving HTML
- **Supabase**: PostgreSQL + Auth + Storage in one platform
- **Vercel**: Zero-config deployment with edge functions
- **Claude AI**: Best-in-class text parsing and understanding

### Performance
- Lazy loading of recipes
- Optimistic UI updates
- Debounced search
- Efficient tag filtering
- CDN-hosted static assets

## License

MIT License - Feel free to use this for your own recipe collection!

## Credits

Built with ❤️ for personal recipe management
