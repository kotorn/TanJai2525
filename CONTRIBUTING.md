# Contributing to Tanjai POS

Welcome to the Tanjai POS team! This guide will help you get started with the development environment and understand our coding standards.

## 1. Development Setup

### Prerequisites
- **Node.js**: v20 or later (LTS recommended).
- **Package Manager**: npm (comes with Node.js).
- **Supabase CLI**: Required for local database development.
  ```bash
  npm install -g supabase
  ```

### Installation
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd tanjai-pos
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in your local or dev Supabase credentials.

### Running Locally
To start the Next.js development server:
```bash
npm run dev
```
Access the app at `http://localhost:3000`.

## 2. Coding Standards

### Linting & Formatting
We use **ESLint** and **Prettier** (via `eslint-config-next`).
- Run lint check: `npm run lint`
- All code must pass linting without warnings before merging.

### TypeScript
- **Strict Mode** is enabled. Avoid `any` types.
- Define interfaces/types for all component props and API responses.

### Component Structure
- Use **Server Components** by default.
- Place `use client` directive only when necessary (e.g., using hooks, event listeners).
- Colocate exclusive components within the feature folder (e.g., `app/login/_components`).

## 3. Git Workflow

### Branching Strategy
- **main**: Production-ready code.
- **develop**: Staging/Integration branch.
- **feature/feature-name**: New features.
- **fix/issue-name**: Bug fixes.

### Pull Request Process
1. Create a branch from `main` (or `develop`).
2. Implement changes.
3. Open a PR with a descriptive title and summary of changes.
4. Require at least 1 approval from a peer.
5. Merge after CI checks pass.

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat: add offline support`
- `fix: correct z-index on modal`
- `docs: update deployment guide`
- `chore: update dependencies`

## 4. Database Changes
- **Never** change the database schema manually in the dashboard for production.
- Use Supabase Migrations for all schema changes.
  ```bash
  supabase migration new add_orders_table
  ```
- Apply migrations locally first, then push to remote/production.
