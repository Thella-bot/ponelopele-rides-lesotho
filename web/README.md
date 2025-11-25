# Urban Taxis - Web Application

A modern web application for the Urban Taxis ride-hailing service in Maseru, Lesotho.

## Features

- 🗺️ **Map-based Pickup Selection** - Tap your roof using satellite view with Mapbox integration
- 📍 **What3Words Integration** - Precise location addressing without house numbers
- 🚕 **Real-time Ride Booking** - Request rides with estimated fares
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🔐 **Authentication** - Secure login and registration system
- 📊 **Ride History** - View your past rides
- 👤 **User Profile** - Manage your account details

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Routing**: React Router v6
- **Styling**: Tailwind CSS v4 + Custom CSS
- **Maps**: Mapbox GL JS
- **HTTP Client**: Axios
- **Authentication**: JWT with jwt-decode

## Prerequisites

- Node.js 20.19+ or 22.12+
- npm or yarn
- Mapbox API token (optional, for map features)
- What3Words API key (optional, for address conversion)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Then edit `.env` with your actual values:

```env
VITE_API_URL=http://localhost:3000
VITE_MAPBOX_TOKEN=your_mapbox_token_here
VITE_W3W_API_KEY=your_what3words_api_key_here
```

**Getting API Keys:**
- Mapbox: https://account.mapbox.com/access-tokens/
- What3Words: https://what3words.com/select-plan

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3001

### 4. Build for Production

```bash
npm run build
```

### 5. Preview Production Build

```bash
npm run preview
```

## Project Structure

```
web/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   │   └── ProtectedRoute.tsx
│   ├── context/         # React contexts
│   │   └── AuthContext.tsx
│   ├── features/        # Feature-based modules
│   │   ├── auth/        # Authentication pages
│   │   ├── ride/        # Ride booking flow
│   │   └── user/        # User profile
│   ├── lib/             # Utilities and API
│   │   ├── api.ts
│   │   └── auth.dto.ts
│   ├── theme/           # Theme configuration
│   │   └── colors.ts
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   ├── index.css        # Global styles
│   └── App.css          # Component styles
├── .env.example         # Environment variables template
├── postcss.config.js    # PostCSS configuration
├── vite.config.ts       # Vite configuration
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features Overview

### Authentication
- Login and registration with JWT tokens
- Protected routes requiring authentication
- Persistent sessions using localStorage

### Ride Booking Flow
1. **Home** - Landing page with ride request button
2. **Pickup** - Select pickup location on map (tap your roof mode)
3. **Destination** - Choose from landmarks or enter custom destination
4. **Confirm** - Review details, select payment method, and request ride

### Additional Features
- **Ride History** - View past rides with details
- **Profile** - View and manage user information
- **Error Handling** - Comprehensive error boundaries and user feedback

## API Integration

The app connects to the backend API (default: http://localhost:3000) with the following endpoints:

- `POST /auth/signin` - User login
- `POST /auth/signup` - User registration
- `GET /auth/profile` - Get user profile
- `POST /rides` - Request a new ride
- `GET /rides/history` - Get ride history

## Troubleshooting

### Map not loading
- Ensure `VITE_MAPBOX_TOKEN` is set in your `.env` file
- Check browser console for errors
- Verify Mapbox token is valid

### API errors
- Ensure backend server is running
- Check `VITE_API_URL` points to correct backend
- Verify CORS is configured on backend

### Build errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Ensure Node.js version is 20.19+ or 22.12+

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

Private - Urban Taxis Lesotho