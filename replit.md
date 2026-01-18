# UniPlan - Student Assignment Tracker

## Overview

UniPlan is a student-focused academic planner application that helps users track courses, manage assignments, and visualize their academic workload. The app provides a clean dashboard with course management, assignment tracking with due dates and priorities, and filtering capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Build Tool**: Vite with HMR support
- **Forms**: React Hook Form with Zod validation

The frontend follows a pages-based structure with reusable components. Protected routes require authentication, handled via a custom `useAuth` hook that checks session state.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schemas for request/response validation
- **Authentication**: Replit Auth integration using OpenID Connect with Passport.js
- **Session Management**: Express sessions stored in PostgreSQL via connect-pg-simple

The backend uses a storage abstraction pattern (`IStorage` interface) that wraps database operations, making it easier to test and swap implementations.

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Migrations**: Drizzle Kit for schema migrations (`db:push` command)

Core entities:
- `users` - User profiles (managed by Replit Auth)
- `sessions` - Session storage for authentication
- `courses` - User's enrolled courses with schedule and color
- `assignments` - Tasks linked to courses with due dates, priority, and completion status

### Shared Code Pattern
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts` - Drizzle table definitions and Zod insert schemas
- `routes.ts` - API contract with paths, methods, and validation schemas
- `models/auth.ts` - User and session table definitions for Replit Auth

## External Dependencies

### Authentication
- Replit Auth via OpenID Connect (`openid-client` + `passport`)
- Sessions stored in PostgreSQL

### Database
- PostgreSQL (connection via `DATABASE_URL` environment variable)
- Drizzle ORM for type-safe queries

### UI Components
- shadcn/ui (Radix primitives + Tailwind)
- Lucide React for icons
- Framer Motion for animations
- date-fns for date formatting

### Required Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secret for session encryption
- `ISSUER_URL` - Replit OIDC issuer (defaults to https://replit.com/oidc)
- `REPL_ID` - Automatically set by Replit environment