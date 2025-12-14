# SmartSpend

## Overview

SmartSpend is a personal finance tracking web application that allows users to manage their spending habits. The application features user authentication (sign up/login) and a dashboard for expense tracking and visualization. It's built as a client-side single-page application with Firebase as the backend-as-a-service for authentication and data storage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Single Page Application (SPA)**: The app uses vanilla JavaScript with ES6 modules, switching between auth and dashboard views by toggling section visibility
- **Styling**: Custom CSS with CSS variables for theming (colors, shadows, spacing) defined in `combined.css`
- **Charts**: Chart.js library loaded via CDN for data visualization on the dashboard
- **No Build Process**: Direct browser module loading using ES6 imports from CDN for Firebase

### Backend Architecture
- **Backend-as-a-Service (BaaS)**: Firebase handles all backend functionality
  - **Firebase Authentication**: Email/password authentication for user management
  - **Cloud Firestore**: NoSQL document database for storing user data and transactions
- **Static File Server**: Simple Python HTTP server (`main.py`) serves the static files on port 5000 with cache-busting headers

### Data Model
- User-centric data structure in Firestore
- Collections organized by user ID for data isolation
- Documents support: creation, reading, updating, and deletion (full CRUD operations)

### Authentication Flow
1. Users can sign up with email/password (minimum 8 characters)
2. Existing users can log in
3. Auth state determines which screen (auth vs dashboard) is displayed
4. User ID stored in `currentUserId` variable for session management

## External Dependencies

### Third-Party Services
| Service | Purpose | Configuration |
|---------|---------|---------------|
| Firebase Authentication | User sign-up and login | Project: smartspend-48e3b |
| Cloud Firestore | Data storage for transactions | Same Firebase project |

### CDN Libraries
| Library | Version | Purpose |
|---------|---------|---------|
| Chart.js | 4.4.0 | Dashboard data visualization |
| Firebase JS SDK | 10.13.1 | Authentication and database |

### Development Server
- Python's built-in `http.server` module
- Runs on port 5000
- Configured with no-cache headers for development