# VaultX - Secure Document Management

A production-ready React Native app built with Expo (managed workflow) for secure document management.

## Project Structure

```
VaultX-qng9Eb/
├── src/
│   ├── app/                    # Expo Router navigation
│   │   ├── (tabs)/            # Bottom tab navigation
│   │   │   ├── _layout.tsx    # Tab layout configuration
│   │   │   ├── index.tsx      # Home (Documents) screen
│   │   │   ├── add.tsx        # Add Document screen
│   │   │   └── settings.tsx   # Settings screen
│   │   └── _layout.tsx        # Root layout
│   ├── components/            # Reusable UI components
│   │   ├── themed-text.tsx
│   │   ├── themed-view.tsx
│   │   └── ui/
│   │       └── icon-symbol.tsx
│   ├── constants/             # App-wide constants
│   │   └── theme.ts
│   ├── hooks/                 # Custom React hooks
│   │   ├── use-color-scheme.ts
│   │   └── use-theme-color.ts
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Utility functions
├── assets/                    # Static assets (images, fonts)
├── package.json
├── tsconfig.json
└── app.json
```

## Features

- ✅ Clean architecture with `/src` folder structure
- ✅ Expo Router for file-based navigation
- ✅ Bottom tab navigation (Documents, Add Document, Settings)
- ✅ TypeScript for type safety
- ✅ Theme support (light/dark mode)
- ✅ Scalable folder structure

## Tech Stack

- **Framework**: React Native with Expo (managed workflow)
- **Navigation**: Expo Router
- **Language**: TypeScript
- **Styling**: StyleSheet API

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```

3. **Run on platforms**:
   - iOS: Press `i` or run `npm run ios`
   - Android: Press `a` or run `npm run android`
   - Web: Press `w` or run `npm run web`

## Navigation Structure

The app uses Expo Router with a bottom tab layout:

- **Home (Documents)**: Main screen for viewing documents
- **Add Document**: Screen for uploading/creating documents
- **Settings**: App configuration and preferences

## Development Guidelines

### Adding New Screens

1. Create a new file in `src/app/` or `src/app/(tabs)/`
2. Export a default React component
3. The file name becomes the route

### Creating Components

1. Add components to `src/components/`
2. Use themed components for consistent styling
3. Follow the existing naming conventions

### TypeScript

- All files use TypeScript
- Type definitions go in `src/types/`
- Leverage type inference where possible

## Code Style

- Use functional components with hooks
- Follow React Native best practices
- Keep components small and focused
- Use absolute imports with `@/` prefix

## Next Steps

- [ ] Implement authentication
- [ ] Add document storage backend
- [ ] Implement document upload/download
- [ ] Add encryption features
- [ ] Set up state management
- [ ] Add unit tests

## License

0BSD
