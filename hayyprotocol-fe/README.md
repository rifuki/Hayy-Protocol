# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/a52ddb16-4f9f-4e13-8d2f-3cc6b5ed0f2e

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/a52ddb16-4f9f-4e13-8d2f-3cc6b5ed0f2e) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Configure environment variables.
cp .env.example .env.local
# Edit .env.local and update VITE_API_BASE_URL if needed

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Environment Configuration

This project requires environment variables to connect to the backend API.

### Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Update the backend API URL in `.env.local`:
   ```bash
   # For local development (default)
   VITE_API_BASE_URL=http://localhost:3001/api

   # For production (update with your VPS domain)
   VITE_API_BASE_URL=https://your-vps-domain.com/api
   ```

### Environment Files

- `.env.example` - Template with all available variables
- `.env.local` - Local development (gitignored)
- `.env.production` - Production build configuration
- `.env` - Shared environment variables (gitignored)

**Note:** Never commit `.env.local` or `.env` files to git as they may contain sensitive information.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/a52ddb16-4f9f-4e13-8d2f-3cc6b5ed0f2e) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
