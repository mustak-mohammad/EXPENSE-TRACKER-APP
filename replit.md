# Overview

This is a full-stack media player application built with React, Express, and TypeScript. The application allows users to upload, manage, and play audio files (MP3, WAV, OGG) through a modern web interface. It features a responsive design with a playlist sidebar, audio player controls, and file upload functionality.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent UI components
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for client-side routing
- **Audio Handling**: Custom useAudioPlayer hook managing HTML5 Audio API
- **Responsive Design**: Mobile-first approach with collapsible sidebar on mobile devices

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints for audio track management
- **File Upload**: Multer middleware for handling multipart/form-data uploads with file validation
- **Storage**: In-memory storage implementation (MemStorage class) with interface pattern for future database integration
- **Development**: Hot-reload development server with Vite integration

## Data Storage Solutions
- **Current**: In-memory storage using Map data structure
- **Database Ready**: Drizzle ORM configuration set up for PostgreSQL with Neon database
- **Schema**: Defined audio tracks table with fields for metadata (filename, size, duration, MIME type, file path)
- **Migration**: Drizzle-kit configured for database schema migrations

## File Management
- **Upload Directory**: Local filesystem storage in `uploads/` directory
- **File Validation**: MIME type checking for audio formats
- **Size Limits**: 50MB maximum file size per upload
- **Supported Formats**: MP3, WAV, OGG audio files

## UI Component System
- **Design System**: shadcn/ui components with Radix UI primitives
- **Theme**: Dark theme with purple/cyan accent colors
- **Typography**: Inter font for UI, Fira Code for monospace
- **Icons**: Lucide React icon library
- **Responsive Components**: Mobile-optimized player controls and sidebar

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: Neon database driver for PostgreSQL
- **drizzle-orm**: TypeScript ORM for database operations
- **drizzle-kit**: Database migration and schema management tool

## Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight client-side routing
- **@radix-ui/***: Headless UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **clsx**: Conditional CSS class utilities

## Backend Libraries
- **express**: Web application framework
- **multer**: Multipart form data handling for file uploads
- **connect-pg-simple**: PostgreSQL session store (prepared for future use)

## Development Tools
- **vite**: Build tool and development server
- **tsx**: TypeScript execution engine for development
- **esbuild**: JavaScript bundler for production builds
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Replit-specific development features