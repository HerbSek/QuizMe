# QuizMe Frontend

A React-based frontend for the QuizMe quiz application.

## Features

- User authentication (login/signup)
- Quiz creation and management
- Live game sessions
- Real-time leaderboards
- Responsive design with TailwindCSS

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Start the development server:
```bash
npm start
```

The app will be available at `http://localhost:3000`.

### Building for Production

```bash
npm run build
```

This creates a `build` folder with the production-ready static files.

## Deployment

This app is configured for static site deployment on platforms like:
- Render
- Netlify
- Vercel
- GitHub Pages

### Render Deployment

1. Connect your GitHub repository to Render
2. Set the build command: `npm run build`
3. Set the publish directory: `build`
4. Add environment variable: `REACT_APP_API_URL=https://your-backend-url.com`

## Environment Variables

- `REACT_APP_API_URL`: Backend API URL (defaults to https://quizme-ked0.onrender.com)

## Tech Stack

- React 18
- React Router DOM
- TailwindCSS
- Zustand (state management)
- React Hook Form
- Axios
- React Hot Toast
