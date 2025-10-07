# D&D Initiative Tracker

A mobile-friendly web application for tracking initiative in D&D sessions with separate views for DMs and players.

## Features

- **Public Player View**: Players see character names and "?" for NPCs
- **DM Admin Panel**: Full control over battles and initiative tracking
- **Player Groups**: Create and manage groups of player characters
- **Real-time Updates**: Changes reflect immediately on the player view
- **Mobile Friendly**: Works seamlessly on phones and tablets
- **Lair Actions**: Quick-add with initiative 20

## Tech Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **MongoDB Atlas**: Free cloud database (no credit card required)
- **Tailwind CSS**: Utility-first styling
- **Vercel**: Free hosting

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up MongoDB Atlas (Free)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (M0 Free tier)
4. Set up database access (create a user)
5. Set up network access (allow access from anywhere: 0.0.0.0/0)
6. Get your connection string

### 3. Configure Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your MongoDB connection string and a secret JWT key.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables (MONGODB_URI, JWT_SECRET, NEXTAUTH_URL)
5. Deploy!

## Usage

### DM Workflow

1. Register/Login at `/admin`
2. Create player groups and add characters
3. Start a battle by selecting a group
4. Add NPCs manually
5. Assign initiative values
6. Control turn progression
7. Share the public URL with players

### Player View

1. Players visit the root URL `/`
2. They see character names and turn order
3. NPCs appear as "?" until revealed by DM
4. Current turn is highlighted

## License

MIT
