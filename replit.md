# replit.md

## Overview
This is a full-stack web application for conducting online coding assessments. The system combines multiple-choice questions (MCQ) and coding problems to evaluate student programming skills. It features a React frontend with a Node.js/Express backend, using PostgreSQL for data persistence and Drizzle ORM for database operations. The platform includes admin authentication and comprehensive assessment management.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state and React hooks for local state
- **Build Tool**: Vite for development and production builds

The frontend follows a component-based architecture with separate pages for assessment taking and admin management. Key sections include MCQ questions, coding problems with an integrated code editor, and real-time timer functionality.

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database**: PostgreSQL with Drizzle ORM and Neon serverless
- **Storage**: DatabaseStorage class implementing IStorage interface
- **Code Execution**: Custom service for running and testing submitted code
- **Authentication**: Admin login system with email/password
- **Data Seeding**: Automatic database seeding with sample content

The backend provides RESTful APIs for managing students, questions, submissions, and assessment results. It includes services for code execution, grading, assessment management, and admin authentication.

### Database Design
The system uses PostgreSQL with the following key tables:
- `students`: Student information and assessment progress
- `mcq_questions`: Multiple choice questions with options and correct answers
- `coding_problems`: Programming challenges with test cases and templates
- `mcq_answers`: Student responses to MCQ questions
- `coding_submissions`: Code submissions with execution results
- `assessment_results`: Final scores and assessment outcomes
- `admins`: Administrator accounts with email/password authentication

Database connection is managed through Neon serverless PostgreSQL with automatic seeding of sample questions, coding problems, and admin accounts.

## Key Components

### Assessment Flow
1. **Student Registration**: Simple name/email registration
2. **MCQ Section**: Timed multiple-choice questions with navigation and flagging
3. **Coding Section**: Programming problems with multi-language support
4. **Auto-grading**: Automated evaluation of both MCQ and coding responses

### Code Execution System
- Supports multiple programming languages (Python, JavaScript, etc.)
- Sandboxed execution environment with timeout protection
- Automated test case validation
- Real-time feedback on code execution

### Admin Panel
- **Authentication**: Secure admin login with email/password
- **Question Management**: Create, edit, and delete MCQ and coding problems
- **Student Monitoring**: Track student progress and assessment status
- **Results Analytics**: View comprehensive assessment results and statistics
- **Dashboard**: Real-time metrics and completion statistics
- **Session Management**: Protected routes with logout functionality

### Timer System
- Section-based timing (separate for MCQ and coding)
- Automatic section transitions
- Server-side time validation to prevent cheating

## Data Flow

1. **Assessment Start**: Student registers → Timer starts → MCQ section begins
2. **MCQ Flow**: Answer submission → Real-time saving → Progress tracking
3. **Coding Flow**: Code editing → Execution → Test case validation → Submission
4. **Grading**: Automatic scoring → Results storage → Admin analytics
5. **Completion**: Final score calculation → Assessment termination

## External Dependencies

### Frontend Dependencies
- **React Ecosystem**: React, React DOM, React Query
- **UI Components**: Radix UI primitives, shadcn/ui components
- **Styling**: Tailwind CSS, class-variance-authority for variants
- **Form Handling**: React Hook Form with Zod validation
- **Code Editor**: Monaco Editor integration for syntax highlighting

### Backend Dependencies
- **Database**: Neon serverless PostgreSQL, Drizzle ORM
- **Server**: Express.js with TypeScript support
- **Session Management**: express-session with PostgreSQL store
- **Validation**: Zod for schema validation
- **Development**: tsx for TypeScript execution, esbuild for production

### Development Tools
- **Build System**: Vite with React plugin
- **TypeScript**: Full-stack TypeScript configuration
- **Database Migration**: Drizzle Kit for schema management
- **Development Server**: Hot reload with Vite middleware

## Deployment Strategy

### Local Development
- **Quick Setup**: Run `./setup-local.sh` (Linux/macOS) or `setup-local.bat` (Windows)
- **Manual Setup**: Copy `.env.example` to `.env`, install PostgreSQL, run `npm run dev`
- **Database**: Supports local PostgreSQL with automatic detection
- **Dependencies**: Python 3, Java JDK, GCC for code execution

### Production Build
- Frontend builds to static files served by Express
- Backend compiles to optimized JavaScript bundle
- Single server deployment with static file serving

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Auto-detects Neon PostgreSQL vs local PostgreSQL
- Session configuration for production security

### Development Workflow
- `./start-local.sh`: Quick start for local development
- `npm run dev`: Development server with hot reload
- `npm run build`: Production build for both frontend and backend
- `npm run db:push`: Database schema synchronization

## Recent Changes

### Local Development Setup (January 20, 2025)
- Added comprehensive local PostgreSQL support alongside cloud Neon database
- Created automated setup scripts for Linux/macOS (setup-local.sh) and Windows (setup-local.bat)
- Enhanced database configuration to auto-detect Neon vs local PostgreSQL
- Added startup scripts (start-local.sh/start-local.bat) for easy local development
- Created detailed installation guide (README-Local-Setup.md) with troubleshooting
- Added environment template (.env.example) for easy configuration
- Platform now supports both online (Replit) and offline (local machine) development

### Dynamic Code Execution Enhancement (January 20, 2025)
- Fixed dynamic function name detection in code execution service
- Code execution now works with any user-defined function names (not hardcoded)
- Enhanced admin panel with full edit functionality for coding problems
- Improved submission system to save all attempts with proper scoring
- Added detailed user feedback with toast notifications for submission results

### Database Migration (January 20, 2025)
- Migrated from in-memory storage to PostgreSQL database
- Implemented DatabaseStorage class replacing MemStorage
- Added automatic database seeding with sample content
- Enhanced admin authentication with persistent storage
- Database includes comprehensive seed data for testing

### Admin Authentication System
- Separate admin login page with email/password authentication
- Protected admin routes requiring authentication
- Clean student interface without admin access links
- Session management with logout functionality
- Demo admin credentials: admin@codeassess.com / admin123

The architecture prioritizes simplicity and reliability, with automatic grading, real-time feedback, persistent data storage, and comprehensive admin tools for managing coding assessments.