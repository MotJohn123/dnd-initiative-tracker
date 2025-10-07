# 🎲 D&D Initiative Tracker - Quick Start

## ✅ Installation Complete!

Dependencies have been installed. Follow these steps to get started:

---

## 🚀 Step 1: Set Up MongoDB Atlas (2 minutes)

### Why MongoDB Atlas?
- **100% Free** - No credit card required
- **500MB storage** - More than enough for this app
- **Vercel-compatible** - Works perfectly with free hosting

### Setup Steps:

1. **Go to** https://www.mongodb.com/cloud/atlas/register
2. **Sign up** with your email (or Google/GitHub account)
3. **Create a cluster**:
   - Choose "M0 FREE" tier
   - Pick any cloud provider and region (doesn't matter)
   - Click "Create Cluster"

4. **Create a database user**:
   - Go to "Database Access" in the left menu
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `dnduser` (or anything you like)
   - Password: Click "Autogenerate Secure Password" and **SAVE IT**
   - User Privileges: "Atlas admin"
   - Click "Add User"

5. **Allow network access**:
   - Go to "Network Access" in the left menu
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (or add `0.0.0.0/0`)
   - Click "Confirm"

6. **Get your connection string**:
   - Go back to "Database" in the left menu
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (it looks like):
     ```
     mongodb+srv://dnduser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - **Important**: Replace `<password>` with your actual password!

---

## 🔧 Step 2: Configure Environment Variables

1. **Open** the `.env.local` file in this folder
2. **Replace** the placeholders with your values:

```env
# Paste your MongoDB connection string here (replace <password> with your actual password)
MONGODB_URI=mongodb+srv://dnduser:YOUR_ACTUAL_PASSWORD@cluster0.xxxxx.mongodb.net/dnd-tracker?retryWrites=true&w=majority

# Generate a random secret (or use this one for testing)
JWT_SECRET=super-secret-jwt-key-change-this-in-production-make-it-long

# Keep this as-is for local development
NEXTAUTH_URL=http://localhost:3000
```

3. **Save** the file

---

## 🎮 Step 3: Run the Application

Open your terminal in this folder and run:

```bash
npm run dev
```

Then open your browser to: **http://localhost:3000**

---

## 📖 How to Use

### For Dungeon Masters:

1. **Register your DM account**:
   - Go to http://localhost:3000/admin
   - Click "Register" and create your account

2. **Create a player group**:
   - In the dashboard, click "+ Create Group"
   - Enter a group name (e.g., "The Adventurers")
   - Add your player characters by name
   - Optionally add character images (paste any image URL)

3. **Start a battle**:
   - Click "Start New Battle"
   - Choose your player group
   - Name the battle (e.g., "Goblin Ambush")

4. **Manage combat**:
   - **Set initiatives**: Click on initiative numbers to change them
   - **Add NPCs**: Click "+ Add NPC", enter name and initiative
   - **Add Lair Action**: Click "+ Lair (20)" for instant lair action at initiative 20
   - **Reveal NPCs**: Click the 🔒 button to reveal NPC names to players
   - **Next Turn**: Click "Next Turn →" to advance combat
   - **Remove characters**: Click the ✕ button to remove anyone

### For Players:

1. **Just open**: http://localhost:3000
2. **You'll see**:
   - All player character names
   - "?" for hidden NPCs
   - Initiative order
   - Who's turn it is (highlighted)
3. **Auto-updates** every 2 seconds!

---

## 🌐 Deploy to Vercel (Free Hosting)

Want to host this online so players can access it from anywhere?

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "D&D Initiative Tracker"
# Create a new repository on GitHub, then:
git remote add origin https://github.com/yourusername/dnd-tracker.git
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to https://vercel.com and sign up (free)
2. Click "New Project"
3. Import your GitHub repository
4. Add these environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your secret key
   - `NEXTAUTH_URL`: Leave empty (Vercel will set it automatically)
5. Click "Deploy"

**Done!** Share your Vercel URL with your players!

Every time you push to GitHub, Vercel automatically updates your site.

---

## ❓ Troubleshooting

### "Cannot connect to database"
- Check your `.env.local` file
- Make sure you replaced `<password>` with your actual password
- Verify you added `0.0.0.0/0` to Network Access in MongoDB Atlas

### "Port 3000 is already in use"
```bash
# Use a different port:
npm run dev -- -p 3001
```

### Need to reset everything?
```bash
# Delete node_modules and reinstall:
rm -rf node_modules
npm install
```

### Still stuck?
Check `SETUP.md` for detailed documentation!

---

## 🎯 Features

✅ Public player view (NPCs shown as "?")  
✅ DM admin dashboard with full control  
✅ Player group management  
✅ Battle tracking with initiative  
✅ NPC reveal toggle  
✅ Lair actions (initiative 20)  
✅ Add/remove characters during combat  
✅ Mobile-friendly design  
✅ Auto-refreshing (no manual reload needed)  
✅ Free MongoDB hosting  
✅ Free Vercel deployment  

---

## 🎲 Enjoy your D&D sessions!

Made with ❤️ for DMs and players

Questions? Check the full documentation in `SETUP.md`
