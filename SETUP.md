# D&D Initiative Tracker - Setup Guide

## Quick Start (3 Steps)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up MongoDB Atlas (Free - No Credit Card Required)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a new **FREE M0 Cluster** (select any cloud provider and region)
4. In **Security** → **Database Access**: Create a database user
   - Username: `dnduser` (or your choice)
   - Password: Generate a secure password and save it
5. In **Security** → **Network Access**: Click "Add IP Address"
   - Select "Allow Access from Anywhere" (or add `0.0.0.0/0`)
   - This is safe for this application
6. In **Deployment** → **Database**: Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://dnduser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

### Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
MONGODB_URI=mongodb+srv://dnduser:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/dnd-tracker?retryWrites=true&w=majority
JWT_SECRET=your-random-secret-key-here-make-it-long-and-secure
NEXTAUTH_URL=http://localhost:3000
```

**Important**: Replace `YOUR_PASSWORD` in MONGODB_URI with your actual password!

### Step 4: Run the Application

```bash
npm run dev
```

Open http://localhost:3000 in your browser!

---

## Usage Guide

### For Dungeon Masters:

1. **Register**: Go to http://localhost:3000/admin
   - Create your DM account with email and password

2. **Create Player Groups**:
   - In the dashboard, click "Create Group"
   - Add your player characters with names
   - Optionally add character images (use any image URL)

3. **Start a Battle**:
   - Click "Start New Battle"
   - Choose a player group
   - Give the battle a name

4. **Manage Combat**:
   - Set initiative values for each character
   - Add NPCs with the "+ Add NPC" button
   - Add "Lair Action" (always initiative 20) with one click
   - Click "Next Turn" to advance through combat
   - Toggle NPC visibility with the reveal button
   - Remove characters during combat if needed

5. **Share with Players**:
   - Give your players the root URL: http://localhost:3000
   - They'll see the initiative order automatically update

### For Players:

1. Simply open http://localhost:3000
2. You'll see:
   - All player character names
   - "?" for hidden NPCs (until DM reveals them)
   - Initiative order from highest to lowest
   - Current turn highlighted
3. The page updates automatically every 2 seconds

---

## Deploy to Vercel (Free Hosting)

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/dnd-tracker.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com
2. Sign up with your GitHub account (free)
3. Click "New Project"
4. Import your repository
5. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string
   - `NEXTAUTH_URL`: Your Vercel deployment URL (e.g., https://dnd-tracker.vercel.app)
6. Click "Deploy"

That's it! Your app will be live at `https://your-project.vercel.app`

### Updating Your Deployed App

Just push to GitHub:
```bash
git add .
git commit -m "Update"
git push
```

Vercel will automatically redeploy!

---

## Troubleshooting

### "Cannot connect to database"
- Check your MongoDB connection string in `.env.local`
- Make sure you replaced `<password>` with your actual password
- Verify Network Access is set to "Allow from Anywhere" in MongoDB Atlas

### "Unauthorized" errors
- Clear your browser's localStorage
- Log out and log back in
- Check that JWT_SECRET is set in `.env.local`

### Pages don't update
- Make sure you're running `npm run dev`
- Try refreshing your browser (Ctrl+F5 or Cmd+Shift+R)
- Check browser console for errors (F12)

### Port 3000 already in use
```bash
# Kill the process on Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Or use a different port:
npm run dev -- -p 3001
```

---

## Project Structure

```
dnd-initiative-tracker/
├── app/
│   ├── api/              # API routes (backend)
│   │   ├── auth/         # Login & registration
│   │   ├── battles/      # Battle management
│   │   └── groups/       # Player group management
│   ├── admin/            # DM dashboard
│   │   └── dashboard/    # Main DM interface
│   ├── globals.css       # Styling
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Player view (public)
├── lib/
│   ├── auth.ts           # JWT authentication
│   └── db.ts             # MongoDB connection
├── models/
│   ├── Battle.ts         # Battle data model
│   ├── PlayerGroup.ts    # Player group model
│   └── User.ts           # User (DM) model
├── .env.local            # Your environment variables (create this!)
├── package.json          # Dependencies
├── tailwind.config.js    # Tailwind CSS config
└── tsconfig.json         # TypeScript config
```

---

## Features Implemented

✅ Public player view with hidden NPCs  
✅ DM authentication (register/login)  
✅ Player group management  
✅ Battle creation and management  
✅ Manual initiative assignment  
✅ NPC reveal toggle  
✅ Lair action quick-add (initiative 20)  
✅ Turn tracking and progression  
✅ Add/remove characters during combat  
✅ Mobile-friendly responsive design  
✅ Real-time updates via polling  
✅ MongoDB database (free Atlas tier)  
✅ Vercel-ready deployment  

---

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **MongoDB Atlas** - Free cloud database (500MB free forever)
- **Mongoose** - MongoDB object modeling
- **JWT** - Secure authentication
- **Tailwind CSS** - Utility-first styling
- **SWR** - Data fetching with auto-refresh
- **bcryptjs** - Password hashing

---

## Support

Need help? Check these resources:
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Vercel Deployment Guide](https://vercel.com/docs)

---

Enjoy your D&D sessions! 🎲⚔️
